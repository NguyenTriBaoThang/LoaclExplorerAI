import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Compass,
  CalendarCheck,
  Navigation,
  ShieldCheck,
  Clock,
  Coins,
  MapPin,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { CityHero3D } from '../components/3d/CityHero3D'
import { TiltCard3D } from '../components/3d/TiltCard3D'

const categories = [
  { id: 'food', name: 'Ẩm thực Sài Gòn', icon: '🍜', desc: 'Bếp món Nam Bộ, cà phê vợt hẻm xưa, bánh dân gian', color: 'from-orange-500/20 to-amber-500/20' },
  { id: 'handicraft', name: 'Thủ công mỹ nghệ', icon: '🎨', desc: 'Sổ tay giấy dó, bàn xoay gốm sứ, nước hoa thảo mộc', color: 'from-amber-500/20 to-yellow-500/20' },
  { id: 'culture', name: 'Di sản & Văn hóa', icon: '🏛️', desc: 'Triển lãm ảnh ký sự, bảo tàng nghệ thuật, kiến trúc cổ', color: 'from-emerald-500/20 to-teal-500/20' },
  { id: 'nature', name: 'Thiên nhiên & Thư giãn', icon: '🌿', desc: 'Hoàng hôn sông Sài Gòn, vườn cổ thụ, thiền chuông xoay', color: 'from-teal-500/20 to-cyan-500/20' },
]

const highlights = [
  {
    number: '01',
    title: 'Biết khung giờ thực tế',
    copy: 'Một địa điểm mở cửa không có nghĩa trải nghiệm đang diễn ra. Chúng tôi chỉ đề xuất khi có khung giờ bạn tham gia được.',
    icon: CalendarCheck,
  },
  {
    number: '02',
    title: 'Vừa sức & Ngân sách nhóm',
    copy: 'Thuật toán tính toán thời lượng từng hoạt động, chi phí chia đều theo đầu người và thời gian di chuyển thực tế giữa các quận.',
    icon: Navigation,
  },
  {
    number: '03',
    title: 'Minh bạch độ chắc chắn',
    copy: 'Chỗ nào đã xác nhận, chỗ nào cần gọi trước đều được đánh dấu rõ ràng (Tentative vs Available), không gây ngộ nhận.',
    icon: ShieldCheck,
  },
]

const curatedExperiences = [
  {
    title: 'Góc thủ công giấy Dó Sài Gòn',
    district: 'Quận 1',
    category: 'Thủ công',
    duration: '75 phút',
    price: '120.000₫',
    time: '09:00 - 10:15',
    icon: '🎨',
  },
  {
    title: 'Bàn trải nghiệm gốm Sài Gòn',
    district: 'Quận 3',
    category: 'Thủ công',
    duration: '90 phút',
    price: '180.000₫',
    time: '10:00 - 11:30',
    icon: '🏺',
  },
  {
    title: 'Bếp Cơm Niêu & Món Nam Bộ',
    district: 'Quận 1',
    category: 'Ẩm thực',
    duration: '90 phút',
    price: '220.000₫',
    time: '11:30 - 13:00',
    icon: '🍲',
  },
  {
    title: 'Thuyền hoàng hôn sông Sài Gòn',
    district: 'Bến Bạch Đằng',
    category: 'Thiên nhiên',
    duration: '75 phút',
    price: '150.000₫',
    time: '16:30 - 17:45',
    icon: '⛵',
  },
]

