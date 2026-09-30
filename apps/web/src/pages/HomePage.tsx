import { ArrowDownRight, ArrowRight, ArrowUpRight, CalendarDays, MapPin, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const highlights = [
  { number: '01', title: 'Có khung giờ', copy: 'Tìm hoạt động có slot phù hợp với ngày bạn đi.' },
  { number: '02', title: 'Vừa sức nhóm', copy: 'Cân nhắc thời lượng, ngân sách và số người.' },
  { number: '03', title: 'Biết điều chưa chắc', copy: 'Hiển thị rõ dữ liệu mô phỏng và chỗ cần xác nhận.' },
]

export function HomePage() {
  return <>
    <section className="home-hero page-wrap">
      <div className="hero-copy">
        <span className="eyebrow"><span className="eyebrow-line" /> TP. HỒ CHÍ MINH · BẢN DEMO</span>
        <h1>Đi xa hơn<br />vào <em>đời sống</em><br />địa phương.</h1>
        <p className="hero-lede">Một lịch trình hay bắt đầu từ trải nghiệm đúng lúc — và một kế hoạch đủ thực tế để bạn tận hưởng trọn vẹn.</p>
        <div className="hero-actions">
          <Link className="button button-primary" to="/explore">Khám phá trải nghiệm <ArrowRight size={17} /></Link>
          <Link className="button button-text" to="/planner">Tạo lịch trình <ArrowUpRight size={16} /></Link>
        </div>
        <div className="hero-note"><Sparkles size={15} /> Planner chạy độc lập, không cần chatbot hay API key AI.</div>
      </div>
      <div className="hero-visual">
        <div className="hero-map-wash">
          <div className="map-grid" />
          <div className="district-ribbon ribbon-one" />
          <div className="district-ribbon ribbon-two" />
          <div className="district-ribbon ribbon-three" />
          <span className="map-neighborhood neighborhood-one">QUẬN 1</span>
          <span className="map-neighborhood neighborhood-two">BÌNH THẠNH</span>
          <span className="map-neighborhood neighborhood-three">QUẬN 3</span>
          <span className="hero-map-pin pin-a"><MapPin size={17} /></span>
          <span className="hero-map-pin pin-b"><MapPin size={17} /></span>
          <span className="hero-map-pin pin-c"><MapPin size={17} /></span>
          <div className="map-orbit orbit-a" /><div className="map-orbit orbit-b" />
          <span className="map-corner-label">10°46' N<br />106°42' E</span>
        </div>
        <div className="hero-floating-card itinerary-card-float">
          <div className="float-card-heading"><span className="float-icon"><CalendarDays size={16} /></span><span><small>MỘT BUỔI SÁNG</small><strong>Nhịp sống Sài Gòn</strong></span></div>
          <div className="float-timeline"><i /><span>09:00</span><b>Góc thủ công giấy</b></div>
          <div className="float-timeline"><i /><span>11:30</span><b>Bếp món Nam bộ</b></div>
          <div className="float-total"><span>2 trải nghiệm · 3 giờ 15 phút</span><ArrowDownRight size={15} /></div>
        </div>
        <div className="hero-sticker"><span>Đi theo<br />nhịp riêng</span><ArrowUpRight size={17} /></div>
        <p className="visual-caption">Một góc thành phố, nhiều cách để cảm nhận.</p>
      </div>
    </section>

    <section className="intro-strip">
      <div className="page-wrap intro-inner"><span className="section-index">01 / Ý TƯỞNG</span><p>Một địa điểm có trên bản đồ <strong>không có nghĩa là bạn chắc chắn có thể tham gia</strong> vào thời điểm mình đến.</p><span className="intro-aside">Chúng tôi bắt đầu từ câu hỏi đó.</span></div>
    </section>

    <section className="page-wrap how-section">
      <div className="section-head"><div><span className="eyebrow"><span className="eyebrow-line" /> ĐI CHƠI CÓ CHỦ ĐÍCH</span><h2>Đúng trải nghiệm.<br /><em>Đúng thời điểm.</em></h2></div><p>Local Explorer AI kết hợp trải nghiệm, khung giờ, di chuyển và mục đích chuyến đi để gợi ý kế hoạch phù hợp.</p></div>
      <div className="highlight-grid">{highlights.map((item) => <article className="highlight-item" key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.copy}</p><ArrowUpRight className="highlight-arrow" size={18} /></article>)}</div>
    </section>

    <section className="closing-cta"><div className="page-wrap closing-inner"><div><span className="eyebrow eyebrow-light"><span className="eyebrow-line" /> THÀNH PHỐ ĐANG CHỜ</span><h2>Bắt đầu từ một<br /><em>điều bạn muốn thử.</em></h2></div><Link to="/planner" className="button button-light">Lên lịch cho chuyến đi <ArrowRight size={17} /></Link><span className="closing-mark">L/E — 01</span></div></section>
  </>
}
