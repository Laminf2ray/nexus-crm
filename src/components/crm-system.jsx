import { useState, useEffect, useRef } from "react";

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const INITIAL_LEADS = [
  { id: 1, name: "Sarah Chen", company: "Nexus Corp", email: "sarah@nexus.com", phone: "+1 555-0101", value: 48000, stage: "Qualified", source: "LinkedIn", assigned: "Alex M.", lastContact: "2026-02-18", tags: ["Enterprise", "Hot"], avatar: "SC" },
  { id: 2, name: "Marcus Webb", company: "Orbit SaaS", email: "m.webb@orbit.io", phone: "+1 555-0142", value: 22500, stage: "Proposal", source: "Referral", assigned: "Jamie L.", lastContact: "2026-02-19", tags: ["Mid-Market"], avatar: "MW" },
  { id: 3, name: "Priya Nair", company: "Stellar AI", email: "priya@stellar.ai", phone: "+1 555-0198", value: 97000, stage: "Negotiation", source: "Website", assigned: "Alex M.", lastContact: "2026-02-17", tags: ["Enterprise", "AI"], avatar: "PN" },
  { id: 4, name: "James Okafor", company: "BrightEdge", email: "j.okafor@brightedge.com", phone: "+1 555-0234", value: 15000, stage: "New", source: "Cold Email", assigned: "Sam K.", lastContact: "2026-02-20", tags: ["SMB"], avatar: "JO" },
  { id: 5, name: "Lena Müller", company: "DataStream GmbH", email: "lena@datastream.de", phone: "+49 555-0177", value: 63000, stage: "Qualified", source: "Conference", assigned: "Jamie L.", lastContact: "2026-02-15", tags: ["Enterprise", "EU"], avatar: "LM" },
  { id: 6, name: "Carlos Rivera", company: "PulseMedia", email: "carlos@pulsemedia.com", phone: "+1 555-0299", value: 8500, stage: "Closed Won", source: "Referral", assigned: "Sam K.", lastContact: "2026-02-10", tags: ["SMB"], avatar: "CR" },
  { id: 7, name: "Aisha Patel", company: "QuantumLeap", email: "a.patel@qleap.com", phone: "+1 555-0311", value: 155000, stage: "Negotiation", source: "LinkedIn", assigned: "Alex M.", lastContact: "2026-02-19", tags: ["Enterprise", "Hot", "Priority"], avatar: "AP" },
  { id: 8, name: "Tom Bergmann", company: "FlowStack", email: "t.berg@flowstack.dev", phone: "+1 555-0388", value: 31000, stage: "Proposal", source: "Website", assigned: "Sam K.", lastContact: "2026-02-16", tags: ["Tech", "Mid-Market"], avatar: "TB" },
];

