import { Compass, Sparkles, Menu, X, MapPin, Heart } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/explore', label: 'Khám phá trải nghiệm' },
  { to: '/planner', label: 'Lập lịch trình thông minh' },
  { to: '/provider', label: 'Dành cho đối tác' },
  { to: '/about', label: 'Về dự án & Công nghệ' },
]

export function AppLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="app-frame-3d">
      {/* Floating Glass Navigation Header */}
      <header className="site-header-3d">
        <div className="header-inner">
          <NavLink to="/" className="brand-3d" onClick={() => setOpen(false)}>
            <div className="brand-gem-3d">
              <Compass size={22} className="brand-compass" />
              <div className="gem-glow" />
            </div>
            <div className="brand-text">
              <span className="brand-title">
                Local Explorer <span className="brand-ai-chip">3D AI</span>
              </span>
              <span className="brand-tagline">TP. HỒ CHÍ MINH</span>
            </div>
          </NavLink>

          <nav className={`primary-nav-3d ${open ? 'nav-open' : ''}`}>
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  isActive ? 'nav-link-3d nav-link-active-3d' : 'nav-link-3d'
                }
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/planner"
              className="header-cta-3d"
              onClick={() => setOpen(false)}
            >
              <span>Lên Lịch Ngay</span>
              <Sparkles size={15} />
            </NavLink>
          </nav>

          <button
            className="menu-toggle-3d"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Đóng menu' : 'Mở menu'}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content-3d">
        <Outlet />
      </main>

      {/* Modern Footer */}
      <footer className="site-footer-3d">
        <div className="footer-wrap">
          <div className="footer-top">
            <div className="footer-brand-col">
              <NavLink to="/" className="footer-brand-title">
                <Compass size={20} className="text-emerald" />
                <span>Local Explorer AI</span>
              </NavLink>
              <p className="footer-desc">
                Hệ thống gợi ý lịch trình trải nghiệm thời gian thực cho TP. Hồ Chí Minh.
                Kết hợp dữ liệu khung giờ thực tế và thuật toán heuristic tối ưu hóa di chuyển.
              </p>
              <div className="footer-coords">
                <MapPin size={13} className="text-amber" />
                <span>Tọa độ trung tâm: 10.7769° N, 106.7009° E</span>
              </div>
            </div>

            <div className="footer-links-col">
              <span className="footer-col-title">Khám Phá Nhanh</span>
              <NavLink to="/explore">Kho trải nghiệm địa phương</NavLink>
              <NavLink to="/planner">Lập lịch trình tự động</NavLink>
              <NavLink to="/provider">Cổng thông tin đối tác</NavLink>
              <NavLink to="/about">Kiến trúc hệ thống POI & Slot</NavLink>
            </div>

            <div className="footer-links-col">
              <span className="footer-col-title">Cam Kết Minh Bạch</span>
              <div className="footer-policy-item">
                <span className="policy-dot" />
                <span>Dữ liệu mô phỏng minh bạch</span>
              </div>
              <div className="footer-policy-item">
                <span className="policy-dot" />
                <span>Không thu phí trung gian</span>
              </div>
              <div className="footer-policy-item">
                <span className="policy-dot" />
                <span>Chạy độc lập không phụ thuộc LLM</span>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 Local Explorer AI. Khám phá đúng trải nghiệm, đúng thời điểm.</span>
            <div className="footer-credits">
              <span>Được xây dựng với <Heart size={12} className="inline text-rose-500 fill-rose-500" /> dành cho Sài Gòn</span>
              <span className="footer-version-tag">Phiên bản 3D Experience v2.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
