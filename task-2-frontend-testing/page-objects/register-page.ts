import type { Locator, Page } from "@playwright/test";
import type { TestUser } from "@test-types/testuser";

export class RegisterPage {
    readonly heading: Locator;
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly registerButton: Locator;
    readonly cancelLink: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole("heading", { name: "Register" });
        this.firstNameInput = page.locator("input[name='firstName']");
        this.lastNameInput = page.locator("input[name='lastName']");
        this.usernameInput = page.locator("input[name='username']");
        this.passwordInput = page.locator("input[name='password']");
        this.registerButton = page.getByRole("button", { name: "Register" });
        this.cancelLink = page.getByRole("link", { name: "Cancel" });
    }

    async navigate(): Promise<void> {
        await this.page.goto("#/register");
        await this.heading.waitFor({ state: "visible" });
    }

    async fillForm(user: TestUser): Promise<void> {
        await this.firstNameInput.fill(user.firstName);
        await this.lastNameInput.fill(user.lastName);
        await this.usernameInput.fill(user.username);
        await this.passwordInput.fill(user.password);
    }

    async submit(): Promise<void> {
        await this.registerButton.click();
    }

    async register(user: TestUser): Promise<void> {
        await this.fillForm(user);
        await this.submit();
    }
}
