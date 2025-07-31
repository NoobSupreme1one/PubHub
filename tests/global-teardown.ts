import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('All tests completed. Cleaning up...');
  
  // Add any cleanup logic here
  // For example:
  // - Clean up test data from database
  // - Remove test files
  // - Reset application state
  
  console.log('Cleanup completed.');
}

export default globalTeardown; 