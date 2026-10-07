# Cloud Campus Frontend

The frontend application for **Cloud Campus**, a cloud-based learning management system built with Next.js, TypeScript and Tailwind CSS.

The application provides a responsive interface for students and administrators to access courses, learning resources, reports, user profiles and other Cloud Campus features.

## Tech Stack

- **Framework:** Next.js
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **API Communication:** REST API
- **Hosting:** AWS Amplify

## AWS Architecture

Cloud Campus uses a serverless, three-tier architecture designed to run on AWS.

| Layer          | AWS Service        | Purpose                                                |
| -------------- | ------------------ | ------------------------------------------------------ |
| Frontend       | AWS Amplify        | Hosts and deploys the Next.js application              |
| API            | Amazon API Gateway | Exposes and manages REST APIs                          |
| Backend        | AWS Lambda         | Runs the NestJS backend                                |
| Database       | Amazon RDS         | Hosts the PostgreSQL database                          |
| Authentication | Amazon Cognito     | Handles user authentication                            |
| File Storage   | Amazon S3          | Stores uploaded files                                  |
| Monitoring     | Amazon CloudWatch  | Collects logs, metrics and application monitoring data |

## Prerequisites

- Node.js
- npm
- Git

## Installation

Clone the repository and install dependencies.

    git clone https://github.com/Lyhab/cloud-campus-frontend.git
    cd cloud-campus-frontend
    npm install

## Environment Variables

Create a `.env` file in the project root.

    NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

The `.env.example` file provides an example configuration.

### Environment Variables

| Variable                   | Description                         |
| -------------------------- | ----------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | URL of the Cloud Campus backend API |

## Running the Application

### Development

Start the development server:

    npm run dev

The application runs on:

    http://localhost:3000

### Production

Create a production build:

    npm run build

Start the production application:

    npm run start

## Application Features

### Student Features

- Dashboard
- Course browsing
- Course enrolment
- Learning resources
- Resource search
- Resource bookmarking
- Resource ratings
- Resource reporting
- User profile
- Global search

### Administrator Features

- Dashboard
- User management
- User role management
- User status management
- Course management
- Resource management
- Report management
- Resource status management
- Report resolution and dismissal
- Global search across resources, courses, reports and users

## Authentication

Authentication is handled by the Cloud Campus backend using **Amazon Cognito**.

The frontend communicates with the backend through authenticated REST API requests. Authentication sessions are maintained using HTTP-only cookies managed by the backend.

The frontend API client includes credentials with API requests and supports session refresh when an authenticated request returns an unauthorised response.

## API Integration

The frontend communicates with the Cloud Campus NestJS backend through REST APIs.

The backend provides APIs for:

- Authentication
- Users
- Courses
- Resources
- Reports
- Dashboard data
- Global search
- File storage operations

The backend API URL is configured using:

    NEXT_PUBLIC_API_BASE_URL

For local development:

    NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

## Global Search

Cloud Campus provides a global search feature through the application header.

The search can return results from:

- Resources
- Courses
- Reports
- Users

The available search results depend on the authenticated user's role and permissions.

Administrators can search across additional administrative resources such as users and reports.

## Project Structure

    app/
    ├── (auth)/
    │   ├── _components/       # Authentication components
    │   ├── confirm-email/     # Email confirmation
    │   ├── forgot-password/   # Password recovery
    │   ├── reset-password/    # Password reset
    │   ├── sign-in/           # Sign-in page
    │   ├── sign-up/           # Sign-up page
    │   └── layout.tsx         # Authentication layout
    │
    ├── (dashboard)/
    │   ├── _components/       # Dashboard components
    │   ├── courses/           # Course pages
    │   ├── dashboard/         # Dashboard page
    │   ├── profile/           # User profile pages
    │   ├── reports/           # Report pages
    │   ├── resources/         # Resource pages
    │   ├── users/             # User management pages
    │   └── layout.tsx         # Dashboard layout
    │
    ├── components/            # Shared application components
    ├── context/               # React context providers
    ├── lib/                   # API clients and utility functions
    ├── favicon.ico             # Application favicon
    ├── globals.css             # Global styles
    ├── home.module.css         # Homepage styles
    ├── layout.tsx              # Root layout
    └── page.tsx                # Homepage

    public/                     # Static assets

## Development Workflow

1. Pull the latest changes from the repository.
2. Install dependencies using `npm install`.
3. Configure the `.env` file.
4. Ensure the Cloud Campus backend is running.
5. Start the development server using `npm run dev`.
6. Test the application locally.
7. Create a production build using `npm run build`.
8. Push changes to the configured GitHub branch.

## Deployment

The frontend is designed for deployment using **AWS Amplify**.

AWS Amplify is responsible for:

- Connecting to the GitHub repository
- Building the Next.js application
- Hosting the frontend
- Deploying updates when changes are pushed to the configured branch

### Amplify Environment Variables

Configure the following environment variable in AWS Amplify:

    NEXT_PUBLIC_API_BASE_URL=xxxx

`NEXT_PUBLIC_API_BASE_URL` must point to the deployed Cloud Campus backend API.

## Deployment Architecture

    GitHub Repository
           │
           ▼
    AWS Amplify
           │
           ▼
    Next.js Frontend
           │
           ▼
    Amazon API Gateway
           │
           ▼
    AWS Lambda
           │
           ▼
    Amazon RDS

Amazon Cognito handles authentication, Amazon S3 provides file storage and Amazon CloudWatch provides monitoring and logging.

## Repository

Cloud Campus Frontend:

https://github.com/Lyhab/cloud-campus-frontend
