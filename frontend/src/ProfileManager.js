import React, { useEffect, useState } from 'react';
import './ProfileManager.css';

export const API_URL = process.env.REACT_APP_API_URL || '';
const EMPTY = { profile: { name: '', email: '', phone: '', location: '', linkedin: '', website: '', github: '' }, experience: [], education: [], skills: [], projects: [] };
const SECTIONS = {
  experience: { label: 'Experience', fields: ['title', 'organization', 'dates', 'location', 'bullets'] },
  education: { label: 'Education', fields: ['institution', 'degree', 'date', 'gpa', 'coursework'] },
  skills: { label: 'Skills', fields: ['category', 'items'] },
  projects: { label: 'Projects & achievements', fields: ['title', 'url', 'context', 'bullets'] },
};
const LABELS = { name: 'Full name', linkedin: 'LinkedIn', github: 'GitHub', website: 'Portfolio / website', gpa: 'GPA', url: 'Link', items: 'Skills (comma-separated)', bullets: 'Achievements / evidence (one per line)' };

export async function api(path, options = {}) {
  const response = await fetch(`${API_URL}/api/${path}`, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed. Please try again.');
  return data;
}
const jsonRequest = (body) => ({ method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

function Field({ field, value, onChange, prefix = '', required = false }) {
  const id = `${prefix}-${field}`;
  const label = LABELS[field] || field[0].toUpperCase() + field.slice(1);
  return <label className={field === 'bullets' ? 'profile-field wide' : 'profile-field'} htmlFor={id}>
    <span>{label}{required ? ' *' : ''}</span>
    {field === 'bullets'
      ? <textarea id={id} rows="4" value={(value || []).join('\n')} onChange={e => onChange(e.target.value.split('\n'))} />
      : <input id={id} required={required} value={value || ''} onChange={e => onChange(e.target.value)} />}
  </label>;
}

export default function ProfileManager({ children }) {
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [models, setModels] = useState([]);
  const [page, setPage] = useState('loading');
  const [draft, setDraft] = useState(EMPTY);
  const [preferences, setPreferences] = useState({ defaultModel: '', instructions: '' });
  const [key, setKey] = useState('');
  const [file, setFile] = useState(null);
  const [extracted, setExtracted] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function load() {
    setError('');
    try {
      const [p, s, m] = await Promise.all([api('profile'), api('settings'), api('models')]);
      setProfile(p.profile); setDraft(p.profile || EMPTY); setSettings(s); setModels(m.models);
      setPreferences({ ...s.preferences, defaultModel: s.preferences.defaultModel || m.defaultModel });
      setPage(!s.hasApiKey ? 'settings' : !p.profile ? 'profile' : 'workspace');
    } catch (e) { setError(e.message); }
  }
  useEffect(() => { load(); }, []);

  async function run(action) {
    setBusy(true); setError(''); setNotice('');
    try { await action(); } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  function editProfile() { setDraft(profile || EMPTY); setExtracted(null); setPage('profile'); setError(''); setNotice(''); }
  function openSettings() { setPreferences({ ...settings.preferences, defaultModel: settings.preferences.defaultModel || models[0]?.slug || '' }); setPage('settings'); setError(''); setNotice(''); }
  function cancel() { setKey(''); setExtracted(null); setError(''); setNotice(''); setPage(profile && settings.hasApiKey ? 'workspace' : 'profile'); }

  if (page === 'loading') return <main className="profile-shell"><h1>Opening your workspace…</h1>{error && <><p role="alert">{error}</p><button onClick={load}>Retry</button></>}</main>;
  // Keep the workspace mounted while editing so an application's inputs and outputs survive.
  const workspace = profile && settings.hasApiKey ? <div hidden={page !== 'workspace'}>{children({ profile, onEditProfile: editProfile, onSettings: openSettings, preferences: settings.preferences })}</div> : null;
  return <>{workspace}{page !== 'workspace' && <main className="profile-shell">
    <header className="profile-heading"><div><p className="profile-eyebrow">COVER LETTER GENERATOR / YOUR LOCAL WORKSPACE</p>
      <h1>{page === 'settings' ? (profile ? 'Settings' : 'Make it yours.') : (profile ? 'My Profile' : 'Your experience. Ready for every role.')}</h1>
      <p>{page === 'settings' ? 'Connect your own OpenRouter account. Your key stays on this computer.' : 'Save your background once. Choose what matters for each application later.'}</p></div>
      {profile && settings.hasApiKey && <button onClick={cancel} disabled={busy}>Back to application</button>}
    </header>
    {error && <p className="profile-error" role="alert">{error}</p>}
    {notice && <p className="profile-notice" role="status">{notice}</p>}
    {page === 'settings' ? <form onSubmit={e => { e.preventDefault(); run(async () => {
      const s = await api('settings', jsonRequest({ preferences, ...(key.trim() ? { apiKey: key.trim() } : {}) }));
      setSettings(s); setKey(''); setNotice('Settings saved.');
      if (!profile) { setPage('profile'); setNotice('Connection settings saved. Upload a resume or enter your information below.'); }
    }); }}>
      <section className="profile-card"><h2>01 / AI connection</h2>
        <label className="profile-field">OpenRouter API key<input type="password" autoComplete="off" value={key} required={!settings.hasApiKey} placeholder={settings.hasApiKey ? 'Key saved — enter a new key to replace it' : 'Paste your OpenRouter key'} onChange={e => setKey(e.target.value)} /></label>
        <p className="profile-help">Resume text and relevant profile information are sent to OpenRouter and your selected model when you extract or generate. Requests use your account credits. The key is stored in a separate local file, not in profile exports.</p>
        <label className="profile-field">Default model<select value={preferences.defaultModel} onChange={e => setPreferences({ ...preferences, defaultModel: e.target.value })}>{models.map(m => <option key={m.slug} value={m.slug}>{m.label}</option>)}</select></label>
      </section>
      <section className="profile-card"><h2>02 / Writing preferences</h2><label className="profile-field">Default instructions<textarea rows="4" placeholder="For example: Use concise language and Canadian spelling." value={preferences.instructions} onChange={e => setPreferences({ ...preferences, instructions: e.target.value })} /></label><p className="profile-help">Applied to every application. Add role-specific instructions in the application workspace.</p></section>
      <footer className="profile-footer"><button className="primary" disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</button>{profile && <button type="button" onClick={cancel}>Cancel</button>}{!profile && <button type="button" onClick={() => setPage('profile')}>Enter profile manually first</button>}</footer>
    </form> : <>
      <section className="profile-card"><h2>01 / Start with your resume</h2><p>Upload a text-based PDF (up to 10 MB). AI extraction creates a draft; nothing is saved until you review it.</p>
        <div className="profile-upload"><input aria-label="Resume PDF" type="file" accept="application/pdf,.pdf" disabled={busy} onChange={e => setFile(e.target.files[0])} />
          <button disabled={busy || !file || !settings.hasApiKey} onClick={() => run(async () => {
            const form = new FormData(); form.append('resume', file); form.append('model', preferences.defaultModel);
            const result = await api('profile/extract', { method: 'POST', body: form }); setExtracted(result.profile);
          })}>{busy ? 'Working…' : 'Extract with AI'}</button>
          {!settings.hasApiKey && <button onClick={openSettings}>Connect OpenRouter</button>}
        </div><p className="profile-help">Prefer to type? Fill in the sections below. Scanned PDFs currently require manual entry.</p>
      </section>
      {extracted && <section className="profile-card import-review"><h2>Review imported information</h2><p>Apply only the sections you want to replace in your draft. Leave a section untouched to preserve your existing information. You can edit everything before saving.</p>
        {['profile', ...Object.keys(SECTIONS)].map(section => <details key={section}><summary>{section === 'profile' ? 'Contact details' : SECTIONS[section].label}</summary><div className="import-preview">{(Array.isArray(extracted[section]) ? extracted[section] : [extracted[section]]).map((entry, i) => <dl key={i}>{Object.entries(entry).filter(([field, value]) => field !== 'id' && value && (!Array.isArray(value) || value.length)).map(([field, value]) => <React.Fragment key={field}><dt>{LABELS[field] || field}</dt><dd>{Array.isArray(value) ? value.join(' • ') : value}</dd></React.Fragment>)}</dl>)}</div><button onClick={() => { setDraft(prev => ({ ...prev, [section]: extracted[section] })); setNotice('Imported section applied to the draft. Review below, then save.'); }}>Use imported {section === 'profile' ? 'contact details' : SECTIONS[section].label.toLowerCase()}</button></details>)}
        {!profile && <button onClick={() => { setDraft(extracted); setExtracted(null); setNotice('Imported fields are ready to edit below. Save when you have reviewed them.'); }}>Use all imported sections</button>} <button onClick={() => setExtracted(null)}>Close import review</button>
      </section>}
      <form onSubmit={e => { e.preventDefault(); run(async () => {
        const saved = await api('profile', jsonRequest(draft)); setProfile(saved.profile); setDraft(saved.profile); setExtracted(null);
        setPage(settings.hasApiKey ? 'workspace' : 'settings');
      }); }}>
        <fieldset disabled={busy} className="profile-fields">
        <section className="profile-card"><h2>02 / Contact details</h2><div className="profile-grid">{Object.keys(EMPTY.profile).map(field => <Field key={field} field={field} prefix="contact" required={field === 'name'} value={draft.profile[field]} onChange={value => setDraft({ ...draft, profile: { ...draft.profile, [field]: value } })} />)}</div></section>
        {Object.entries(SECTIONS).map(([section, spec], index) => <section className="profile-card" key={section}><h2>0{index + 3} / {spec.label}</h2><p className="profile-help">Optional. Add facts and evidence you want the app to use.</p>
          {draft[section].map((entry, i) => <div className="profile-entry" key={i}><div className="profile-grid">{spec.fields.map(field => <Field key={field} prefix={`${section}-${i}`} field={field} value={entry[field]} onChange={value => setDraft({ ...draft, [section]: draft[section].map((item, j) => j === i ? { ...item, [field]: value } : item) })} />)}</div><button type="button" onClick={() => setDraft({ ...draft, [section]: draft[section].filter((_, j) => i !== j) })}>Remove entry</button></div>)}
          <button type="button" onClick={() => setDraft({ ...draft, [section]: [...draft[section], Object.fromEntries(spec.fields.map(f => [f, f === 'bullets' ? [] : '']))] })}>+ Add {section === 'skills' ? 'skill group' : 'entry'}</button>
        </section>)}
        </fieldset>
        <footer className="profile-footer"><button className="primary" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>{profile && <button type="button" disabled={busy} onClick={cancel}>Cancel</button>}
          {profile && <a download="candidate-profile.json" href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(profile, null, 2))}`}>Export saved profile</a>}
          <label className="profile-import">Import profile backup<input type="file" accept=".json,application/json" disabled={busy} onChange={e => { const backup = e.target.files[0]; if (backup) run(async () => { const parsed = JSON.parse(await backup.text()); const validated = await api('profile/validate', { ...jsonRequest(parsed), method: 'POST' }); setExtracted(validated.profile); }); }} /></label>
        </footer>
      </form>
    </>}
  </main>}</>;
}
