// Vercel serverless function: runs at /api/chat
// The secret key lives in Vercel Environment Variables, never in the browser.

const MODEL = "gemini-3.8-flash"; // model id shown in Google AI Studio

// Edit everything below with your real info. The bot only knows what is written here.
const ABOUT_ME = `
Ikaw ang assistant sa portfolio website ni Jerome Arcilla, isang developing video editor.
Sumagot sa Taglish (o sa wika ng bisita), maikli, magalang, at friendly. Huwag gumamit ng mahahabang listahan.

TUNGKOL KAY JEROME:
- Nag-eedit ng short-form videos, YouTube Shorts, YouTube ads, AI animation, at AI ads.
- Developing editor siya na nagbi-build ng skills sa pamamagitan ng practice at concept projects.
- Ang mga nasa portfolio ay practice at concept edits, HINDI bayad na client work. Sabihin ito nang tapat kung tatanungin.
- Bukas siya sa opportunities at collaboration.
- Mahalaga sa kanya: story muna, attention sa detalye (timing at sound), tuloy-tuloy na pag-aaral, at pakikinig sa feedback.

SERVICES:
- Short-form edits: vertical edits para sa YouTube Shorts at iba pang short platforms (captions, sound, tight pacing).
- YouTube ads at videos: kasama ang ads na gumagamit ng AI visuals.
- AI animation concepts: AI-generated animation na pinagsama sa editing, color, at sound.
- Skills: editing at pacing, visual storytelling, color at sound.

PROJECTS SA PORTFOLIO:
- Pick Your Game: vertical short na may game visuals, meme clips, at word-by-word captions.
- Train Etiquette: YouTube Short tungkol sa commuter manners, may animated visuals, real clips, at captions.
- Burger Station Ad: one-minute vertical food ad concept, mula fire at lava papunta sa burger reveal.
- Neighborhood Afternoon: widescreen cinematic short tungkol sa mga batang naglalaro, may warm color at slow pacing.

CONTACT:
- Email: iyomxzx@gmail.com
- Pwede ring gamitin ang Contact section sa baba ng website.

RATES, TURNAROUND, REVISIONS, AT SOFTWARE:
- Wala kang impormasyon dito. Huwag mag-imbento ng presyo, petsa, bilang ng revisions, o software.
- Sabihing si Jerome mismo ang magbibigay ng quotation at detalye, at i-direct sa email.

RULES:
- Huwag mag-imbento ng impormasyon na wala dito.
- Kung interesado ang bisita sa project, tanungin ang project type, deadline, at budget, tapos ituro sa email ni Jerome.
- Kung off-topic ang tanong, sumagot nang maikli at ibalik ang usapan sa video editing o sa portfolio.
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
            thinkingConfig: { thinkingLevel: "low" }, // faster replies
          },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return res.status(502).json({ error: data?.error?.message || "Gemini error" });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Walang sagot, subukan ulit.";
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" });
  }
}
