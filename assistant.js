// Vercel Serverless Function: /api/assistant
// This function proxies chat messages to OpenAI-compatible API.
// Set environment variable OPENAI_API_KEY in Vercel dashboard before deploying.
// If you prefer Gemini, replace the fetch call below with the appropriate Gemini REST endpoint and headers.

const fetch = (...args) => import('node-fetch').then(({default:fetch})=>fetch(...args));

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Content-Type');
    return res.status(200).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE';
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
    return res.status(500).json({ error: 'OpenAI API key not configured. Set OPENAI_API_KEY in Vercel env.' });
  }

  let payload = req.body;
  if (!payload || !payload.messages) {
    return res.status(400).json({ error: 'Missing messages in request body.' });
  }

  // Build conversation for OpenAI Chat API
  const conversation = [
    { role: 'system', content: 'You are Orion, a wise, calm, and insightful virtual mentor. Speak thoughtfully.' },
    ...payload.messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text }))
  ];

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: conversation,
        max_tokens: 800,
        temperature: 0.7
      })
    });
    const data = await resp.json();
    if (!resp.ok) {
      return res.status(502).json({ error: 'Upstream error', details: data });
    }
    const reply = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || 'No reply';
    return res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
