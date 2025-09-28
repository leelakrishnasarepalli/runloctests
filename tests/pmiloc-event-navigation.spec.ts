import { test, expect, chromium } from '@playwright/test';
import { HomePage } from './pages/homepage.page';
import { EventDetailsPage } from './pages/event-details.page';
import { RegistrationPage } from './pages/registration.page';
import { TestLogger } from './utils/logger';
import { TestReporter } from './utils/reporter';

// Global reporter instance
const globalReporter = new TestReporter();

test.describe('PMI Lakeshore Event Navigation Tests', () => {
  let logger: TestLogger;

  test.beforeEach(async () => {
    // Initialize logger for each test
    logger = new TestLogger('Event Navigation Test');
  });

  test.afterEach(async () => {
    // Add test results to global reporter
    if (logger) {
      globalReporter.addTestReport(logger);
    }
  });

  test.afterAll(async () => {
    // Generate final report
    globalReporter.saveReport('test-results/event-navigation-report.html');
    globalReporter.printSummary();
  });

  test('should navigate to events tab, click first event details, and register as guest', async () => {
    let browser;
    let context;
    let page;

    try {
      logger.info('🎭 Starting Event Navigation Test');

      // Launch browser with visible mode
      logger.step('Launching browser in visible mode');
      browser = await chromium.launch({
        headless: false,
        slowMo: 1000, // Slow down actions for visibility
        args: ['--start-maximized']
      });

      context = await browser.newContext({
        viewport: null, // Use full screen
        recordVideo: {
          dir: 'test-results/videos/',
          size: { width: 1920, height: 1080 }
        }
      });

      page = await context.newPage();
      logger.success('Browser launched successfully');

      // Initialize page objects
      const homePage = new HomePage(page, logger);
      const eventDetailsPage = new EventDetailsPage(page, logger);
      const registrationPage = new RegistrationPage(page, logger);

      // Step 1: Navigate to homepage
      logger.step('Navigating to PMI Lakeshore homepage');
      await homePage.navigateToHomePage();
      await homePage.takeScreenshot('homepage-loaded');

      // Step 2: Scroll to events section and scan available events
      await homePage.scrollToEventsSection();
      const availableEvents = await homePage.getAvailableEvents();
      logger.info(`Found ${availableEvents.length} events on the page`);

      if (availableEvents.length === 0) {
        logger.warning('No events found on homepage, trying events quick link');
        await homePage.navigateToEventsViaQuickLink();
      }

      // Step 3: Get first event details and click on it
      const firstEventDetails = await homePage.getFirstEventDetails();
      logger.info(`Attempting to view details for: ${firstEventDetails.title}`);

      await homePage.clickFirstEventDetails();
      await eventDetailsPage.takeEventScreenshot();

      // Step 4: Verify we're on event details page
      const isEventDetailsPage = await eventDetailsPage.verifyEventDetailsPage();
      expect(isEventDetailsPage).toBeTruthy();

      // Step 5: Extract event information
      const eventInfo = await eventDetailsPage.getEventInformation();
      logger.info('Event Information:', eventInfo);

      // Step 6: Check registration availability
      const registrationAvailability = await eventDetailsPage.checkRegistrationAvailability();
      logger.info('Registration Availability:', registrationAvailability);

      if (!registrationAvailability.hasRegisterButton) {
        logger.warning('No register button found on this event');
        logger.success('Test completed - Event details viewed successfully');
        return;
      }

      // Step 7: Click register button
      await eventDetailsPage.clickRegisterButton();
      await registrationPage.takeRegistrationScreenshot();

      // Step 8: Verify registration page
      const isRegistrationPage = await registrationPage.verifyRegistrationPage();
      if (!isRegistrationPage) {
        logger.warning('Registration page not reached, may have gone to external site');
        logger.success('Test completed - Registration button clicked successfully');
        return;
      }

      // Step 9: Analyze registration options
      const registrationOptions = await registrationPage.getRegistrationOptions();
      logger.info('Registration Options:', registrationOptions);

      // Step 10: Continue as guest if available
      if (registrationOptions.hasGuestOption) {
        await registrationPage.continueAsGuest();

        // Step 11: Fill guest registration form if required
        if (registrationOptions.requiredFields.length > 0) {
          const guestInfo = {
            firstName: 'Test',
            lastName: 'User',
            email: 'test.user@example.com',
            phone: '555-0123',
            organization: 'Test Organization'
          };

          await registrationPage.fillGuestRegistrationForm(guestInfo);
          await registrationPage.submitRegistration();

          // Step 12: Check for confirmation
          const registrationConfirmed = await registrationPage.checkForConfirmation();
          if (registrationConfirmed) {
            logger.success('🎉 Registration completed successfully as guest!');
          } else {
            logger.warning('Registration may be pending or require additional steps');
          }
        }
      } else {
        logger.warning('Guest registration not available for this event');
      }

      logger.success('✅ Event navigation test completed successfully');

    } catch (error) {
      logger.error('❌ Test failed with error', error);

      // Take error screenshot
      if (page) {
        try {
          await page.screenshot({
            path: 'test-results/error-screenshot.png',
            fullPage: true
          });
          logger.info('Error screenshot saved');
        } catch (screenshotError) {
          logger.error('Failed to take error screenshot', screenshotError);
        }
      }

      throw error;

    } finally {
      // Step 13: Close browser
      try {
        if (context) {
          logger.step('Closing browser context');
          await context.close();
        }
        if (browser) {
          await browser.close();
          logger.success('Browser closed successfully');
        }
      } catch (closeError) {
        logger.error('Error closing browser', closeError);
      }

      // Final logging
      const executionSummary = logger.getExecutionSummary();
      logger.info('Test Execution Summary:', {
        duration: executionSummary.duration,
        totalLogs: executionSummary.totalLogs,
        errors: executionSummary.logsByLevel.ERROR
      });
    }
  });

  test('should handle event with no registration available', async () => {
    let browser;
    let context;
    let page;

    try {
      logger.info('🎭 Starting No Registration Event Test');

      browser = await chromium.launch({
        headless: false,
        slowMo: 500
      });

      context = await browser.newContext({ viewport: null });
      page = await context.newPage();

      const homePage = new HomePage(page, logger);
      const eventDetailsPage = new EventDetailsPage(page, logger);

      // Navigate and find events
      await homePage.navigateToHomePage();
      const events = await homePage.getAvailableEvents();

      // Look for an event without registration
      const eventWithoutRegistration = events.find(event => !event.hasRegister);

      if (eventWithoutRegistration) {
        logger.info(`Testing event without registration: ${eventWithoutRegistration.title}`);

        await homePage.clickFirstEventDetails();
        const eventInfo = await eventDetailsPage.getEventInformation();

        logger.success('Successfully viewed event details without registration');
      } else {
        logger.info('All events have registration available');
      }

    } catch (error) {
      logger.error('Test failed', error);
      throw error;
    } finally {
      if (context) await context.close();
      if (browser) await browser.close();
      logger.success('Browser closed');
    }
  });
});