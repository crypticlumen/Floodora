import { useState } from 'react';
import { Menu, Search, Bell, Pause, Play, RotateCcw, CloudRain } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const titles = { '/': 'City Overview', '/map': 'Drain Map', '/monitoring': 'Drain Monitoring', '/alerts': 'Alert Centre', '/maintenance': 'Maintenance', '/analytics': 'Analytics & Reports', '/settings': 'Settings' };

export default function Header({ onMenu, unreadCount, paused, onTogglePause, onReset, onSearch }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const title = titles[location.pathname] || 'City Overview';

  function submitSearch(event) {
    event.preventDefault();
    onSearch(query);
    navigate('/monitoring');
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-button menu-button" onClick={onMenu} aria-label="Open navigation"><Menu size={21} /></button>
        <div><div className="breadcrumb">Floodora <span>/</span> <strong>{title}</strong></div><h1 className="page-title">{title}</h1></div>
      </div>
      <div className="topbar-actions">
        <form className="global-search" onSubmit={submitSearch}>
          <Search size={16} />
          <input aria-label="Search drains" placeholder="Search drains..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <kbd>↵</kbd>
        </form>
        <span className="demo-indicator"><span /> DEMO DATA</span>
        <button className={`icon-button simulation-button ${paused ? 'is-paused' : ''}`} onClick={onTogglePause} title={paused ? 'Resume sensor simulation' : 'Pause sensor simulation'} aria-label={paused ? 'Resume sensor simulation' : 'Pause sensor simulation'}>{paused ? <Play size={17} /> : <Pause size={17} />}</button>
        <button className="icon-button" onClick={onReset} title="Reset demo data" aria-label="Reset demo data"><RotateCcw size={17} /></button>
        <button className="icon-button notification-button" onClick={() => navigate('/alerts')} aria-label={`${unreadCount} active alerts`}><Bell size={19} />{unreadCount > 0 && <span>{unreadCount}</span>}</button>
      </div>
    </header>
  );
}
