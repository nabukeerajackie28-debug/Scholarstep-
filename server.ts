import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { OFFLINE_RIDDLES, SUBJECTS_DATA } from './src/data.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log('Gemini client initialized successfully server-side.');
  } catch (e) {
    console.error('Failed to initialize Gemini client:', e);
  }
} else {
  console.log('No valid GEMINI_API_KEY found. Running in offline/simulation fallback mode.');
}

// 1. Health & Config endpoint
app.get('/api/status', (req, res) => {
  res.json({
    online: ai !== null,
    appUrl: process.env.APP_URL || 'http://localhost:3000',
    version: '1.2.0',
    databaseNamespace: 'ScholarDB.V1',
    userRole: 'Student'
  });
});

// 2. Explanations API
app.post('/api/explain', async (req, res) => {
  const { concept, persona } = req.body;
  if (!concept) {
    return res.status(400).json({ error: 'Concept query is required' });
  }

  const selectedPersona = persona || 'copilot';

  let prompt = '';
  let systemInstruction = '';

  if (selectedPersona === 'einstein') {
    systemInstruction = `You are Albert Einstein, the famous theoretical physicist.
Tone: Gentle warmth, playful curiosity, grandfatherly, and passionate about the universe.
Style: Write in a slightly German-accented, friendly tone (e.g., "Ach! Ah, my young friend!"). Explaining concepts using beautiful, vivid sensory metaphors like clocks, falling elevators, moving trains, violin play, or stardust. Keep explanations readable with standard Markdown, bold keywords, and a small bullet list if helpful. Avoid dry academic textbook sentences. Keep the response compact (around 150-250 words).`;
  } else if (selectedPersona === 'newton') {
    systemInstruction = `You are Sir Isaac Newton, the legendary natural philosopher.
Tone: Classical English academic gravitas, high scientific logic, solemn but deeply passionate.
Style: Write in a formal, elegant 17th-century intellectual manner (e.g., "Verily, let us observe...", "By the laws of mechanics..."). Use terms like gravity, prisms, forces of nature, motion, and calculus. Structure with numbering and bullet lists to declare immutable natural laws. Keep the response compact (around 150-250 words).`;
  } else {
    systemInstruction = `You are Scholar Copilot, a supportive, modern, and highly encouraging digital peer and secondary education tutor.
Tone: Peer-level, friendly, highly clear, and enthusiastic.
Style: Explains secondary school-level concepts (suitable for ages 11-18) in extremely straightforward, encouraging terms. Use bullet points, simple diagrams in text representation, and actionable study tips. Offer help to navigate the application. Keep it under 200 words.`;
  }

  prompt = `Please explain the concept of: "${concept}". After your main explanation, provide 2 or 3 short relevant follow-up questions that a high school student might ask about this specific concept, formatted at the very bottom inside a valid JSON-like block or readable format. Wait, let's specify a strict JSON schema output format so the client can parse it easily.`;

  if (!ai) {
    // Offline Simulation fallback
    const offlineExplanations: Record<string, string> = {
      'mitosis': 'Mitosis is the process of cell division where a single cell divides into two identical daughter cells. The main phases are Prophase, Metaphase, Anaphase, and Telophase.',
      'covalent bonds': 'Covalent bonds occur when two non-metal atoms share pairs of outer energy electrons to fulfill the octet rule stable configurations, e.g. H2O water molecules.',
      'photosynthesis': 'Photosynthesis is the chemical reaction where plant chlorophyll converts light energy, carbon dioxide, and water into chemical energy in the form of organic glucose sugars, releasing oxygen.',
      'gravity': 'Gravity is an attractive force acting between all mass bodies of the universe. Formulated by Newton, and re-imagined by Einstein as space-time wrapping curvatures.'
    };

    const conceptLower = concept.toLowerCase();
    let explanationText = `[Offline Simulation Mode] Currently in local fallback. Here is educational material regarding your concept:
    
`;
    let found = false;
    for (const key of Object.keys(offlineExplanations)) {
      if (conceptLower.includes(key)) {
        explanationText += offlineExplanations[key];
        found = true;
        break;
      }
    }

    if (!found) {
      explanationText += `"${concept}" represents an amazing academic topic! In an offline state, ScholarStep recommends consulting your local factsheets in the curriculum browser, or activating the Gemini API for live custom lectures.`;
    }

    return res.json({
      explanation: explanationText,
      suggestedQuestions: [
        `What are practical real-life examples of ${concept}?`,
        `How is ${concept} tested in final exams?`
      ]
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: {
              type: Type.STRING,
              description: 'The narrative explanation in Markdown format, using paragraphs and bold keys.'
            },
            suggestedQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2 or 3 follow-up student queries.'
            }
          },
          required: ['explanation', 'suggestedQuestions']
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    res.json({
      explanation: data.explanation || 'No explanation generated.',
      suggestedQuestions: data.suggestedQuestions || []
    });
  } catch (err: any) {
    console.error('Gemini explanation error:', err);
    res.status(500).json({ error: 'Failed to generate explanation. Fallback values are serving instead.' });
  }
});

