Orion — Vercel Deployment Guide
===============================

This project is ready to deploy on Vercel. It includes:
- Frontend (index.html, style.css, script.js)
- Serverless function at /api/assistant (Node.js) which proxies to OpenAI's Chat Completions API.
- Placeholder for OPENAI_API_KEY - set this in Vercel Dashboard.

Steps to deploy:
1. Download and unzip this project.
2. Create a new Vercel project and point it to this folder (or import the GitHub repo).
3. In Vercel Dashboard, go to Settings → Environment Variables and add:
   - OPENAI_API_KEY = your_openai_api_key_here
4. Deploy. The site will be available at https://your-project.vercel.app
5. If you want to use Gemini instead of OpenAI, edit /api/assistant.js and replace the fetch call with the Gemini REST endpoint and headers (use an env var like GEMINI_API_KEY).

Important security notes:
- Never commit your API key to a public repo.
- Prefer creating a dedicated key with limited access and usage limits.
