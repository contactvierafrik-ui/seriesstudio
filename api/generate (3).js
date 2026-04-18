import Anthropic from "@anthropic-ai/sdk";

// ══════════════════════════════════════════
// FALLBACK LOCAL — génération sans API
// ══════════════════════════════════════════
function generateFallback(theme, type, perso, lieu, style, episodeNum) {
  const hooks = {
    emotion: [
      "Personne ne croyait en elle… jusqu'au jour où tout a basculé.",
      "Ils se sont moqués d'elle. Elle rit maintenant dans sa Mercedes.",
      "Elle avait tout perdu… sauf sa volonté."
    ],
    business: [
      "Avec 5000 FCFA, elle a bâti un empire. Voici comment.",
      "De vendeuse de rue à PDG. Son secret va vous choquer.",
      "Zéro investisseur. Zéro aide. Juste une idée et du courage."
    ],
    afrique: [
      "L'Afrique qu'on ne vous montre jamais. Épisode " + episodeNum + ".",
      "Cette femme africaine cache un secret qui change tout.",
      "Ce marché africain renferme une histoire incroyable."
    ]
  };

  const titres = {
    emotion: ["La Femme Invisible", "Née Pour Gagner", "Les Larmes du Succès"],
    business: ["L'Empire du Marché", "De Zéro à Million", "La Patronne"],
    afrique: ["Racines d'Or", "L'Âme de l'Afrique", "Terre de Légendes"]
  };

  const hook = (hooks[theme] || hooks.emotion)[Math.floor(Math.random() * 3)];
  const titre_serie = (titres[theme] || titres.emotion)[Math.floor(Math.random() * 3)];

  return {
    concept: {
      titre_serie,
      titre_episode: `${titre_serie} — Épisode ${episodeNum} : ${type}`,
      angle: `Un(e) ${perso} ordinaire dans un ${lieu} qui accomplit quelque chose d'extraordinaire`,
      hook,
      promesse: "Le spectateur va pleurer, s'inspirer et partager cette vidéo."
    },
    script: {
      hook_text: hook.split("…")[0] + "…",
      hook_voix: hook,
      developpement: [
        { sec: "3-8s", ecran: `${perso} au ${lieu}. Seul(e). Sans aide.`, voix: `C'était une matinée ordinaire pour ${perso.toLowerCase()}… mais ce jour-là allait tout changer.` },
        { sec: "8-15s", ecran: "Chaque jour était une bataille.", voix: "Les obstacles s'accumulaient. Mais elle refusait d'abandonner." },
        { sec: "15-22s", ecran: "Puis elle a pris UNE décision.", voix: "Une décision que personne ne comprenait. Mais qu'elle seule voyait." }
      ],
      climax_ecran: "Et sa vie a basculé pour toujours.",
      climax_voix: "Ce moment a tout changé. Pour elle. Pour sa famille. Pour son avenir.",
      cta_ecran: "Suis la suite → Episode " + (episodeNum + 1),
      cta_voix: "Abonne-toi pour ne pas manquer la suite de son histoire."
    },
    images: [
      { scene: 1, label: "Exposition", prompt_mj: `${perso.toLowerCase()} at ${lieu.toLowerCase()}, early morning, humble beginnings, cinematic lighting, 4K, emotional`, prompt_leo: `portrait of ${perso.toLowerCase()} at african market, golden hour, documentary style, high detail`, notes: "Montrer la solitude et la détermination dans le regard" },
      { scene: 2, label: "Épreuve", prompt_mj: `${perso.toLowerCase()} struggling, ${lieu.toLowerCase()}, sweat, fatigue, cinematic dramatic lighting, 4K`, prompt_leo: `hardship scene, african ${perso.toLowerCase()}, tired but determined, realistic, emotional`, notes: "L'épreuve doit être visible sur le visage — pas de sourire" },
      { scene: 3, label: "Tournant", prompt_mj: `${perso.toLowerCase()} moment of realization, ${style.toLowerCase()} style, hope in eyes, cinematic 4K`, prompt_leo: `turning point, african ${perso.toLowerCase()}, light breaking through, inspirational`, notes: "La lumière change ici — plus chaude, plus dorée" },
      { scene: 4, label: "Victoire", prompt_mj: `successful african ${perso.toLowerCase()}, confident, elegant, luxury setting, cinematic 4K`, prompt_leo: `victory moment, african ${perso.toLowerCase()}, success, proud, high quality`, notes: "Contraste fort avec scène 1 — même personne, monde différent" },
      { scene: 5, label: "Impact", prompt_mj: `african ${perso.toLowerCase()} inspiring others, community, powerful, ${style.toLowerCase()} cinematic`, prompt_leo: `impact scene, african ${perso.toLowerCase()}, surrounded by community, emotional, 4K`, notes: "Finir sur un sourire qui inspire — regard caméra si possible" }
    ],
    video: {
      structure: [
        { scene: 1, duree: "3s", transition: "Fade in", texte_ecran: hook.split("…")[0] + "…", mouvement: "Zoom lent vers le visage" },
        { scene: 2, duree: "5s", transition: "Cut rapide", texte_ecran: "Chaque jour était un combat…", mouvement: "Pan gauche lent" },
        { scene: 3, duree: "5s", transition: "Dissolve doux", texte_ecran: "Puis tout a changé.", mouvement: "Static — punch in" },
        { scene: 4, duree: "5s", transition: "Cut net", texte_ecran: "Aujourd'hui elle inspire.", mouvement: "Zoom out révélateur" },
        { scene: 5, duree: "4s", transition: "Fade out doré", texte_ecran: "Episode " + (episodeNum + 1) + " →", mouvement: "Static — regard caméra" }
      ],
      musique: "Piano émotionnel + montée orchestrale progressive — tempo lent 60-70 BPM",
      rythme: "Lent au début, accélération au climax, retour calme à la fin"
    },
    voice: {
      voix_off_complete: `${hook} C'était une matinée ordinaire… mais ce jour-là allait tout changer. Les obstacles s'accumulaient. Mais ${perso.toLowerCase()} refusait d'abandonner. Une décision a tout changé. Et aujourd'hui… sa vie n'est plus jamais la même. Abonne-toi pour la suite.`,
      sous_titres: [
        { time: "0-3s", texte: hook.split("…")[0] + "…" },
        { time: "3-8s", texte: "Une matinée ordinaire… qui allait tout changer." },
        { time: "8-15s", texte: "Chaque obstacle la rendait plus forte." },
        { time: "15-22s", texte: "Une seule décision a tout basculé." },
        { time: "22-30s", texte: "Aujourd'hui elle inspire. Episode " + (episodeNum + 1) + " →" }
      ],
      ton: "Voix posée, grave, émotionnelle — comme un documentaire Netflix",
      vitesse: "Lente et articulée — 120-140 mots/minute avec pauses dramatiques"
    },
    description: {
      tiktok_court: `Elle avait tout perdu… regardez ce qu'elle a construit. Episode ${episodeNum}`,
      tiktok_long: `${hook} Cette histoire va vous toucher au fond du coeur. Parce que c'est une histoire vraie. Une histoire africaine. Une histoire de foi, de courage et de victoire. Regarde jusqu'à la fin.`,
      youtube: `${hook}\n\nDans cet épisode ${episodeNum}, découvrez l'histoire extraordinaire d'un(e) ${perso.toLowerCase()} qui a tout osé pour changer sa vie. Une transformation incroyable qui commence dans un ${lieu.toLowerCase()} et finit au sommet.\n\nCette série africaine inspirante montre que la réussite n'a pas de frontières quand on a la foi et la détermination. Partage cette vidéo avec quelqu'un qui en a besoin aujourd'hui.`,
      facebook: `Cette histoire africaine va vous donner des frissons. Un(e) ${perso.toLowerCase()}, un ${lieu.toLowerCase()}, et une volonté de fer. Episode ${episodeNum} de notre série. Taguez quelqu'un qui a besoin de voir ça aujourd'hui.`,
      mots_cles: ["histoire africaine", "inspiration afrique", "transformation", "success story", "motivation africaine"]
    }
  };
}

