import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req, res) {
  console.log("API START");
  console.log("KEY EXISTS:", !!process.env.ANTHROPIC_API_KEY);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { theme, type, perso, lieu, style, duree, episodeNum } = req.body;

  const SERIES_TYPES = {
    emotion: "Transformation, rejet vers succes, larmes vers victoire",
    business: "Petit vers grand, zero vers empire, idee vers millions",
    afrique: "Fruits, personnages, symboles africains iconiques",
  };

  const prompt = `Tu es le meilleur createur de contenu viral africain au monde. Expert TikTok, YouTube Shorts, Facebook Reels.

CONFIGURATION :
- Type : ${type} (${SERIES_TYPES[theme] || ""})
- Personnage : ${perso}
- Lieu : ${lieu}
- Style : ${style}
- Duree : ${duree}
- Episode : ${episodeNum}

Reponds UNIQUEMENT en JSON valide (zero markdown, zero backtick) :

{
  "concept": {
    "titre_serie": "Nom de la serie court et memorable",
    "titre_episode": "Titre ultra-accrocheur choc emotionnel",
    "angle": "L angle emotionnel central en 1 phrase",
    "hook": "La premiere phrase qui accroche en 0-3 secondes",
    "promesse": "Ce que le spectateur va ressentir"
  },
  "script": {
    "hook_text": "Texte affiche a l ecran 0-3 sec",
    "hook_voix": "Voix off au debut",
    "developpement": [
      {"sec": "3-8s", "ecran": "Texte affiche", "voix": "Voix off"},
      {"sec": "8-15s", "ecran": "Texte affiche", "voix": "Voix off"},
      {"sec": "15-22s", "ecran": "Texte affiche", "voix": "Voix off"}
    ],
    "climax_ecran": "Texte climax fort",
    "climax_voix": "Voix off climax",
    "cta_ecran": "Call to action affiche",
    "cta_voix": "Call to action voix off"
  },
  "images": [
    {"scene": 1, "label": "Exposition", "prompt_mj": "Prompt Midjourney anglais cinematic 4K", "prompt_leo": "Prompt Leonardo anglais", "notes": "Conseil"},
    {"scene": 2, "label": "Epreuve", "prompt_mj": "prompt here", "prompt_leo": "prompt here", "notes": "conseil here"},
    {"scene": 3, "label": "Tournant", "prompt_mj": "prompt here", "prompt_leo": "prompt here", "notes": "conseil here"},
    {"scene": 4, "label": "Victoire", "prompt_mj": "prompt here", "prompt_leo": "prompt here", "notes": "conseil here"},
    {"scene": 5, "label": "Impact", "prompt_mj": "prompt here", "prompt_leo": "prompt here", "notes": "conseil here"}
  ],
  "video": {
    "structure": [
      {"scene": 1, "duree": "3s", "transition": "Fade in", "texte_ecran": "texte", "mouvement": "Zoom lent"},
      {"scene": 2, "duree": "4s", "transition": "Cut rapide", "texte_ecran": "texte", "mouvement": "Pan gauche"},
      {"scene": 3, "duree": "5s", "transition": "Dissolve", "texte_ecran": "texte", "mouvement": "Static"},
      {"scene": 4, "duree": "4s", "transition": "Cut", "texte_ecran": "texte", "mouvement": "Zoom out"},
      {"scene": 5, "duree": "4s", "transition": "Fade out", "texte_ecran": "texte", "mouvement": "Static"}
    ],
    "musique": "Type de musique recommandee",
    "rythme": "Rythme general du montage"
  },
  "voice": {
    "voix_off_complete": "Texte complet narration voix off",
    "sous_titres": [
      {"time": "0-3s", "texte": "Sous-titre 1"},
      {"time": "3-8s", "texte": "Sous-titre 2"},
      {"time": "8-15s", "texte": "Sous-titre 3"},
      {"time": "15-22s", "texte": "Sous-titre 4"},
      {"time": "22-30s", "texte": "Sous-titre 5"}
    ],
    "ton": "Ton recommande",
    "vitesse": "Vitesse recommandee"
  },
  "description": {
    "tiktok_court": "Description TikTok max 150 caracteres",
    "tiktok_long": "Description TikTok 3-4 phrases",
    "youtube": "Description YouTube SEO 5-8 phrases",
    "facebook": "Description Facebook 3-5 phrases",
    "mots_cles": ["mot1", "mot2", "mot3", "mot4", "mot5"]
  }
}`;

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.content?.[0]?.text || "";
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ error: error.message || "Erreur generation" });
  }
}
