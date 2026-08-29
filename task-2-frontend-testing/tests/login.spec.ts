import { expect, test } from "@fixture/pages";

test.describe("Login page", () => {
    test("keeps the login button disabled while the form is empty", async ({ loginPage }) => {
        await loginPage.navigate();

        await expect(loginPage.loginButton).toBeDisabled();

        await loginPage.usernameInput.fill("someone");
        await expect(loginPage.loginButton).toBeDisabled();

        await loginPage.passwordInput.fill("secret");
        await expect(loginPage.loginButton).toBeEnabled();
    });

    test("navigates to the registration page", async ({ loginPage, registerPage }) => {
        await loginPage.navigate();

        await loginPage.registerLink.click();

        await expect(registerPage.heading).toBeVisible();
        await expect(registerPage.usernameInput).toBeVisible();
    });

    test("redirects unauthenticated users to the login page", async ({ page, loginPage, homePage }) => {
        await homePage.navigate();

        await expect(loginPage.heading).toBeVisible();
        await expect(page).toHaveURL(/#\/login$/u);
    });

    test("logs in a registered user", async ({ registeredUser, loginPage, homePage }) => {
        await loginPage.navigate();

        await loginPage.login(registeredUser.username, registeredUser.password);

        await expect(homePage.heading).toHaveText(
            `Hi ${registeredUser.firstName}!`,
        );
        await expect(homePage.loggedInText).toBeVisible();
        await expect(homePage.userRow(registeredUser.username)).toContainText(
            `${registeredUser.firstName} ${registeredUser.lastName}`,
        );
    });

    test("rejects a wrong password", async ({ registeredUser, loginPage }) => {
        await loginPage.navigate();

        await loginPage.login(registeredUser.username, "wrong-password");

        await expect(loginPage.errorMessage).toHaveText(
            "Username or password is incorrect",
        );
        await expect(loginPage.heading).toBeVisible();
    });

    test("rejects an unknown username", async ({ loginPage }) => {
        await loginPage.navigate();

        await loginPage.login("not_a_registered_user", "irrelevant");

        await expect(loginPage.errorMessage).toHaveText(
            "Username or password is incorrect",
        );
    });

    test("logs the user out again", async ({ registeredUser, loginPage, homePage }) => {
        await loginPage.navigate();
        await loginPage.login(registeredUser.username, registeredUser.password);
        await expect(homePage.loggedInText).toBeVisible();

        await homePage.logout();

        await expect(loginPage.heading).toBeVisible();
    });
});
