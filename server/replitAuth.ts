import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import { Strategy as LocalStrategy } from 'passport-local';
import { storage } from "./storage";

// For local development, provide default values if not running on Replit
if (!process.env.REPLIT_DOMAINS) {
  process.env.REPLIT_DOMAINS = "localhost:5000";
}
if (!process.env.REPL_ID) {
  process.env.REPL_ID = "local-dev";
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  // For now, use memory store. In production, you can implement a MySQL session store
  return session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Simple local strategy for development
  passport.use(new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password'
    },
    async function(username: string, password: string, done: any) {
      try {
        // Check against the database
        const { pool } = await import('./db');
        
        // Query the users table using proper MySQL syntax
        const [rows] = await pool.execute(
          'SELECT * FROM users WHERE username = ? AND password = ?',
          [username, password]
        );
        
        if (rows && Array.isArray(rows) && rows.length > 0) {
          const user = rows[0] as any;
          return done(null, {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            branchId: user.branchId
          });
        }
        
        return done(null, false, { message: 'Invalid username or password.' });
      } catch (error) {
        console.error('Authentication error:', error);
        return done(error);
      }
    }
  ));

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Custom login form endpoint
  app.get("/api/login", (req, res) => {
    res.json({ 
      message: "Please use POST /api/login with username and password",
      form: {
        username: "admin",
        password: "admin"
      }
    });
  });

  app.post("/api/login", passport.authenticate('local'), (req, res) => {
    res.json({ 
      success: true, 
      user: req.user,
      message: "Login successful" 
    });
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return next();
};
