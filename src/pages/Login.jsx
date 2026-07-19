import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Icon } from '../components/Icons'
import api from '../utils/api'
import { toast } from '../components/Toast'

export default function Login() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    const d = await api.post('auth/login', { name, password, remember_me: rememberMe })
    setLoading(false)
    if (d.error) { setError(d.error); return }
    login(d.token, d.player)
    if (d.suspicious) toast.warning("Yangi qurilmadan kirish aniqlandi!")
    toast.success(`Xush kelibsiz, ${d.player.name}!`)
    nav('/profile')
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'radial-gradient(ellipse 60% 50% at 50% 0%,rgba(124,58,237,.15),transparent)',paddingTop:80}}>
      <div style={{width:'100%',maxWidth:420,padding:'0 20px'}}>
        <div className="card" style={{padding:36}}>
          <div style={{textAlign:'center',marginBottom:28}}>
            <div style={{width:56,height:56,borderRadius:16,background:'linear-gradient(135deg,#7C3AED,#4C1D95)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:24,color:'#fff',margin:'0 auto 14px',boxShadow:'0 8px 24px rgba(124,58,237,.4)'}}>S</div>
            <h2 style={{fontSize:24,fontWeight:800,marginBottom:4}}>Xush kelibsiz!</h2>
            <p style={{fontSize:13,color:'var(--td)'}}>O'yindagi akkauntingiz bilan kiring</p>
          </div>
          {error && <div className="alert alert-err"><Icon name="alert" size={16}/>{error}</div>}
          <form onSubmit={submit}>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,fontWeight:600,color:'var(--td)',marginBottom:6,display:'block'}}>Nick (Ism_Familiya)</label>
              <input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="Ism_Familiya" required/>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,fontWeight:600,color:'var(--td)',marginBottom:6,display:'block'}}>Parol</label>
              <input className="inp" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required/>
            </div>
            <label style={{display:'flex',alignItems:'center',gap:8,marginBottom:22,fontSize:13,color:'var(--td)',cursor:'pointer'}}>
              <input type="checkbox" checked={rememberMe} onChange={e=>setRememberMe(e.target.checked)} style={{width:16,height:16,accentColor:'var(--p)'}}/>
              Meni eslab qol (30 kun)
            </label>
            <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:13,fontSize:15,borderRadius:10}} disabled={loading}>
              {loading ? <div className="spin"></div> : <><Icon name="login" size={17}/>Kirish</>}
            </button>
          </form>
          <div style={{textAlign:'center',marginTop:20,padding:'16px 0 0',borderTop:'1px solid var(--b)',fontSize:13,color:'var(--td)',lineHeight:1.6}}>
            Akkauntingiz yo'qmi?<br/>
            <span style={{color:'var(--pl)'}}>O'yinga kirib ro'yxatdan o'ting</span>
          </div>
        </div>
      </div>
    </div>
  )
}