// ══════════════════════════════════════════
// HANDLER PRINCIPAL
// ══════════════════════════════════════════
export default async function handler(req, res) {
  console.log("=== API GENERATE START ===");
  console.log("METHOD:", req.method);
  console.log("KEY EXISTS:", !!process.env.ANTHROPIC_API_KEY);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { theme, type, perso, lieu, style, duree, episodeNum } = req.body;
  console.log("PARAMS:", { theme, type, perso, lieu });

  // ── TENTATIVE APPEL API ANTHROPIC ──
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = `Tu es le meilleur createur de contenu viral africain. Expert TikTok YouTube Shorts Facebook Reels.

CONFIGURATION : Type=${type}, Personnage=${perso}, Lieu=${lieu}, Style=${style}, Duree=${duree}, Episode=${episodeNum}

Reponds UNIQUEMENT en JSON valide sans markdown sans backtick :

{"concept":{"titre_serie":"string","titre_episode":"string","angle":"string","hook":"string","promesse":"string"},"script":{"hook_text":"string","hook_voix":"string","developpement":[{"sec":"3-8s","ecran":"string","voix":"string"},{"sec":"8-15s","ecran":"string","voix":"string"},{"sec":"15-22s","ecran":"string","voix":"string"}],"climax_ecran":"string","climax_voix":"string","cta_ecran":"string","cta_voix":"string"},"images":[{"scene":1,"label":"Exposition","prompt_mj":"english cinematic prompt 4K","prompt_leo":"english prompt","notes":"conseil"},{"scene":2,"label":"Epreuve","prompt_mj":"string","prompt_leo":"string","notes":"string"},{"scene":3,"label":"Tournant","prompt_mj":"string","prompt_leo":"string","notes":"string"},{"scene":4,"label":"Victoire","prompt_mj":"string","prompt_leo":"string","notes":"string"},{"scene":5,"label":"Impact","prompt_mj":"string","prompt_leo":"string","notes":"string"}],"video":{"structure":[{"scene":1,"duree":"3s","transition":"Fade in","texte_ecran":"string","mouvement":"string"},{"scene":2,"duree":"4s","transition":"Cut","texte_ecran":"string","mouvement":"string"},{"scene":3,"duree":"5s","transition":"Dissolve","texte_ecran":"string","mouvement":"string"},{"scene":4,"duree":"4s","transition":"Cut","texte_ecran":"string","mouvement":"string"},{"scene":5,"duree":"4s","transition":"Fade out","texte_ecran":"string","mouvement":"string"}],"musique":"string","rythme":"string"},"voice":{"voix_off_complete":"string","sous_titres":[{"time":"0-3s","texte":"string"},{"time":"3-8s","texte":"string"},{"time":"8-15s","texte":"string"},{"time":"15-22s","texte":"string"},{"time":"22-30s","texte":"string"}],"ton":"string","vitesse":"string"},"description":{"tiktok_court":"string","tiktok_long":"string","youtube":"string","facebook":"string","mots_cles":["string","string","string","string","string"]}}

Histoire africaine authentique, emotionnelle, virale. Titre CHOQUANT.`;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    console.log("API SUCCESS");
    const raw = response.content?.[0]?.text || "";
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return res.status(200).json({ ...parsed, _source: "ai" });

  } catch (error) {
    console.error("=== API ERROR ===");
    console.error("Status:", error.status);
    console.error("Message:", error.message);

    // ── CRÉDITS INSUFFISANTS → FALLBACK LOCAL ──
    const isCreditsError = 
      error.status === 400 || 
      error.status === 402 ||
      (error.message && error.message.toLowerCase().includes("credit"));

    if (isCreditsError) {
      console.log("CREDITS LOW — activating local fallback");
      const fallback = generateFallback(theme, type, perso, lieu, style, episodeNum);
      return res.status(200).json({ 
        ...fallback, 
        _source: "fallback",
        _notice: "credits_low"
      });
    }

    // ── AUTRE ERREUR ──
    return res.status(500).json({ 
      error: error.message || "Erreur de generation",
      code: error.status || 500
    });
  }
}
