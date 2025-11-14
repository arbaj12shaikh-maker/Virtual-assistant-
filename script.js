// Client script: sends conversation to /api/assistant and handles voice/TTS and theme
const chatbox = document.getElementById('chatbox');
const inputEl = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const voiceBtn = document.getElementById('voiceBtn');
const exportBtn = document.getElementById('exportBtn');
const loader = document.getElementById('loader');
const themeToggle = document.getElementById('themeToggle');

let conversation = JSON.parse(localStorage.getItem('orion_chat')) || [
  { role: 'assistant', text: "Hello — I'm Orion, your wise virtual mentor. How can I help?" }
];

function save() { localStorage.setItem('orion_chat', JSON.stringify(conversation)); }
function addMessage(text, cls) {
  const div = document.createElement('div');
  div.className = cls;
  div.innerText = text;
  chatbox.appendChild(div);
  chatbox.scrollTop = chatbox.scrollHeight;
}
function render() {
  chatbox.innerHTML = '';
  conversation.forEach(m => addMessage((m.role === 'assistant' ? 'Orion: ' : 'You: ') + m.text, m.role === 'assistant' ? 'bot' : 'user'));
}
render();

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;
  conversation.push({ role: 'user', text });
  render(); save();
  inputEl.value = '';
  showLoader(true);

  try {
    const resp = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversation })
    });
    const json = await resp.json();
    showLoader(false);
    if (json.error) {
      conversation.push({ role: 'assistant', text: 'Error: ' + json.error });
    } else {
      const reply = json.reply || 'No reply';
      conversation.push({ role: 'assistant', text: reply });
      speak(reply);
    }
    render(); save();
  } catch (err) {
    showLoader(false);
    conversation.push({ role: 'assistant', text: 'Network error: ' + err.message });
    render(); save();
  }
}

sendBtn.onclick = sendMessage;
inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

function showLoader(show) {
  loader.classList.toggle('hidden', !show);
}

// Text-to-speech
function speak(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1; u.pitch = 1;
  window.speechSynthesis.speak(u);
}

// Voice input
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRec) {
  const r = new SpeechRec();
  r.lang = 'en-US';
  voiceBtn.onclick = () => { r.start(); };
  r.onresult = (e) => {
    const spoken = e.results[0][0].transcript;
    inputEl.value = spoken;
    sendMessage();
  };
} else {
  voiceBtn.style.display = 'none';
}

// Export chat
exportBtn.onclick = () => {
  const blob = new Blob([conversation.map(m => (m.role + ': ' + m.text)).join('\n\n')], {type:'text/plain'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'orion-chat.txt'; a.click();
};

// Theme toggle
themeToggle.onclick = () => {
  document.body.classList.toggle('dark');
  themeToggle.innerText = document.body.classList.contains('dark') ? 'Light Mode' : 'Dark Mode';
};
