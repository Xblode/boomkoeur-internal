import { NextRequest, NextResponse } from 'next/server';

/**
 * Synthèse IA des messages du jour via Google Gemini (tier gratuit).
 * Clé API gratuite : https://aistudio.google.com/app/apikey
 * Variable d'environnement : GEMINI_API_KEY
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY non configurée. Ajoutez-la dans .env.local (gratuit sur aistudio.google.com)' },
      { status: 503 }
    );
  }

  type SummarizeMessage = {
    author?: string;
    content: string;
    type?: 'user' | 'system';
    entityType?: string;
    entityTitle?: string;
    poll?: { question: string; results: { label: string; votes: number }[]; totalVotes: number };
    quickVote?: { question?: string; yes: number; no: number; total: number };
  };

  let body: { messages?: SummarizeMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 });
  }

  const messages = body.messages ?? [];
  if (messages.length === 0) {
    return NextResponse.json({ summary: '' });
  }

  const text = messages
    .map((m) => {
      const author = m.author ?? 'Système';
      const tag = m.type === 'system'
        ? m.entityType
          ? ` [ALERTE ${m.entityType.toUpperCase()}${m.entityTitle ? `: ${m.entityTitle}` : ''}]`
          : ' [ALERTE SYSTÈME]'
        : '';
      let extra = '';
      if (m.poll) {
        const results = m.poll.results.map((r) => `${r.label}: ${r.votes}`).join(', ');
        extra = `\n  → Sondage « ${m.poll.question} » (${m.poll.totalVotes} votants) — ${results}`;
      }
      if (m.quickVote) {
        const q = m.quickVote.question ? ` « ${m.quickVote.question} »` : '';
        extra = `\n  → Vote${q} : ${m.quickVote.yes} oui, ${m.quickVote.no} non (${m.quickVote.total} votants)`;
      }
      return `[${author}]${tag} ${m.content}${extra}`;
    })
    .join('\n\n');

  const msgCount = messages.length;
  const lengthGuide = msgCount <= 5
    ? 'Résume en 1-2 phrases.'
    : msgCount <= 15
      ? 'Résume en 3-5 phrases.'
      : msgCount <= 30
        ? 'Résume en 5-8 phrases, sois détaillé.'
        : 'Fais un résumé complet et détaillé, couvre tous les sujets abordés.';

  const systemInstruction = `Tu résumes des conversations d'une messagerie d'équipe qui organise des événements musicaux.

RÈGLES :
- ${lengthGuide}
- Cite les prénoms des personnes et ce qu'elles ont dit ou fait.
- Mentionne les événements, réunions, publications discutés par leur nom.
- Inclus les résultats de sondages et votes s'il y en a.
- Les messages marqués [Système] ou [ALERTE ...] sont des notifications automatiques, résume-les factuellement.
- NE COMMENCE JAMAIS par "La messagerie", "La journée", "L'équipe" ou "Les échanges".
- NE PARLE PAS de l'outil ou de la plateforme elle-même.
- Si le contenu est banal (salutations, messages de bienvenue uniquement), réponds exactement : "Échanges légers, pas de point marquant."

FORMAT DE SORTIE : Structure le résumé avec des puces. Chaque point important sur une nouvelle ligne, précédé de "- ". Sépare les blocs par une ligne vide. Exemple :
- Premier point important.
- Deuxième point avec détails.
- Troisième point.`;

  const model = 'gemini-2.5-flash';
  const maxTokens = 65535; // max autorisé par Gemini 2.5 Flash
  const payload = {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents: [{ role: 'user', parts: [{ text }] }],
    generationConfig: { maxOutputTokens: maxTokens, temperature: 0.4 },
  };

  async function callGemini(model: string, retryAfterMs?: number): Promise<Response> {
    if (retryAfterMs) await new Promise((r) => setTimeout(r, retryAfterMs));
    return fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
  }

  function parseError(err: string): { msg: string; retryAfterMs?: number } {
    try {
      const parsed = JSON.parse(err) as {
        error?: { message?: string; details?: Array<{ retryDelay?: string }> };
      };
      const msg = parsed?.error?.message ?? err.slice(0, 150);
      const retry = parsed?.error?.details?.find((d: { retryDelay?: string }) => d.retryDelay);
      const retrySec = retry?.retryDelay ? parseFloat(retry.retryDelay.replace('s', '')) : 0;
      const retryAfterMs = retrySec > 0 && retrySec < 120 ? retrySec * 1000 : undefined;
      return { msg, retryAfterMs };
    } catch {
      return { msg: err.slice(0, 150) };
    }
  }

  try {
    let res = await callGemini(model);
    if (res.status === 429) {
      const { msg, retryAfterMs } = parseError(await res.text());
      if (retryAfterMs && retryAfterMs < 60000) {
        res = await callGemini(model, retryAfterMs);
        if (res.ok) {
          const data = (await res.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
          const summary = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
          console.log('[summarize] RÉSULTAT:', summary);
          return NextResponse.json({ summary });
        }
      }
      return NextResponse.json(
        { error: 'Quota API dépassée (5 req/min). Réessayez dans 1 minute.' },
        { status: 502 }
      );
    }
    if (!res.ok) {
      const err = await res.text();
      console.error('Gemini API error:', res.status, model, err.slice(0, 200));
      const errMsg = parseError(err).msg;
      return NextResponse.json({ error: errMsg }, { status: 502 });
    }
    const data = (await res.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
    console.log('[summarize] RÉSULTAT:', summary);
    return NextResponse.json({ summary });
  } catch (err) {
    console.error('Summarize error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
