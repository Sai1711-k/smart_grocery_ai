const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { generateReport } = require('./report-generator');

// Import tests
const { runAuthTests } = require('./tests/auth.test');
const { runCheckoutTests } = require('./tests/checkout.test');
const { runAdminTests } = require('./tests/admin.test');

async function runAllTests() {
  console.log('[Runner] Starting E2E Tests...');
  const results = [];
  
  // Set up headless or non-headless options if needed
  let options = new chrome.Options();
  // options.addArguments('--headless'); // Uncomment to run headless

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  // Helper to execute and track a test
  const executeTest = async (name, testFn) => {
    console.log(`\n--- Running Test: ${name} ---`);
    const startTime = Date.now();
    try {
      await testFn(driver);
      const duration = Date.now() - startTime;
      console.log(`[PASS] ${name} (${duration}ms)`);
      results.push({ name, status: 'PASS', duration, error: null });
    } catch (err) {
      const duration = Date.now() - startTime;
      console.log(`[FAIL] ${name} (${duration}ms)`);
      console.error(err.message);
      results.push({ name, status: 'FAIL', duration, error: err.message });
    }
  };

  try {
    // We will pass the `executeTest` helper so individual test files can define multiple test cases
    await runAuthTests(driver, executeTest);
    await runCheckoutTests(driver, executeTest);
    await runAdminTests(driver, executeTest);
  } finally {
    await driver.quit();
    console.log('\n[Runner] Generating Excel Report...');
    await generateReport(results);
    console.log('[Runner] Tests Complete.');
  }
}

runAllTests();
