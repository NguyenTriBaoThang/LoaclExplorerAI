import { ArrowRight, Check, Compass, MapPin, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export function AboutPage() {
  return <div className="page-wrap about-page">
    <div className="about-hero"><span className="eyebrow"><span className="eyebrow-line" /> MỘT CÁCH KHÁC ĐỂ ĐI CHƠI</span><h1>Bản đồ là khởi đầu.<br /><em>Trải nghiệm mới là đích đến.</em></h1><p>Local Explorer AI giúp bạn tìm hoạt động có thể tham gia trong khung thời gian thật của chuyến đi — rồi giải thích vì sao hoạt động đó phù hợp.</p></div>
    <div className="about-manifesto"><span className="section-index">CỐT LÕI SẢN PHẨM</span><p>Địa điểm có thể mở cửa, nhưng trải nghiệm có thể hết giờ, hết chỗ, hoặc cần đặt trước. Kế hoạch tốt phải hiểu những khác biệt ấy.</p></div>
    <div className="concept-grid"><article><span><MapPin size={18} /></span><small>01 / NƠI CHỐN</small><h2>POI</h2><p>Một điểm trên bản đồ. Đây là nền tảng địa lý để gắn với hoạt động.</p></article><article><span><Sparkles size={18} /></span><small>02 / HOẠT ĐỘNG</small><h2>Experience</h2><p>Một điều cụ thể bạn có thể làm tại điểm đó, gắn với mục đích và thời lượng.</p></article><article><span><Check size={18} /></span><small>03 / THỜI ĐIỂM</small><h2>Slot</h2><p>Một khung giờ có sức chứa và trạng thái riêng. Không đồng nghĩa với xác nhận đặt chỗ.</p></article></div>
    <div className="about-principle"><ShieldCheck size={25} /><div><span className="eyebrow-small">MINH BẠCH VỀ ĐỘ TIN CẬY</span><p>Dữ liệu demo được gắn nhãn mô phỏng. Chỗ chưa được báo cáo sẽ hiện “cần xác nhận”, còn ước tính di chuyển không giả làm dữ liệu giao thông thực.</p></div></div>
    <div className="about-cta"><Compass size={23} /><div><h2>Thử lên kế hoạch cho ngày của bạn.</h2><p>Form có cấu trúc luôn hoạt động độc lập với chatbot.</p></div><Link to="/planner" className="button button-primary">Bắt đầu <ArrowRight size={16} /></Link></div>
  </div>
}
