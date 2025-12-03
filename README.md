# Happy English - Grammar Correction Tool

A simple web application for English grammar correction powered by Google Gemini AI.

## Features

- **Grammar Correction**: Get instant grammar corrections for your English sentences
- **Detailed Analysis**: View word usage corrections and explanations
- **Simple View**: Toggle to show only corrected text
- **PWA Support**: Install as a Progressive Web App
- **Secure API Key Storage**: API key stored locally in browser
- **Clipboard Integration**: Paste directly from clipboard

## Tech Stack

- Vite
- React
- TypeScript
- Google Gemini AI API
- PWA (Progressive Web App)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## Getting Started

1. Get your Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Open the application
3. Click the Settings button (⚙️) and enter your API key
4. Start correcting your English sentences!

## PWA Icons

To complete the PWA setup, add the following icon files to the `public` folder:
- `pwa-192x192.png` (192x192 pixels)
- `pwa-512x512.png` (512x512 pixels)

You can generate these icons from any image using online tools like [RealFaviconGenerator](https://realfavicongenerator.net/).

## Usage

1. Enter or paste your English sentence in the input field
2. Click "Correct Grammar"
3. View the corrected text, word usage analysis, and explanation
4. Use the checkbox to toggle between detailed and simple view
5. Copy the corrected text with the copy button

## Deployment

This project includes a GitHub Actions workflow that automatically builds and deploys the app to GitHub Pages.

### Setting Up GitHub Pages

1. Go to your repository settings on GitHub
2. Navigate to **Pages** in the left sidebar
3. Under **Source**, select **GitHub Actions**
4. Push to the `main` or `master` branch to trigger the deployment

The app will be automatically deployed to: `https://luantran069.github.io/happy-english/`

### Manual Deployment

You can also trigger the deployment manually:
1. Go to the **Actions** tab in your GitHub repository
2. Select the **Deploy to GitHub Pages** workflow
3. Click **Run workflow**

## License

MIT
