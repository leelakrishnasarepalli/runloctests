import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { TestLogger } from '../utils/logger';

export class RegistrationPage extends BasePage {
  // Registration form elements
  private readonly registrationForm: Locator;
  private readonly firstNameField: Locator;
  private readonly lastNameField: Locator;
  private readonly emailField: Locator;
  private readonly phoneField: Locator;
  private readonly organizationField: Locator;

  // Guest registration
  private readonly continueAsGuestButton: Locator;
  private readonly continueAsGuestLink: Locator;
  private readonly guestRegistrationSection: Locator;

  // Member login
  private readonly memberLoginButton: Locator;
  private readonly usernameField: Locator;
  private readonly passwordField: Locator;

  // Form actions
  private readonly submitButton: Locator;
  private readonly registerButton: Locator;
  private readonly cancelButton: Locator;
  private readonly backButton: Locator;

  // Page elements
  private readonly pageTitle: Locator;
  private readonly eventTitle: Locator;
  private readonly confirmationMessage: Locator;

  // Terms and conditions
  private readonly termsCheckbox: Locator;
  private readonly privacyCheckbox: Locator;

  constructor(page: Page, logger: TestLogger) {
    super(page, logger);

    // Form elements
    this.registrationForm = page.locator('form, .registration-form, .reg-form').first();
    this.firstNameField = page.locator('input[name*="first"], input[name*="fname"], input[placeholder*="First"]').first();
    this.lastNameField = page.locator('input[name*="last"], input[name*="lname"], input[placeholder*="Last"]').first();
    this.emailField = page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]').first();
    this.phoneField = page.locator('input[type="tel"], input[name*="phone"], input[placeholder*="phone"]').first();
    this.organizationField = page.locator('input[name*="org"], input[name*="company"], input[placeholder*="Organization"]').first();

    // Guest options
    this.continueAsGuestButton = page.getByRole('button', { name: /guest/i });
    this.continueAsGuestLink = page.getByRole('link', { name: /guest/i });
    this.guestRegistrationSection = page.locator('.guest, .guest-registration, text=/guest/i').first();

    // Login options
    this.memberLoginButton = page.getByRole('button', { name: /login/i });
    this.usernameField = page.locator('input[name*="user"], input[name*="login"], input[placeholder*="Username"]').first();
    this.passwordField = page.locator('input[type="password"], input[name*="pass"], input[placeholder*="Password"]').first();

    // Action buttons
    this.submitButton = page.getByRole('button', { name: /submit/i });
    this.registerButton = page.getByRole('button', { name: /register/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
    this.backButton = page.getByRole('button', { name: /back/i });

    // Page info
    this.pageTitle = page.locator('h1, h2, .page-title, .title').first();
    this.eventTitle = page.locator('.event-title, .event-name, h1, h2').first();
    this.confirmationMessage = page.locator('.success, .confirmation, .message, text=/success/i').first();

    // Terms
    this.termsCheckbox = page.locator('input[type="checkbox"][name*="terms"], input[type="checkbox"][name*="agree"]').first();
    this.privacyCheckbox = page.locator('input[type="checkbox"][name*="privacy"], input[type="checkbox"][name*="policy"]').first();
  }

  async verifyRegistrationPage(): Promise<boolean> {
    try {
      this.logger.step('Verifying registration page');

      const currentUrl = await this.getCurrentUrl();
      const isRegistrationPage = currentUrl.includes('reg') ||
                                currentUrl.includes('register') ||
                                currentUrl.includes('signup') ||
                                currentUrl.includes('meeting');

      if (isRegistrationPage) {
        this.logger.success('Confirmed on registration page');

        // Try to get page title
        const title = await this.getElementText(this.pageTitle, 'Page Title').catch(() => 'No title found');
        this.logger.info(`Page title: ${title}`);

        return true;
      } else {
        this.logger.warning(`Unexpected page: ${currentUrl}`);
        return false;
      }

    } catch (error) {
      this.logger.error('Failed to verify registration page', error);
      return false;
    }
  }

  async continueAsGuest(): Promise<void> {
    try {
      this.logger.step('Attempting to continue as guest');

      // First check if guest options are available
      const guestButtonVisible = await this.continueAsGuestButton.isVisible().catch(() => false);
      const guestLinkVisible = await this.continueAsGuestLink.isVisible().catch(() => false);

      if (guestButtonVisible) {
        await this.clickElement(this.continueAsGuestButton, 'Continue as Guest Button');
      } else if (guestLinkVisible) {
        await this.clickElement(this.continueAsGuestLink, 'Continue as Guest Link');
      } else {
        // Look for any guest-related text or links
        const guestElements = this.page.locator('text=/guest/i, text=/continue/i, text=/without.*account/i');
        const guestCount = await guestElements.count();

        if (guestCount > 0) {
          this.logger.info(`Found ${guestCount} potential guest options`);
          for (let i = 0; i < Math.min(guestCount, 3); i++) {
            const element = guestElements.nth(i);
            const text = await element.textContent();
            this.logger.info(`Guest option ${i + 1}: ${text}`);

            if (text && text.toLowerCase().includes('guest')) {
              await this.clickElement(element, `Guest Option: ${text}`);
              break;
            }
          }
        } else {
          this.logger.warning('No guest registration option found');
          throw new Error('Guest registration not available');
        }
      }

      await this.waitForNavigation();
      this.logger.success('Successfully continued as guest');

    } catch (error) {
      this.logger.error('Failed to continue as guest', error);
      throw error;
    }
  }

  async fillGuestRegistrationForm(guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    organization?: string;
  }): Promise<void> {
    try {
      this.logger.step('Filling guest registration form');

      // Fill required fields
      if (await this.firstNameField.isVisible().catch(() => false)) {
        await this.fillInput(this.firstNameField, guestInfo.firstName, 'First Name');
      }

      if (await this.lastNameField.isVisible().catch(() => false)) {
        await this.fillInput(this.lastNameField, guestInfo.lastName, 'Last Name');
      }

      if (await this.emailField.isVisible().catch(() => false)) {
        await this.fillInput(this.emailField, guestInfo.email, 'Email');
      }

      // Fill optional fields if present
      if (guestInfo.phone && await this.phoneField.isVisible().catch(() => false)) {
        await this.fillInput(this.phoneField, guestInfo.phone, 'Phone');
      }

      if (guestInfo.organization && await this.organizationField.isVisible().catch(() => false)) {
        await this.fillInput(this.organizationField, guestInfo.organization, 'Organization');
      }

      // Handle checkboxes if present
      if (await this.termsCheckbox.isVisible().catch(() => false)) {
        await this.clickElement(this.termsCheckbox, 'Terms and Conditions Checkbox');
      }

      if (await this.privacyCheckbox.isVisible().catch(() => false)) {
        await this.clickElement(this.privacyCheckbox, 'Privacy Policy Checkbox');
      }

      this.logger.success('Registration form filled successfully');

    } catch (error) {
      this.logger.error('Failed to fill registration form', error);
      throw error;
    }
  }

