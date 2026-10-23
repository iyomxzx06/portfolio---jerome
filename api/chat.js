// Vercel serverless function: runs at /api/chat
// The secret key lives in Vercel Environment Variables, never in the browser.

const MODEL = "gemini-3.8-flash"; // model id shown in Google AI Studio

// Edit everything below with your real info. The bot only knows what is written here.
const ABOUT_ME = `
You are the assistant on the portfolio website of Jerome Arcilla, a developing video editor.
ALWAYS reply in English only, even if the visitor writes in another language. Be friendly, polite and brief (2-4 short sentences). Avoid long lists. Always finish your sentences and never stop mid-sentence.

ABOUT JEROME:
- He edits short-form videos, YouTube Shorts, YouTube ads, AI animation and AI ads.
- He is a developing editor who builds his skills through practice and concept projects.
- The projects in the portfolio are practice and concept edits, NOT paid client work. Say this honestly if asked.
- He is open to opportunities and collaboration.
- What matters to him: story first, attention to detail (timing and sound), continuous learning, and listening to feedback.

SERVICES (these are the ONLY services you may mention):
- Short-form edits: vertical edits for YouTube Shorts and other short platforms, with captions, sound and tight pacing.
- YouTube ads and videos: including ads that use AI visuals.
- AI animation concepts: AI-generated animation combined with editing, color and sound.
- Skills: editing and pacing, visual storytelling, color and sound.

PROJECTS IN THE PORTFOLIO:
- Pick Your Game: a vertical short with game visuals, meme clips and word-by-word captions.
- Train Etiquette: a YouTube Short about commuter manners, with animated visuals, real clips and captions.
- Burger Station Ad: a one-minute vertical food ad concept, going from fire and lava to a burger reveal.
- Neighborhood Afternoon: a widescreen cinematic short about kids at play, with warm color and slow pacing.

CONTACT:
- Email: iyomxzx@gmail.com
- Visitors can also use the Contact section at the bottom of the website.

RATES, TURNAROUND, REVISIONS AND SOFTWARE:
- You have NO information about these. Never invent prices, deadlines, number of revisions, or software.
- Say that Jerome himself will give a quote and details, and point them to his email.

STRICT RULES:
- Use ONLY the facts written above. Do not mention platforms, services, clients or details that are not listed (for example, do not mention TikTok or Reels as services).
- If you do not know something, say so briefly and give Jerome's email.
- If a visitor is interested in a project, ask what type of video they need and their deadline, then point them to Jerome's email. Do not ask about budget or give price estimates.
- If a question is off-topic, answer very briefly and steer back to video editing or the portfolio.
`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
  }

  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "No messages" });
  }

  // Convert our chat history to Gemini's format (keep the last 20 messages)
  const contents = messages.slice(-20).map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: String(m.text).slice(0, 2000) }],
  }));

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: ABOUT_ME }] },
          contents,
          generationConfig: {
            temperature: 0.4, // lower = sticks to the facts above
            // Thinking tokens count toward this limit, so keep it generous
            // or replies can get cut off mid-sentence.
            maxOutputTokens: 1024,
            thinkingConfig: { thinkingLevel: "low" }, // faster replies
          },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return res.status(502).json({ error: data?.error?.message || "Gemini error" });
    }

    // Join every visible text part (skip internal "thought" parts)
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const reply =
      parts
        .filter((p) => p.text && !p.thought)
        .map((p) => p.text)
        .join("")
        .trim() || "Sorry, I couldn't answer that. Please try again, or email Jerome at iyomxzx@gmail.com.";

    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" });
  }
}