const PIPELINE_STAGES = ["New", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

const STAGE_COLORS = {
  "New": "#64748b",
  "Qualified": "#3b82f6",
  "Proposal": "#8b5cf6",
  "Negotiation": "#f59e0b",
  "Closed Won": "#10b981",
  "Closed Lost": "#ef4444",
};

const EMAIL_TEMPLATES = [
  { id: 1, name: "Initial Outreach", subject: "Quick question about {company}", body: "Hi {name},\n\nI came across {company} and was impressed by what you're building. I'd love to explore how we might work together...\n\nBest,\n{sender}" },
  { id: 2, name: "Follow Up", subject: "Following up – {company}", body: "Hi {name},\n\nJust circling back on my previous message. I understand you're busy, but I believe we can add real value to {company}...\n\nBest,\n{sender}" },
  { id: 3, name: "Proposal", subject: "Proposal for {company} – Next Steps", body: "Hi {name},\n\nAs discussed, I've put together a tailored proposal for {company}. Please find the key highlights below...\n\nBest,\n{sender}" },
  { id: 4, name: "Closing", subject: "Ready to move forward, {name}?", body: "Hi {name},\n\nI wanted to check in as we approach the end of the quarter. I'd love to finalize our partnership with {company}...\n\nBest,\n{sender}" },
];

const ACTIVITIES = [
  { id: 1, type: "email", lead: "Sarah Chen", text: "Sent initial proposal", time: "2 hours ago", icon: "✉" },
  { id: 2, type: "call", lead: "Aisha Patel", text: "Discovery call completed", time: "3 hours ago", icon: "📞" },
  { id: 3, type: "stage", lead: "Marcus Webb", text: "Moved to Proposal stage", time: "5 hours ago", icon: "🔄" },
  { id: 4, type: "note", lead: "Priya Nair", text: "Added negotiation notes", time: "Yesterday", icon: "📝" },
  { id: 5, type: "won", lead: "Carlos Rivera", text: "Deal closed – $8,500", time: "2 days ago", icon: "🎉" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);
const tagColor = (tag) => {
  const map = { Hot: "#ef4444", Enterprise: "#6366f1", Priority: "#f59e0b", SMB: "#10b981", "Mid-Market": "#3b82f6", EU: "#8b5cf6", Tech: "#06b6d4", AI: "#ec4899" };
  return map[tag] || "#64748b";
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────
const Avatar = ({ initials, size = 36, color = "#6366f1" }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: size * 0.36, fontWeight: 700, flexShrink: 0, fontFamily: "'DM Mono', monospace" }}>
    {initials}
  </div>
);

const avatarColor = (str) => {
  const colors = ["#6366f1", "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#ef4444"];
  let h = 0; for (let c of str) h = (h << 5) - h + c.charCodeAt(0);
  return colors[Math.abs(h) % colors.length];
};

const Badge = ({ label }) => (
  <span style={{ background: tagColor(label) + "22", color: tagColor(label), border: `1px solid ${tagColor(label)}44`, borderRadius: 4, padding: "1px 7px", fontSize: 11, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>
    {label}
  </span>
);

const StageDot = ({ stage }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: STAGE_COLORS[stage] }}>
    <span style={{ width: 7, height: 7, borderRadius: "50%", background: STAGE_COLORS[stage], display: "inline-block" }} />
    {stage}
  </span>
);

// ─── METRIC CARD ─────────────────────────────────────────────────────────────
const MetricCard = ({ label, value, delta, icon, color }) => (
  <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 20 }}>{icon}</span>
    </div>
    <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", fontFamily: "'DM Mono', monospace" }}>{value}</div>
    <div style={{ fontSize: 12, color: delta >= 0 ? "#10b981" : "#ef4444", fontWeight: 600 }}>
      {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs last month
    </div>
  </div>
);

