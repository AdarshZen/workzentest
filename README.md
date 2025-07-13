# WorkZen Skills Assessment Platform

A comprehensive skills assessment platform for companies to create and manage technical tests for candidates.

## Features

- Admin dashboard for test management
- Create and customize tests with different question types
- Invite candidates via email or upload CSV/Excel
- Real-time test monitoring
- Detailed candidate reports and analytics
- Secure test-taking environment

## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (local or cloud)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd workzen-skills
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   ./setup-env.sh
   ```
   Then edit the generated `.env` file with your database credentials and other settings.

4. **Initialize the database**
   Make sure your database is running and the connection URL in `.env` is correct.

5. **Create admin user**
   ```bash
   pnpm init-admin
   ```
   This will create an admin user with the credentials specified in your `.env` file.

6. **Run the development server**
   ```bash
   pnpm dev
   ```

7. **Access the admin panel**
   Open [http://localhost:3000/admin](http://localhost:3000/admin) in your browser and log in with your admin credentials.

## Project Structure

- `/app` - Next.js app router pages and API routes
- `/components` - Reusable UI components
- `/lib` - Utility functions and database connections
- `/public` - Static assets
- `/scripts` - Database and utility scripts

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm init-admin` - Create initial admin user

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `ADMIN_EMAIL` - Initial admin email
- `ADMIN_PASSWORD` - Initial admin password
- `ADMIN_NAME` - Initial admin name
- `ADMIN_ROLE` - Initial admin role (admin/superadmin)
- `NEXTAUTH_SECRET` - Secret for NextAuth.js
- `NEXTAUTH_URL` - Base URL of your application
- `NODE_ENV` - Environment (development/production)

## License

MIT
