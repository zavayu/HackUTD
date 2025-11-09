# ProdigyPM Backend

AI-powered project management backend API built with Node.js, Express, and TypeScript.

## Prerequisites

- Node.js 18+ 
- MongoDB 6.0+
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration values

4. Build the project:
```bash
npm run build
```

5. Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
```

## Environment Variables

See `.env.example` for all required environment variables and their descriptions.

## Project Structure

```
src/
├── config/         # Configuration files
├── middleware/     # Express middleware
├── models/         # Mongoose data models
├── repositories/   # Data access layer
├── routes/         # API route handlers
├── services/       # Business logic services
├── utils/          # Utility functions
└── index.ts        # Main server entry point
```

## API Documentation

API documentation will be available after implementation.

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## License

MIT