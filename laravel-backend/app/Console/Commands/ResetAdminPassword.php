<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ResetAdminPassword extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:reset-password {username} {password}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset password for a user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $username = $this->argument('username');
        $password = $this->argument('password');

        $user = User::where('username', $username)->first();

        if (!$user) {
            $this->error("User with username '{$username}' not found!");
            return 1;
        }

        $user->update([
            'password' => Hash::make($password)
        ]);

        $this->info("Password for user '{$username}' has been reset to '{$password}'");
        return 0;
    }
}



