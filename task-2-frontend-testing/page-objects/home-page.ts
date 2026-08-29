import type { Locator, Page } from "@playwright/test";

export class HomePage {
    readonly heading: Locator;
    readonly loggedInText: Locator;
    readonly userList: Locator;
    readonly userRows: Locator;
    readonly logoutLink: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole("heading", { level: 1 });
        this.loggedInText = page.getByText("You're logged in!!");
        this.userList = page.getByRole("list");
        this.userRows = page.getByRole("listitem");
        this.logoutLink = page.getByRole("link", { name: "Logout" });
    }

    async navigate(): Promise<void> {
        await this.page.goto("#/");
    }

    userRow(username: string): Locator {
        return this.userRows.filter({ hasText: username });
    }

    deleteLink(username: string): Locator {
        return this.userRow(username).getByRole("link", { name: "Delete" });
    }

    async deleteUser(username: string): Promise<void> {
        await this.deleteLink(username).click();
        await this.userRow(username).waitFor({ state: "detached" });
    }

    async logout(): Promise<void> {
        await this.logoutLink.click();
    }

    async isDisplayed(): Promise<boolean> {
        return this.loggedInText.isVisible();
    }
}
