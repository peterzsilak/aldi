import type { Locator, Page } from "@playwright/test";

export class LoginPage {
    readonly heading: Locator;
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly registerLink: Locator;
    readonly successMessage: Locator;
    readonly errorMessage: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole("heading", { name: "Login" });
        this.usernameInput = page.locator("input[name='username']");
        this.passwordInput = page.locator("input[name='password']");
        this.loginButton = page.getByRole("button", { name: "Login" });
        this.registerLink = page.getByRole("link", { name: "Register" });
        this.successMessage = page.locator(".alert-success");
        this.errorMessage = page.locator(".alert-danger");
    }

    async navigate(): Promise<void> {
        await this.page.goto("#/login");
        await this.heading.waitFor({ state: "visible" });
    }

    async fillForm(username: string, password: string): Promise<void> {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
    }

    async submit(): Promise<void> {
        await this.loginButton.click();
    }

    async login(username: string, password: string): Promise<void> {
        await this.fillForm(username, password);
        await this.submit();
    }
}
