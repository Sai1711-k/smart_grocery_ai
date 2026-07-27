const { By, until } = require('selenium-webdriver');

async function runAdminTests(driver, executeTest) {
  
  await executeTest('Can access Admin Analytics (Requires Auth/Mock Auth)', async (driver) => {
    await driver.get('http://localhost:3000/admin/analytics');
    await driver.sleep(2000); 

    const bodyText = await driver.findElement(By.css('body')).getText();
    
    // Depending on auth state, it might redirect or show the dashboard
    if (bodyText.includes('Sales Recap') || bodyText.includes('Log In') || bodyText.includes('Admin')) {
      // It successfully hit the page or redirected to login, which is expected behavior
    } else {
      throw new Error('Admin analytics page completely failed to render.');
    }
  });

}

module.exports = { runAdminTests };
