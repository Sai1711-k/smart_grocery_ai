const { By, until } = require('selenium-webdriver');

async function runAuthTests(driver, executeTest) {
  
  await executeTest('Guest can view homepage', async (driver) => {
    await driver.get('http://localhost:3000');
    // Wait for Next.js to compile on first load
    await driver.sleep(2000);
    // Wait for the main title to load
    await driver.wait(until.elementLocated(By.xpath("//h1[contains(., 'FreshCart')] | //h2")), 5000);
    const bodyText = await driver.findElement(By.css('body')).getText();
    if (!bodyText.includes('FreshCart') && !bodyText.includes('Login')) {
      throw new Error('Homepage did not load correctly.');
    }
  });

  await executeTest('User can navigate to Auth Flow', async (driver) => {
    await driver.get('http://localhost:3000');
    // Find the login/profile button. We can look for the User icon or "Log In"
    // Since the navbar has a user button that toggles the Auth Flow when not logged in
    const loginButtons = await driver.findElements(By.xpath("//button[contains(., 'Log In') or contains(@class, 'lucide-user')]"));
    if (loginButtons.length > 0) {
      await loginButtons[0].click();
    } else {
      console.log('Login button not found, maybe already logged in?');
    }
    // Wait for the auth modal or page
    await driver.sleep(1000);
  });

}

module.exports = { runAuthTests };
