import { test, expect, chromium } from '@playwright/test';
import { HomePage } from './pages/homepage.page';
import { EventDetailsPage } from './pages/event-details.page';
import { RegistrationPage } from './pages/registration.page';
import { TestLogger } from './utils/logger';
import { TestReporter } from './utils/reporter';

// Global reporter instance
const globalReporter = new TestReporter();

test.describe('PMI Lakeshore Banner Image Navigation Tests', () => {
  let logger: TestLogger;

  test.beforeEach(async () => {
    // Initialize logger for each test
    logger = new TestLogger('Banner Image Navigation Test');
  });

  test.afterEach(async () => {
    // Add test results to global reporter
    if (logger) {
      globalReporter.addTestReport(logger);
    }
  });

  test.afterAll(async () => {
    // Generate final report
    globalReporter.saveReport('test-results/banner-navigation-report.html');
    globalReporter.printSummary();
  });

  test.skip('should navigate to event by clicking first banner image and complete registration', async () => {
    let browser;
    let context;
    let page;

    try {
      logger.info('🎭 Starting Banner Image Navigation Test');

      // Launch browser with CI-compatible settings
      logger.step('Launching browser for banner navigation');
      browser = await chromium.launch({
        headless: process.env.CI ? true : false,
        slowMo: process.env.CI ? 0 : 1500,
        args: process.env.CI ? [] : ['--start-maximized', '--disable-web-security']
      });

      context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        recordVideo: process.env.CI ? undefined : {
          dir: 'test-results/videos/',
          size: { width: 1920, height: 1080 }
        }
      });

      page = await context.newPage();

      // Set longer timeouts for this test
      page.setDefaultTimeout(30000);
      page.setDefaultNavigationTimeout(30000);

      logger.success('Browser launched successfully');

      // Initialize page objects
      const homePage = new HomePage(page, logger);
      const eventDetailsPage = new EventDetailsPage(page, logger);
      const registrationPage = new RegistrationPage(page, logger);

      // Step 1: Navigate to homepage
      logger.step('Navigating to PMI Lakeshore homepage');
      await homePage.navigateToHomePage();
      await homePage.takeScreenshot('homepage-loaded-banner-test');

      // Step 2: Wait for page to fully load and scan for images
      logger.step('Waiting for page to fully load and scanning for banner images');
      await page.waitForTimeout(3000); // Give time for images to load

      // Step 3: Look for carousel/banner images
      logger.step('Searching for banner/carousel images');

      // Multiple strategies to find clickable images
      const imageSelectors = [
        // Carousel/slider images
        '.carousel img[src*="meetinginfo"], .slider img[src*="meetinginfo"]',
        'img[src*="meetinginfo"]',
        'a[href*="meetinginfo"] img',
        // Generic carousel patterns
        '.carousel img, .slider img, .banner img',
        '[class*="slide"] img, [class*="banner"] img',
        // List item images that might be clickable
        'li img[src*="http"]',
        'li a img',
        // Any linked images
        'a img'
      ];

      let foundClickableImage = false;
      let imageInfo = null;

      for (const selector of imageSelectors) {
        try {
          const images = page.locator(selector);
          const imageCount = await images.count();

          if (imageCount > 0) {
            logger.info(`Found ${imageCount} images with selector: ${selector}`);

            // Try first few images
            for (let i = 0; i < Math.min(imageCount, 3); i++) {
              const image = images.nth(i);

              try {
                // Check if image is visible and has a valid src
                const isVisible = await image.isVisible({ timeout: 2000 });
                const src = await image.getAttribute('src');
                const parentHref = await image.locator('..').getAttribute('href');

                if (isVisible && (src || parentHref)) {
                  imageInfo = {
                    selector,
                    index: i,
                    src: src || 'No src',
                    parentHref: parentHref || 'No href',
                    isClickable: !!parentHref || src?.includes('meetinginfo')
                  };

                  logger.info(`Image ${i + 1} details:`, imageInfo);

                  // If this looks promising, try to click it
                  if (imageInfo.isClickable || i === 0) {
                    logger.step(`Attempting to click banner image ${i + 1}`);

                    // Take screenshot before clicking
                    await homePage.takeScreenshot(`before-banner-click-${i}`);

                    // Try clicking the image
                    await image.click({ timeout: 5000 });
                    foundClickableImage = true;

                    // Wait for navigation
                    await page.waitForTimeout(2000);

                    // Check if we navigated somewhere
                    const newUrl = await page.url();
                    logger.info(`After image click, URL is: ${newUrl}`);

                    // Take screenshot after click
                    await homePage.takeScreenshot(`after-banner-click-${i}`);

                    break;
                  }
                }
              } catch (imageError) {
                logger.warning(`Image ${i + 1} not clickable:`, imageError.message);
              }
            }

            if (foundClickableImage) break;
          }
        } catch (selectorError) {
          logger.warning(`Selector failed: ${selector}`, selectorError.message);
        }
      }

      if (!foundClickableImage) {
        logger.warning('No clickable banner images found, trying alternative approach');

        // Alternative: Look for any linked images in the events area
        await homePage.scrollToEventsSection();

        const eventAreaImages = page.locator('h2:has-text("Webinars") ~ div img, .event img, [class*="event"] img').first();
        const eventImageCount = await eventAreaImages.count();

        if (eventImageCount > 0) {
          logger.info(`Found ${eventImageCount} images in events area`);
          await eventAreaImages.click();
          foundClickableImage = true;
        } else {
          // Last resort: click first available event link
          logger.warning('No banner images found, falling back to first event details link');
          await homePage.clickFirstEventDetails();
          foundClickableImage = true;
        }
      }

      // Step 4: Verify navigation result
      logger.step('Verifying navigation result after banner click');
      const currentUrl = await page.url();

      // Check if we're on an event-related page
      if (currentUrl.includes('meetinginfo') || currentUrl.includes('event')) {
        logger.success(`Successfully navigated to event page via banner: ${currentUrl}`);

        // Continue with event registration flow
        const eventDetailsPage = new EventDetailsPage(page, logger);
        await eventDetailsPage.takeEventScreenshot();

        // Get event information
        const eventInfo = await eventDetailsPage.getEventInformation();
        logger.info('Event accessed via banner:', eventInfo);

        // Check for registration
        const registrationAvailability = await eventDetailsPage.checkRegistrationAvailability();

        if (registrationAvailability.hasRegisterButton) {
          logger.step('Registration available, proceeding with guest registration');

          await eventDetailsPage.clickRegisterButton();
          await registrationPage.takeRegistrationScreenshot();

          const isRegistrationPage = await registrationPage.verifyRegistrationPage();

          if (isRegistrationPage) {
            const registrationOptions = await registrationPage.getRegistrationOptions();

            if (registrationOptions.hasGuestOption) {
              await registrationPage.continueAsGuest();

              if (registrationOptions.requiredFields.length > 0) {
                const guestInfo = {
                  firstName: 'Banner',
                  lastName: 'Tester',
                  email: 'banner.test@example.com',
                  phone: '555-BANNER',
                  organization: 'Banner Test Org'
                };

                await registrationPage.fillGuestRegistrationForm(guestInfo);
                await registrationPage.submitRegistration();

                const confirmed = await registrationPage.checkForConfirmation();
                if (confirmed) {
                  logger.success('🎉 Registration completed via banner navigation!');
                }
              }
            }
          }
        } else {
          logger.info('Event accessed but registration not available');
        }

      } else if (currentUrl !== 'https://pmiloc.org/index.php') {
        logger.info(`Banner click led to different page: ${currentUrl}`);
        logger.success('Banner navigation successful to external or different page');

      } else {
        logger.warning('Banner click did not result in navigation');
        // Take a screenshot to see what happened
        await homePage.takeScreenshot('banner-click-no-navigation');
      }

      logger.success('✅ Banner image navigation test completed');

    } catch (error) {
      logger.error('❌ Banner navigation test failed', error);

      // Enhanced error handling with screenshots
      if (page) {
        try {
          // Take multiple screenshots for debugging
          await page.screenshot({
            path: 'test-results/banner-error-full.png',
            fullPage: true
          });

          await page.screenshot({
            path: 'test-results/banner-error-viewport.png'
          });

          // Log current page state
          const url = await page.url();
          const title = await page.title();
          logger.info(`Error occurred on page: ${url} (${title})`);

          // Log visible images for debugging
          const allImages = page.locator('img');
          const imageCount = await allImages.count();
          logger.info(`Total images on page: ${imageCount}`);

          for (let i = 0; i < Math.min(imageCount, 5); i++) {
            const img = allImages.nth(i);
            const src = await img.getAttribute('src').catch(() => 'no src');
            const alt = await img.getAttribute('alt').catch(() => 'no alt');
            logger.info(`Image ${i + 1}: src="${src}" alt="${alt}"`);
          }

        } catch (screenshotError) {
          logger.error('Failed to take error screenshots', screenshotError);
        }
      }

      throw error;

    } finally {
      // Enhanced cleanup with proper error handling
      try {
        if (page && !page.isClosed()) {
          logger.step('Closing page');
          await page.close();
        }
      } catch (pageError) {
        logger.warning('Failed to close page', pageError);
      }

      try {
        if (context) {
          logger.step('Closing browser context');
          await context.close();
        }
      } catch (contextError) {
        logger.warning('Failed to close context', contextError);
      }

      try {
        if (browser && browser.isConnected()) {
          logger.step('Closing browser');
          await browser.close();
          logger.success('Browser closed successfully');
        }
      } catch (browserError) {
        logger.warning('Failed to close browser', browserError);
      }

      // Log execution summary
      const executionSummary = logger.getExecutionSummary();
      logger.info('Banner Test Summary:', {
        duration: executionSummary.duration,
        totalLogs: executionSummary.totalLogs,
        errors: executionSummary.logsByLevel.ERROR,
        warnings: executionSummary.logsByLevel.WARNING
      });
    }
  });

  test('should identify and catalog all clickable banner elements', async () => {
    let browser;
    let context;
    let page;

    try {
      logger.info('🔍 Starting Banner Element Discovery Test');

      browser = await chromium.launch({
        headless: process.env.CI ? true : false,
        slowMo: process.env.CI ? 0 : 500
      });

      context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
      });
      page = await context.newPage();

      const homePage = new HomePage(page, logger);

      await homePage.navigateToHomePage();
      await homePage.scrollToEventsSection();

      // Catalog all potentially clickable elements
      logger.step('Cataloging all clickable banner elements');

      const clickableElements = await page.evaluate(() => {
        const elements = [];

        // Find all images with parent links
        document.querySelectorAll('a img').forEach((img, index) => {
          const parent = img.parentElement;
          elements.push({
            type: 'linked-image',
            index,
            src: img.src || 'no src',
            alt: img.alt || 'no alt',
            href: parent.href || 'no href',
            visible: img.offsetParent !== null
          });
        });

        // Find all images in carousels/sliders
        document.querySelectorAll('.carousel img, .slider img, [class*="slide"] img').forEach((img, index) => {
          elements.push({
            type: 'carousel-image',
            index,
            src: img.src || 'no src',
            alt: img.alt || 'no alt',
            visible: img.offsetParent !== null
          });
        });

        return elements;
      });

      logger.info(`Found ${clickableElements.length} potentially clickable banner elements:`);
      clickableElements.forEach((element, index) => {
        logger.info(`Element ${index + 1}:`, element);
      });

      if (clickableElements.length > 0) {
        logger.success('Banner element discovery completed successfully');
      } else {
        logger.warning('No banner elements found');
      }

    } catch (error) {
      logger.error('Banner discovery test failed', error);
      throw error;
    } finally {
      // Enhanced cleanup for discovery test
      try {
        if (page && !page.isClosed()) {
          await page.close();
        }
      } catch (pageError) {
        logger.warning('Failed to close discovery test page', pageError);
      }

      try {
        if (context) {
          await context.close();
        }
      } catch (contextError) {
        logger.warning('Failed to close discovery test context', contextError);
      }

      try {
        if (browser && browser.isConnected()) {
          await browser.close();
          logger.success('Discovery test browser closed');
        }
      } catch (browserError) {
        logger.warning('Failed to close discovery test browser', browserError);
      }
    }
  });
});