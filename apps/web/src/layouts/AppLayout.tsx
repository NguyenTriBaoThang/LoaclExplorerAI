import { Compass, Leaf, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/explore', label: 'Khám phá' },
  { to: '/planner', label: 'Lập lịch trình' },
  { to: '/provider', label: 'Dành cho đối tác' },
  { to: '/about', label: 'Về dự án' },
]

export function AppLayout() {
  const [open, setOpen] = useState(false)
  return <div className="app-frame">
    <header className="site-header">
      <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
        <span className="brand-mark"><Compass size={20} strokeWidth={1.8} /></span>
        <span>local explorer<span className="brand-ai">AI</span></span>
      </NavLink>
      <nav className={`primary-nav ${open ? 'nav-open' : ''}`}>
        {links.map((link) => <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? 'nav-link nav-link-active' : 'nav-link'}>{link.label}</NavLink>)}
        <NavLink to="/planner" className="header-cta" onClick={() => setOpen(false)}>Tạo lịch trình <Leaf size={15} /></NavLink>
      </nav>
      <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? 'Đóng menu' : 'Mở menu'}>{open ? <X /> : <Menu />}</button>
    </header>
    <main><Outlet /></main>
    <footer className="site-footer">
      <NavLink to="/" className="footer-brand"><Compass size={17} /> Local Explorer AI</NavLink>
      <span>Khám phá có chủ đích, đi chơi có kế hoạch.</span>
      <span className="footer-demo">Bản demo · Dữ liệu mô phỏng</span>
    </footer>
  </div>
}
