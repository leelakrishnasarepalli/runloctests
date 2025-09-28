import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { TestLogger } from '../utils/logger';

export class EventDetailsPage extends BasePage {
  // Event information elements
  private readonly eventTitle: Locator;
  private readonly eventDate: Locator;
  private readonly eventTime: Locator;
  private readonly eventLocation: Locator;
  private readonly eventDescription: Locator;

  // Action buttons
  private readonly registerButton: Locator;
  private readonly registerLink: Locator;
  private readonly backButton: Locator;
  private readonly homeLink: Locator;

  // Registration related
  private readonly registrationForm: Locator;
  private readonly continueAsGuestButton: Locator;
  private readonly continueAsGuestLink: Locator;
  private readonly loginButton: Locator;

  // Event metadata
  private readonly eventId: Locator;
  private readonly eventCapacity: Locator;
  private readonly eventPrice: Locator;

  constructor(page: Page, logger: TestLogger) {
    super(page, logger);

    // Event information
    this.eventTitle = page.locator('h1, h2, .event-title, .title').first();
    this.eventDate = page.locator('text=/.*\\d{1,2}, \\d{4}.*/, .date, .event-date').first();
    this.eventTime = page.locator('text=/.*\\d{1,2}:\\d{2}.*/, .time, .event-time').first();
    this.eventLocation = page.locator('.location, .venue, text=/Virtual/, text=/Online/, text=/EDT/, text=/EST/').first();
    this.eventDescription = page.locator('.description, .event-description, p').first();

    // Action buttons - multiple possible selectors
    this.registerButton = page.getByRole('button', { name: /register/i });
    this.registerLink = page.getByRole('link', { name: /register/i });
    this.backButton = page.getByRole('button', { name: /back/i });
    this.homeLink = page.getByRole('link', { name: /home/i });

    // Registration elements
    this.registrationForm = page.locator('form, .registration-form, .reg-form');
    this.continueAsGuestButton = page.getByRole('button', { name: /guest/i });
    this.continueAsGuestLink = page.getByRole('link', { name: /guest/i });
    this.loginButton = page.getByRole('button', { name: /login/i });

    // Metadata
    this.eventId = page.locator('.event-id, [data-event-id]');
    this.eventCapacity = page.locator('.capacity, .max-attendees');
    this.eventPrice = page.locator('.price, .cost, text=/\\$/, text=/free/i');
  }

  async getEventInformation(): Promise<{
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
  }> {
    try {
      this.logger.step('Extracting event information');

      const title = await this.getElementText(this.eventTitle, 'Event Title').catch(() => 'Title not found');
      const date = await this.getElementText(this.eventDate, 'Event Date').catch(() => 'Date not found');
      const time = await this.getElementText(this.eventTime, 'Event Time').catch(() => 'Time not found');
      const location = await this.getElementText(this.eventLocation, 'Event Location').catch(() => 'Location not found');
      const description = await this.getElementText(this.eventDescription, 'Event Description').catch(() => 'Description not found');

      const eventInfo = { title, date, time, location, description };

      this.logger.success('Event information extracted successfully');
      this.logger.info(`Event: ${title}`);
      this.logger.info(`Date: ${date}`);
      this.logger.info(`Time: ${time}`);
      this.logger.info(`Location: ${location}`);

      return eventInfo;
    } catch (error) {
      this.logger.error('Failed to extract event information', error);
      throw error;
    }
  }

  async clickRegisterButton(): Promise<void> {
    try {
      this.logger.step('Looking for Register button/link');

      // First try to find a register button
      const registerButtonCount = await this.registerButton.count();
      const registerLinkCount = await this.registerLink.count();

      this.logger.info(`Found ${registerButtonCount} register buttons and ${registerLinkCount} register links`);

      if (registerButtonCount > 0) {
        await this.clickElement(this.registerButton, 'Register Button');
      } else if (registerLinkCount > 0) {
        await this.clickElement(this.registerLink, 'Register Link');
      } else {
        // Look for any element containing "register"
        const registerElement = this.page.locator('text=/register/i').first();
        await this.clickElement(registerElement, 'Register Element');
      }

      await this.waitForNavigation();
      this.logger.success('Successfully clicked register');

    } catch (error) {
      this.logger.error('Failed to click register button', error);
      throw error;
    }
  }

  async continueAsGuest(): Promise<void> {
    try {
      this.logger.step('Looking for Continue as Guest option');

      // Wait a moment for the registration page to load
      await this.page.waitForTimeout(2000);

      const guestButtonCount = await this.continueAsGuestButton.count();
      const guestLinkCount = await this.continueAsGuestLink.count();

      this.logger.info(`Found ${guestButtonCount} guest buttons and ${guestLinkCount} guest links`);

      if (guestButtonCount > 0) {
        await this.clickElement(this.continueAsGuestButton, 'Continue as Guest Button');
      } else if (guestLinkCount > 0) {
        await this.clickElement(this.continueAsGuestLink, 'Continue as Guest Link');
      } else {
        // Look for any element containing "guest"
        const guestElements = this.page.locator('text=/guest/i, text=/continue/i, text=/proceed/i');
        const guestCount = await guestElements.count();

        if (guestCount > 0) {
          this.logger.info(`Found ${guestCount} potential guest options`);
          await this.clickElement(guestElements.first(), 'Guest Option');
        } else {
          this.logger.warning('No guest option found, registration may require login');
          return;
        }
      }

      await this.waitForNavigation();
      this.logger.success('Successfully continued as guest');

    } catch (error) {
      this.logger.error('Failed to continue as guest', error);
      // Don't throw error as this might be optional
    }
  }

  async verifyEventDetailsPage(): Promise<boolean> {
    try {
      this.logger.step('Verifying event details page');

      const currentUrl = await this.getCurrentUrl();

      // Check if we're on an event details page
      const isEventPage = currentUrl.includes('meetinginfo') ||
                         currentUrl.includes('event') ||
                         currentUrl.includes('details');

      if (isEventPage) {
        this.logger.success('Confirmed on event details page');
        return true;
      } else {
        this.logger.warning(`Unexpected page: ${currentUrl}`);
        return false;
      }

    } catch (error) {
      this.logger.error('Failed to verify event details page', error);
      return false;
    }
  }

  async checkRegistrationAvailability(): Promise<{
    hasRegisterButton: boolean;
    hasGuestOption: boolean;
    requiresLogin: boolean;
  }> {
    try {
      this.logger.step('Checking registration availability');

      const hasRegisterButton = await this.registerButton.isVisible().catch(() => false) ||
                               await this.registerLink.isVisible().catch(() => false);

      const hasGuestOption = await this.continueAsGuestButton.isVisible().catch(() => false) ||
                            await this.continueAsGuestLink.isVisible().catch(() => false);

      const requiresLogin = await this.loginButton.isVisible().catch(() => false);

      const availability = {
        hasRegisterButton,
        hasGuestOption,
        requiresLogin
      };

      this.logger.info(`Registration availability: ${JSON.stringify(availability)}`);

      return availability;

    } catch (error) {
      this.logger.error('Failed to check registration availability', error);
      return {
        hasRegisterButton: false,
        hasGuestOption: false,
        requiresLogin: false
      };
    }
  }

  async takeEventScreenshot(): Promise<void> {
    await this.takeScreenshot('event-details');
  }
}