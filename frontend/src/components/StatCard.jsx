export default function StatCard({ label, value, note, icon: Icon, tone = 'blue' }) {
  return <article className="stat-card"><div className={`stat-icon tone-${tone}`}><Icon size={21} /></div><div className="stat-copy"><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></div></article>;
}
