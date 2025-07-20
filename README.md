# plant-debug
Web app for debugging plant issues.

## Usage
1. Upload up to 3 images
2. Optionally provide further information
3. Submit to receive diagnosis and prevention tips

## Features
- Responsive, mobile-friendly UI
- Diagnosis via Gemini API using multiple calls and structured prompts for more consistent results

## Tech Stack
- Next.js (React)
- TypeScript
- CSS Modules
- browser-image-compression
- Formidable (API file uploads)

## Getting Started

### Prerequisites
- Node.js
- npm
- generate a Gemini API key at https://aistudio.google.com/apikey and store in .env.local as GEMINI_API_KEY="xyz"

### Installation
```bash
npm install
```
### Development
```bash
npm run dev
```
App runs locally at `http://localhost:3000`

## Project Structure
```
components/         # React components (forms, uploader, results)
pages/              # Next.js pages and API routes
styles/             # CSS modules for styling
types/              # TypeScript types
README.md           # Project documentation
```


