#!/bin/bash
# Professional Local Setup Script for ConstructIQ

set -e # Exit on error

echo "🚀 Starting professional project setup..."

# 1. Check for required tools
if ! command -v node &> /dev/null
then
    echo "❌ Error: Node.js is not installed. Please install it first."
    exit 1
fi

# 2. Setup environment file
if [ ! -f .env ]; then
    echo "⚙️ Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Action Required: Update your credentials in the newly created .env file."
else
    echo "✅ .env file already exists."
fi

# 3. Install dependencies
echo "📦 Installing project dependencies..."
npm install

# 4. Generate Prisma client
echo "💎 Generating Prisma client..."
npx prisma generate

echo "✅ Setup complete! You are now ready to run 'npm run dev' once you fill in your API keys in the .env file."
