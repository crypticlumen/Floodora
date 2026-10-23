import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AlertTriangle, BellRing, ClipboardCheck, Droplets, MapPinned, Plus, Search, SlidersHorizontal, ArrowUpRight, Check, CheckCheck, ExternalLink, Clock3, Activity, RotateCcw } from 'lucide-react';
import MainLayout from './components/layout/MainLayout.jsx';
import StatCard from './components/StatCard.jsx';
import RiskBadge from './components/RiskBadge.jsx';
import DrainMap from './components/DrainMap.jsx';
import DrainDetails from './components/DrainDetails.jsx';
import { RiskChart, WaterTrend, MaintenanceChart } from './components/Charts.jsx';
import TaskModal from './components/TaskModal.jsx';
import useLocalStorage from './hooks/useLocalStorage.js';
import { makeInitialDrains, makeInitialAlerts, makeInitialTasks, initialWorkers, initialRainfallData } from './data/demoData.js';
import { calculateRisk } from './utils/riskScore.js';
import { formatDateTime } from './utils/formatters.js';
import './index.css';

function createInitialState() {
  const drains = makeInitialDrains();
  return { drains, alerts: makeInitialAlerts(drains), tasks: makeInitialTasks(drains) };
}

export default function App() {
  const [initial] = useState(createInitialState);
  const [drains, setDrains] = useLocalStorage('floodora-drains-v1', initial.drains);
  const [alerts, setAlerts] = useLocalStorage('floodora-alerts-v1', initial.alerts);
  const [tasks, setTasks] = useLocalStorage('floodora-tasks-v1', initial.tasks);
  const [paused, setPaused] = useState(false);
  const [selectedDrainId, setSelectedDrainId] = useState('D-014');
  const [taskModal, setTaskModal] = useState(null);
  const [toast, setToast] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const navigate = useNavigate();

  const selectedDrain = drains.find((d) => d.id === selectedDrainId) || drains[0];
  const unreadCount = alerts.filter((a) => a.status === 'Active').length;

  useEffect(() => {
    if (paused) return undefined;
    const timer = window.setInterval(() => {
      setDrains((current) => current.map((drain) => {
        const change = (Math.random() - 0.48) * 5;
        const waterLevel = Math.max(8, Math.min(98, Math.round(drain.waterLevel + change)));
        const rainfall = Math.max(0, Math.min(45, Math.round(drain.rainfall + (Math.random() - 0.55) * 5)));
        const flowRate = Math.max(3, Math.min(48, Math.round(drain.flowRate + (Math.random() - 0.5) * 4)));
        const updated = { ...drain, waterLevel, rainfall, flowRate, riseRate: change > 2 ? change : Math.max(0, drain.riseRate * 0.45), lastUpdated: new Date().toISOString() };
        return { ...updated, ...calculateRisk(updated) };
      }));
    }, 7000);
    return () => window.clearInterval(timer);
  }, [paused, setDrains]);

  useEffect(() => {
    const timer = window.setTimeout(() => setToast(''), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function createTask(task) {
    setTasks((current) => [task, ...current]);
    setToast(`Maintenance task created for ${task.drainId}.`);
    setTaskModal(null);
    navigate('/maintenance');
  }

  function updateTask(taskId, changes) {
    setTasks((current) => current.map((t) => t.id === taskId ? { ...t, ...changes } : t));
    setToast('Maintenance task updated.');
  }

  function updateAlert(alertId, status) {
    setAlerts((current) => current.map((a) => a.id === alertId ? { ...a, status } : a));
    setToast(status === 'Resolved' ? 'Alert marked as resolved.' : 'Alert acknowledged.');
  }

  function resetDemo() {
    if (!window.confirm('Reset all Floodora demo data to the original sample dataset? This will overwrite locally saved demo changes.')) return;
    const fresh = createInitialState();
    setDrains(fresh.drains);
    setAlerts(fresh.alerts);
    setTasks(fresh.tasks);
    setSelectedDrainId('D-014');
    setPaused(false);
    setToast('Demo data reset successfully.');
  }

  const pageProps = { drains, alerts, tasks, selectedDrain, selectedDrainId, setSelectedDrainId, onCreateTask: (drain) => setTaskModal(drain || null), onAlertStatus: updateAlert, onTaskUpdate: updateTask, globalSearch, setGlobalSearch };
  return <>
    <MainLayout unreadCount={unreadCount} paused={paused} onTogglePause={() => setPaused((p) => !p)} onReset={resetDemo} onSearch={(query) => { setGlobalSearch(query); navigate('/monitoring'); }}>
      <Routes>
        <Route path="/" element={<Overview {...pageProps} paused={paused} />} />
        <Route path="/map" element={<MapPage {...pageProps} />} />
        <Route path="/monitoring" element={<Monitoring {...pageProps} />} />
        <Route path="/alerts" element={<AlertsPage {...pageProps} />} />
        <Route path="/maintenance" element={<MaintenancePage {...pageProps} workers={initialWorkers} />} />
        <Route path="/analytics" element={<AnalyticsPage {...pageProps} />} />
        <Route path="/settings" element={<SettingsPage paused={paused} onTogglePause={() => setPaused((p) => !p)} />} />
        <Route path="*" element={<Overview {...pageProps} paused={paused} />} />
      </Routes>
    </MainLayout>
    {taskModal !== null && <TaskModal drains={drains} workers={initialWorkers} initialDrain={taskModal || undefined} onClose={() => setTaskModal(null)} onSave={createTask} />}
    {toast && <div className="toast"><Check size={17} />{toast}</div>}
  </>;
}

function PageHeading({ eyebrow, title, description, action }) {
  return <div className="section-heading"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>;
}
function Panel({ title, subtitle, action, children, className = '' }) {
  return <section className={`panel ${className}`}><div className="panel-heading"><div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>{action}</div>{children}</section>;
}
function Overview(p) {
  const high = p.drains.filter((d) => d.risk === 'High').length;
  const pending = p.tasks.filter((t) => t.status !== 'Completed').length;
  const selected = p.selectedDrain;
  return <div className="page-stack">
    <PageHeading eyebrow="MUNICIPAL COMMAND CENTER" title="City Overview" description="Monitor drainage infrastructure, identify emerging risks, and prioritize flood-prevention actions." action={<span className="live-chip"><span className="pulse-dot" />{p.paused ? 'Simulation paused' : 'Simulation active'}</span>} />
    <div className="demo-banner"><div className="demo-banner-icon"><Activity size={18} /></div><div><strong>DEMO DATA — NOT CONNECTED TO LIVE SENSORS</strong><p>Sensor readings are simulated for demonstration. Map locations are illustrative, not verified municipal assets.</p></div><span className="demo-banner-time">Updated {formatDateTime(selected?.lastUpdated)}</span></div>
    <div className="stats-grid">
      <StatCard label="Total drains monitored" value={p.drains.length} note="Illustrative drain records" icon={Droplets} tone="blue" />
      <StatCard label="High-risk drains" value={high} note="Prioritize inspection" icon={AlertTriangle} tone="red" />
      <StatCard label="Active alerts" value={p.alerts.filter((a) => a.status === 'Active').length} note="Require review" icon={BellRing} tone="amber" />
      <StatCard label="Pending inspections" value={pending} note="Maintenance not completed" icon={ClipboardCheck} tone="teal" />
    </div>
    {p.drains.some((d) => d.waterLevel >= 95) && <div className="emergency-banner"><AlertTriangle size={19} /><div><strong>Critical water-level condition in demo data</strong><p>Review high-water drains and prioritize an inspection. This is not a real-world emergency notification.</p></div></div>}
    <div className="dashboard-grid">
      <Panel title="Drain risk map" subtitle="Select a marker to inspect its current simulated readings." action={<button className="text-button" onClick={() => window.location.assign('/map')}>Full map <ArrowUpRight size={15} /></button>} className="map-panel"><DrainMap drains={p.drains} selectedId={p.selectedDrainId} onSelect={(d) => p.setSelectedDrainId(d.id)} compact /><div className="map-legend"><span><i className="legend-dot high" />High risk</span><span><i className="legend-dot medium" />Medium risk</span><span><i className="legend-dot low" />Low risk</span></div></Panel>
      <Panel title="Selected drain" subtitle="Risk explanation and next action"><DrainDetails drain={selected} onCreateTask={p.onCreateTask} /></Panel>
      <Panel title="Risk distribution" subtitle="Current risk classification across the demo dataset"><RiskChart drains={p.drains} /><div className="risk-counts">{['High', 'Medium', 'Low'].map((risk) => <div key={risk}><span><i className={`legend-dot ${risk.toLowerCase()}`} />{risk}</span><strong>{p.drains.filter((d) => d.risk === risk).length}</strong></div>)}</div></Panel>
      <Panel title="Recent alerts" subtitle="Latest system warnings" action={<button className="text-button" onClick={() => window.location.assign('/alerts')}>View all <ArrowUpRight size={15} /></button>}>
        <div className="compact-list">{p.alerts.slice(0, 4).map((a) => <div className="compact-row" key={a.id}><div className={`alert-icon alert-${a.severity.toLowerCase()}`}><AlertTriangle size={16} /></div><div className="compact-main"><strong>{a.title}</strong><span>{a.drainId} · {a.location}</span><small>{a.reason}</small></div><RiskBadge risk={a.severity === 'Critical' ? 'High' : a.severity} /></div>)}</div>
      </Panel>
    </div>
  </div>;
}
function MapPage(p) {
  const [risk, setRisk] = useState('All');
  const [query, setQuery] = useState('');
  const filtered = p.drains.filter((d) => (risk === 'All' || d.risk === risk) && `${d.id} ${d.location} ${d.area}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="page-stack"><PageHeading eyebrow="SPATIAL MONITORING" title="Interactive Drain Map" description="Explore illustrative drain locations and select a marker to review risk details." /><div className="filter-row"><div className="search-field"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search drain ID, road, or area..." /></div><div className="filter-select"><SlidersHorizontal size={16} /><select value={risk} onChange={(e) => setRisk(e.target.value)}><option>All</option><option>High</option><option>Medium</option><option>Low</option></select></div><span className="result-count">{filtered.length} drains</span></div><div className="map-page-grid"><Panel title="Drain locations" subtitle="OpenStreetMap · Illustrative New Delhi coordinates" className="map-panel"><DrainMap drains={filtered} selectedId={p.selectedDrainId} onSelect={(d) => p.setSelectedDrainId(d.id)} /><div className="map-legend"><span><i className="legend-dot high" />High risk</span><span><i className="legend-dot medium" />Medium risk</span><span><i className="legend-dot low" />Low risk</span></div></Panel><Panel title="Drain details" subtitle="Selected marker"><DrainDetails drain={p.selectedDrain} onCreateTask={p.onCreateTask} /></Panel></div></div>;
}
function Monitoring(p) {
  const [risk, setRisk] = useState('All');
  const [blockage, setBlockage] = useState('All');
  const [sort, setSort] = useState('riskScore');
  const [direction, setDirection] = useState('desc');
  const [localSearch, setLocalSearch] = useState(p.globalSearch || '');
  const filtered = useMemo(() => p.drains.filter((d) => (risk === 'All' || d.risk === risk) && (blockage === 'All' || d.blockageStatus === blockage) && `${d.id} ${d.location} ${d.area}`.toLowerCase().includes(localSearch.toLowerCase())).sort((a, b) => (Number(a[sort]) - Number(b[sort])) * (direction === 'asc' ? 1 : -1)), [p.drains, risk, blockage, sort, direction, localSearch]);
  return <div className="page-stack"><PageHeading eyebrow="SENSOR INVENTORY" title="Drain Monitoring" description="Search, sort, and inspect readings across 128 illustrative drain records." /><div className="filter-row"><div className="search-field"><Search size={16} /><input value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} placeholder="Search drain ID, location, or area..." /></div><select className="filter-control" value={risk} onChange={(e) => setRisk(e.target.value)}><option value="All">All risk levels</option><option>High</option><option>Medium</option><option>Low</option></select><select className="filter-control" value={blockage} onChange={(e) => setBlockage(e.target.value)}><option value="All">All blockage states</option><option>Suspected</option><option>Possible</option><option>Clear</option></select><select className="filter-control" value={sort} onChange={(e) => setSort(e.target.value)}><option value="riskScore">Sort by risk score</option><option value="waterLevel">Sort by water level</option><option value="flowRate">Sort by flow rate</option></select><button className="button button-secondary" onClick={() => setDirection((d) => d === 'asc' ? 'desc' : 'asc')}>{direction === 'asc' ? 'Ascending ↑' : 'Descending ↓'}</button></div><div className="monitoring-layout"><Panel title="Drain inventory" subtitle={`${filtered.length} matching drains`} className="table-panel"><div className="table-scroll"><table><thead><tr><th>Drain ID</th><th>Location</th><th>Water</th><th>Flow</th><th>Rainfall</th><th>Blockage</th><th>Risk score</th><th>Risk</th><th>Updated</th><th /></tr></thead><tbody>{filtered.map((d) => <tr key={d.id} className={p.selectedDrainId === d.id ? 'selected-row' : ''}><td><button className="table-link" onClick={() => p.setSelectedDrainId(d.id)}>{d.id}</button></td><td>{d.location}<small className="table-sub">{d.area}</small></td><td><div className="water-cell"><span>{d.waterLevel}%</span><i><b style={{ width: `${d.waterLevel}%` }} /></i></div></td><td>{d.flowRate} L/s</td><td>{d.rainfall} mm/h</td><td><span className={`blockage-tag ${d.blockageStatus.toLowerCase()}`}>{d.blockageStatus}</span></td><td><strong>{d.riskScore}</strong>/100</td><td><RiskBadge risk={d.risk} /></td><td>{formatDateTime(d.lastUpdated)}</td><td><button className="icon-button table-action" onClick={() => { p.setSelectedDrainId(d.id); }} aria-label={`Select ${d.id}`}><ArrowUpRight size={16} /></button></td></tr>)}</tbody></table></div></Panel><Panel title="Selected drain details" subtitle="Live simulated reading"><DrainDetails drain={p.selectedDrain} onCreateTask={p.onCreateTask} /></Panel></div></div>;
}
function AlertsPage(p) {
  const [query, setQuery] = useState('');
  const [severity, setSeverity] = useState('All');
  const [status, setStatus] = useState('All');
  const filtered = p.alerts.filter((a) => (severity === 'All' || a.severity === severity) && (status === 'All' || a.status === status) && `${a.id} ${a.drainId} ${a.location} ${a.title} ${a.reason}`.toLowerCase().includes(query.toLowerCase()));
  const ack = p.alerts.filter((a) => a.status === 'Acknowledged').length;
  const resolved = p.alerts.filter((a) => a.status === 'Resolved').length;
  return <div className="page-stack"><PageHeading eyebrow="EARLY WARNING CENTRE" title="Alert Centre" description="Review warning conditions, acknowledge alerts, and track resolution." /><div className="stats-grid three-stats"><StatCard label="Active alerts" value={p.alerts.filter((a) => a.status === 'Active').length} note="Awaiting acknowledgement" icon={BellRing} tone="red" /><StatCard label="Acknowledged" value={ack} note="Seen by an operator" icon={Check} tone="amber" /><StatCard label="Resolved" value={resolved} note="Marked as resolved" icon={CheckCheck} tone="teal" /></div><div className="filter-row"><div className="search-field"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search alerts, drain ID, or location..." /></div><select className="filter-control" value={severity} onChange={(e) => setSeverity(e.target.value)}><option>All</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select><select className="filter-control" value={status} onChange={(e) => setStatus(e.target.value)}><option>All</option><option>Active</option><option>Acknowledged</option><option>Resolved</option></select></div><Panel title="Alert records" subtitle={`${filtered.length} alerts match your filters`}>{filtered.length ? <div className="alert-list">{filtered.map((a) => <article className="alert-card" key={a.id}><div className={`alert-icon alert-${a.severity.toLowerCase()}`}><AlertTriangle size={18} /></div><div className="alert-card-content"><div className="alert-card-title"><h3>{a.title}</h3><RiskBadge risk={a.severity === 'Critical' ? 'High' : a.severity} /><span className={`status-pill status-${a.status.toLowerCase().replace(' ', '-')}`}>{a.status}</span></div><p>{a.reason}</p><div className="alert-meta"><span>{a.id}</span><span>{a.drainId} · {a.location}</span><span><Clock3 size={13} />{formatDateTime(a.createdAt)}</span></div><div className="alert-action-text"><strong>Recommended action:</strong> {a.action}</div><div className="alert-buttons"><button className="button button-secondary button-small" onClick={() => { p.setSelectedDrainId(a.drainId); window.location.assign('/monitoring'); }}>View drain <ExternalLink size={13} /></button>{a.status === 'Active' && <button className="button button-secondary button-small" onClick={() => p.onAlertStatus(a.id, 'Acknowledged')}>Acknowledge</button>}{a.status !== 'Resolved' && <button className="button button-primary button-small" onClick={() => p.onAlertStatus(a.id, 'Resolved')}>Resolve alert</button>}{a.status === 'Resolved' && <span className="resolved-note"><CheckCircle2Icon /> Resolved</span>}</div></div></article>)}</div> : <div className="empty-state"><BellRing size={28} /><strong>No alerts match these filters</strong><span>Try another severity, status, or search term.</span></div>}</Panel><p className="disclaimer">Alert conditions are generated from illustrative demo readings. Floodora is not connected to emergency services.</p></div>;
}
function CheckCircle2Icon() { return <CheckCheck size={14} />; }
function MaintenancePage(p) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const filtered = p.tasks.filter((t) => (status === 'All' || t.status === status) && (priority === 'All' || t.priority === priority) && `${t.id} ${t.drainId} ${t.location} ${t.title} ${t.assignedWorker}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="page-stack"><PageHeading eyebrow="FIELD OPERATIONS" title="Maintenance Management" description="Turn early warnings into assigned inspections and track work through completion." action={<button className="button button-primary" onClick={() => p.onCreateTask(null)}><Plus size={16} /> Create task</button>} /><div className="stats-grid three-stats"><StatCard label="Pending" value={p.tasks.filter((t) => t.status === 'Pending').length} note="Awaiting field action" icon={ClipboardCheck} tone="amber" /><StatCard label="In progress" value={p.tasks.filter((t) => t.status === 'In Progress').length} note="Work underway" icon={Activity} tone="blue" /><StatCard label="Completed" value={p.tasks.filter((t) => t.status === 'Completed').length} note="Resolved maintenance" icon={CheckCheck} tone="teal" /></div><div className="filter-row"><div className="search-field"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search task, drain, location, or worker..." /></div><select className="filter-control" value={priority} onChange={(e) => setPriority(e.target.value)}><option>All</option><option>High</option><option>Medium</option><option>Low</option></select><select className="filter-control" value={status} onChange={(e) => setStatus(e.target.value)}><option>All</option><option>Pending</option><option>In Progress</option><option>Completed</option></select></div><Panel title="Maintenance task board" subtitle={`${filtered.length} matching tasks`}>{filtered.length ? <div className="task-list">{filtered.map((t) => <article className="task-card" key={t.id}><div className="task-priority-mark" data-priority={t.priority} /><div className="task-content"><div className="task-topline"><span className="task-id">{t.id}</span><span className={`priority-pill priority-${t.priority.toLowerCase()}`}>{t.priority} priority</span><span className={`status-pill status-${t.status.toLowerCase().replace(' ', '-')}`}>{t.status}</span></div><h3>{t.title}</h3><p>{t.description}</p><div className="task-meta"><span><MapPinned size={14} />{t.drainId} · {t.location}</span><span><Activity size={14} />{t.assignedWorker}</span><span><Clock3 size={14} />Due {t.dueDate}</span></div>{t.status === 'Completed' && <div className="resolution-note"><strong>Resolution note:</strong> {t.resolutionNote || 'No note recorded.'}</div>}</div><div className="task-controls">{t.status === 'Pending' && <button className="button button-secondary button-small" onClick={() => p.onTaskUpdate(t.id, { status: 'In Progress' })}>Start work</button>}{t.status === 'In Progress' && <button className="button button-primary button-small" onClick={() => { const note = window.prompt('Enter a resolution note before completing this task:'); if (note === null) return; if (!note.trim()) { window.alert('Please enter a resolution note.'); return; } p.onTaskUpdate(t.id, { status: 'Completed', resolutionNote: note.trim(), completedAt: new Date().toISOString() }); }}>Complete</button>}{t.status === 'Completed' && <button className="button button-secondary button-small" onClick={() => { const note = window.prompt('Edit resolution note:', t.resolutionNote || ''); if (note !== null) p.onTaskUpdate(t.id, { resolutionNote: note.trim() }); }}>Edit note</button>}</div></article>)}</div> : <div className="empty-state"><ClipboardCheck size={28} /><strong>No maintenance tasks found</strong><span>Adjust the filters or create a new task.</span><button className="button button-primary" onClick={() => p.onCreateTask(null)}>Create task</button></div>}</Panel></div>;
}
function AnalyticsPage(p) {
  const riskRows = ['High', 'Medium', 'Low'].map((risk) => ({ risk, count: p.drains.filter((d) => d.risk === risk).length }));
  const areaRows = [...new Set(p.drains.map((d) => d.area))].map((area) => ({ area, count: p.alerts.filter((a) => a.area === area).length }));
  const blocked = [...p.drains].sort((a, b) => b.riskScore - a.riskScore).slice(0, 6);
  return <div className="page-stack"><PageHeading eyebrow="DATA & REPORTS" title="Analytics & Reports" description="Explore simulated water-level trends, risk distribution, alert patterns, and field-work progress." /><div className="demo-banner"><div className="demo-banner-icon"><Activity size={18} /></div><div><strong>SIMULATED ANALYTICS</strong><p>Charts are based on demonstration data and do not represent validated flood forecasts.</p></div></div><div className="analytics-grid"><Panel title="Risk distribution" subtitle="Drain count by risk level"><RiskChart drains={p.drains} /></Panel><Panel title="Water-level trend" subtitle="Illustrative hourly readings"><WaterTrend data={initialRainfallData} /></Panel><Panel title="Maintenance by status" subtitle="Task count across the workflow"><MaintenanceChart tasks={p.tasks} /></Panel><Panel title="Alerts by area" subtitle="Current demo alert records"><div className="horizontal-bars">{areaRows.map((row) => <div className="bar-row" key={row.area}><span>{row.area}</span><div><i style={{ width: `${Math.max(4, row.count / Math.max(1, ...areaRows.map((r) => r.count)) * 100)}%` }} /></div><strong>{row.count}</strong></div>)}</div></Panel></div><Panel title="Highest-risk drains" subtitle="Use this list to prioritize inspection planning"><div className="compact-list">{blocked.map((d) => <div className="compact-row" key={d.id}><div className="alert-icon alert-high"><Droplets size={16} /></div><div className="compact-main"><strong>{d.id} · {d.location}</strong><span>{d.waterLevel}% water · {d.flowRate} L/s flow</span></div><strong className="score-value">{d.riskScore}/100</strong><RiskBadge risk={d.risk} /></div>)}</div></Panel></div>;
}
function SettingsPage({ paused, onTogglePause }) {
  const [prefs, setPrefs] = useLocalStorage('floodora-preferences-v1', { operator: 'Municipal Operator', city: 'New Delhi', highThreshold: 70, waterThreshold: 80, notifications: true, maintenance: true });
  const [saved, setSaved] = useState(false);
  function change(e) { setPrefs((old) => ({ ...old, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })); setSaved(false); }
  return <div className="page-stack"><PageHeading eyebrow="CONFIGURATION" title="Settings" description="Manage local demo preferences and simulation controls." /><form className="settings-grid" onSubmit={(e) => { e.preventDefault(); setSaved(true); }}><Panel title="Operator profile" subtitle="Local demonstration profile"><label className="form-label">Operator name<input name="operator" value={prefs.operator} onChange={change} /></label><label className="form-label">Monitoring city<input name="city" value={prefs.city} onChange={change} /></label></Panel><Panel title="Risk thresholds" subtitle="Preferences shown for the demo"><label className="form-label">High-risk score threshold<input type="number" min="40" max="100" name="highThreshold" value={prefs.highThreshold} onChange={change} /></label><label className="form-label">Water-level warning (%)<input type="number" min="50" max="100" name="waterThreshold" value={prefs.waterThreshold} onChange={change} /></label><p className="form-hint">These preferences do not alter the illustrative risk scoring rules in this prototype.</p></Panel><Panel title="Notifications" subtitle="Notification preferences only"><label className="check-setting"><input type="checkbox" name="notifications" checked={prefs.notifications} onChange={change} /> Enable alert notification preference</label><label className="check-setting"><input type="checkbox" name="maintenance" checked={prefs.maintenance} onChange={change} /> Enable maintenance reminder preference</label></Panel><Panel title="Simulation controls" subtitle="No physical sensors are connected"><div className="simulation-setting"><div><strong>Simulated sensor readings</strong><p>Updates every 7 seconds while running.</p></div><button type="button" className="button button-secondary" onClick={onTogglePause}>{paused ? 'Resume simulation' : 'Pause simulation'}</button></div><p className="form-hint">Reset demo data from the top navigation to restore the original drains, alerts, and tasks.</p></Panel><div className="settings-save"><button className="button button-primary" type="submit">Save preferences</button>{saved && <span className="saved-message"><Check size={15} /> Preferences saved in this browser.</span>}</div></form></div>;
}
