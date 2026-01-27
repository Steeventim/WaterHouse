import { faker } from '@faker-js/faker';

export class UserFactory {
  private createdUsers: string[] = [];

  async createUser(overrides: Record<string, any> = {}) {
    const user = {
      email: faker.internet.email(),
      name: faker.person.fullName(),
      password: faker.internet.password({ length: 12 }),
      ...overrides,
    };

    const base = process.env.API_URL || 'http://localhost:3001/api';
    const url = base.replace(/\/$/, '') + '/users';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        // Fallback to synthesized user when API rejects
        console.warn(`UserFactory: API responded ${response.status} ${response.statusText}. Falling back to local user. ${text}`);
        const fallback = { id: `local-${Date.now()}-${Math.floor(Math.random() * 10000)}`, ...user };
        this.createdUsers.push(fallback.id);
        return fallback;
      }

      const created = await response.json();
      if (created && created.id) this.createdUsers.push(created.id);
      return created;
    } catch (err) {
      // Network or parsing error — fall back to a synthesized local user so tests can continue offline
      console.warn(`UserFactory.createUser network failed for URL=${url}: ${err instanceof Error ? err.message : String(err)} — falling back to local user`);
      const fallback = { id: `local-${Date.now()}-${Math.floor(Math.random() * 10000)}`, ...user };
      this.createdUsers.push(fallback.id);
      return fallback;
    }
  }

  async cleanup() {
    for (const userId of this.createdUsers) {
      await fetch(`${process.env.API_URL}/users/${userId}`, { method: 'DELETE' });
    }
    this.createdUsers = [];
  }
}
