import { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import { Menu, Bell, Search, CloudRain } from "lucide-react";

export default function MainLayout({ children, unreadCount, paused, onTogglePause, onReset, onSearch }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} unreadCount={unreadCount} />
      <div className="main-shell">
        <Header onMenu={() => setMenuOpen(true)} unreadCount={unreadCount} paused={paused} onTogglePause={onTogglePause} onReset={onReset} onSearch={onSearch} />
        <main className="page-content">{children}</main>
        <footer className="app-footer"><span>Floodora · Smarter Drains, Safer Cities.</span><span><CloudRain size={13} /> DEMO DATA — NOT CONNECTED TO LIVE SENSORS</span></footer>
      </div>
    </div>
  );
}
