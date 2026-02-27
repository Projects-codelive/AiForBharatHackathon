# GitHub Analyzer

A Next.js application that provides deep insights into GitHub repositories using LLMs to analyze architecture, tech stack, and codebase flow. It also includes advanced issue filtering capabilities similar to GitHub's native functionality.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB (Mongoose)
- **Authentication**: NextAuth.js v5 (Beta) with GitHub Provider
- **LLM Integration**: Groq SDK for AI-powered analysis
- **GitHub API**: Octokit
- **Diagrams**: Mermaid.js

## Project Features

- **Automated Codebase Analysis**: Fetches repository metadata, commits, contributors, and the file tree.
- **AI Architecture Generation**: Uses an LLM to generate Mermaid architecture diagrams and explain the overall codebase flow.
- **Advanced Issue Filtering**: Filter repository issues and pull requests by labels, type, and sort them.
- **Caching**: Analyzes repositories once and caches the results in MongoDB to prevent redundant API calls.

## Application Routes

### Frontend Routes

- `/` (Landing Page): The entry point of the application introducing the features.
- `/dashboard`: The main user interface where authenticated users can input a GitHub repository URL, trigger analysis, view the generated architecture diagram, and filter repository issues.

### API Routes

- `/api/auth/[...nextauth]`: Handles NextAuth authentication workflows, specifically GitHub OAuth sign-in and sign-out operations.
- `/api/analyze`: The core orchestration webhook.
  - **Purpose**: Validates the repository, checks MongoDB for cached results, fetches all required data from the GitHub API in parallel (commits, file tree, tech stack, etc.), runs the Groq LLM analysis, and saves the comprehensive result to MongoDB.
  - **Methods**: `GET` (check if cached), `POST` (run full analysis).
- `/api/issues`: The issue filtering API.
  - **Purpose**: Fetches issues and pull requests from a specific repository using the GitHub API, applying user-selected filters (labels, type, sorting).
  - **Methods**: `GET`.

## Getting Started

### Prerequisites

Ensure you have Node.js and npm (or yarn/pnpm/bun) installed on your machine.
You will also need a MongoDB database and OAuth credentials from GitHub.

### 1. Clone the repository and install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Environment Variables

Create a `.env.local` file in the root of your project. You can use the provided `.env.local.example` or `.env.example` as a template.

```env
# Database
MONGODB_URI="your_mongodb_connection_string"

# NextAuth
AUTH_SECRET="your_nextauth_secret" 

# GitHub OAuth App (for NextAuth)
AUTH_GITHUB_ID="your_github_oauth_client_id"
AUTH_GITHUB_SECRET="your_github_oauth_client_secret"

# LLM Provider
GROQ_API_KEY="your_groq_api_key"
```

*Note: `.env.local` is ignored by git for security purposes.*

### 3. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new). Make sure to add your environment variables to the Vercel project settings before deploying.