  async submitRegistration(): Promise<void> {
    try {
      this.logger.step('Submitting registration');

      // Try different submit buttons
      const submitVisible = await this.submitButton.isVisible().catch(() => false);
      const registerVisible = await this.registerButton.isVisible().catch(() => false);

      if (submitVisible) {
        await this.clickElement(this.submitButton, 'Submit Button');
      } else if (registerVisible) {
        await this.clickElement(this.registerButton, 'Register Button');
      } else {
        // Look for any submit-like button
        const submitElements = this.page.locator('button[type="submit"], input[type="submit"], button:has-text("Submit"), button:has-text("Register")');
        const submitCount = await submitElements.count();

        if (submitCount > 0) {
          await this.clickElement(submitElements.first(), 'Submit Element');
        } else {
          throw new Error('No submit button found');
        }
      }

      await this.waitForNavigation();
      this.logger.success('Registration submitted successfully');

    } catch (error) {
      this.logger.error('Failed to submit registration', error);
      throw error;
    }
  }

  async checkForConfirmation(): Promise<boolean> {
    try {
      this.logger.step('Checking for confirmation message');

      await this.page.waitForTimeout(2000); // Wait for any redirect/confirmation

      const confirmationVisible = await this.confirmationMessage.isVisible().catch(() => false);

      if (confirmationVisible) {
        const confirmationText = await this.getElementText(this.confirmationMessage, 'Confirmation Message');
        this.logger.success(`Registration confirmed: ${confirmationText}`);
        return true;
      } else {
        // Check URL for success indicators
        const currentUrl = await this.getCurrentUrl();
        const urlIndicatesSuccess = currentUrl.includes('success') ||
                                   currentUrl.includes('confirm') ||
                                   currentUrl.includes('thank');

        if (urlIndicatesSuccess) {
          this.logger.success('Registration appears successful based on URL');
          return true;
        } else {
          this.logger.warning('No clear confirmation found');
          return false;
        }
      }

    } catch (error) {
      this.logger.error('Failed to check confirmation', error);
      return false;
    }
  }

  async getRegistrationOptions(): Promise<{
    hasGuestOption: boolean;
    hasMemberLogin: boolean;
    requiredFields: string[];
  }> {
    try {
      this.logger.step('Analyzing registration options');

      const hasGuestOption = await this.continueAsGuestButton.isVisible().catch(() => false) ||
                            await this.continueAsGuestLink.isVisible().catch(() => false) ||
                            await this.guestRegistrationSection.isVisible().catch(() => false);

      const hasMemberLogin = await this.memberLoginButton.isVisible().catch(() => false) ||
                            await this.usernameField.isVisible().catch(() => false);

      // Check for required fields
      const requiredFields = [];
      if (await this.firstNameField.isVisible().catch(() => false)) requiredFields.push('firstName');
      if (await this.lastNameField.isVisible().catch(() => false)) requiredFields.push('lastName');
      if (await this.emailField.isVisible().catch(() => false)) requiredFields.push('email');
      if (await this.phoneField.isVisible().catch(() => false)) requiredFields.push('phone');

      const options = {
        hasGuestOption,
        hasMemberLogin,
        requiredFields
      };

      this.logger.info(`Registration options: ${JSON.stringify(options)}`);

      return options;

    } catch (error) {
      this.logger.error('Failed to analyze registration options', error);
      return {
        hasGuestOption: false,
        hasMemberLogin: false,
        requiredFields: []
      };
    }
  }

  async takeRegistrationScreenshot(): Promise<void> {
    await this.takeScreenshot('registration-page');
  }
}