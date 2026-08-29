import { createTestUser } from "@fixture/test-user";
import { HomePage } from "@page-objects/home-page";
import { LoginPage } from "@page-objects/login-page";
import { RegisterPage } from "@page-objects/register-page";
import { test as base, expect } from "@playwright/test";
import type { TestUser } from "@test-types/testuser";

export interface PageFixtures {
    loginPage: LoginPage;
    registerPage: RegisterPage;
    homePage: HomePage;
    /**
     * A user registered through the UI before the test and removed after it.
     */
    registeredUser: TestUser;
}

export const test = base.extend<PageFixtures>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },

    registerPage: async ({ page }, use) => {
        await use(new RegisterPage(page));
    },

    homePage: async ({ page }, use) => {
        await use(new HomePage(page));
    },

    registeredUser: async ({ registerPage, loginPage, homePage }, use) => {
        const user = createTestUser();

        await registerPage.navigate();
        await registerPage.register(user);
        await expect(loginPage.successMessage).toHaveText("Registration successful");

        await use(user);

        await deleteUser(user, loginPage, homePage);
    },
});

async function deleteUser(user: TestUser, loginPage: LoginPage, homePage: HomePage): Promise<void> {
    await loginPage.navigate();
    await loginPage.login(user.username, user.password);
    await expect(homePage.loggedInText.or(loginPage.errorMessage)).toBeVisible();

    if (await homePage.isDisplayed()) {
        await homePage.deleteUser(user.username);
    }
}

export { expect };