// 3. Quiz API
app.post('/api/quiz', async (req, res) => {
  const { subjectId, topicId } = req.body;
  if (!subjectId || !topicId) {
    return res.status(400).json({ error: 'SubjectId and TopicId are required' });
  }

  const subject = SUBJECTS_DATA.find(s => s.id === subjectId);
  const topic = subject?.topics.find(t => t.id === topicId);

  if (!topic) {
    return res.status(404).json({ error: 'Topic not found in local catalog.' });
  }

  if (!ai) {
    // Offline status - return the offline question pool from src/data.ts
    return res.json({
      questions: topic.quizQuestions,
      offline: true
    });
  }

  try {
    const prompt = `Construct a highly-engaging custom multiple-choice quiz of 5 questions about the high school topic: "${topic.name}" inside the subject "${subject?.name}". 
Ensure each question is direct and appropriate for students aged 11-18. 
Every question must contain 4 distinct plausible options, a single 0-indexed correct answer index, and a clear explanatory paragraph outlining why the chosen index is scientifically correct.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswerIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ['question', 'options', 'correctAnswerIndex', 'explanation']
              }
            }
          },
          required: ['questions']
        }
      }
    });

    const rawJson = JSON.parse(response.text || '{"questions":[]}');
    // Ensure ids exist
    const quizResponse = (rawJson.questions || []).map((q: any, index: number) => ({
      ...q,
      id: q.id || `ai-q-${index}`
    }));

    res.json({
      questions: quizResponse.length > 0 ? quizResponse : topic.quizQuestions,
      offline: false
    });
  } catch (err) {
    console.error('Gemini quiz generation failed:', err);
    // Fallback to local
    res.json({
      questions: topic.quizQuestions,
      offline: true,
      fallbackMessage: 'Fell back to high-quality preloaded offline curriculum due to API timeout.'
    });
  }
});

// 4. Copilot AI Navigation Chat
app.post('/api/chat-navigate', async (req, res) => {
  const { message, persona, chatHistory } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const selectedPersona = persona || 'copilot';

  let systemInstruction = `You are an AI Scholar Navigator built for ScholarStep. 
Your objective is to provide a cheerful response AND decide whether the student's request can trigger a navigation routing action inside our app.
Our app supports the following destination navigation targets:
- "DASHBOARD" (the main welcome screen, subject hub overview, credit tribute)
- "SUBJECTS" (open curriculum browsers)
- "PLANNER" (homework manager, planner slots)
- "ADMIN" (secret command center with seeding and technical diagnostics)
- "QUIZ:mathematics" (initiates math quadratic equations or similar)
- "QUIZ:physics" (initiates physics quiz)
- "QUIZ:chemistry" (initiates chemistry quiz)
- "QUIZ:biology" (initiates biology quiz)
- "QUIZ:history" (initiates history quiz)
- "QUIZ:english-literature" (initiates english literature quiz)
- "EXPLAIN:mitosis" (if they are asking to explain mitosis or similar)
- "EXPLAIN:covalent bonds" (if they ask about chemical bonding)

You MUST select an actionType: "navigate" if they explicitly or implicitly ask to:
- Open, see, or navigate to homework, tasks, or planner (route to "PLANNER")
- Take, start, open, or do a quiz about specific subjects (route to "QUIZ:<subject_id>")
- View curriculum, subjects, factsheets (route to "SUBJECTS")
- Go home, open dashboard (route to "DASHBOARD")
- Open or visit the administrative panel, command desk, database control (route to "ADMIN")
- Otherwise, actionType is null.

Also, adopt the chosen historical avatar style:
- 'einstein': Albert Einstein's playful German-academic metaphors.
- 'newton': Sir Isaac Newton's grave, classical 17th-century physics speech.
- 'copilot': Supportive digital classmate tutor.

Formulate your response in JSON according to the schema below.`;

  if (!ai) {
    // Offline simulated Navigation Parser (Local keywords logic!)
    const msgLower = message.toLowerCase();
    let reply = "I would be glad to guide you around our school space! In offline simulation mode, I can still parse your intent.";
    let actionType: string | null = null;
    let actionTarget: string | null = null;

    if (msgLower.includes('plan') || msgLower.includes('homew') || msgLower.includes('task') || msgLower.includes('calendar')) {
      reply = "Verily/Ach! Let us immediately review your list of academic duties. I am shifting your view to the Homework Planner!";
      actionType = 'navigate';
      actionTarget = 'PLANNER';
    } else if (msgLower.includes('quiz') || msgLower.includes('challenge') || msgLower.includes('test')) {
      let sub = 'physics';
      if (msgLower.includes('math')) sub = 'mathematics';
      else if (msgLower.includes('chemistry') || msgLower.includes('bond')) sub = 'chemistry';
      else if (msgLower.includes('biology') || msgLower.includes('cell')) sub = 'biology';
      else if (msgLower.includes('history')) sub = 'history';
      else if (msgLower.includes('english') || msgLower.includes('literature')) sub = 'english-literature';

      reply = `Superb choice! Let us challenge your knowledge. Preparing the interactive quiz for ${sub} now!`;
      actionType = 'navigate';
      actionTarget = `QUIZ:${sub}`;
    } else if (msgLower.includes('explain') || msgLower.includes('what is') || msgLower.includes('how do')) {
      let concept = 'mitosis';
      if (msgLower.includes('bond') || msgLower.includes('covalent')) concept = 'covalent bonds';
      else if (msgLower.includes('gravity') || msgLower.includes('law')) concept = 'gravity';
      else if (msgLower.includes('photo')) concept = 'photosynthesis';

      reply = `Let me explain that for you. I will retrieve the Topic Tutor Explainer for: ${concept}!`;
      actionType = 'navigate';
      actionTarget = `EXPLAIN:${concept}`;
    } else if (msgLower.includes('admin') || msgLower.includes('seed') || msgLower.includes('database')) {
      reply = "Opening the secure Admin Command Center. Remember, you must solve our riddle challenge to fully access the databases!";
      actionType = 'navigate';
      actionTarget = 'ADMIN';
    } else if (msgLower.includes('home') || msgLower.includes('dash') || msgLower.includes('welcome')) {
      reply = "Understood. Returning you to the core Scholar Dashboard.";
      actionType = 'navigate';
      actionTarget = 'DASHBOARD';
    } else {
      if (selectedPersona === 'einstein') {
        reply = "Ach! My young math-tutor friend, that is indeed an intriguing question. To learn in high spirits, try asking me to 'start a physics quiz' or 'open the homework planner'!";
      } else if (selectedPersona === 'newton') {
        reply = "A curious inquiry, scholar. Let us seek clarity. Command me to 'open the scheduler of homework' or 'test my physics laws', and those scrolls shall open.";
      } else {
        reply = "I'm on it! I can help you search the curriculum or manage your studies. To try things out, say 'take a biology quiz' or 'show my study planner'!";
      }
    }

    return res.json({ reply, actionType, actionTarget });
  }

  try {
    const formattedHistory = (chatHistory || []).slice(-4).map((h: any) => ({
      role: h.sender === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }));

    const contents = [
      ...formattedHistory,
      { role: 'user', parts: [{ text: message }] }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      // We pass the user message as contents to preserve conversational flow
      contents: message,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING, description: 'The personal response in character style.' },
            actionType: { type: Type.STRING, enum: ['navigate', 'toast', 'null'], description: 'Navigate if a routing is recognized, otherwise null or empty.' },
            actionTarget: { type: Type.STRING, description: 'The identifier string such as PLANNER, SUBJECTS, ADMIN, or QUIZ:physics' }
          },
          required: ['reply']
        }
      }
    });

    const out = JSON.parse(response.text || '{}');
    res.json({
      reply: out.reply,
      actionType: out.actionType === 'null' ? null : out.actionType,
      actionTarget: out.actionTarget || null
    });
  } catch (err) {
    console.error('Gemini navigator error:', err);
    res.json({
      reply: 'An intermittent cloud-particle connection issue has arisen. I remain eager to help!',
      actionType: null,
      actionTarget: null
    });
  }
});

// 5. Admin AI Gate Riddle Generator endpoint
app.get('/api/admin/riddle', async (req, res) => {
  if (!ai) {
    // Return a random offline riddle
    const idx = Math.floor(Math.random() * OFFLINE_RIDDLES.length);
    return res.json({
      riddle: OFFLINE_RIDDLES[idx],
      offline: true
    });
  }

  try {
    const prompt = `Generate a creative but simple high-school level quiz riddle for the Admin Security Gate.
It must be narrated by either 'einstein' (warm, German/physics metaphors) or 'newton' (classical, gravity/apples/motion gravitas).
The riddle must test standard science or mathematics concepts (e.g., photosynthesis, gravity, speed of light, atoms, tectonic plates).
Format: multiple-choice with 4 distinct options.
Specify the single 0-indexed correctAnswerIndex, and a short explanation outlining why this is correct.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING, description: 'The riddle problem narration, matching the physics avatar.' },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Exactly 4 logical multiple-choice answer strings.'
            },
            correctAnswerIndex: { type: Type.INTEGER, description: 'Value 0, 1, 2, or 3.' },
            explanation: { type: Type.STRING, description: 'Why this option satisfies the physics requirements.' },
            avatar: { type: Type.STRING, enum: ['einstein', 'newton'] }
          },
          required: ['question', 'options', 'correctAnswerIndex', 'explanation', 'avatar']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      riddle: parsed,
      offline: false
    });
  } catch (err) {
    console.error('Riddle generation failed, serving offline target:', err);
    const idx = Math.floor(Math.random() * OFFLINE_RIDDLES.length);
    res.json({
      riddle: OFFLINE_RIDDLES[idx],
      offline: true
    });
  }
});

startServer();

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production serving from built files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express custom server running in container on http://localhost:${PORT}`);
  });
}