export function HomePage() {
  return (
    <div className="home-container-3d">
      {/* Hero Section */}
      <section className="home-hero-3d">
        <div className="hero-content-col">
          <div className="hero-badge-wrap">
            <span className="hero-badge-glow" />
            <span className="hero-badge-text">
              <Compass size={14} className="text-emerald animate-spin-slow" />
              TP. HỒ CHÍ MINH · NỀN TẢNG KHÁM PHÁ 3D
            </span>
          </div>

          <h1 className="hero-heading-3d">
            Đi xa hơn vào <br />
            <span className="gradient-text-emerald">đời sống</span> địa phương.
          </h1>

          <p className="hero-description-3d">
            Một chuyến đi trọn vẹn bắt đầu từ <strong>trải nghiệm đúng lúc</strong> — không phải
            chỉ là những dấu chấm vô hồn trên bản đồ. Local Explorer AI gợi ý lịch trình phù hợp với
            thời gian, nhịp đi và ngân sách của bạn.
          </p>

          <div className="hero-cta-group">
            <Link className="btn-primary-3d" to="/explore">
              <span>Khám phá trải nghiệm</span>
              <ArrowRight size={18} />
            </Link>
            <Link className="btn-secondary-3d" to="/planner">
              <span>Tạo lịch trình thông minh</span>
              <ArrowUpRight size={17} />
            </Link>
          </div>

          <div className="hero-features-strip">
            <div className="feature-pill">
              <Sparkles size={14} className="text-amber" />
              <span>Planner Heuristic 0ms</span>
            </div>
            <div className="feature-pill">
              <Clock size={14} className="text-emerald" />
              <span>Khung giờ Slot thực</span>
            </div>
            <div className="feature-pill">
              <Coins size={14} className="text-cyan" />
              <span>Tối ưu hóa ngân sách</span>
            </div>
          </div>
        </div>

        {/* 3D WebGL Saigon Cityscape Canvas */}
        <div className="hero-visual-col">
          <CityHero3D />
        </div>
      </section>

      {/* Quick Vibe Categories */}
      <section className="vibe-section-3d">
        <div className="section-header-center">
          <span className="section-eyebrow">CHỌN THEO NHỊP ĐI</span>
          <h2 className="section-title-3d">Hôm nay bạn muốn cảm nhận điều gì?</h2>
          <p className="section-subtitle-3d">
            Khám phá các hoạt động đặc trưng theo phong cách và sở thích riêng của bạn tại Sài Gòn.
          </p>
        </div>

        <div className="vibe-grid-3d">
          {categories.map((cat) => (
            <Link to={`/explore?intent=${cat.id}`} key={cat.id} className="vibe-card-link">
              <TiltCard3D maxTilt={10} className="vibe-card-3d">
                <div className="vibe-icon-wrap">
                  <span className="vibe-emoji">{cat.icon}</span>
                </div>
                <h3 className="vibe-title">{cat.name}</h3>
                <p className="vibe-desc">{cat.desc}</p>
                <div className="vibe-action">
                  <span>Khám phá ngay</span>
                  <ArrowRight size={15} />
                </div>
              </TiltCard3D>
            </Link>
          ))}
        </div>
      </section>

      {/* Curated Experiences Showcase */}
      <section className="showcase-section-3d">
        <div className="section-header-split">
          <div>
            <span className="section-eyebrow">GỢI Ý ĐẶC SẮC</span>
            <h2 className="section-title-3d">Trải nghiệm đang mở khung giờ</h2>
          </div>
          <Link to="/explore" className="view-all-link">
            <span>Xem tất cả trải nghiệm</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="showcase-grid-3d">
          {curatedExperiences.map((item, idx) => (
            <TiltCard3D key={idx} maxTilt={8} className="showcase-card-3d">
              <div className="showcase-top">
                <span className="showcase-emoji">{item.icon}</span>
                <span className="showcase-tag">{item.category}</span>
              </div>
              <h3 className="showcase-title">{item.title}</h3>
              <div className="showcase-meta">
                <span className="meta-pin">
                  <MapPin size={13} /> {item.district}
                </span>
                <span className="meta-time">
                  <Clock size={13} /> {item.duration}
                </span>
              </div>
              <div className="showcase-footer">
                <div>
                  <small>Chi phí dự kiến</small>
                  <strong>{item.price}</strong>
                </div>
                <div className="slot-badge">
                  <span className="slot-dot" />
                  <span>{item.time}</span>
                </div>
              </div>
            </TiltCard3D>
          ))}
        </div>
      </section>

      {/* Core Philosophy & Comparison */}
      <section className="philosophy-section-3d">
        <div className="philosophy-card-main">
          <div className="section-header-center">
            <span className="section-eyebrow">VÌ SAO CHỌN LOCAL EXPLORER AI?</span>
            <h2 className="section-title-3d">Giải pháp thông minh cho người du lịch hiện đại</h2>
            <p className="section-subtitle-3d">
              Không còn cảnh đến nơi phát hiện workshop đã kín chỗ hay quán nghỉ sớm.
            </p>
          </div>

          <div className="highlights-grid-3d">
            {highlights.map((item) => {
              const Icon = item.icon
              return (
                <TiltCard3D key={item.number} maxTilt={6} className="highlight-box-3d">
                  <div className="highlight-icon-pill">
                    <Icon size={24} className="text-emerald" />
                  </div>
                  <span className="highlight-num">{item.number}</span>
                  <h3 className="highlight-title">{item.title}</h3>
                  <p className="highlight-copy">{item.copy}</p>
                </TiltCard3D>
              )
            })}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="cta-banner-3d">
        <div className="cta-banner-glow" />
        <div className="cta-banner-inner">
          <div className="cta-text-side">
            <span className="section-eyebrow text-emerald-300">SÀI GÒN ĐANG CHỜ BẠN</span>
            <h2 className="cta-heading-3d">
              Sẵn sàng cho một ngày <br />
              <em>khám phá trọn vẹn?</em>
            </h2>
            <p className="cta-sub-3d">
              Nhập thời gian rảnh, số lượng người và ngân sách — AI sẽ tạo lịch trình hoàn chỉnh
              trong nháy mắt.
            </p>
          </div>
          <div className="cta-action-side">
            <Link to="/planner" className="btn-cta-hero">
              <span>Bắt đầu lên lịch</span>
              <ArrowRight size={20} />
            </Link>
            <span className="cta-guarantee">Hoàn toàn miễn phí · Dữ liệu mô phỏng minh bạch</span>
          </div>
        </div>
      </section>
    </div>
  )
}
