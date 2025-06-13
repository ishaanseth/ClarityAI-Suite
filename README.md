
# ClarityAI Suite

**Live Application Link:** [https://clarityai-suite-763028360616.us-west1.run.app/](https://clarityai-suite-763028360616.us-west1.run.app/)

ClarityAI Suite is an innovative web application designed to enhance digital accessibility for users with diverse needs. Leveraging the power of Google's Gemini AI, this toolkit provides a suite of features to help make web content more understandable and navigable.

## ✨ Features

The suite currently offers the following AI-powered tools:

1.  **Image Describer:**
    *   Upload an image, and the AI generates a concise and contextually relevant alternative text (alt text).
    *   Provides descriptive tags for the image.
    *   Helps make visual content accessible to users relying on screen readers.

2.  **Color Contrast Advisor:**
    *   Input foreground and background colors (in HEX format).
    *   The AI analyzes the contrast ratio against WCAG (Web Content Accessibility Guidelines).
    *   Provides feedback on compliance for small and large text (AA and AAA levels).
    *   Suggests accessible color alternatives if the initial combination fails contrast checks.

3.  **Text Simplifier:**
    *   Paste complex or lengthy text into the tool.
    *   The AI rephrases the content into simpler language, aiming for better readability.
    *   Beneficial for users with cognitive disabilities, reading difficulties, or those encountering unfamiliar jargon.

4.  **Video Describer:**
    *   Provides a platform to generate ideas, summaries, or potential scene descriptions for video content.
    *   Users can "upload" a video file (currently, only the filename is used for context) and/or provide a text prompt about the video's topic.
    *   The AI generates a summary, potential keywords, and hypothetical scene breakdowns.

## 🚀 How to Use

### Navigation
*   The main tools are listed in the navigation panel on the left side of the screen.
*   Click on a tool name (e.g., "Image Describer") to switch to that feature.

### General Interaction
*   **Image Describer:** Click "Select image" or drag and drop an image file. Then click "Generate Description."
*   **Color Contrast:** Enter HEX color codes for foreground and background. A live preview is shown. Click "Analyze Contrast."
*   **Text Simplifier:** Type or paste text into the text area. Click "Simplify Text."
*   **Video Describer:** Optionally, "upload" a video file (metadata only for now). Enter a prompt describing the video content or topic. Click "Generate Video Description."

### 🌓 Dark Mode
*   A theme toggle button (sun/moon icon) is located in the top-right header.
*   Click it to switch between light and dark modes for comfortable viewing.

### 🎙️ Voice Commands
The application supports voice commands for navigation and interaction:
*   **Activation:** Click the microphone icon in the header to start listening. Click again or wait for a command to be processed to stop.
*   **Navigation:**
    *   Say "Open [Tool Name]" or "Go to [Tool Name]" (e.g., "Open Image Describer", "Go to Color Contrast"). The AI will interpret your intent and switch to the most likely tool.
*   **Feature-Specific Commands (Future Examples):**
    *   **Image Describer:** After selecting an image, say "Analyze image" or "Describe image."
    *   **Color Contrast:** Say "Check contrast." You can also try "Check contrast #FF0000 on #FFFFFF" or "Check contrast black on white."
    *   **Text Simplifier:** After entering text, say "Simplify text." You can also say "Input text [your text here]" or "Simplify this text [your text here]".
    *   **Video Describer:** After entering a prompt, say "Describe video" or "Summarize video." You can also say "Input prompt [your prompt here]".

## 🛠️ Setup and Running Locally (for Developers)

While the application is hosted live, if you wish to run it locally:

1.  **Prerequisites:**
    *   Node.js and npm (or yarn) installed.
2.  **Clone the repository:**
    ```bash
    git clone [URL_OF_YOUR_GITHUB_REPO]
    cd [REPOSITORY_DIRECTORY]
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```
4.  **Set up API Key:**
    *   This application uses the Google Gemini API. You will need an API key.
    *   Create a `.env` file in the root of the project.
    *   Add your API key to the `.env` file:
        ```
        API_KEY=YOUR_GEMINI_API_KEY
        ```
    *   The application is configured to pick up `process.env.API_KEY`.
5.  **Start the development server:**
    ```bash
    npm start
    # or
    # yarn start
    ```
    This will typically open the application in your default web browser at `http://localhost:3000` (or another port if configured).

## 💻 Technologies Used

*   **Frontend:** React, TypeScript, Tailwind CSS
*   **AI Integration:** Google Gemini API (`@google/genai`)
*   **Icons:** Font Awesome
*   **Speech Recognition:** Web Speech API (browser-based)

## 🎯 Purpose

This project aims to explore and demonstrate how AI can be utilized to build tools that make the digital world more accessible and inclusive for people with various disabilities, including visual, cognitive, and motor impairments.

---

Feel free to contribute, report issues, or suggest new features!
