import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  
  // Start browser and check if app is ready
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for the app to be ready
    await page.goto(baseURL!);
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Check if the app is responding
    const title = await page.title();
    console.log(`App is ready. Title: ${title}`);
    
  } catch (error) {
    console.error('Failed to verify app is ready:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup; 