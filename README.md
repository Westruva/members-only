# Members Only

A simple bulletin board app with signup, login, and a global message feed.

## Local development

1. Copy the environment example:
   ```bash
   cp .env.example .env
   ```
2. Start PostgreSQL locally and create a database named `members_only`.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the app:
   ```bash
   npm start
   ```

## Railway deployment

1. Push this project to GitHub.
2. Create a new Railway project and connect the repository.
3. Add the following environment variables in Railway:
   - `NODE_ENV=production`
   - `PORT=3000`
   - `SESSION_SECRET=<a strong random secret>`
   - `DATABASE_URL=<your Railway PostgreSQL connection string>`
4. Railway will run `npm start` automatically using the included `railway.json` config.

## Notes

- The app creates its required tables on startup if they do not already exist.
- The app expects a PostgreSQL database with the `pgcrypto` and `uuid-ossp` extensions available.
