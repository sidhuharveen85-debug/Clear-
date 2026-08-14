// This runs on Vercel's servers only — never in the user's browser.
// Your ANTHROPIC_API_KEY stays here, safely hidden from anyone visiting the site.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { caption, context, imageBase64, imageMediaType } = req.body || {};

  if (!caption && !imageBase64) {
    return res.status(400).json({ error: 'Add a caption or a photo first.' });
  }

  const systemPrompt = `You are Clearcheck, a pre-post risk analysis tool for content creators and influencers. Analyze the caption and (if provided) the image together. Respond ONLY with valid JSON, no markdown fences, no preamble, matching exactly this shape:
{
  "risk_score": <integer 0-100>,
  "flags": [ { "severity": "high"|"med"|"low", "title": "<short title>", "description": "<1-2 sentence explanation>" } ],
  "rewrite": "<a safer alternative caption, or empty string if no caption issues>"
}
Consider: tone misreads, who could be offended, brand safety, anything in the image background that could be problematic, mismatches between image and caption, and any context the user provided. Be direct and specific, not generic. Include 1-4 flags, ordered by severity.`;

  const userContent = [];
  if (imageBase64) {
    userContent.push({
      type: 'image',
      source: { type: 'base64', media_type: imageMediaType || 'image/jpeg', data: imageBase64 }
    });
  }
  let textPrompt = `Caption: ${caption || '(no caption provided)'}`;
  if (context) textPrompt += `\n\nAdditional context from the creator: ${context}`;
  userContent.push({ type: 'text', text: textPrompt });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userContent }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', errText);
      return res.status(502).json({ error: 'Analysis service error. Try again shortly.' });
    }

    const data = await response.json();
    const textBlock = (data.content || []).find((b) => b.type === 'text');
    if (!textBlock) {
      return res.status(502).json({ error: 'No response from analysis.' });
    }

    const clean = textBlock.text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
}
