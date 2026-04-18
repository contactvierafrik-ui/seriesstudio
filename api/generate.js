export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { theme, type, perso, lieu, style, duree, episodeNum } = req.body;

  const SERIES_TYPES = {
    emotion: "Transformation, rejet → succès, larmes → victoire",
    business: "Petit → grand, zéro → empire, idée → millions",
    afrique: "Fruits, personnages, symboles africains iconiques",
  };

  const prompt = `Tu es le meilleur créateur de contenu viral africain au monde. Expert TikTok, YouTube Shorts, Facebook Reels.

CONFIGURATION :
- Type : ${type} (${SERIES_TYPES[theme] || ""})
- Personnage : ${perso}
- Lieu : ${lieu}
- Style : ${style}
- Durée : ${duree}
- Épisode : ${episodeNum}

Réponds UNIQUEMENT en JSON valide (zéro markdown, zéro backtick) :

{
  "concept": {
    "titre_serie": "Nom de la série court et mémorable",
    "titre_episode": "Titre ultra-accrocheur choc émotionnel",
    "angle": "L'angle émotionnel central en 1 phrase",
    "hook": "La première phrase qui accroche en 0-3 secondes",
    "promesse": "Ce que le spectateur va ressentir"
  },
  "script": {
    "hook_text": "Texte affiché à l'écran 0-3 sec",
    "hook_voix": "Voix off au début",
    "developpement": [
      {"sec": "3-8s", "ecran": "Texte affiché", "voix": "Voix off"},
      {"sec": "8-15s", "ecran": "Texte affiché", "voix": "Voix off"},
      {"sec": "15-22s", "ecran": "Texte affiché", "voix": "Voix off"}
    ],
    "climax_ecran": "Texte climax fort",
    "climax_voix": "Voix off climax",
    "cta_ecran": "Call to action affiché",
    "cta_voix": "Call to action voix off"
  },
  "images": [
    {"scene": 1, "label": "Exposition", "prompt_mj": "Prompt Midjourney anglais cinematic 4K", "prompt_leo": "Prompt Leonardo anglais", "notes": "Conseil"},
    {"scene": 2, "label": "Épreuve", "prompt_mj": "...", "prompt_leo": "...", "notes": "..."},
    {"scene": 3, "label": "Tournant", "prompt_mj": "...", "prompt_leo": "...", "notes": "..."},
    {"scene": 4, "label": "Victoire", "prompt_mj": "...", "prompt_leo": "...", "notes": "..."},
    {"scene": 5, "label": "Impact", "prompt_mj": "...", "prompt_leo": "...", "notes": "..."}
  ],
  "video": {
    "structure": [
      {"scene": 1, "duree": "3s", "transition": "Fade in", "texte_ecran": "...", "mouvement": "Zoom lent"},
      {"scene": 2, "duree": "4s", "transition": "Cut rapide", "texte_ecran": "...", "mouvement": "Pan gauche"},
      {"scene": 3, "duree": "5s", "transition": "Dissolve", "texte_ecran": "...", "mouvement": "Static"},
      {"scene": 4, "duree": "4s", "transition": "Cut", "texte_ecran": "...", "mouvement": "Zoom out"},
      {"scene": 5, "duree": "4s", "transition": "Fade out", "texte_ecran": "...", "mouvement": "Static"}
    ],
    "musique": "Type de musique recommandée",
    "rythme": "Rythme général du montage"
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
    "ton": "Ton recommandé",
    "vitesse": "Vitesse recommandée"
  },
  "description": {
    "tiktok_court": "Description TikTok max 150 caractères",
    "tiktok_long": "Description TikTok 3-4 phrases",
    "youtube": "Description YouTube SEO 5-8 phrases",
    "facebook": "Description Facebook 3-5 phrases",
    "mots_cles": ["mot1", "mot2", "mot3", "mot4", "mot5"]
  }
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: "Erreur API", details: err });
    }

    const data = await response.json();
    const raw = data.content?.find((b) => b.type === "text")?.text || "";
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Erreur génération" });
  }
}
