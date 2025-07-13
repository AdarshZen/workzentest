#!/bin/bash

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "# Database" > .env
    echo "DATABASE_URL=postgres://user:password@host:port/dbname" >> .env
    echo "" >> .env
    echo "# Admin User" >> .env
    echo "ADMIN_EMAIL=admin@workzen.com" >> .env
    echo "ADMIN_PASSWORD=admin123" >> .env
    echo "ADMIN_NAME=Admin User" >> .env
    echo "ADMIN_ROLE=superadmin" >> .env
    echo "" >> .env
    echo "# NextAuth" >> .env
    echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env
    echo "NEXTAUTH_URL=http://localhost:3000" >> .env
    echo "" >> .env
    echo "# Environment" >> .env
    echo "NODE_ENV=development" >> .env
    
    echo "✅ Created .env file with default values"
    echo "Please update the DATABASE_URL with your actual database connection string"
else
    echo "ℹ️ .env file already exists"
fi

# Make the script executable
chmod +x setup-env.sh
