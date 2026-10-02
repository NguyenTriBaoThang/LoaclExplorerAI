import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { api, apiErrorMessage, login, registerAccount } from '../api/client'
import { useAuth } from '../auth'

export function AuthPage({ register = false }: { register?: boolean }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const destination = (location.state as { from?: string } | null)?.from || '/'

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      setUser(register
        ? await registerAccount(email, name, password)
        : await login(email, password))
      navigate(destination, { replace: true })
    } catch (reason) {
      setError(apiErrorMessage(reason))
    } finally {
      setBusy(false)
    }
  }

  return <div className="page-wrap" style={{ maxWidth: 560, paddingTop: 48 }}>
    <section className="form-card-3d">
      <div className="form-card-header"><span className="step-num">LE</span><div>
        <h1>{register ? 'Tạo tài khoản du khách' : 'Đăng nhập Local Explorer'}</h1>
        <p>Email và mật khẩu hoặc tiếp tục bằng Google.</p>
      </div></div>
      <form onSubmit={submit} className="form-fields-grid-2">
        {register && <label className="field-group-3d"><span>Họ tên</span><input required minLength={2} value={name} onChange={e => setName(e.target.value)} autoComplete="name" /></label>}
        <label className="field-group-3d"><span>Email</span><input required type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></label>
        <label className="field-group-3d"><span>Mật khẩu</span><input required type="password" minLength={register ? 12 : 1} value={password} onChange={e => setPassword(e.target.value)} autoComplete={register ? 'new-password' : 'current-password'} /></label>
        {(error || (searchParams.get('error') ? 'Đăng nhập Google chưa thành công. Kiểm tra cấu hình OAuth hoặc trạng thái email.' : '')) && <div className="form-alert-3d" style={{ gridColumn: '1 / -1' }}>{error || 'Đăng nhập Google chưa thành công. Kiểm tra cấu hình OAuth hoặc trạng thái email.'}</div>}
        <button className="btn-planner-submit" type="submit" disabled={busy}>{busy ? 'Đang xử lý…' : register ? 'Tạo tài khoản' : 'Đăng nhập'}</button>
      </form>
      <a className="btn-secondary-3d" href={`${api.defaults.baseURL}/auth/google/start`} style={{ display: 'block', textAlign: 'center', marginTop: 12 }}>Tiếp tục bằng Google</a>
      <p style={{ marginTop: 18 }}>{register ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
        <Link to={register ? '/login' : '/register'}>{register ? 'Đăng nhập' : 'Đăng ký'}</Link>
      </p>
      <small>Google login cần quản trị viên cấu hình OAuth client trong môi trường triển khai.</small>
    </section>
  </div>
}
