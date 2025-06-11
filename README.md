# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Running Locally

To run this Next.js application on your local machine, follow these steps:

1.  **Download or Clone the Code:**
    Ensure you have the project files on your local system. If your Firebase Studio project is connected to a Git repository, clone it. Otherwise, download the code.

2.  **Install Node.js:**
    If you haven't already, install Node.js (which includes npm). You can download it from [nodejs.org](https://nodejs.org/).

3.  **Navigate to Project Directory:**
    Open your terminal or command prompt and change to the project's root directory:
    ```bash
    cd path/to/your-project
    ```

4.  **Install Dependencies:**
    Install the project dependencies using npm:
    ```bash
    npm install
    ```

5.  **Set Up Environment Variables (for AI Features):**
    This project uses Genkit with Google AI. You'll need to provide your Google AI API key.
    *   Create a file named `.env.local` in the root of your project.
    *   Add your API key to this file:
        ```
        GOOGLE_API_KEY=YOUR_GOOGLE_AI_API_KEY
        ```
    Replace `YOUR_GOOGLE_AI_API_KEY` with your actual key.

6.  **Run the Development Server:**
    Start the Next.js development server:
    ```bash
    npm run dev
    ```
    This will start the application, usually on port 9002.

7.  **Access the Application:**
    Open your web browser and navigate to [http://localhost:9002](http://localhost:9002).

You should now see the application running locally. If you plan to work with the Genkit AI flows, you might also need to run the Genkit development server in a separate terminal:
```bash
npm run genkit:dev
# or for auto-reloading on changes
npm run genkit:watch
```
