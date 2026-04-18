import { useState, useRef, useCallback } from "react";

// ════════════════════════════════════════════════════════════
//  SERIES STUDIO — V5
//  SERIES ENGINE · 7 MODULES · FULL EPISODE GENERATOR
// ════════════════════════════════════════════════════════════

// ── FONTS & GLOBAL CSS ──────────────────────────────────────
const _fl = document.createElement("link");
_fl.rel = "stylesheet";
_fl.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=JetBrains+Mono:wght@300;400;500&display=swap";
document.head.appendChild(_fl);

const _css = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:#06060e}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#b8952833;border-radius:2px}
::-webkit-scrollbar-thumb:hover{background:#b8952866}

@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes shimmer{0%{opacity:.6}50%{opacity:1}100%{opacity:.6}}
@keyframes borderGlow{0%,100%{border-color:#b8952820}50%{border-color:#b8952855}}
@keyframes progressBar{from{width:0%}to{width:100%}}
@keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}

.module-card{
  background:#0c0c18;
  border:1px solid #141428;
  border-radius:10px;
  overflow:hidden;
  animation:fadeUp .4s ease both;
  transition:border-color .25s;
}
.module-card:hover{border-color:#b8952828}
.module-card.active{border-color:#b8952855;animation:borderGlow 3s ease infinite}

.pill{
  padding:5px 11px;background:transparent;
  border:1px solid #181830;border-radius:3px;
  color:#404060;cursor:pointer;
  font-size:10px;font-family:'JetBrains Mono',monospace;
  letter-spacing:.04em;transition:all .15s;white-space:nowrap;
}
.pill:hover{border-color:#b8952855;color:#b8952899}
.pill.on{background:#b8952818;border-color:#b89528;color:#e8c060}

.cpbtn{
  background:transparent;border:1px solid #181830;
  color:#303050;font-size:9px;padding:3px 8px;
  border-radius:2px;cursor:pointer;
  font-family:'JetBrains Mono',monospace;
  transition:all .15s;white-space:nowrap;flex-shrink:0;
}
.cpbtn:hover{border-color:#b8952855;color:#b89528}
.cpbtn.ok{border-color:#3d9970;color:#3d9970}

.gen-full{
  display:flex;align-items:center;justify-content:center;gap:10px;
  width:100%;padding:16px;
  background:linear-gradient(135deg,#b89528,#e8c060,#b89528);
  background-size:200% 100%;
  border:none;border-radius:6px;
  color:#06060e;font-size:13px;font-weight:800;
  font-family:'Playfair Display',serif;letter-spacing:.15em;
  cursor:pointer;transition:all .25s;
}
.gen-full:hover{background-position:100% 0;transform:translateY(-1px);box-shadow:0 8px 30px #b8952840}
.gen-full:disabled{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none}

.mod-btn{
  display:flex;align-items:center;gap:8px;
  padding:10px 14px;background:transparent;
  border:1px solid #141428;border-radius:5px;
  color:#404060;cursor:pointer;
  font-size:10px;font-family:'JetBrains Mono',monospace;
  letter-spacing:.06em;transition:all .2s;width:100%;
}
.mod-btn:hover{border-color:#b8952844;color:#b8952899;background:#b8952808}
.mod-btn.running{border-color:#b89528;color:#e8c060;background:#b8952812}
.mod-btn.done{border-color:#3d997055;color:#3d9970;background:#3d997010}

.tab{
  padding:9px 16px;background:transparent;border:none;
  border-bottom:2px solid transparent;
  color:#303050;cursor:pointer;
  font-size:10px;font-family:'JetBrains Mono',monospace;
  letter-spacing:.1em;transition:all .2s;text-transform:uppercase;
}
.tab:hover{color:#606080}
.tab.on{border-bottom-color:#b89528;color:#e8c060}

.skeleton{
  background:linear-gradient(90deg,#0f0f1e 25%,#141428 50%,#0f0f1e 75%);
  background-size:400px 100%;
  animation:shimmer 1.5s ease infinite;
  border-radius:4px;
}

.prog-wrap{height:2px;background:#0f0f1e;border-radius:1px;overflow:hidden;margin-top:6px}
.prog-bar{height:100%;background:linear-gradient(90deg,#b89528,#e8c060);border-radius:1px;transition:width .5s ease}
`;
const _se = document.createElement("style");
_se.textContent = _css;
document.head.appendChild(_se);

// ════════════════════════════════════════════════════════════
//  CONSTANTS
// ════════════════════════════════════════════════════════════
const SERIES_TYPES = [
  { id: "emotion", label: "Émotion / Drama", icon: "💔", desc: "Transformation, rejet → succès, larmes → victoire" },
  { id: "business", label: "Business", icon: "💰", desc: "Petit → grand, zéro → empire, idée → millions" },
  { id: "afrique", label: "Afrique Stylisée", icon: "🌍", desc: "Fruits, personnages, symboles africains iconiques" },
];

const PERSONNAGES = ["Femme","Homme","Entrepreneur","Enfant","Famille"];
const LIEUX = ["Marché africain","Ville moderne","Europe","Campagne","Bureau"];
const STYLES = ["Cinématique","Documentaire","Dramatique","Inspirationnel"];
const DUREES = ["15 sec","30 sec","60 sec"];

const MODULES = [
  { id: "concept",     icon: "💡", label: "Concept Generator",   desc: "Idée · Angle · Hook" },
  { id: "script",      icon: "📝", label: "Script Generator",    desc: "Hook · Dév · Climax · CTA" },
  { id: "images",      icon: "🖼", label: "Image Prompts",       desc: "Prompts Midjourney / Leonardo" },
  { id: "video",       icon: "🎬", label: "Video Structure",     desc: "Scènes · Timing · Transitions" },
  { id: "voice",       icon: "🎤", label: "Voice + Subtitles",   desc: "Voix off · Sous-titres sync" },
  { id: "description", icon: "📱", label: "Viral Description",   desc: "TikTok · YouTube · Facebook" },
];

// ════════════════════════════════════════════════════════════
//  SERIES ENGINE — PROMPT BUILDER
// ════════════════════════════════════════════════════════════
function buildMasterPrompt(config) {
  const { seriesType, personnage, lieu, style, duree, episodeNum } = config;
  const typeDesc = SERIES_TYPES.find(t => t.id === seriesType)?.desc || "";

  return `Tu es le meilleur créateur de contenu viral africain au monde. Expert TikTok, YouTube Shorts, Facebook Reels.

CONFIGURATION DE L'ÉPISODE :
- Type de série : ${seriesType} (${typeDesc})
- Personnage : ${personnage}
- Lieu : ${lieu}
- Style visuel : ${style}
- Durée cible : ${duree}
- Numéro d'épisode : ${episodeNum}

Génère un épisode COMPLET et VIRAL. Réponds UNIQUEMENT en JSON valide (zéro markdown, zéro backtick) :

{
  "concept": {
    "titre_serie": "Nom de la série (court, mémorable, percutant)",
    "titre_episode": "Titre de cet épisode (ultra-accrocheur, choc émotionnel)",
    "angle": "L'angle émotionnel central en 1 phrase",
    "hook": "La première phrase qui accroche en 0-3 secondes (doit choquer ou intriguer)",
    "promesse": "Ce que le spectateur va ressentir/apprendre"
  },
  "script": {
    "hook_text": "Texte d'accroche affiché à l'écran (0-3 sec)",
    "hook_voix": "Ce que dit la voix off au début",
    "developpement": [
      {"sec": "3-8s", "ecran": "Texte affiché", "voix": "Voix off"},
      {"sec": "8-15s", "ecran": "Texte affiché", "voix": "Voix off"},
      {"sec": "15-22s", "ecran": "Texte affiché", "voix": "Voix off"}
    ],
    "climax_ecran": "Texte climax émotionnel fort",
    "climax_voix": "Voix off au climax",
    "cta_ecran": "Call to action affiché",
    "cta_voix": "Call to action voix off"
  },
  "images": [
    {
      "scene": 1,
      "label": "Nom de la scène",
      "prompt_mj": "Prompt Midjourney complet en anglais (cinematic, detailed, style cohérent)",
      "prompt_leo": "Prompt Leonardo/SD optimisé en anglais",
      "notes": "Conseil de mise en scène"
    },
    {"scene": 2, "label": "...", "prompt_mj": "...", "prompt_leo": "...", "notes": "..."},
    {"scene": 3, "label": "...", "prompt_mj": "...", "prompt_leo": "...", "notes": "..."},
    {"scene": 4, "label": "...", "prompt_mj": "...", "prompt_leo": "...", "notes": "..."},
    {"scene": 5, "label": "...", "prompt_mj": "...", "prompt_leo": "...", "notes": "..."}
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
    "voix_off_complete": "Texte complet de la narration voix off du début à la fin",
    "sous_titres": [
      {"time": "0-3s", "texte": "Sous-titre scène 1"},
      {"time": "3-8s", "texte": "Sous-titre scène 2"},
      {"time": "8-15s", "texte": "Sous-titre scène 3"},
      {"time": "15-22s", "texte": "Sous-titre scène 4"},
      {"time": "22-30s", "texte": "Sous-titre scène 5"}
    ],
    "ton": "Ton recommandé pour la voix",
    "vitesse": "Vitesse de parole recommandée"
  },
  "description": {
    "tiktok_court": "Description TikTok max 150 caractères, percutante, sans hashtags",
    "tiktok_long": "Description TikTok 3-4 phrases engageantes avec mots-clés intégrés naturellement",
    "youtube": "Description YouTube longue et optimisée SEO, mots-clés naturels, 5-8 phrases",
    "facebook": "Description Facebook émotionnelle et communautaire, 3-5 phrases",
    "mots_cles": ["mot-clé 1", "mot-clé 2", "mot-clé 3", "mot-clé 4", "mot-clé 5"]
  }
}

RÈGLES ABSOLUES :
- Contenu 100% africain et émotionnel, authentique
- Titre CHOQUANT qui donne envie de regarder absolument
- Hook doit accrocher en moins de 2 secondes
- Cohérence visuelle entre toutes les scènes (même personnage, même univers)
- Prompts images en anglais, ultra-détaillés, style ${style.toLowerCase()} cinematic 4K`;
}

// ════════════════════════════════════════════════════════════
//  API CALL
// ════════════════════════════════════════════════════════════
async function generateEpisode(config) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: buildMasterPrompt(config) }],
    }),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const d = await res.json();
  const raw = d.content?.find(b => b.type === "text")?.text || "";
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ════════════════════════════════════════════════════════════
//  UTILITY HOOKS
// ════════════════════════════════════════════════════════════
function useCopy() {
  const [k, setK] = useState(null);
  const cp = useCallback((txt, key) => {
    navigator.clipboard.writeText(txt);
    setK(key);
    setTimeout(() => setK(null), 2000);
  }, []);
  return [k, cp];
}

function useLocalStorage(key, def) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : def; } catch { return def; }
  });
  const set = useCallback((v) => {
    const next = typeof v === "function" ? v(val) : v;
    setVal(next);
    localStorage.setItem(key, JSON.stringify(next));
  }, [key, val]);
  return [val, set];
}

// ════════════════════════════════════════════════════════════
//  UI ATOMS
// ════════════════════════════════════════════════════════════
const C = {
  bg: "#06060e", surf: "#09091a", card: "#0c0c18",
  border: "#141428", border2: "#1a1a30",
  gold: "#b89528", goldL: "#e8c060", goldD: "#8a6e1c",
  text: "#d8d8ee", muted: "#404060", faint: "#1e1e38",
  green: "#3d9970", red: "#c0392b",
};

function CopyBtn({ text, id, label = "copy" }) {
  const [k, cp] = useCopy();
  return (
    <button className={`cpbtn ${k === id ? "ok" : ""}`} onClick={() => cp(text, id)}>
      {k === id ? "✓ copié" : label}
    </button>
  );
}

function SectionHeader({ icon, label, badge }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <span style={{ fontSize: 13 }}>{icon}</span>
      <span style={{ fontSize: 9, color: C.gold, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".22em", textTransform: "uppercase" }}>{label}</span>
      {badge && <span style={{ marginLeft: "auto", fontSize: 9, color: C.muted, fontFamily: "'JetBrains Mono',monospace" }}>{badge}</span>}
    </div>
  );
}

function PickGroup({ label, opts, val, set, multi = false }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 8, color: C.muted, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".2em", marginBottom: 7, textTransform: "uppercase" }}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {opts.map(o => {
          const id = o.id || o;
          const lbl = o.label || o;
          const active = multi ? val.includes(id) : val === id;
          return (
            <button key={id} className={`pill ${active ? "on" : ""}`} onClick={() => {
              if (multi) set(active ? val.filter(x => x !== id) : [...val, id]);
              else set(id);
            }}>
              {o.icon ? `${o.icon} ${lbl}` : lbl}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TextBlock({ children, mono = false, dim = false }) {
  return (
    <p style={{
      fontSize: mono ? 11 : 14,
      color: dim ? C.muted : C.text,
      fontFamily: mono ? "'JetBrains Mono',monospace" : "'Playfair Display',serif",
      lineHeight: mono ? 1.7 : 1.85,
      whiteSpace: "pre-wrap",
    }}>{children}</p>
  );
}

function Divider() {
  return <div style={{ height: 1, background: C.border, margin: "20px 0" }} />;
}

function ProgressBar({ pct }) {
  return (
    <div className="prog-wrap">
      <div className="prog-bar" style={{ width: `${pct}%` }} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  MODULE RENDERERS
// ════════════════════════════════════════════════════════════

function ConceptModule({ data }) {
  const [k, cp] = useCopy();
  if (!data) return null;
  return (
    <div className="module-card" style={{ padding: "22px 24px", animation: "fadeUp .3s ease" }}>
      <SectionHeader icon="💡" label="Concept Generator" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          ["Titre de la série", data.titre_serie],
          ["Titre de l'épisode", data.titre_episode],
          ["Angle émotionnel", data.angle],
          ["Promesse spectateur", data.promesse],
        ].map(([lbl, val]) => (
          <div key={lbl} style={{ background: C.faint, borderRadius: 6, padding: "12px 14px" }}>
            <div style={{ fontSize: 8, color: C.gold, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".16em", marginBottom: 7, textTransform: "uppercase" }}>{lbl}</div>
            <TextBlock>{val}</TextBlock>
          </div>
        ))}
      </div>
      <Divider />
      <div style={{ background: "#0b0b1a", border: `1px solid ${C.gold}44`, borderRadius: 8, padding: "16px 18px" }}>
        <div style={{ fontSize: 8, color: C.gold, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".16em", marginBottom: 8, textTransform: "uppercase" }}>🎯 Hook — 0–3 secondes</div>
        <p style={{ fontSize: 19, fontWeight: 700, color: "#f5e8b0", fontFamily: "'Playfair Display',serif", fontStyle: "italic", lineHeight: 1.4 }}>
          "{data.hook}"
        </p>
        <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
          <CopyBtn text={data.hook} id="hook" label="copier le hook" />
        </div>
      </div>
    </div>
  );
}

function ScriptModule({ data }) {
  if (!data) return null;
  return (
    <div className="module-card" style={{ padding: "22px 24px", animation: "fadeUp .35s ease" }}>
      <SectionHeader icon="📝" label="Script Generator" badge={`Hook + ${data.developpement?.length || 0} séquences + Climax + CTA`} />

      {/* Hook */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div style={{ background: C.faint, borderRadius: 6, padding: "12px 14px" }}>
          <div style={{ fontSize: 8, color: C.gold, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".14em", marginBottom: 6, textTransform: "uppercase" }}>Écran — Hook</div>
          <TextBlock>{data.hook_text}</TextBlock>
        </div>
        <div style={{ background: C.faint, borderRadius: 6, padding: "12px 14px" }}>
          <div style={{ fontSize: 8, color: "#6080a0", fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".14em", marginBottom: 6, textTransform: "uppercase" }}>🎤 Voix off — Hook</div>
          <TextBlock dim>{data.hook_voix}</TextBlock>
        </div>
      </div>

      {/* Développement */}
      {data.developpement?.map((seq, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr", gap: 10, marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: C.faint, borderRadius: 5, fontSize: 9, color: C.gold, fontFamily: "'JetBrains Mono',monospace" }}>
            {seq.sec}
          </div>
          <div style={{ background: C.faint, borderRadius: 5, padding: "10px 12px" }}>
            <TextBlock>{seq.ecran}</TextBlock>
          </div>
          <div style={{ background: C.faint, borderRadius: 5, padding: "10px 12px" }}>
            <TextBlock dim>{seq.voix}</TextBlock>
          </div>
        </div>
      ))}

      <Divider />

      {/* Climax */}
      <div style={{ background: "#120d06", border: `1px solid ${C.gold}33`, borderRadius: 7, padding: "14px 16px", marginBottom: 10 }}>
        <div style={{ fontSize: 8, color: "#e8a020", fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".14em", marginBottom: 7, textTransform: "uppercase" }}>⚡ Climax Émotionnel</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <TextBlock>{data.climax_ecran}</TextBlock>
          <TextBlock dim>{data.climax_voix}</TextBlock>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: "#080d10", border: "1px solid #204060", borderRadius: 7, padding: "14px 16px" }}>
        <div style={{ fontSize: 8, color: "#4080c0", fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".14em", marginBottom: 7, textTransform: "uppercase" }}>→ Call to Action</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <TextBlock>{data.cta_ecran}</TextBlock>
          <TextBlock dim>{data.cta_voix}</TextBlock>
        </div>
      </div>
    </div>
  );
}

function ImageModule({ data }) {
  const [active, setActive] = useState(0);
  const [k, cp] = useCopy();
  if (!data?.length) return null;
  const sc = data[active];
  return (
    <div className="module-card" style={{ padding: "22px 24px", animation: "fadeUp .4s ease" }}>
      <SectionHeader icon="🖼" label="Image Prompts" badge="Midjourney · Leonardo / SD" />

      {/* Scene picker */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {data.map((s, i) => (
          <button key={i} className={`pill ${active === i ? "on" : ""}`} onClick={() => setActive(i)}>
            Scène {s.scene}
          </button>
        ))}
      </div>

      {/* Scene label */}
      <div style={{ fontSize: 11, color: C.gold, fontFamily: "'Playfair Display',serif", fontStyle: "italic", marginBottom: 14 }}>
        {sc.label}
      </div>

      {/* Prompts */}
      {[
        { label: "Midjourney", key: "mj", val: sc.prompt_mj },
        { label: "Leonardo / SD", key: "leo", val: sc.prompt_leo },
      ].map(({ label, key, val }) => (
        <div key={key} style={{ background: "#080813", border: `1px solid ${C.border2}`, borderRadius: 6, padding: "12px 14px", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 8, color: "#6060c0", fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".14em", textTransform: "uppercase" }}>{label}</span>
            <CopyBtn text={val} id={`${key}-${active}`} label="copier" />
          </div>
          <TextBlock mono dim>{val}</TextBlock>
        </div>
      ))}

      {sc.notes && (
        <div style={{ marginTop: 4, fontSize: 11, color: C.muted, fontFamily: "'JetBrains Mono',monospace", fontStyle: "italic", lineHeight: 1.6 }}>
          💡 {sc.notes}
        </div>
      )}
    </div>
  );
}

function VideoModule({ data }) {
  if (!data) return null;
  return (
    <div className="module-card" style={{ padding: "22px 24px", animation: "fadeUp .42s ease" }}>
      <SectionHeader icon="🎬" label="Video Structure" badge={`${data.rythme || ""}`} />

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
        {data.structure?.map((sc, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "28px 45px 100px 1fr 80px", gap: 8, alignItems: "center", background: C.faint, borderRadius: 5, padding: "10px 12px" }}>
            <span style={{ fontSize: 11, color: C.gold, fontFamily: "'JetBrains Mono',monospace", fontWeight: 500 }}>#{sc.scene}</span>
            <span style={{ fontSize: 10, color: C.muted, fontFamily: "'JetBrains Mono',monospace" }}>{sc.duree}</span>
            <span style={{ fontSize: 10, color: "#6060c0", fontFamily: "'JetBrains Mono',monospace" }}>{sc.transition}</span>
            <span style={{ fontSize: 12, color: C.text, fontFamily: "'Playfair Display',serif" }}>{sc.texte_ecran}</span>
            <span style={{ fontSize: 9, color: C.muted, fontFamily: "'JetBrains Mono',monospace", textAlign: "right" }}>{sc.mouvement}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: C.faint, borderRadius: 6, padding: "10px 12px" }}>
          <div style={{ fontSize: 8, color: C.gold, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".14em", marginBottom: 5, textTransform: "uppercase" }}>🎵 Musique</div>
          <TextBlock dim>{data.musique}</TextBlock>
        </div>
        <div style={{ background: C.faint, borderRadius: 6, padding: "10px 12px" }}>
          <div style={{ fontSize: 8, color: C.gold, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".14em", marginBottom: 5, textTransform: "uppercase" }}>⚡ Rythme</div>
          <TextBlock dim>{data.rythme}</TextBlock>
        </div>
      </div>
    </div>
  );
}

function VoiceModule({ data }) {
  const [k, cp] = useCopy();
  if (!data) return null;
  return (
    <div className="module-card" style={{ padding: "22px 24px", animation: "fadeUp .44s ease" }}>
      <SectionHeader icon="🎤" label="Voice + Subtitles" />

      <div style={{ background: "#0b0b18", border: `1px solid ${C.border2}`, borderRadius: 7, padding: "16px 18px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 8, color: C.gold, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".16em", textTransform: "uppercase" }}>🎙 Voix Off Complète</span>
          <CopyBtn text={data.voix_off_complete} id="voix" label="copier tout" />
        </div>
        <TextBlock>{data.voix_off_complete}</TextBlock>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        <div style={{ background: C.faint, borderRadius: 6, padding: "10px 12px" }}>
          <div style={{ fontSize: 8, color: C.muted, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".12em", marginBottom: 5, textTransform: "uppercase" }}>Ton</div>
          <TextBlock mono dim>{data.ton}</TextBlock>
        </div>
        <div style={{ background: C.faint, borderRadius: 6, padding: "10px 12px" }}>
          <div style={{ fontSize: 8, color: C.muted, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".12em", marginBottom: 5, textTransform: "uppercase" }}>Vitesse</div>
          <TextBlock mono dim>{data.vitesse}</TextBlock>
        </div>
      </div>

      <div style={{ fontSize: 8, color: C.muted, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 8 }}>Sous-titres Synchronisés</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {data.sous_titres?.map((sub, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 8, alignItems: "center", background: C.faint, borderRadius: 4, padding: "8px 10px" }}>
            <span style={{ fontSize: 9, color: C.gold, fontFamily: "'JetBrains Mono',monospace" }}>{sub.time}</span>
            <span style={{ fontSize: 12, color: C.text, fontFamily: "'Playfair Display',serif" }}>{sub.texte}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DescriptionModule({ data }) {
  const [tab, setTab] = useState("tiktok");
  if (!data) return null;

  const tabs = [
    { id: "tiktok", label: "TikTok", short: data.tiktok_court, long: data.tiktok_long },
    { id: "youtube", label: "YouTube", long: data.youtube },
    { id: "facebook", label: "Facebook", long: data.facebook },
  ];
  const current = tabs.find(t => t.id === tab);

  return (
    <div className="module-card" style={{ padding: "22px 24px", animation: "fadeUp .46s ease" }}>
      <SectionHeader icon="📱" label="Viral Description" />

      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, marginBottom: 16, gap: 0 }}>
        {tabs.map(t => (
          <button key={t.id} className={`tab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {current.short && (
        <div style={{ background: "#080d10", border: "1px solid #204060", borderRadius: 6, padding: "12px 14px", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
            <span style={{ fontSize: 8, color: "#4080c0", fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".14em", textTransform: "uppercase" }}>Version courte ≤ 150 car.</span>
            <CopyBtn text={current.short} id={`${tab}-short`} label="copier" />
          </div>
          <TextBlock>{current.short}</TextBlock>
        </div>
      )}

      <div style={{ background: C.faint, borderRadius: 6, padding: "14px 16px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 8, color: C.gold, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".14em", textTransform: "uppercase" }}>Version longue</span>
          <CopyBtn text={current.long} id={`${tab}-long`} label="copier" />
        </div>
        <TextBlock>{current.long}</TextBlock>
      </div>

      {data.mots_cles?.length > 0 && (
        <>
          <div style={{ fontSize: 8, color: C.muted, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 8 }}>Mots-clés SEO</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {data.mots_cles.map((kw, i) => (
              <span key={i} style={{ background: C.faint, border: `1px solid ${C.border2}`, borderRadius: 3, padding: "4px 9px", fontSize: 10, color: C.muted, fontFamily: "'JetBrains Mono',monospace" }}>
                {kw}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  SAVED PROJECTS PANEL
// ════════════════════════════════════════════════════════════
function ProjectsPanel({ projects, onLoad, onDelete }) {
  if (!projects.length) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", color: C.muted, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, lineHeight: 2 }}>
        Aucun projet sauvegardé.<br />
        <span style={{ fontSize: 9, color: C.border2 }}>Génère un épisode et clique sur 💾</span>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {projects.map((p, i) => (
        <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "border-color .2s", animation: "slideIn .3s ease" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#b8952840"}
          onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
          <div style={{ flex: 1 }} onClick={() => onLoad(p)}>
            <div style={{ fontSize: 13, color: C.text, fontFamily: "'Playfair Display',serif", fontStyle: "italic", marginBottom: 4 }}>
              {p.result?.concept?.titre_episode || "Episode sans titre"}
            </div>
            <div style={{ fontSize: 9, color: C.muted, fontFamily: "'JetBrains Mono',monospace" }}>
              {p.config?.seriesType} · {p.config?.personnage} · {p.date}
            </div>
          </div>
          <button onClick={() => onDelete(i)} style={{ background: "transparent", border: "none", color: C.border2, cursor: "pointer", fontSize: 16, padding: "0 4px", transition: "color .15s", lineHeight: 1 }}
            onMouseEnter={e => e.currentTarget.style.color = C.red}
            onMouseLeave={e => e.currentTarget.style.color = C.border2}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  LOADING OVERLAY
// ════════════════════════════════════════════════════════════
function LoadingView({ step, total }) {
  const steps = ["Concept…", "Script…", "Prompts images…", "Structure vidéo…", "Voix off…", "Descriptions…", "Finalisation…"];
  const pct = Math.round((step / total) * 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "70vh", gap: 24 }}>
      <div style={{ position: "relative", width: 64, height: 64 }}>
        <div style={{ width: 64, height: 64, border: `2px solid ${C.border}`, borderTop: `2px solid ${C.gold}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🎬</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: C.gold, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, marginBottom: 6, animation: "shimmer 1.5s ease infinite" }}>
          {steps[Math.min(step, steps.length - 1)]}
        </p>
        <div style={{ width: 240 }}>
          <ProgressBar pct={pct} />
        </div>
        <p style={{ color: C.muted, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, marginTop: 6 }}>{pct}%</p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  MAIN APP
// ════════════════════════════════════════════════════════════
export default function SeriesStudioV5() {
  // Config
  const [seriesType, setSeriesType] = useState("emotion");
  const [personnage, setPersonnage] = useState("Femme");
  const [lieu, setLieu] = useState("Marché africain");
  const [style, setStyle] = useState("Cinématique");
  const [duree, setDuree] = useState("30 sec");
  const [episodeNum, setEpisodeNum] = useState(1);

  // State
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("studio");
  const [activeModules, setActiveModules] = useState(["concept", "script", "images", "video", "voice", "description"]);

  // Persistence
  const [projects, setProjects] = useLocalStorage("ss_v5_projects", []);

  const mainRef = useRef(null);

  const config = { seriesType, personnage, lieu, style, duree, episodeNum };

  // Simulated progress during API call
  const simulateProgress = useCallback(() => {
    let s = 0;
    const iv = setInterval(() => {
      s = Math.min(s + 1, 5);
      setLoadStep(s);
    }, 1200);
    return () => clearInterval(iv);
  }, []);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setLoadStep(0);
    const stopProgress = simulateProgress();
    try {
      const data = await generateEpisode(config);
      stopProgress();
      setLoadStep(6);
      await new Promise(r => setTimeout(r, 400));
      setResult(data);
      setTimeout(() => mainRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 100);
    } catch (e) {
      stopProgress();
      setError(`Erreur de génération : ${e.message || "vérifie ta connexion et réessaie."}`);
    }
    setLoading(false);
    setLoadStep(0);
  };

  const saveProject = () => {
    if (!result) return;
    const entry = { config, result, date: new Date().toLocaleDateString("fr-FR"), id: Date.now() };
    setProjects(prev => [entry, ...prev].slice(0, 50));
  };

  const loadProject = (p) => {
    const c = p.config;
    setSeriesType(c.seriesType); setPersonnage(c.personnage);
    setLieu(c.lieu); setStyle(c.style); setDuree(c.duree);
    setEpisodeNum(c.episodeNum || 1);
    setResult(p.result);
    setTab("studio");
  };

  const deleteProject = (i) => setProjects(prev => prev.filter((_, j) => j !== i));

  const TABS = [
    { id: "studio", label: "✦ Studio" },
    { id: "projects", label: `📁 Projets (${projects.length})` },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.bg, color: C.text, overflow: "hidden" }}>

      {/* ── HEADER ── */}
      <header style={{ background: C.surf, borderBottom: `1px solid ${C.border}`, padding: "0 24px", display: "flex", alignItems: "center", height: 52, flexShrink: 0, gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🎬</span>
          <div>
            <span style={{ fontSize: 17, fontWeight: 900, color: C.goldL, fontFamily: "'Playfair Display',serif", letterSpacing: ".06em" }}>Series Studio</span>
            <span style={{ fontSize: 9, color: C.muted, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".18em", marginLeft: 10 }}>V5 · SERIES ENGINE</span>
          </div>
        </div>

        {/* Credits placeholder for future */}
        <div style={{ marginLeft: 16, background: C.faint, border: `1px solid ${C.border2}`, borderRadius: 4, padding: "4px 12px", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 9, color: C.muted, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".1em" }}>⚡ Crédits</span>
          <span style={{ fontSize: 11, color: C.gold, fontFamily: "'JetBrains Mono',monospace", fontWeight: 500 }}>∞</span>
        </div>

        <div style={{ marginLeft: "auto", display: "flex" }}>
          {TABS.map(t => (
            <button key={t.id} className={`tab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── SIDEBAR ── */}
        {tab === "studio" && (
          <aside style={{ width: 272, background: C.surf, borderRight: `1px solid ${C.border}`, padding: "20px 14px", display: "flex", flexDirection: "column", overflowY: "auto", flexShrink: 0, gap: 0 }}>

            <div style={{ fontSize: 7, color: C.muted, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".28em", textTransform: "uppercase", marginBottom: 18 }}>
              Configuration Episode
            </div>

            <PickGroup label="🎭 Type de série" opts={SERIES_TYPES} val={seriesType} set={setSeriesType} />
            <PickGroup label="👤 Personnage" opts={PERSONNAGES} val={personnage} set={setPersonnage} />
            <PickGroup label="📍 Lieu" opts={LIEUX} val={lieu} set={setLieu} />
            <PickGroup label="🎨 Style visuel" opts={STYLES} val={style} set={setStyle} />
            <PickGroup label="⏱ Durée cible" opts={DUREES} val={duree} set={setDuree} />

            {/* Episode number */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 8, color: C.muted, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".2em", marginBottom: 7, textTransform: "uppercase" }}>N° d'épisode</div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <button onClick={() => setEpisodeNum(Math.max(1, episodeNum - 1))} className="pill">−</button>
                <span style={{ fontSize: 14, color: C.gold, fontFamily: "'JetBrains Mono',monospace", minWidth: 24, textAlign: "center" }}>{episodeNum}</span>
                <button onClick={() => setEpisodeNum(episodeNum + 1)} className="pill">+</button>
              </div>
            </div>

            <Divider />

            {/* Module selector */}
            <div style={{ fontSize: 8, color: C.muted, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 10 }}>Modules actifs</div>
            <PickGroup label="" opts={MODULES.map(m => ({ id: m.id, label: `${m.icon} ${m.label}` }))} val={activeModules} set={setActiveModules} multi={true} />

            <div style={{ marginTop: "auto", paddingTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <button className="gen-full" onClick={generate} disabled={loading || activeModules.length === 0}>
                {loading ? "⏳ Génération…" : "⚡ GENERATE FULL EPISODE"}
              </button>
              {result && (
                <button onClick={saveProject} style={{ padding: "9px", background: "#b8952814", border: `1px solid ${C.gold}44`, borderRadius: 5, color: C.gold, cursor: "pointer", fontSize: 10, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".08em", transition: "all .2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#b8952828"}
                  onMouseLeave={e => e.currentTarget.style.background = "#b8952814"}>
                  💾 Sauvegarder ce projet
                </button>
              )}
            </div>
          </aside>
        )}

        {/* ── MAIN OUTPUT ── */}
        <main ref={mainRef} style={{ flex: 1, overflowY: "auto", padding: "24px 28px", background: C.bg }}>

          {/* PROJECTS */}
          {tab === "projects" && (
            <div>
              <div style={{ fontSize: 8, color: C.gold, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".22em", marginBottom: 20, textTransform: "uppercase" }}>📁 Projets sauvegardés</div>
              <ProjectsPanel projects={projects} onLoad={loadProject} onDelete={deleteProject} />
            </div>
          )}

          {/* STUDIO */}
          {tab === "studio" && (
            <>
              {/* Empty */}
              {!result && !loading && !error && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "72vh", gap: 20, opacity: .3 }}>
                  <div style={{ fontSize: 70, lineHeight: 1 }}>🎬</div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: C.text, marginBottom: 8 }}>Series Engine prêt</p>
                    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: C.muted, lineHeight: 1.8 }}>Configure · Sélectionne les modules · Generate Full Episode</p>
                  </div>
                </div>
              )}

              {/* Loading */}
              {loading && <LoadingView step={loadStep} total={7} />}

              {/* Error */}
              {error && !loading && (
                <div style={{ background: "#160808", border: `1px solid ${C.red}44`, borderRadius: 8, padding: "18px 22px", color: "#e08080", fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>
                  ⚠ {error}
                </div>
              )}

              {/* Results */}
              {result && !loading && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                  {/* Episode header */}
                  <div style={{ background: "linear-gradient(135deg,#0e0e20,#16162a)", border: `1px solid ${C.gold}33`, borderRadius: 10, padding: "24px 28px", animation: "fadeUp .25s ease" }}>
                    <div style={{ fontSize: 8, color: C.gold, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".22em", marginBottom: 10, textTransform: "uppercase" }}>
                      🎬 Épisode {episodeNum} — {SERIES_TYPES.find(t => t.id === seriesType)?.label}
                    </div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f5e8b0", fontFamily: "'Playfair Display',serif", lineHeight: 1.35, marginBottom: 10 }}>
                      {result.concept?.titre_episode}
                    </h1>
                    <div style={{ fontSize: 12, color: C.muted, fontFamily: "'JetBrains Mono',monospace", borderTop: `1px solid ${C.border}`, paddingTop: 10, marginTop: 4 }}>
                      {result.concept?.titre_serie} &nbsp;·&nbsp; {personnage} &nbsp;·&nbsp; {lieu}
                    </div>
                  </div>

                  {/* Modules output — only active ones */}
                  {activeModules.includes("concept") && result.concept && <ConceptModule data={result.concept} />}
                  {activeModules.includes("script") && result.script && <ScriptModule data={result.script} />}
                  {activeModules.includes("images") && result.images && <ImageModule data={result.images} />}
                  {activeModules.includes("video") && result.video && <VideoModule data={result.video} />}
                  {activeModules.includes("voice") && result.voice && <VoiceModule data={result.voice} />}
                  {activeModules.includes("description") && result.description && <DescriptionModule data={result.description} />}

                  {/* Regen */}
                  <button onClick={generate} style={{ width: "100%", padding: 11, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer", fontSize: 10, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".1em", transition: "all .2s", marginTop: 4 }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#b8952855"; e.currentTarget.style.color = "#b8952899"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
                    ↻ Régénérer une nouvelle version
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
