'use strict';

const { remote } = require('webdriverio');
const assert = require('chai').assert;
const { Eyes,
  ClassicRunner,
  VisualGridRunner,
  RunnerOptions,
  Target,
  RectangleSize,
  Configuration,
  BatchInfo,
  BrowserType,
  ScreenOrientation,
  DeviceName } = require('@applitools/eyes-webdriverio');

describe('NAB Bank', function () {

  const USE_ULTRAFAST_GRID = true;
  const USE_EXECUTION_CLOUD = true;

  // Applitools objects to share for all tests
  let batch;
  let config;
  let runner;

  // Test-specific objects
  let eyes;
  let AppName = "NAB Bank";
  let TestName;

  before(async () => {

    if (USE_ULTRAFAST_GRID) {
      runner = new VisualGridRunner(5);
    }
    else {
      // Create the classic runner.
      runner = new ClassicRunner();
    }

    const runnerName = (USE_ULTRAFAST_GRID) ? 'Ultrafast Grid' : 'Classic runner';
    batch = new BatchInfo(`Example: WebdriverIO JavaScript with the ${runnerName}`);

    // Create a configuration for Applitools Eyes.
    config = new Configuration();
    config.setBatch(batch);

    if (USE_ULTRAFAST_GRID) {

      // Add 3 desktop browsers with different viewports for cross-browser testing in the Ultrafast Grid.
      // Other browsers are also available, like Edge and IE.
      config.addBrowser(800, 600, BrowserType.CHROME);
      config.addBrowser(1600, 1200, BrowserType.FIREFOX);
      config.addBrowser(1024, 768, BrowserType.SAFARI);

      // Add 2 mobile emulation devices with different orientations for cross-browser testing in the Ultrafast Grid.
      // Other mobile devices are available, including iOS.
      config.addDeviceEmulation(DeviceName.Pixel_2, ScreenOrientation.PORTRAIT);
      config.addDeviceEmulation(DeviceName.Nexus_10, ScreenOrientation.LANDSCAPE);
    }
  });


  beforeEach(async function () {
    eyes = new Eyes(runner);
    eyes.setConfiguration(config);

    // Set up Execution Cloud if it will be used.
    if (USE_EXECUTION_CLOUD) {
      const executionCloudUrl = new URL(await Eyes.getExecutionCloudUrl());
      const protocol_val = executionCloudUrl.protocol.substring(0, executionCloudUrl.protocol.length - 1);

      browser = await remote({
        logLevel: 'trace',
        protocol: protocol_val,
        hostname: executionCloudUrl.hostname,
        port: Number(executionCloudUrl.port),
        capabilities: {
          browserName: 'chrome',
          "applitools:sessionName": 'Demo New',
          "applitools:useSelfHealing": true,
        }
      });
    }
  });

  it('NAB Execution Cloud Demo- Non Eyes Test', async () => {

    TestName = 'NAB Execution Cloud Demo- Non Eyes Test';
    await browser.executeScript("applitools:startTest", [{testName: TestName}]);
    await browser.url('https://www.nab.com.au/locations?return');

    // Using Applitools Eyes with WebDriverIO
    browser = await eyes.open(browser, AppName, TestName);

    // WebDriverIO uses CSS selectors directly in the $() function.
    let parentRootElement = await browser.$('nab-locations-tool');
    await parentRootElement.waitForExist();

    let isElementDisplayed = await parentRootElement.shadow$('#Search').isDisplayed();
    console.log('isElementDisplayed - ', isElementDisplayed);

    assert.equal(isElementDisplayed, true, "Element is present on the page");

    
    await browser.executeScript("var root = document.querySelector('nab-locations-tool'); if(root.shadowRoot) root.shadowRoot.querySelector('#Search').id='aaa';", []);

    await browser.pause(1000); // Adjust this timing as needed

    isElementDisplayed = await (await parentRootElement.shadow$('#aaa')).isDisplayed();
    console.log('isElementDisplayed - ', isElementDisplayed);

    assert.equal(isElementDisplayed, true, "Element should be present on the page");

  });

  afterEach(async () => {
    await browser.executeScript("applitools:endTest", [{status: "Failed"}]);
    await browser.closeWindow();
  });

  after(async () => {
    const allTestResults = await runner.getAllTestResults();
    console.log(allTestResults);
  });
});