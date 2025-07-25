# Plant Debugger

A web application that helps debug plant health issues. Upload images of your plant, provide context about care conditions, and receive detailed diagnostic information with treatment recommendations.

## Features

- **Image Upload**: Drag-and-drop or click to upload up to 3 plant images
- **Plant Identification**: Automatic plant species identification from images
- **Smart Diagnosis**: AI-powered analysis of plant health issues
- **Detailed Results**: Primary and secondary diagnoses with confidence levels
- **Treatment Plans**: Specific care recommendations and prevention tips
- **Responsive Design**: Optimized for desktop and mobile devices

## Usage
1. Upload up to 3 images of your plant
2. Optionally provide further information about care conditions
3. Submit to receive diagnosis and prevention tips

## Tech Stack
- **Framework**: Next.js 14 with TypeScript
- **Styling**: CSS Modules with responsive design
- **AI Integration**: Google Gemini API for plant analysis
- **Image Processing**: Sharp (server-side) and browser-image-compression (client-side)
- **Form Handling**: Custom hooks with TypeScript

## Getting Started

Test the live app at [plant-debug.vercel.app](https://plant-debug.vercel.app/). To run locally:

### Prerequisites
- Node.js and npm
- generate a Gemini API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### Installation
```bash
npm install
```

### Environment Setup
Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Development
```bash
npm run dev
```
App runs locally at `http://localhost:3000`

## Project Structure

```
├── components/
│   ├── common/           # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── ButtonGroup.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── TabBar.tsx
│   │   └── index.ts
│   ├── tabs/             # Tab-specific components
│   │   ├── UploadTab.tsx
│   │   ├── InfoTab.tsx
│   │   ├── ResultsTab.tsx
│   │   └── index.ts
│   ├── ContextForm.tsx   # Plant care context form
│   ├── DiagnosisResult.tsx # Results display component
│   └── ImageUploader.tsx # Image upload component
├── hooks/                # Custom React hooks
│   ├── usePlantForm.ts   # Form state and API management
│   └── useTabNavigation.ts # Tab navigation logic
├── pages/
│   ├── api/v1/           # API endpoints
│   │   ├── diagnose.ts   # Main diagnosis endpoint
│   │   └── identify-plant.ts # Plant identification endpoint
│   ├── _app.tsx          # Next.js app wrapper
│   └── index.tsx         # Main application page
├── styles/               # CSS modules
│   ├── globals.css       # Global styles (sliders, radio buttons)
│   └── *.module.css      # Component-specific styles
├── types/                # TypeScript type definitions
│   └── index.ts
├── utils/                # Utility functions
│   ├── formUtils.ts      # Form data utilities
│   └── imageCompression.ts # Image compression utilities
└── constants/            # Application constants
    └── sliderLabels.ts   # Slider value mappings
```


