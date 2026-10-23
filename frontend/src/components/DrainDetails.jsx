import { Droplets, Gauge, CloudRain, ArrowUpRight, CheckCircle2, ClipboardList } from 'lucide-react';
import RiskBadge from './RiskBadge.jsx';

export default function DrainDetails({ drain, onCreateTask }) {
  if (!drain) return <div className="empty-state">Select a drain to inspect its readings.</div>;
  return <div className="detail-panel">
    <div className="detail-heading"><div><div className="eyebrow">SELECTED DRAIN</div><h3>{drain.id}</h3><p>{drain.location} · {drain.area}</p></div><RiskBadge risk={drain.risk} /></div>
    <div className="detail-score"><div><span>Risk score</span><strong>{drain.riskScore}<small>/100</small></strong></div><div className="score-track"><span style={{ width: `${drain.riskScore}%` }} /></div></div>
    <div className="reading-grid">
      <Reading icon={Droplets} label="Water level" value={`${drain.waterLevel}%`} />
      <Reading icon={Gauge} label="Flow rate" value={`${drain.flowRate} L/s`} />
      <Reading icon={CloudRain} label="Rainfall" value={`${drain.rainfall} mm/h`} />
      <Reading icon={ArrowUpRight} label="Blockage" value={drain.blockageStatus} />
    </div>
    <div className="explain-section"><h4><CheckCircle2 size={16} /> Why is this drain at risk?</h4><ul>{drain.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></div>
    <div className="action-recommendation"><div className="recommend-icon"><ClipboardList size={17} /></div><div><strong>Recommended action</strong><p>{drain.action}</p></div></div>
    <button className="button button-primary button-full" onClick={() => onCreateTask?.(drain)}>Create maintenance task</button>
  </div>;
}
function Reading({ icon: Icon, label, value }) {
  return <div className="reading-tile"><Icon size={17} /><span>{label}</span><strong>{value}</strong></div>;
}
