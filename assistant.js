export const config = { runtime: 'edge' };

/**
 * /api/assistant (Edge)
 * Expects JSON POST: { messages: [ {role, text}, ... ] }
 * Requires environment variable OPENAI_API_KEY in Vercel settings.
 */
export default async function handler(req) {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' }});
    }

    const payload = await req.json();
    const messages = payload.messages || [];
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing messages' }), { status: 400, headers: { 'Content-Type': 'application/json' }});
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' }});
    }

    // Build chat conversation with system persona
    const conversation = [
      { role: 'system', content: 'You are Orion, a wise, calm, and insightful virtual mentor. Speak thoughtfully.' },
      ...messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text }))
    ];

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
      return new Response(JSON.stringify({ error: 'Upstream error', details: data }), { status: 502, headers: { 'Content-Type': 'application/json' }});
    }

    const reply = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || 'No reply';
    return new Response(JSON.stringify({ reply }), { status: 200, headers: { 'Content-Type': 'application/json' }});
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' }});
  }
}
