import { NavLink } from 'react-router-dom';
import { Activity, LayoutDashboard, Map, Waves, BellRing, Wrench, ChartNoAxesCombined, Settings, ShieldCheck, Droplets, X } from 'lucide-react';

const links = [
  { label: 'Overview', to: '/', icon: LayoutDashboard },
  { label: 'Drain Map', to: '/map', icon: Map },
  { label: 'Monitoring', to: '/monitoring', icon: Waves },
  { label: 'Alerts', to: '/alerts', icon: BellRing },
  { label: 'Maintenance', to: '/maintenance', icon: Wrench },
  { label: 'Analytics', to: '/analytics', icon: ChartNoAxesCombined },
  { label: 'Settings', to: '/settings', icon: Settings },
];

export default function Sidebar({ open, onClose, unreadCount }) {
  return (
    <>
      {open && <button aria-label="Close navigation overlay" className="drawer-overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Droplets size={23} /><ShieldCheck size={15} className="brand-shield" /></div>
          <div><div className="brand-name">Floodora</div><div className="brand-tagline">Smarter Drains, Safer Cities.</div></div>
          <button className="icon-button mobile-close" onClick={onClose} aria-label="Close menu"><X size={19} /></button>
        </div>
        <div className="brand-descriptor">SMART DRAIN & FLOOD MONITORING</div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="nav-list">
          {links.map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={onClose} end={to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} strokeWidth={1.9} /><span>{label}</span>
              {label === 'Alerts' && unreadCount > 0 && <span className="nav-count">{unreadCount}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="online-status"><span className="status-dot" /><span>System Online</span><span className="demo-pill">DEMO</span></div>
          <div className="operator"><div className="operator-avatar">MO</div><div><strong>Municipal Operator</strong><small>Demo workspace</small></div></div>
          <div className="version"><Activity size={13} /> Prototype v1.0</div>
        </div>
      </aside>
    </>
  );
}
