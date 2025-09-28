import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { TestLogger } from '../utils/logger';

export class HomePage extends BasePage {
  // Navigation elements
  private readonly eventsTab: Locator;
  private readonly calendarLink: Locator;
  private readonly homePageLink: Locator;

  // Event elements
  private readonly upcomingEventsSection: Locator;
  private readonly firstEventDetailsLink: Locator;
  private readonly eventCarouselImages: Locator;
  private readonly firstBannerImage: Locator;

  // Quick links
  private readonly upcomingEventsQuickLink: Locator;
  private readonly memberLoginLink: Locator;

  // Event listing elements
  private readonly eventTitles: Locator;
  private readonly eventDates: Locator;
  private readonly registerLinks: Locator;
  private readonly viewDetailsLinks: Locator;

  constructor(page: Page, logger: TestLogger) {
    super(page, logger);

    // Navigation
    this.eventsTab = page.locator('text=Events').first();
    this.calendarLink = page.getByRole('link', { name: 'Calendar' });
    this.homePageLink = page.getByRole('link', { name: 'Home Page' });

    // Events section
    this.upcomingEventsSection = page.locator('text=Webinars & In Person Events');
    this.firstEventDetailsLink = page.getByRole('link', { name: 'View Details ►' }).first();
    this.eventCarouselImages = page.locator('.carousel img, .slider img, [class*="slide"] img, [class*="banner"] img').first();
    this.firstBannerImage = page.locator('img').first();

    // Quick links
    this.upcomingEventsQuickLink = page.getByRole('link', { name: 'UPCOMING EVENTS' });
    this.memberLoginLink = page.getByRole('link', { name: 'Login' }).first();

    // Event details
    this.eventTitles = page.locator('h3');
    this.eventDates = page.locator('text=/.*\\d{1,2}, \\d{4}.*/');
    this.registerLinks = page.getByRole('link', { name: 'Register' });
    this.viewDetailsLinks = page.getByRole('link', { name: 'View Details ►' });
  }

  async navigateToHomePage(): Promise<void> {
    await this.navigateTo('/index.php');
    await this.waitForElement(this.upcomingEventsSection, 'Upcoming Events Section');
  }

  async clickEventsTab(): Promise<void> {
    await this.clickElement(this.eventsTab, 'Events Tab');
    await this.waitForNavigation();
  }

  async navigateToEventsViaQuickLink(): Promise<void> {
    await this.clickElement(this.upcomingEventsQuickLink, 'Upcoming Events Quick Link');
    await this.waitForNavigation('meetinginfo');
  }

  async navigateToCalendar(): Promise<void> {
    await this.clickElement(this.calendarLink, 'Calendar Link');
    await this.waitForNavigation('calendar');
  }

  async getFirstEventDetails(): Promise<{ title: string; date: string }> {
    try {
      this.logger.step('Getting first event details');

      // Find the first event title
      const eventTitle = await this.eventTitles.first().textContent() || 'No title found';

      // Find the first event date
      const eventDate = await this.eventDates.first().textContent() || 'No date found';

      this.logger.success(`Found event: ${eventTitle} on ${eventDate}`);

      return {
        title: eventTitle.trim(),
        date: eventDate.trim()
      };
    } catch (error) {
      this.logger.error('Failed to get event details', error);
      return { title: 'Error getting title', date: 'Error getting date' };
    }
  }

  async clickFirstEventDetails(): Promise<void> {
    const eventDetails = await this.getFirstEventDetails();
    this.logger.info(`Clicking details for event: ${eventDetails.title}`);

    await this.clickElement(this.firstEventDetailsLink, `First Event Details (${eventDetails.title})`);
    await this.waitForNavigation('meetinginfo');
  }

  async clickFirstBannerImage(): Promise<void> {
    try {
      this.logger.step('Looking for first banner/carousel image');

      // Try to find carousel or banner images first
      const carouselImage = this.eventCarouselImages;
      const imageCount = await carouselImage.count();

      if (imageCount > 0) {
        this.logger.info(`Found ${imageCount} banner/carousel images`);
        await this.clickElement(carouselImage, 'First Banner/Carousel Image');
      } else {
        // Fallback to first image on page
        this.logger.warning('No carousel images found, trying first image on page');
        await this.clickElement(this.firstBannerImage, 'First Image on Page');
      }

      await this.waitForNavigation();
    } catch (error) {
      this.logger.error('Failed to click banner image', error);
      throw error;
    }
  }

  async getAvailableEvents(): Promise<Array<{ title: string; hasRegister: boolean; hasDetails: boolean }>> {
    try {
      this.logger.step('Scanning available events');

      const events = [];
      const eventTitleElements = await this.eventTitles.all();

      for (let i = 0; i < eventTitleElements.length; i++) {
        const title = await eventTitleElements[i].textContent() || `Event ${i + 1}`;

        // Check if this event has register and details links
        const hasRegister = await this.registerLinks.nth(i).isVisible().catch(() => false);
        const hasDetails = await this.viewDetailsLinks.nth(i).isVisible().catch(() => false);

        events.push({
          title: title.trim(),
          hasRegister,
          hasDetails
        });
      }

      this.logger.success(`Found ${events.length} events`);
      events.forEach((event, index) => {
        this.logger.info(`Event ${index + 1}: ${event.title} | Register: ${event.hasRegister} | Details: ${event.hasDetails}`);
      });

      return events;
    } catch (error) {
      this.logger.error('Failed to scan events', error);
      return [];
    }
  }

  async scrollToEventsSection(): Promise<void> {
    try {
      this.logger.step('Scrolling to events section');
      await this.upcomingEventsSection.scrollIntoViewIfNeeded();
      this.logger.success('Scrolled to events section');
    } catch (error) {
      this.logger.warning('Could not scroll to events section', error);
    }
  }
}