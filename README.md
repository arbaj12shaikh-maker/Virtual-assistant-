Orion — Fixed Vercel Project (OpenAI)
=====================================

This project is configured to run on Vercel using an Edge function for /api/assistant.
Before deploying:

1. In Vercel Project → Settings → Environment Variables add:
   - OPENAI_API_KEY = your_openai_api_key_here

2. Deploy the project (Import repo or drag & drop this folder).

3. The site root serves index.html and the API is available at:
   https://<your-deploy>.vercel.app/api/assistant

Security:
- Keep your OPENAI_API_KEY secret in Vercel env settings (do not commit it).
- If you want rate limits or auth, add checks in the Edge function.

