export default function RiskBadge({ risk = 'Low' }) {
  return <span className={`risk-badge risk-${String(risk).toLowerCase()}`}><span />{risk}</span>;
}