// ─── PIPELINE VIEW ────────────────────────────────────────────────────────────
const PipelineView = ({ leads, onStageChange }) => {
  const stages = PIPELINE_STAGES.slice(0, 5);
  return (
    <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
      {stages.map(stage => {
        const stageLeads = leads.filter(l => l.stage === stage);
        const total = stageLeads.reduce((s, l) => s + l.value, 0);
        return (
          <div key={stage} style={{ minWidth: 230, flex: "0 0 230px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ padding: "12px 14px", background: STAGE_COLORS[stage] + "18", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: STAGE_COLORS[stage] }}>{stage}</span>
              <span style={{ fontSize: 12, color: "#64748b", fontFamily: "'DM Mono', monospace" }}>{fmt(total)}</span>
            </div>
            <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8, minHeight: 80 }}>
              {stageLeads.map(lead => (
                <div key={lead.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 9, padding: "10px 12px", cursor: "pointer", transition: "box-shadow .15s", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(99,102,241,0.12)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"}
                >
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                    <Avatar initials={lead.avatar} size={28} color={avatarColor(lead.name)} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{lead.name}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{lead.company}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#6366f1", fontFamily: "'DM Mono', monospace" }}>{fmt(lead.value)}</div>
                  <div style={{ marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {lead.tags.map(t => <Badge key={t} label={t} />)}
                  </div>
                  <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
                    {PIPELINE_STAGES.indexOf(stage) > 0 && (
                      <button onClick={() => onStageChange(lead.id, PIPELINE_STAGES[PIPELINE_STAGES.indexOf(stage) - 1])}
                        style={{ flex: 1, fontSize: 11, padding: "3px 0", border: "1px solid #e2e8f0", background: "#f8fafc", borderRadius: 5, cursor: "pointer", color: "#64748b" }}>← Back</button>
                    )}
                    {PIPELINE_STAGES.indexOf(stage) < PIPELINE_STAGES.length - 1 && (
                      <button onClick={() => onStageChange(lead.id, PIPELINE_STAGES[PIPELINE_STAGES.indexOf(stage) + 1])}
                        style={{ flex: 1, fontSize: 11, padding: "3px 0", border: "1px solid #6366f1", background: "#6366f1", borderRadius: 5, cursor: "pointer", color: "#fff" }}>Advance →</button>
                    )}
                  </div>
                </div>
              ))}
              {stageLeads.length === 0 && <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 12, padding: "16px 0" }}>No leads</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── EMAIL COMPOSER ──────────────────────────────────────────────────────────
const EmailComposer = ({ leads, onClose, onSent }) => {
  const [to, setTo] = useState("");
  const [template, setTemplate] = useState(EMAIL_TEMPLATES[0]);
  const [subject, setSubject] = useState(EMAIL_TEMPLATES[0].subject);
  const [body, setBody] = useState(EMAIL_TEMPLATES[0].body);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const selectedLead = leads.find(l => l.email === to);

  const fillTemplate = (tpl, lead) => {
    const fill = (s) => s
      .replace(/{name}/g, lead?.name.split(" ")[0] || "{name}")
      .replace(/{company}/g, lead?.company || "{company}")
      .replace(/{sender}/g, "Alex Martinez");
    return { subject: fill(tpl.subject), body: fill(tpl.body) };
  };

  const handleTemplate = (tpl) => {
    setTemplate(tpl);
    const filled = fillTemplate(tpl, selectedLead);
    setSubject(filled.subject);
    setBody(filled.body);
  };

  const handleTo = (email) => {
    setTo(email);
    const lead = leads.find(l => l.email === email);
    const filled = fillTemplate(template, lead);
    setSubject(filled.subject);
    setBody(filled.body);
  };

  const handleSend = () => {
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); setTimeout(() => { onSent && onSent(); onClose(); }, 1500); }, 1500);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 18, width: "min(700px, 95vw)", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
          <div style={{ color: "#fff" }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>✉ Email Composer</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Powered by SendGrid</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13 }}>✕ Close</button>
        </div>
        <div style={{ padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {sent ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 48 }}>🎉</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#10b981", marginTop: 12 }}>Email Sent Successfully!</div>
            </div>
          ) : (
            <>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>TEMPLATE</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {EMAIL_TEMPLATES.map(t => (
                    <button key={t.id} onClick={() => handleTemplate(t)}
                      style={{ fontSize: 12, padding: "6px 12px", borderRadius: 7, border: `1px solid ${template.id === t.id ? "#6366f1" : "#e2e8f0"}`, background: template.id === t.id ? "#6366f1" : "#fff", color: template.id === t.id ? "#fff" : "#475569", cursor: "pointer", fontWeight: 600 }}>
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>TO</label>
                <select value={to} onChange={e => handleTo(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, background: "#f8fafc", color: "#0f172a", outline: "none" }}>
                  <option value="">Select lead...</option>
                  {leads.map(l => <option key={l.id} value={l.email}>{l.name} – {l.company} ({l.email})</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>SUBJECT</label>
                <input value={subject} onChange={e => setSubject(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, background: "#f8fafc", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>BODY</label>
                <textarea value={body} onChange={e => setBody(e.target.value)} rows={8}
                  style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, background: "#f8fafc", color: "#0f172a", outline: "none", resize: "vertical", fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box" }} />
              </div>
              <button onClick={handleSend} disabled={!to || sending}
                style={{ padding: "12px 24px", background: sending ? "#94a3b8" : "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: to && !sending ? "pointer" : "not-allowed", transition: "opacity .2s" }}>
                {sending ? "⏳ Sending via SendGrid..." : "✈ Send Email"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── LEAD MODAL ───────────────────────────────────────────────────────────────
const LeadModal = ({ lead, onClose, onUpdate, onEmail }) => {
  const [notes, setNotes] = useState("Strong enterprise potential. Decision maker confirmed. Q1 budget available.");
  const [editStage, setEditStage] = useState(lead.stage);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 18, width: "min(640px, 95vw)", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ padding: "24px", background: "linear-gradient(135deg,#0f172a,#1e293b)", borderRadius: "18px 18px 0 0", display: "flex", gap: 16, alignItems: "center" }}>
          <Avatar initials={lead.avatar} size={52} color={avatarColor(lead.name)} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{lead.name}</div>
            <div style={{ color: "#94a3b8", fontSize: 14 }}>{lead.company}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>{lead.tags.map(t => <Badge key={t} label={t} />)}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#6366f1", fontFamily: "'DM Mono', monospace" }}>{fmt(lead.value)}</div>
            <StageDot stage={lead.stage} />
          </div>
        </div>
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[["📧 Email", lead.email], ["📞 Phone", lead.phone], ["👤 Assigned", lead.assigned], ["📡 Source", lead.source], ["🗓 Last Contact", lead.lastContact]].map(([k, v]) => (
              <div key={k} style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{k}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginTop: 3 }}>{v}</div>
              </div>
            ))}
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 8 }}>MOVE STAGE</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {PIPELINE_STAGES.map(s => (
                <button key={s} onClick={() => { setEditStage(s); onUpdate(lead.id, { stage: s }); }}
                  style={{ fontSize: 12, padding: "6px 12px", borderRadius: 7, border: `1px solid ${editStage === s ? STAGE_COLORS[s] : "#e2e8f0"}`, background: editStage === s ? STAGE_COLORS[s] + "22" : "#fff", color: editStage === s ? STAGE_COLORS[s] : "#64748b", cursor: "pointer", fontWeight: 600 }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 8 }}>NOTES</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
              style={{ width: "100%", padding: 12, border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6, background: "#f8fafc", outline: "none", boxSizing: "border-box", color: "#0f172a" }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => onEmail(lead)} style={{ flex: 1, padding: "11px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>✉ Send Email</button>
            <button onClick={onClose} style={{ flex: 1, padding: "11px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── ADD LEAD MODAL ───────────────────────────────────────────────────────────
const AddLeadModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", value: "", stage: "New", source: "Website", assigned: "Alex M." });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, background: "#f8fafc", color: "#0f172a", outline: "none", boxSizing: "border-box" };

  const handleAdd = () => {
    if (!form.name || !form.company || !form.email) return;
    onAdd({ ...form, id: Date.now(), value: parseFloat(form.value) || 0, tags: [], avatar: form.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(), lastContact: new Date().toISOString().split("T")[0] });
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 18, width: "min(520px, 95vw)", boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>➕ Add New Lead</div>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13, color: "#475569" }}>✕</button>
        </div>
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          {[["Full Name*", "name", "text"], ["Company*", "company", "text"], ["Email*", "email", "email"], ["Phone", "phone", "tel"], ["Deal Value ($)", "value", "number"]].map(([lbl, key, type]) => (
            <div key={key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5 }}>{lbl}</label>
              <input type={type} value={form[key]} onChange={set(key)} style={inputStyle} />
            </div>
          ))}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5 }}>STAGE</label>
              <select value={form.stage} onChange={set("stage")} style={inputStyle}>
                {PIPELINE_STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5 }}>ASSIGNED TO</label>
              <select value={form.assigned} onChange={set("assigned")} style={inputStyle}>
                {["Alex M.", "Jamie L.", "Sam K."].map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button onClick={handleAdd} style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Add Lead</button>
            <button onClick={onClose} style={{ flex: 1, padding: "12px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function CRMApp() {
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [view, setView] = useState("dashboard"); // dashboard | leads | pipeline | email
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState("All");
  const [selectedLead, setSelectedLead] = useState(null);
  const [showEmail, setShowEmail] = useState(false);
  const [emailTo, setEmailTo] = useState(null);
  const [showAddLead, setShowAddLead] = useState(false);
  const [sentCount, setSentCount] = useState(12);
  const [notification, setNotification] = useState(null);

  const notify = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  const updateLead = (id, patch) => {
    setLeads(ls => ls.map(l => l.id === id ? { ...l, ...patch } : l));
    notify("Lead updated ✓");
  };

  const addLead = (lead) => { setLeads(ls => [lead, ...ls]); notify("Lead added ✓"); };

  const filteredLeads = leads.filter(l => {
    const q = search.toLowerCase();
    const matchesSearch = !q || l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.email.toLowerCase().includes(q);
    const matchesStage = filterStage === "All" || l.stage === filterStage;
    return matchesSearch && matchesStage;
  });

  const totalPipelineValue = leads.filter(l => !["Closed Won", "Closed Lost"].includes(l.stage)).reduce((s, l) => s + l.value, 0);
  const closedWon = leads.filter(l => l.stage === "Closed Won").reduce((s, l) => s + l.value, 0);
  const wonCount = leads.filter(l => l.stage === "Closed Won").length;

  // Sidebar nav items
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "⬛" },
    { id: "leads", label: "Leads", icon: "👥" },
    { id: "pipeline", label: "Pipeline", icon: "📊" },
    { id: "email", label: "Email Campaigns", icon: "✉" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f1f5f9", overflow: "hidden" }}>
      {/* SIDEBAR */}
      <div style={{ width: 220, background: "linear-gradient(180deg,#0f172a 0%,#1e293b 100%)", display: "flex", flexDirection: "column", flexShrink: 0, borderRight: "1px solid #334155" }}>
        <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid #334155" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: 0.5 }}>⚡ NexusCRM</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Sales Intelligence Platform</div>
        </div>
        <nav style={{ padding: "12px 0", flex: 1 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setView(item.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 20px", background: view === item.id ? "rgba(99,102,241,0.2)" : "transparent", border: "none", cursor: "pointer", fontSize: 13, fontWeight: view === item.id ? 700 : 500, color: view === item.id ? "#a5b4fc" : "#94a3b8", borderLeft: view === item.id ? "3px solid #6366f1" : "3px solid transparent", transition: "all .15s", textAlign: "left" }}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: "1px solid #334155" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar initials="AM" size={32} color="#6366f1" />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>Alex Martinez</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>Sales Manager</div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* TOP BAR */}
        <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "14px 24px", display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search leads, companies, emails..."
              style={{ width: "100%", maxWidth: 420, padding: "9px 14px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 13, background: "#f8fafc", outline: "none", color: "#0f172a" }} />
          </div>
          <button onClick={() => setShowEmail(true)}
            style={{ padding: "9px 16px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}>✉ Compose</button>
          <button onClick={() => setShowAddLead(true)}
            style={{ padding: "9px 18px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Add Lead</button>
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>

          {/* DASHBOARD */}
          {view === "dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Good morning, Alex 👋</h1>
                <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>Here's what's happening with your pipeline today.</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
                <MetricCard label="Pipeline Value" value={fmt(totalPipelineValue)} delta={14} icon="💰" color="#6366f1" />
                <MetricCard label="Closed Won" value={fmt(closedWon)} delta={8} icon="🏆" color="#10b981" />
                <MetricCard label="Total Leads" value={leads.length} delta={23} icon="👥" color="#3b82f6" />
                <MetricCard label="Emails Sent" value={sentCount} delta={31} icon="✉" color="#8b5cf6" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
                {/* Pipeline Bar */}
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>Pipeline by Stage</div>
                  {PIPELINE_STAGES.slice(0, 5).map(stage => {
                    const count = leads.filter(l => l.stage === stage).length;
                    const val = leads.filter(l => l.stage === stage).reduce((s, l) => s + l.value, 0);
                    const pct = totalPipelineValue > 0 ? (val / (totalPipelineValue + closedWon)) * 100 : 0;
                    return (
                      <div key={stage} style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                          <StageDot stage={stage} />
                          <span style={{ fontSize: 12, color: "#64748b", fontFamily: "'DM Mono', monospace" }}>{fmt(val)} · {count} leads</span>
                        </div>
                        <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: STAGE_COLORS[stage], borderRadius: 3, transition: "width .5s" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Activity Feed */}
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>Recent Activity</div>
                  {ACTIVITIES.map(a => (
                    <div key={a.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #f1f5f9" }}>
                      <div style={{ fontSize: 18, lineHeight: 1 }}>{a.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{a.lead}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>{a.text}</div>
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0 }}>{a.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* LEADS TABLE */}
          {view === "leads" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>All Leads <span style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}>({filteredLeads.length})</span></h2>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["All", ...PIPELINE_STAGES].map(s => (
                    <button key={s} onClick={() => setFilterStage(s)}
                      style={{ fontSize: 12, padding: "5px 12px", borderRadius: 7, border: `1px solid ${filterStage === s ? "#6366f1" : "#e2e8f0"}`, background: filterStage === s ? "#6366f1" : "#fff", color: filterStage === s ? "#fff" : "#64748b", cursor: "pointer", fontWeight: 600 }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["Lead", "Company", "Value", "Stage", "Source", "Assigned", "Last Contact", "Actions"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", borderBottom: "1px solid #e2e8f0", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead, i) => (
                      <tr key={lead.id} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafbff" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f5f3ff"}
                        onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafbff"}>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Avatar initials={lead.avatar} size={32} color={avatarColor(lead.name)} />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{lead.name}</div>
                              <div style={{ fontSize: 11, color: "#64748b" }}>{lead.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#475569" }}>{lead.company}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#6366f1", fontFamily: "'DM Mono', monospace" }}>{fmt(lead.value)}</td>
                        <td style={{ padding: "12px 16px" }}><StageDot stage={lead.stage} /></td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748b" }}>{lead.source}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748b" }}>{lead.assigned}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748b", fontFamily: "'DM Mono', monospace" }}>{lead.lastContact}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => setSelectedLead(lead)}
                              style={{ fontSize: 11, padding: "5px 10px", background: "#f1f5f9", border: "none", borderRadius: 6, cursor: "pointer", color: "#475569", fontWeight: 600 }}>View</button>
                            <button onClick={() => { setEmailTo(lead); setShowEmail(true); }}
                              style={{ fontSize: 11, padding: "5px 10px", background: "#6366f1", border: "none", borderRadius: 6, cursor: "pointer", color: "#fff", fontWeight: 600 }}>✉</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredLeads.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>No leads found</div>}
              </div>
            </div>
          )}

          {/* PIPELINE */}
          {view === "pipeline" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Pipeline Kanban</h2>
              <PipelineView leads={filteredLeads} onStageChange={(id, stage) => updateLead(id, { stage })} />
            </div>
          )}

          {/* EMAIL CAMPAIGNS */}
          {view === "email" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Email Campaigns</h2>
                <button onClick={() => setShowEmail(true)}
                  style={{ padding: "10px 20px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>✉ Compose Email</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
                {[{ name: "Q1 Outreach", sent: 47, opened: 31, clicked: 18, status: "Active" }, { name: "Enterprise Nurture", sent: 23, opened: 19, clicked: 14, status: "Active" }, { name: "Re-engagement", sent: 34, opened: 12, clicked: 5, status: "Paused" }].map(c => (
                  <div key={c.name} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{c.name}</div>
                      <Badge label={c.status} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      {[["Sent", c.sent], ["Opened", c.opened], ["Clicked", c.clicked]].map(([k, v]) => (
                        <div key={k} style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", fontFamily: "'DM Mono', monospace" }}>{v}</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>{k}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 5 }}>Open Rate: {Math.round(c.opened / c.sent * 100)}%</div>
                      <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3 }}>
                        <div style={{ height: "100%", width: `${Math.round(c.opened / c.sent * 100)}%`, background: "linear-gradient(90deg,#6366f1,#8b5cf6)", borderRadius: 3 }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>Email Templates</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {EMAIL_TEMPLATES.map(t => (
                    <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{t.name}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>{t.subject}</div>
                      </div>
                      <button onClick={() => setShowEmail(true)} style={{ fontSize: 12, padding: "6px 14px", background: "#6366f1", border: "none", borderRadius: 7, cursor: "pointer", color: "#fff", fontWeight: 600 }}>Use Template</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {selectedLead && (
        <LeadModal lead={selectedLead} onClose={() => setSelectedLead(null)}
          onUpdate={(id, patch) => { updateLead(id, patch); setSelectedLead(l => ({ ...l, ...patch })); }}
          onEmail={(lead) => { setEmailTo(lead); setSelectedLead(null); setShowEmail(true); }} />
      )}
      {showEmail && (
        <EmailComposer leads={leads} onClose={() => { setShowEmail(false); setEmailTo(null); }}
          onSent={() => setSentCount(n => n + 1)} />
      )}
      {showAddLead && <AddLeadModal onClose={() => setShowAddLead(false)} onAdd={addLead} />}

      {/* NOTIFICATION */}
      {notification && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#10b981", color: "#fff", padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, boxShadow: "0 8px 24px rgba(16,185,129,0.3)", zIndex: 2000, animation: "fadeIn .2s ease" }}>
          {notification}
        </div>
      )}

      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500;700&display=swap'); @keyframes fadeIn { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } } * { box-sizing: border-box; } body { margin: 0; }`}</style>
    </div>
  );
}
