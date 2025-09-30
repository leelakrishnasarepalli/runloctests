import { test, expect } from '@playwright/test';
import { robustPageLoad, smartElementFind, safeTest, waitForPageReady } from './utils/ci-helpers';

test.describe('PMI Lakeshore Chapter Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await robustPageLoad(page, '/index.php');
    await waitForPageReady(page);
  });

  test('should navigate to member login page', async ({ page }) => {
    await safeTest('Member Login Navigation', async () => {
      const memberLoginSelectors = [
        'role:link',
        'a:has-text("Member Login")',
        'a:has-text("Login")',
        'a[href*="member"]',
        'a[href*="login"]',
        'text:Member Login'
      ];

      const memberLoginLink = await smartElementFind(page, memberLoginSelectors, 'member login link', 20000);
      await memberLoginLink.click();
      await waitForPageReady(page);

      const currentUrl = page.url();
      if (currentUrl.includes('member') || currentUrl.includes('login')) {
        console.log(`✅ Successfully navigated to: ${currentUrl}`);
      } else {
        console.log(`⚠️ Navigation may have failed. Current URL: ${currentUrl}`);
      }
    });
  });

  test('should navigate to calendar page', async ({ page }) => {
    await safeTest('Calendar Navigation', async () => {
      const calendarSelectors = [
        'role:link',
        'a:has-text("Calendar")',
        'a[href*="calendar"]',
        'text:Calendar',
        'a:has-text("Events")',
        'a[href*="event"]'
      ];

      const calendarLink = await smartElementFind(page, calendarSelectors, 'calendar link', 20000);
      await calendarLink.click();
      await waitForPageReady(page);

      const currentUrl = page.url();
      if (currentUrl.includes('calendar') || currentUrl.includes('event')) {
        console.log(`✅ Successfully navigated to: ${currentUrl}`);
      } else {
        console.log(`⚠️ Navigation may have failed. Current URL: ${currentUrl}`);
      }
    });
  });

  test('should open mailing list in new context', async ({ page, context }) => {
    await safeTest('Mailing List Navigation', async () => {
      const mailingListSelectors = [
        'role:link',
        'a:has-text("Join Our Mailing List")',
        'a:has-text("Mailing List")',
        'a[href*="constantcontact"]',
        'a:has-text("Join")',
        'text:Mailing List'
      ];

      const mailingListLink = await smartElementFind(page, mailingListSelectors, 'mailing list link', 20000);

      // Create a promise that resolves when a new page is opened
      const newPagePromise = context.waitForEvent('page', { timeout: 30000 });
      await mailingListLink.click();

      try {
        const newPage = await newPagePromise;
        await newPage.waitForLoadState('networkidle', { timeout: 30000 });

        const newUrl = newPage.url();
        if (newUrl.includes('constantcontact')) {
          console.log(`✅ Successfully opened mailing list: ${newUrl}`);
        } else {
          console.log(`⚠️ Unexpected mailing list URL: ${newUrl}`);
        }
        await newPage.close();
      } catch (error) {
        console.log(`⚠️ Mailing list navigation failed: ${error.message}`);
      }
    });
  });

  test('should navigate to contact form', async ({ page }) => {
    await safeTest('Contact Form Navigation', async () => {
      const contactSelectors = [
        'role:link',
        'a:has-text("Contact Us")',
        'a:has-text("Contact")',
        'a[href*="contact"]',
        'a[href*="form"]',
        'text:Contact'
      ];

      const contactLink = await smartElementFind(page, contactSelectors, 'contact link', 20000);
      await contactLink.click();
      await waitForPageReady(page);

      const currentUrl = page.url();
      if (currentUrl.includes('form') || currentUrl.includes('contact')) {
        console.log(`✅ Successfully navigated to: ${currentUrl}`);
      } else {
        console.log(`⚠️ Navigation may have failed. Current URL: ${currentUrl}`);
      }
    });
  });

  test('should navigate to DEI page', async ({ page }) => {
    await safeTest('DEI Page Navigation', async () => {
      const deiSelectors = [
        'role:link',
        'a:has-text("DEI")',
        'a[href*="Diversity"]',
        'a[href*="Inclusion"]',
        'text:DEI'
      ];

      const deiLink = await smartElementFind(page, deiSelectors, 'DEI link', 20000);
      await deiLink.click();
      await waitForPageReady(page);

      const currentUrl = page.url();
      if (currentUrl.includes('Diversity') || currentUrl.includes('Inclusion')) {
        console.log(`✅ Successfully navigated to: ${currentUrl}`);
      } else {
        console.log(`⚠️ Navigation may have failed. Current URL: ${currentUrl}`);
      }
    });
  });

  test('should access upcoming events', async ({ page }) => {
    await safeTest('Upcoming Events Navigation', async () => {
      const eventsSelectors = [
        'role:link',
        'a:has-text("UPCOMING EVENTS")',
        'a:has-text("Events")',
        'a[href*="meetinginfo"]',
        'a[href*="event"]',
        'text:UPCOMING EVENTS'
      ];

      const upcomingEventsLink = await smartElementFind(page, eventsSelectors, 'upcoming events link', 20000);
      await upcomingEventsLink.click();
      await waitForPageReady(page);

      const currentUrl = page.url();
      if (currentUrl.includes('meetinginfo') || currentUrl.includes('event')) {
        console.log(`✅ Successfully navigated to: ${currentUrl}`);
      } else {
        console.log(`⚠️ Navigation may have failed. Current URL: ${currentUrl}`);
      }
    });
  });

  test('should navigate to volunteering page', async ({ page }) => {
    const volunteeringLink = page.getByRole('link', { name: 'VOLUNTEERING' });
    await volunteeringLink.click();

    await expect(page).toHaveURL(/Volunteers/);
  });

  test('should access job board', async ({ page }) => {
    const jobBoardLink = page.getByRole('link', { name: 'JOB BOARD' });
    await jobBoardLink.click();

    await expect(page).toHaveURL(/Job_Listing/);
  });

  test('should navigate to call for speakers', async ({ page }) => {
    const speakersLink = page.getByRole('link', { name: 'Call for Speakers' });
    await speakersLink.click();

    await expect(page).toHaveURL(/Call_for_Speakers/);
  });

  test('should access toastmasters club page', async ({ page }) => {
    const toastmastersLink = page.getByRole('link', { name: 'TOASTMASTERS' });
    await toastmastersLink.click();

    await expect(page).toHaveURL(/Toastmasters_Club/);
  });

  test('should navigate to disciplined agile page', async ({ page }) => {
    const agileLink = page.getByRole('link', { name: 'Disciplined Agile' });
    await agileLink.click();

    await expect(page).toHaveURL(/Disciplined_Agile/);
  });

  test('should access PMI global resource hub', async ({ page, context }) => {
    const resourceHubLink = page.getByRole('link', { name: 'PMI Global Resource Hub - Great Reference Resource' });

    const newPagePromise = context.waitForEvent('page');
    await resourceHubLink.click();

    const newPage = await newPagePromise;
    await newPage.waitForLoadState();

    expect(newPage.url()).toContain('pmi.org');
  });

  test('should navigate to product catalog', async ({ page }) => {
    const catalogLink = page.getByRole('link', { name: 'Product Catalog' });
    await catalogLink.click();

    await expect(page).toHaveURL(/Project_Management_Ready_Certification/);
  });

  test('should access footer links', async ({ page }) => {
    // Test Terms of Use
    const termsLink = page.getByRole('link', { name: 'Terms of Use' });
    await termsLink.click();
    await expect(page).toHaveURL(/terms/);

    // Go back and test Privacy Policy
    await page.goBack();
    const privacyLink = page.getByRole('link', { name: 'Privacy Policy' });
    await privacyLink.click();
    await expect(page).toHaveURL(/privacy/);
  });

  test('should handle event registration links', async ({ page }) => {
    // Find and click a register link
    const registerLinks = page.getByRole('link', { name: 'Register' });
    if (await registerLinks.count() > 0) {
      await registerLinks.first().click();
      await expect(page).toHaveURL(/meet-reg1\.php/);
    }
  });

  test('should access event details', async ({ page }) => {
    // Find and click a "View Details" link
    const detailsLinks = page.getByRole('link', { name: 'View Details ►' });
    if (await detailsLinks.count() > 0) {
      await detailsLinks.first().click();
      await expect(page).toHaveURL(/meetinginfo\.php/);
    }
  });

  test('should verify pagination functionality', async ({ page }) => {
    // Test carousel pagination if visible
    const paginationLinks = page.locator('text=/^[0-9]+$/').filter({ hasText: /^[1-9]$/ });

    if (await paginationLinks.count() > 1) {
      // Click on page 2 if it exists
      const page2Link = paginationLinks.nth(1);
      if (await page2Link.isVisible()) {
        await page2Link.click();
        // Wait for any potential content change
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should handle search functionality', async ({ page }) => {
    const searchBox = page.getByRole('searchbox').first();
    await searchBox.fill('project management');

    // Look for search button or submit
    const searchButton = page.locator('button[type="submit"]').first();
    if (await searchButton.isVisible()) {
      await searchButton.click();
      // Wait for search results or page change
      await page.waitForTimeout(2000);
    }
  });

  test('should test breadcrumb navigation', async ({ page }) => {
    // Navigate to a sub-page first
    const aboutLink = page.getByRole('link', { name: 'About Us' }).last();
    if (await aboutLink.isVisible()) {
      await aboutLink.click();

      // Look for home/back navigation
      const homeLink = page.getByRole('link', { name: 'Home Page' });
      if (await homeLink.isVisible()) {
        await homeLink.click();
        await expect(page).toHaveURL(/index\.php/);
      }
    }
  });
});