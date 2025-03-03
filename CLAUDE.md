# CLAUDE.md - AI SDK Preview with PDF Support

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build the project for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint

## Code Style Guidelines
- **TypeScript**: Use strict type checking and proper interfaces/types
- **React**: Use functional components with hooks
- **Imports**: Use absolute paths with @ alias
- **Naming**: PascalCase for components, camelCase for variables/functions
- **Components**: Follow shadcn/ui patterns with "new-york" style
- **Styling**: Use Tailwind CSS classes
- **State Management**: Use React hooks (useState, useContext)
- **Data Validation**: Use Zod schemas (lib/schemas.ts)
- **Error Handling**: Use try/catch with proper error messages
- **File Structure**: Follow Next.js app directory conventions

## Project-Specific Notes
- This project uses the Vercel AI SDK for AI-powered features
- PDF support is being added to the application
- Quiz generation functionality via app/api/generate-quiz/route.ts