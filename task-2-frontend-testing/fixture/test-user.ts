import { faker } from "@faker-js/faker";
import type { TestUser } from "@test-types/testuser";

export function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
        firstName,
        lastName,
        username: faker.internet.username({ firstName, lastName }),
        password: faker.internet.password({ length: 12, prefix: "Aa1!" }),
        ...overrides,
    };
}
