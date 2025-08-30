// Dark Mode Update Script
// This script helps identify components that still need dark mode classes

const componentsToUpdate = [
  'client/src/pages/courses.tsx',
  'client/src/pages/branch-management.tsx',
  'client/src/pages/batch-detail.tsx',
  'client/src/pages/payments.tsx',
  'client/src/pages/reports-analytics.tsx',
  'client/src/pages/notifications-automation.tsx'
];

const commonPatterns = [
  // Background colors
  { from: 'bg-white', to: 'bg-white dark:bg-gray-800' },
  { from: 'bg-slate-50', to: 'bg-slate-50 dark:bg-gray-900' },
  { from: 'bg-gray-50', to: 'bg-gray-50 dark:bg-gray-800' },
  { from: 'bg-gray-100', to: 'bg-gray-100 dark:bg-gray-900' },
  
  // Text colors
  { from: 'text-gray-900', to: 'text-gray-900 dark:text-white' },
  { from: 'text-gray-700', to: 'text-gray-700 dark:text-gray-300' },
  { from: 'text-gray-600', to: 'text-gray-600 dark:text-gray-400' },
  { from: 'text-gray-500', to: 'text-gray-500 dark:text-gray-400' },
  
  // Border colors
  { from: 'border-gray-200', to: 'border-gray-200 dark:border-gray-700' },
  { from: 'border-gray-100', to: 'border-gray-100 dark:border-gray-700' },
  
  // Form backgrounds
  { from: 'bg-blue-50', to: 'bg-blue-50 dark:bg-blue-900/20' },
  { from: 'bg-green-50', to: 'bg-green-50 dark:bg-green-900/20' },
  { from: 'bg-yellow-50', to: 'bg-yellow-50 dark:bg-yellow-900/20' },
  { from: 'bg-red-50', to: 'bg-red-50 dark:bg-red-900/20' },
  
  // Form text colors
  { from: 'text-blue-800', to: 'text-blue-800 dark:text-blue-200' },
  { from: 'text-green-800', to: 'text-green-800 dark:text-green-200' },
  { from: 'text-yellow-800', to: 'text-yellow-800 dark:text-yellow-200' },
  { from: 'text-red-800', to: 'text-red-800 dark:text-red-200' }
];

console.log('Dark Mode Update Guide:');
console.log('=======================');
console.log('');
console.log('Components that need dark mode updates:');
componentsToUpdate.forEach(component => {
  console.log(`- ${component}`);
});

console.log('');
console.log('Common patterns to replace:');
commonPatterns.forEach(pattern => {
  console.log(`"${pattern.from}" → "${pattern.to}"`);
});

console.log('');
console.log('Steps to complete dark mode:');
console.log('1. Update all remaining page components');
console.log('2. Update any remaining UI components');
console.log('3. Test dark mode toggle across all pages');
console.log('4. Verify contrast and readability in both themes');

