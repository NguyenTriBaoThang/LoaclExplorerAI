import { ArrowRight, Compass, MapPin, ShieldCheck, Sparkles, Cpu, Clock3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TiltCard3D } from '../components/3d/TiltCard3D'

const concepts = [
  {
    num: '01',
    kicker: 'NƠI CHỐN VẬT LÝ',
    title: 'POI (Point of Interest)',
    desc: 'Điểm tọa độ địa lý trên bản đồ (Latitude, Longitude). Đây là nền tảng không gian để neo giữ các hoạt động thực tế.',
    icon: MapPin,
    color: 'text-emerald-500',
    tags: ['Tọa độ', 'Địa chỉ', 'Khu vực'],
  },
  {
    num: '02',
    kicker: 'HOẠT ĐỘNG CỤ THỂ',
    title: 'Experience (Trải nghiệm)',
    desc: 'Hành động cụ thể bạn tham gia tại địa điểm: vẽ gốm, nếm cà phê bít tất, làm giấy dó. Gắn liền với thời lượng và chi phí.',
    icon: Sparkles,
    color: 'text-amber-500',
    tags: ['Thời lượng', 'Ngân sách', 'Mục đích'],
  },
  {
    num: '03',
    kicker: 'THỜI ĐIỂM KHẢ THI',
    title: 'Slot (Khung giờ)',
    desc: 'Khung giờ độc lập có sức chứa riêng và trạng thái chỗ trống. Quyết định trực tiếp bạn có thể tham gia vào lúc bạn đến hay không.',
    icon: Clock3,
    color: 'text-cyan-500',
    tags: ['Giờ bắt đầu', 'Sức chứa', 'Xác nhận'],
  },
  {
    num: '04',
    kicker: 'TỐI ƯU HÓA TỔNG THỂ',
    title: 'Itinerary (Lịch trình 3D)',
    desc: 'Chuỗi trải nghiệm được thuật toán Heuristic sắp xếp khoa học, cân đối thời gian di chuyển giữa các quận và sức bền của nhóm.',
    icon: Compass,
    color: 'text-rose-500',
    tags: ['Heuristic', 'Lộ trình', 'Ma trận cự ly'],
  },
]

export function AboutPage() {
  return (
    <div className="about-page-3d page-wrap">
      {/* Hero Section */}
      <div className="about-hero-3d">
        <span className="eyebrow-3d">
          <span className="eyebrow-dot" /> TƯ DUY THIẾT KẾ MỚI CHO DU LỊCH
        </span>
        <h1 className="about-hero-title">
          Bản đồ chỉ là khởi đầu. <br />
          <em>Trải nghiệm mới là đích đến.</em>
        </h1>
        <p className="about-hero-lead">
          Local Explorer AI ra đời từ một quan sát thực tế: Một địa điểm mở cửa không đồng nghĩa với
          việc bạn có thể tham gia hoạt động vào thời điểm mình đến. Kế hoạch tốt phải hiểu được
          khung giờ thật của từng trải nghiệm.
        </p>
      </div>

      {/* Core Architectural Model Grid */}
      <div className="about-concept-section">
        <div className="section-header-center">
          <span className="section-eyebrow">KIẾN TRÚC MÔ HÌNH DỮ LIỆU</span>
          <h2 className="section-title-3d">Từ Tọa độ Bản đồ đến Lịch trình Hoàn chỉnh</h2>
        </div>

        <div className="concept-grid-3d">
          {concepts.map((item) => {
            const Icon = item.icon
            return (
              <TiltCard3D key={item.num} maxTilt={8} className="concept-card-3d">
                <div className="concept-card-top">
                  <div className={`concept-icon-box ${item.color}`}>
                    <Icon size={24} />
                  </div>
                  <span className="concept-step-badge">{item.num}</span>
                </div>

                <small className="concept-kicker">{item.kicker}</small>
                <h3 className="concept-title">{item.title}</h3>
                <p className="concept-desc">{item.desc}</p>

                <div className="concept-tags-row">
                  {item.tags.map((t) => (
                    <span key={t} className="concept-mini-tag">
                      {t}
                    </span>
                  ))}
                </div>
              </TiltCard3D>
            )
          })}
        </div>
      </div>

      {/* Engineering Principles */}
      <div className="engineering-section-3d">
        <div className="engineering-card-3d">
          <div className="eng-icon-box">
            <Cpu size={32} className="text-emerald" />
          </div>
          <div className="eng-content">
            <span className="results-sub">TRIẾT LÝ CÔNG NGHỆ</span>
            <h3>Heuristic Planner độc lập — Không ảo tưởng (Hallucination-free)</h3>
            <p>
              Khác với các chatbot LLM tự do thường hay “vẽ” ra các địa điểm không có thật hoặc gợi ý
              thời gian phi thực tế, Local Explorer AI sử dụng thuật toán sắp xếp Heuristic toán học
              chính xác trên cơ sở dữ liệu khung giờ có cấu trúc.
            </p>
          </div>
        </div>

        <div className="engineering-card-3d">
          <div className="eng-icon-box">
            <ShieldCheck size={32} className="text-amber" />
          </div>
          <div className="eng-content">
            <span className="results-sub">MINH BẠCH & TRÁCH NHIỆM</span>
            <h3>Rõ ràng về độ chắc chắn của dữ liệu</h3>
            <p>
              Dữ liệu demo được gắn nhãn mô phỏng. Những khung giờ chưa có báo cáo chỗ trống sẽ được
              đánh dấu <em>“cần xác nhận”</em> để du khách chủ động liên lạc, không ngộ nhận thành hết chỗ
              hoặc chắc chắn còn chỗ.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="about-cta-card-3d">
        <div className="about-cta-glow" />
        <div className="about-cta-inner">
          <div className="cta-icon-wrap">
            <Compass size={28} className="text-emerald-300" />
          </div>
          <div>
            <h2>Trải nghiệm ngay thuật toán lên lịch 3D</h2>
            <p>Chỉ mất 30 giây để có một lịch trình phù hợp cho ngày rảnh rỗi của bạn.</p>
          </div>
          <Link to="/planner" className="btn-primary-3d">
            <span>Bắt đầu ngay</span>
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </div>
  )
}
