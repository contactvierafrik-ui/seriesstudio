import { useState, useRef, useCallback } from "react";

// ════════════════════════════════════════════════════════════
//  SERIES STUDIO — V5  (sécurisé — appel via /api/generate)
// ════════════════════════════════════════════════════════════

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
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes shimmer{0%{opacity:.6}50%{opacity:1}100%{opacity:.6}}
@keyframes borderGlow{0%,100%{border-color:#b8952820}50%{border-color:#b8952855}}
@keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
.module-card{background:#0c0c18;border:1px solid #141428;border-radius:10px;overflow:hidden;animation:fadeUp .4s ease both;transition:border-color .25s}
.module-card:hover{border-color:#b8952828}
.pill{padding:5px 11px;background:transparent;border:1px solid #181830;border-radius:3px;color:#404060;cursor:pointer;font-size:10px;font-family:'JetBrains Mono',monospace;letter-spacing:.04em;transition:all .15s;white-space:nowrap}
.pill:hover{border-color:#b8952855;color:#b8952899}
.pill.on{background:#b8952818;border-color:#b89528;color:#e8c060}
.gen-full{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:16px;background:linear-gradient(135deg,#b89528,#e8c060,#b89528);background-size:200% 100%;border:none;border-radius:6px;color:#06060e;font-size:13px;font-weight:800;font-family:'Playfair Display',serif;letter-spacing:.15em;cursor:pointer;transition:all .25s}
.gen-full:hover{background-position:100% 0;transform:translateY(-1px);box-shadow:0 8px 30px #b8952840}
.gen-full:disabled{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none}
.cpbtn{background:transparent;border:1px solid #1e1e2e;color:#303050;font-size:9px;padding:3px 8px;border-radius:2px;cursor:pointer;font-family:'JetBrains Mono',monospace;transition:all .15s;white-space:nowrap;flex-shrink:0}
.cpbtn:hover{border-color:#b8952855;color:#b89528}
.cpbtn.ok{border-color:#3d9970;color:#3d9970}
.tab{padding:9px 16px;background:transparent;border:none;border-bottom:2px solid transparent;color:#303050;cursor:pointer;font-size:10px;font-family:'JetBrains Mono',monospace;letter-spacing:.1em;transition:all .2s;text-transform:uppercase}
.tab:hover{color:#606080}
.tab.on{border-bottom-color:#b89528;color:#e8c060}
.saved-item{background:#0c0c18;border:1px solid #141428;border-radius:7px;padding:14px 18px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:border-color .2s;animation:slideIn .3s ease}
.saved-item:hover{border-color:#b8952840}
`;
const _se = document.createElement("style");
_se.textContent = _css;
document.head.appendChild(_se);

// ── CONSTANTS ──
const SERIES_TYPES = [
  { id: "emotion", label: "Émotion / Drama", icon: "💔" },
  { id: "business", label: "Business", icon: "💰" },
  { id: "afrique", label: "Afrique Stylisée", icon: "🌍" },
];
const PERSONNAGES = ["Femme","Homme","Entrepreneur","Enfant","Famille"];
const LIEUX = ["Marché africain","Ville moderne","Europe","Campagne","Bureau"];
const STYLES = ["Cinématique","Documentaire","Dramatique","Inspirationnel"];
const DUREES = ["15 sec","30 sec","60 sec"];
const MODULES = [
  { id: "concept", icon: "💡", label: "Concept Generator" },
  { id: "script", icon: "📝", label: "Script Generator" },
  { id: "images", icon: "🖼", label: "Image Prompts" },
  { id: "video", icon: "🎬", label: "Video Structure" },
  { id: "voice", icon: "🎤", label: "Voice + Subtitles" },
  { id: "description", icon: "📱", label: "Viral Description" },
];

const C = {
  bg:"#06060e",surf:"#09091a",card:"#0c0c18",
  border:"#141428",border2:"#1a1a30",
  gold:"#b89528",goldL:"#e8c060",
  text:"#d8d8ee",muted:"#404060",faint:"#1e1e38",
  green:"#3d9970",red:"#c0392b",
};

// ── API CALL — sécurisé via backend ──
async function generateEpisode(config) {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Erreur serveur ${res.status}`);
  }
  return res.json();
}

// ── HOOKS ──
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

// ── UI ATOMS ──
function CopyBtn({ text, id, label = "copy" }) {
  const [k, cp] = useCopy();
  return <button className={`cpbtn ${k === id ? "ok" : ""}`} onClick={() => cp(text, id)}>{k === id ? "✓ copié" : label}</button>;
}

function Divider() { return <div style={{ height: 1, background: C.border, margin: "18px 0" }} />; }

function SectionTag({ children }) {
  return <div style={{ fontSize: 9, color: C.gold, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 10 }}>{children}</div>;
}

function PickGroup({ label, opts, val, set, multi = false }) {
  return (
    <div style={{ marginBottom: 15 }}>
      {label && <div style={{ fontSize: 8, color: C.muted, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".2em", marginBottom: 7, textTransform: "uppercase" }}>{label}</div>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {opts.map(o => {
          const id = o.id || o, lbl = o.label || o;
          const active = multi ? val.includes(id) : val === id;
          return (
            <button key={id} className={`pill ${active ? "on" : ""}`} onClick={() => {
              if (multi) set(active ? val.filter(x => x !== id) : [...val, id]);
              else set(id);
            }}>{o.icon ? `${o.icon} ${lbl}` : lbl}</button>
          );
        })}
      </div>
    </div>
  );
}

function TextBlock({ children, mono, dim }) {
  return <p style={{ fontSize: mono ? 11 : 14, color: dim ? C.muted : C.text, fontFamily: mono ? "'JetBrains Mono',monospace" : "'Playfair Display',serif", lineHeight: mono ? 1.7 : 1.85, whiteSpace: "pre-wrap" }}>{children}</p>;
}

function ProgressBar({ pct }) {
  return <div style={{ height: 2, background: "#0f0f1e", borderRadius: 1, overflow: "hidden", marginTop: 6 }}><div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${C.gold},${C.goldL})`, borderRadius: 1, transition: "width .5s ease" }} /></div>;
}

// ── MODULE RENDERERS ──
function ConceptModule({ data }) {
  if (!data) return null;
  return (
    <div className="module-card" style={{ padding: "22px 24px" }}>
      <SectionTag>💡 Concept Generator</SectionTag>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[["Titre de la série", data.titre_serie], ["Titre épisode", data.titre_episode], ["Angle", data.angle], ["Promesse", data.promesse]].map(([l, v]) => (
          <div key={l} style={{ background: C.faint, borderRadius: 6, padding: "12px 14px" }}>
            <div style={{ fontSize: 8, color: C.gold, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".14em", marginBottom: 6, textTransform: "uppercase" }}>{l}</div>
            <TextBlock>{v}</TextBlock>
          </div>
        ))}
      </div>
      <div style={{ background: "#0b0b1a", border: `1px solid ${C.gold}44`, borderRadius: 8, padding: "16px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 8, color: C.gold, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".16em", textTransform: "uppercase" }}>🎯 Hook 0–3 sec</span>
          <CopyBtn text={data.hook} id="hook" label="copier" />
        </div>
        <p style={{ fontSize: 18, fontWeight: 700, color: "#f5e8b0", fontFamily: "'Playfair Display',serif", fontStyle: "italic", lineHeight: 1.4 }}>"{data.hook}"</p>
      </div>
    </div>
  );
}

function ScriptModule({ data }) {
  if (!data) return null;
  return (
    <div className="module-card" style={{ padding: "22px 24px" }}>
      <SectionTag>📝 Script Generator</SectionTag>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div style={{ background: C.faint, borderRadius: 6, padding: "12px 14px" }}>
          <div style={{ fontSize: 8, color: C.gold, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".12em", marginBottom: 6, textTransform: "uppercase" }}>Écran — Hook</div>
          <TextBlock>{data.hook_text}</TextBlock>
        </div>
        <div style={{ background: C.faint, borderRadius: 6, padding: "12px 14px" }}>
          <div style={{ fontSize: 8, color: "#6080a0", fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".12em", marginBottom: 6, textTransform: "uppercase" }}>🎤 Voix — Hook</div>
          <TextBlock dim>{data.hook_voix}</TextBlock>
        </div>
      </div>
      {data.developpement?.map((s, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "55px 1fr 1fr", gap: 8, marginBottom: 7 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: C.faint, borderRadius: 4, fontSize: 9, color: C.gold, fontFamily: "'JetBrains Mono',monospace" }}>{s.sec}</div>
          <div style={{ background: C.faint, borderRadius: 4, padding: "9px 11px" }}><TextBlock>{s.ecran}</TextBlock></div>
          <div style={{ background: C.faint, borderRadius: 4, padding: "9px 11px" }}><TextBlock dim>{s.voix}</TextBlock></div>
        </div>
      ))}
      <Divider />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: "#120d06", border: `1px solid ${C.gold}33`, borderRadius: 6, padding: "12px 14px" }}>
          <div style={{ fontSize: 8, color: "#e8a020", fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".12em", marginBottom: 6, textTransform: "uppercase" }}>⚡ Climax</div>
          <TextBlock>{data.climax_ecran}</TextBlock>
        </div>
        <div style={{ background: "#080d10", border: "1px solid #204060", borderRadius: 6, padding: "12px 14px" }}>
          <div style={{ fontSize: 8, color: "#4080c0", fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".12em", marginBottom: 6, textTransform: "uppercase" }}>→ CTA</div>
          <TextBlock>{data.cta_ecran}</TextBlock>
        </div>
      </div>
    </div>
  );
}

function ImageModule({ data }) {
  const [active, setActive] = useState(0);
  if (!data?.length) return null;
  const sc = data[active];
  return (
    <div className="module-card" style={{ padding: "22px 24px" }}>
      <SectionTag>🖼 Image Prompts — Midjourney · Leonardo</SectionTag>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {data.map((s, i) => <button key={i} className={`pill ${active === i ? "on" : ""}`} onClick={() => setActive(i)}>Scène {s.scene}</button>)}
      </div>
      <div style={{ fontSize: 11, color: C.gold, fontFamily: "'Playfair Display',serif", fontStyle: "italic", marginBottom: 12 }}>{sc.label}</div>
      {[{ label: "Midjourney", val: sc.prompt_mj, id: `mj-${active}` }, { label: "Leonardo / SD", val: sc.prompt_leo, id: `leo-${active}` }].map(({ label, val, id }) => (
        <div key={id} style={{ background: "#080813", border: `1px solid ${C.border2}`, borderRadius: 6, padding: "12px 14px", marginBottom: 9 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
            <span style={{ fontSize: 8, color: "#6060c0", fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".14em", textTransform: "uppercase" }}>{label}</span>
            <CopyBtn text={val} id={id} label="copier" />
          </div>
          <TextBlock mono dim>{val}</TextBlock>
        </div>
      ))}
      {sc.notes && <div style={{ fontSize: 11, color: C.muted, fontFamily: "'JetBrains Mono',monospace", fontStyle: "italic", lineHeight: 1.6 }}>💡 {sc.notes}</div>}
    </div>
  );
}

function VideoModule({ data }) {
  if (!data) return null;
  return (
    <div className="module-card" style={{ padding: "22px 24px" }}>
      <SectionTag>🎬 Video Structure</SectionTag>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
        {data.structure?.map((sc, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "24px 40px 95px 1fr 75px", gap: 8, alignItems: "center", background: C.faint, borderRadius: 5, padding: "9px 11px" }}>
            <span style={{ fontSize: 11, color: C.gold, fontFamily: "'JetBrains Mono',monospace" }}>#{sc.scene}</span>
            <span style={{ fontSize: 9, color: C.muted, fontFamily: "'JetBrains Mono',monospace" }}>{sc.duree}</span>
            <span style={{ fontSize: 9, color: "#6060c0", fontFamily: "'JetBrains Mono',monospace" }}>{sc.transition}</span>
            <span style={{ fontSize: 12, color: C.text, fontFamily: "'Playfair Display',serif" }}>{sc.texte_ecran}</span>
            <span style={{ fontSize: 9, color: C.muted, fontFamily: "'JetBrains Mono',monospace", textAlign: "right" }}>{sc.mouvement}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[["🎵 Musique", data.musique], ["⚡ Rythme", data.rythme]].map(([l, v]) => (
          <div key={l} style={{ background: C.faint, borderRadius: 5, padding: "10px 12px" }}>
            <div style={{ fontSize: 8, color: C.gold, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".12em", marginBottom: 5, textTransform: "uppercase" }}>{l}</div>
            <TextBlock dim>{v}</TextBlock>
          </div>
        ))}
      </div>
    </div>
  );
}

function VoiceModule({ data }) {
  if (!data) return null;
  return (
    <div className="module-card" style={{ padding: "22px 24px" }}>
      <SectionTag>🎤 Voice + Subtitles</SectionTag>
      <div style={{ background: "#0b0b18", border: `1px solid ${C.border2}`, borderRadius: 7, padding: "14px 16px", marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
          <span style={{ fontSize: 8, color: C.gold, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".16em", textTransform: "uppercase" }}>🎙 Voix Off Complète</span>
          <CopyBtn text={data.voix_off_complete} id="voix" label="copier tout" />
        </div>
        <TextBlock>{data.voix_off_complete}</TextBlock>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        {[["Ton", data.ton], ["Vitesse", data.vitesse]].map(([l, v]) => (
          <div key={l} style={{ background: C.faint, borderRadius: 5, padding: "9px 11px" }}>
            <div style={{ fontSize: 8, color: C.muted, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".12em", marginBottom: 4, textTransform: "uppercase" }}>{l}</div>
            <TextBlock mono dim>{v}</TextBlock>
          </div>
        ))}
      </div>
      <SectionTag>Sous-titres Synchronisés</SectionTag>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {data.sous_titres?.map((s, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 8, alignItems: "center", background: C.faint, borderRadius: 4, padding: "8px 10px" }}>
            <span style={{ fontSize: 9, color: C.gold, fontFamily: "'JetBrains Mono',monospace" }}>{s.time}</span>
            <span style={{ fontSize: 12, color: C.text, fontFamily: "'Playfair Display',serif" }}>{s.texte}</span>
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
  const cur = tabs.find(t => t.id === tab);
  return (
    <div className="module-card" style={{ padding: "22px 24px" }}>
      <SectionTag>📱 Viral Description</SectionTag>
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, marginBottom: 14 }}>
        {tabs.map(t => <button key={t.id} className={`tab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>{t.label}</button>)}
      </div>
      {cur.short && (
        <div style={{ background: "#080d10", border: "1px solid #204060", borderRadius: 6, padding: "12px 14px", marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
            <span style={{ fontSize: 8, color: "#4080c0", fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".12em", textTransform: "uppercase" }}>Version courte ≤150 car.</span>
            <CopyBtn text={cur.short} id={`${tab}-s`} label="copier" />
          </div>
          <TextBlock>{cur.short}</TextBlock>
        </div>
      )}
      <div style={{ background: C.faint, borderRadius: 6, padding: "14px 16px", marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 8, color: C.gold, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".12em", textTransform: "uppercase" }}>Version longue</span>
          <CopyBtn text={cur.long} id={`${tab}-l`} label="copier" />
        </div>
        <TextBlock>{cur.long}</TextBlock>
      </div>
      {data.mots_cles?.length > 0 && (
        <>
          <SectionTag>Mots-clés SEO</SectionTag>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {data.mots_cles.map((kw, i) => (
              <span key={i} style={{ background: C.faint, border: `1px solid ${C.border2}`, borderRadius: 3, padding: "4px 9px", fontSize: 10, color: C.muted, fontFamily: "'JetBrains Mono',monospace" }}>{kw}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── LOADING ──
function LoadingView({ step }) {
  const steps = ["Concept…","Script…","Prompts images…","Structure vidéo…","Voix off…","Descriptions…","Finalisation…"];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "70vh", gap: 24 }}>
      <div style={{ position: "relative", width: 60, height: 60 }}>
        <div style={{ width: 60, height: 60, border: `2px solid ${C.border}`, borderTop: `2px solid ${C.gold}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🎬</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: C.gold, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, marginBottom: 6, animation: "shimmer 1.5s ease infinite" }}>{steps[Math.min(step, steps.length - 1)]}</p>
        <div style={{ width: 220 }}><ProgressBar pct={Math.round((step / 7) * 100)} /></div>
      </div>
    </div>
  );
}

// ── MAIN APP ──
export default function SeriesStudioV5() {
  const [seriesType, setSeriesType] = useState("emotion");
  const [type, setType] = useState("Transformation");
  const [personnage, setPersonnage] = useState("Femme");
  const [lieu, setLieu] = useState("Marché africain");
  const [style, setStyle] = useState("Cinématique");
  const [duree, setDuree] = useState("30 sec");
  const [episodeNum, setEpisodeNum] = useState(1);
  const [activeModules, setActiveModules] = useState(["concept","script","images","video","voice","description"]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("studio");
  const [projects, setProjects] = useLocalStorage("ss_v5", []);
  const mainRef = useRef(null);

  const generate = async () => {
    setLoading(true); setError(null); setResult(null); setLoadStep(0);
    const iv = setInterval(() => setLoadStep(s => Math.min(s + 1, 6)), 1200);
    try {
      const data = await generateEpisode({ theme: seriesType, type, perso: personnage, lieu, style, duree, episodeNum });
      clearInterval(iv);
      setResult(data);
      setTimeout(() => mainRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 80);
    } catch (e) {
      clearInterval(iv);
      setError(e.message || "Erreur de génération. Réessaie.");
    }
    setLoading(false); setLoadStep(0);
  };

  const saveProject = () => {
    if (!result) return;
    setProjects(prev => [{ config: { seriesType, type, personnage, lieu, style, duree, episodeNum }, result, date: new Date().toLocaleDateString("fr-FR") }, ...prev].slice(0, 50));
  };

  const loadProject = (p) => {
    const c = p.config;
    setSeriesType(c.seriesType); setType(c.type);
    setPersonnage(c.personnage); setLieu(c.lieu);
    setStyle(c.style); setDuree(c.duree);
    setEpisodeNum(c.episodeNum || 1);
    setResult(p.result); setTab("studio");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.bg, color: C.text, overflow: "hidden" }}>

      {/* HEADER */}
      <header style={{ background: C.surf, borderBottom: `1px solid ${C.border}`, padding: "0 24px", display: "flex", alignItems: "center", height: 52, flexShrink: 0, gap: 16 }}>
        <span style={{ fontSize: 20 }}>🎬</span>
        <span style={{ fontSize: 17, fontWeight: 900, color: C.goldL, fontFamily: "'Playfair Display',serif", letterSpacing: ".06em" }}>Series Studio</span>
        <span style={{ fontSize: 9, color: C.muted, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".18em" }}>V5 · SERIES ENGINE</span>
        <div style={{ marginLeft: "auto", display: "flex" }}>
          {[["studio","✦ Studio"], ["projects",`📁 Projets (${projects.length})`]].map(([t, lbl]) => (
            <button key={t} className={`tab ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>{lbl}</button>
          ))}
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* SIDEBAR */}
        {tab === "studio" && (
          <aside style={{ width: 272, background: C.surf, borderRight: `1px solid ${C.border}`, padding: "20px 14px", display: "flex", flexDirection: "column", overflowY: "auto", flexShrink: 0 }}>
            <div style={{ fontSize: 7, color: C.muted, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".28em", textTransform: "uppercase", marginBottom: 18 }}>Configuration</div>
            <PickGroup label="🎭 Type de série" opts={SERIES_TYPES} val={seriesType} set={setSeriesType} />
            <PickGroup label="👤 Personnage" opts={PERSONNAGES} val={personnage} set={setPersonnage} />
            <PickGroup label="📍 Lieu" opts={LIEUX} val={lieu} set={setLieu} />
            <PickGroup label="🎨 Style visuel" opts={STYLES} val={style} set={setStyle} />
            <PickGroup label="⏱ Durée cible" opts={DUREES} val={duree} set={setDuree} />
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 8, color: C.muted, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".2em", marginBottom: 7, textTransform: "uppercase" }}>N° d'épisode</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={() => setEpisodeNum(Math.max(1, episodeNum - 1))} className="pill">−</button>
                <span style={{ fontSize: 14, color: C.gold, fontFamily: "'JetBrains Mono',monospace", minWidth: 20, textAlign: "center" }}>{episodeNum}</span>
                <button onClick={() => setEpisodeNum(episodeNum + 1)} className="pill">+</button>
              </div>
            </div>
            <Divider />
            <PickGroup label="Modules actifs" opts={MODULES.map(m => ({ id: m.id, label: `${m.icon} ${m.label}` }))} val={activeModules} set={setActiveModules} multi />
            <div style={{ marginTop: "auto", paddingTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <button className="gen-full" onClick={generate} disabled={loading || !activeModules.length}>
                {loading ? "⏳ Génération…" : "⚡ GENERATE FULL EPISODE"}
              </button>
              {result && (
                <button onClick={saveProject} style={{ padding: 9, background: "#b8952814", border: `1px solid ${C.gold}44`, borderRadius: 5, color: C.gold, cursor: "pointer", fontSize: 10, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".08em", transition: "all .2s" }}>
                  💾 Sauvegarder ce projet
                </button>
              )}
            </div>
          </aside>
        )}

        {/* MAIN */}
        <main ref={mainRef} style={{ flex: 1, overflowY: "auto", padding: "24px 28px", background: C.bg }}>

          {/* PROJECTS */}
          {tab === "projects" && (
            <div>
              <SectionTag>📁 Projets sauvegardés</SectionTag>
              {!projects.length
                ? <p style={{ color: C.muted, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, textAlign: "center", marginTop: 80 }}>Aucun projet sauvegardé</p>
                : projects.map((p, i) => (
                  <div key={i} className="saved-item" style={{ marginBottom: 8 }}>
                    <div style={{ flex: 1 }} onClick={() => loadProject(p)}>
                      <div style={{ fontSize: 13, color: C.text, fontFamily: "'Playfair Display',serif", fontStyle: "italic", marginBottom: 4 }}>{p.result?.concept?.titre_episode || "Épisode"}</div>
                      <div style={{ fontSize: 9, color: C.muted, fontFamily: "'JetBrains Mono',monospace" }}>{p.config?.seriesType} · {p.config?.personnage} · {p.date}</div>
                    </div>
                    <button onClick={() => setProjects(prev => prev.filter((_, j) => j !== i))} style={{ background: "transparent", border: "none", color: C.border2, cursor: "pointer", fontSize: 16, transition: "color .15s" }}
                      onMouseEnter={e => e.currentTarget.style.color = C.red}
                      onMouseLeave={e => e.currentTarget.style.color = C.border2}>✕</button>
                  </div>
                ))
              }
            </div>
          )}

          {/* STUDIO */}
          {tab === "studio" && (
            <>
              {!result && !loading && !error && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "72vh", gap: 16, opacity: .3 }}>
                  <div style={{ fontSize: 64 }}>🎬</div>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, color: C.text }}>Series Engine prêt</p>
                  <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: C.muted }}>Configure · Sélectionne les modules · Generate</p>
                </div>
              )}

              {loading && <LoadingView step={loadStep} />}

              {error && !loading && (
                <div style={{ background: "#160808", border: `1px solid ${C.red}44`, borderRadius: 8, padding: "18px 22px", color: "#e08080", fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>⚠ {error}</div>
              )}

              {result && !loading && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ background: "linear-gradient(135deg,#0e0e20,#16162a)", border: `1px solid ${C.gold}33`, borderRadius: 10, padding: "24px 28px", animation: "fadeUp .25s ease" }}>
                    <div style={{ fontSize: 8, color: C.gold, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".22em", marginBottom: 10, textTransform: "uppercase" }}>
                      🎬 Épisode {episodeNum} · {SERIES_TYPES.find(t => t.id === seriesType)?.label}
                    </div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f5e8b0", fontFamily: "'Playfair Display',serif", lineHeight: 1.35, marginBottom: 8 }}>
                      {result.concept?.titre_episode}
                    </h1>
                    <div style={{ fontSize: 11, color: C.muted, fontFamily: "'JetBrains Mono',monospace", borderTop: `1px solid ${C.border}`, paddingTop: 9 }}>
                      {result.concept?.titre_serie} · {personnage} · {lieu}
                    </div>
                  </div>

                  {activeModules.includes("concept") && <ConceptModule data={result.concept} />}
                  {activeModules.includes("script") && <ScriptModule data={result.script} />}
                  {activeModules.includes("images") && <ImageModule data={result.images} />}
                  {activeModules.includes("video") && <VideoModule data={result.video} />}
                  {activeModules.includes("voice") && <VoiceModule data={result.voice} />}
                  {activeModules.includes("description") && <DescriptionModule data={result.description} />}

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
