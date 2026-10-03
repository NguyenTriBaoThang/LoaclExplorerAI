import { useState, useRef, useEffect } from 'react'
import {
  Compass,
  Sparkles,
  Menu,
  X,
  MapPin,
  Heart,
  User,
  LogOut,
  GitCompare,
  Store,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
  Sun,
  Moon,
} from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { logout } from '../api/client'
import { setTheme, useTheme } from '../theme'

const links = [
  { to: '/chat', label: 'Chat với AI' },
  { to: '/explore', label: 'Khám phá trải nghiệm' },
  { to: '/planner', label: 'Lập lịch trình' },
  { to: '/provider', label: 'Dành cho đối tác' },
  { to: '/about', label: 'Về dự án & Công nghệ' },
]

export function AppLayout() {
  const [open, setOpen] = useState(false)
  const [userDropdown, setUserDropdown] = useState(false)
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setUserDropdown(false)
    setOpen(false)
    try {
      await logout()
      setUser(null)
      navigate('/')
    } catch {
      setUser(null)
      navigate('/')
    }
  }

  const roleLabels: Record<string, { label: string; color: string }> = {
    traveler: { label: 'Du khách', color: 'badge-role-traveler' },
    provider: { label: 'Cơ sở đối tác', color: 'badge-role-provider' },
    admin: { label: 'Quản trị viên', color: 'badge-role-admin' },
  }

  const userInitials = (user?.display_name || user?.email || 'U')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="app-frame-3d">
      {/* Floating Glass Navigation Header with Scroll Mask */}
      <div className="header-outer-sticky">
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
              <span className="brand-tagline">TP. HỒ CHÍ MINH · REALTIME</span>
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="desktop-nav-3d">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  isActive ? 'nav-link-3d nav-link-active-3d' : 'nav-link-3d'
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Header Action / User Menu Area */}
          <div className="header-actions-area">
            <NavLink to="/chat" className="header-cta-3d">
              <span>Lên Lịch Ngay</span>
              <Sparkles size={15} />
            </NavLink>

            {user ? (
              <div className="user-dropdown-container" ref={dropdownRef}>
                <button
                  type="button"
                  className="user-profile-trigger"
                  onClick={() => setUserDropdown(!userDropdown)}
                  aria-expanded={userDropdown}
                  aria-label="Menu tài khoản"
                >
                  <div className="user-avatar-gem">
                    <span>{userInitials}</span>
                  </div>
                  <div className="user-meta-brief">
                    <span className="user-brief-name">
                      {user.display_name || user.email.split('@')[0]}
                    </span>
                    <span className={`user-role-micro ${roleLabels[user.role]?.color || ''}`}>
                      {roleLabels[user.role]?.label || user.role}
                    </span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`dropdown-chevron ${userDropdown ? 'chevron-rotated' : ''}`}
                  />
                </button>

                {userDropdown && (
                  <div className="user-dropdown-panel animate-fadeIn">
                    <div className="dropdown-user-header">
                      <div className="user-avatar-large">{userInitials}</div>
                      <div className="header-info">
                        <strong>{user.display_name || 'Người dùng'}</strong>
                        <small>{user.email}</small>
                        <span className="role-tag-pill">
                          {roleLabels[user.role]?.label || user.role}
                        </span>
                      </div>
                    </div>

                    <div className="dropdown-menu-list">
                      <NavLink
                        to="/profile"
                        className="dropdown-menu-item"
                        onClick={() => setUserDropdown(false)}
                      >
                        <User size={16} className="text-emerald" />
                        <div>
                          <span>Hồ sơ cá nhân</span>
                          <small>Cài đặt tài khoản & mật khẩu</small>
                        </div>
                      </NavLink>

                      <NavLink
                        to="/compare"
                        className="dropdown-menu-item"
                        onClick={() => setUserDropdown(false)}
                      >
                        <GitCompare size={16} className="text-cyan" />
                        <div>
                          <span>So sánh lịch trình</span>
                          <small>Đối chiếu chi phí & thời gian</small>
                        </div>
                      </NavLink>

                      {user.role === 'provider' && (
                        <NavLink
                          to="/provider-portal"
                          className="dropdown-menu-item"
                          onClick={() => setUserDropdown(false)}
                        >
                          <Store size={16} className="text-amber" />
                          <div>
                            <span>Cổng quản lý cơ sở</span>
                            <small>Quản lý khung giờ & hoạt động</small>
                          </div>
                        </NavLink>
                      )}

                      {user.role === 'admin' && (
                        <NavLink
                          to="/admin"
                          className="dropdown-menu-item"
                          onClick={() => setUserDropdown(false)}
                        >
                          <ShieldCheck size={16} className="text-rose" />
                          <div>
                            <span>Trung tâm quản trị</span>
                            <small>Duyệt dữ liệu, POI & kiểm toán</small>
                          </div>
                        </NavLink>
                      )}

                      <div className="dropdown-divider" />

                      <button
                        type="button"
                        className="dropdown-menu-item item-logout"
                        onClick={handleLogout}
                      >
                        <LogOut size={16} />
                        <span>Đăng xuất tài khoản</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="guest-action-group">
                <NavLink to="/login" className="btn-login-ghost">
                  <User size={15} />
                  <span>Đăng nhập</span>
                </NavLink>
              </div>
            )}

            <button
              type="button"
              className="theme-toggle-3d"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
              title={theme === 'dark' ? 'Giao diện sáng' : 'Giao diện tối'}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Mobile Burger Toggle */}
            <button
              className="menu-toggle-3d"
              onClick={() => setOpen(!open)}
              aria-label={open ? 'Đóng menu' : 'Mở menu'}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {open && (
          <div className="mobile-nav-drawer animate-fadeIn">
            <div className="mobile-links-list">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    isActive ? 'mobile-nav-item mobile-nav-active' : 'mobile-nav-item'
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              <div className="mobile-nav-divider" />

              {user ? (
                <>
                  <NavLink
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="mobile-nav-item"
                  >
                    <User size={16} className="text-emerald" />
                    <span>Hồ sơ của tôi ({user.display_name || user.email})</span>
                  </NavLink>
                  <NavLink
                    to="/compare"
                    onClick={() => setOpen(false)}
                    className="mobile-nav-item"
                  >
                    <GitCompare size={16} className="text-cyan" />
                    <span>So sánh lịch trình</span>
                  </NavLink>
                  {user.role === 'provider' && (
                    <NavLink
                      to="/provider-portal"
                      onClick={() => setOpen(false)}
                      className="mobile-nav-item"
                    >
                      <Store size={16} className="text-amber" />
                      <span>Cổng quản lý cơ sở</span>
                    </NavLink>
                  )}
                  {user.role === 'admin' && (
                    <NavLink
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="mobile-nav-item"
                    >
                      <ShieldCheck size={16} className="text-rose" />
                      <span>Trang quản trị</span>
                    </NavLink>
                  )}
                  <button
                    type="button"
                    className="mobile-nav-item text-rose"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    <span>Đăng xuất</span>
                  </button>
                </>
              ) : (
                <div className="mobile-guest-buttons">
                  <NavLink
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="btn-secondary-3d w-full text-center"
                  >
                    Đăng nhập
                  </NavLink>
                  <NavLink
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="btn-primary-3d w-full text-center"
                  >
                    Đăng ký tài khoản
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
      </div>

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
                <Compass size={22} className="text-emerald animate-spin-slow" />
                <span>Local Explorer AI</span>
              </NavLink>
              <p className="footer-desc">
                Nền tảng gợi ý lịch trình thông minh thời gian thực cho TP. Hồ Chí Minh.
                Kết hợp dữ liệu khung giờ mở thực tế, sức chứa địa điểm và thuật toán Heuristic tối ưu hóa di chuyển.
              </p>
              <div className="footer-live-status">
                <span className="live-dot-glow" />
                <span>Heuristic Engine Online · Dữ liệu mô phỏng minh bạch</span>
              </div>
              <div className="footer-coords">
                <MapPin size={13} className="text-amber" />
                <span>Tọa độ trung tâm: 10.7769° N, 106.7009° E (Q.1)</span>
              </div>
            </div>

            <div className="footer-links-col">
              <span className="footer-col-title">Khám Phá Nhanh</span>
              <NavLink to="/explore">Kho trải nghiệm địa phương</NavLink>
              <NavLink to="/planner">Lập lịch trình tự động</NavLink>
              <NavLink to="/provider">Dành cho đối tác & cơ sở</NavLink>
              <NavLink to="/about">Kiến trúc hệ thống POI & Slot</NavLink>
              <NavLink to="/compare">So sánh các phương án</NavLink>
            </div>

            <div className="footer-links-col">
              <span className="footer-col-title">Cam Kết Minh Bạch</span>
              <div className="footer-policy-item">
                <CheckCircle2 size={14} className="text-emerald" />
                <span>Không ảo tưởng thông tin (Hallucination-free)</span>
              </div>
              <div className="footer-policy-item">
                <CheckCircle2 size={14} className="text-emerald" />
                <span>Minh bạch khung giờ & độ chắc chắn</span>
              </div>
              <div className="footer-policy-item">
                <CheckCircle2 size={14} className="text-emerald" />
                <span>Không thu phí trung gian du khách</span>
              </div>
              <div className="footer-policy-item">
                <CheckCircle2 size={14} className="text-emerald" />
                <span>Thuật toán chạy độc lập tốc độ 0ms</span>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 Local Explorer AI. Khám phá đúng trải nghiệm, đúng thời điểm.</span>
            <div className="footer-credits">
              <span>Được xây dựng với <Heart size={12} className="inline text-rose-500 fill-rose-500" /> dành cho Sài Gòn</span>
              <span className="footer-version-tag">3D Experience Architecture v2.5</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
