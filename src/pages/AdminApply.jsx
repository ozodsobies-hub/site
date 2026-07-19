import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Icon } from '../components/Icons'
import api from '../utils/api'
import { toast } from '../components/Toast'

export default function AdminApply() {
  const { user, getToken, loading:authLoading } = useAuth()
  const nav = useNavigate()
  const [age, setAge] = useState('')
  const [joinedDc, setJoinedDc] = useState(false)
  const [understood, setUnderstood] = useState(false)
  const [atmosphere, setAtmosphere] = useState('')
  const [whyPlay, setWhyPlay] = useState('')
  const [msg, setMsg] = useState({type:'',text:''})
  const [loading, setLoading] = useState(false)
  const [myApps, setMyApps] = useState([])

  useEffect(()=>{if(!authLoading&&!user)nav('/login')},[user,authLoading])
  useEffect(()=>{if(user)api.get('admin-apply/my',{},api.authH(getToken())).then(d=>{if(d.success)setMyApps(d.applications)})},[user])

  const submit = async e => {
    e.preventDefault()
    if(!joinedDc){setMsg({type:'err',text:"Discord serverga qo'shilishingiz shart!"});return}
    if(!understood){setMsg({type:'err',text:'21 kun shartini qabul qilishingiz kerak!'});return}
    setLoading(true)
    const d = await api.post('admin-apply',{age:parseInt(age),understood_21days:understood,team_atmosphere:atmosphere,why_play:whyPlay},api.authH(getToken()))
    setLoading(false)
    if(d.error){setMsg({type:'err',text:d.error});return}
    setMsg({type:'ok',text:d.message}); toast.success('Ariza yuborildi!')
    setAge('');setAtmosphere('');setWhyPlay('');setJoinedDc(false);setUnderstood(false)
    api.get('admin-apply/my',{},api.authH(getToken())).then(d=>{if(d.success)setMyApps(d.applications)})
  }

  if(!user) return null
  const hasPending = myApps.some(a=>a.status==='kutilmoqda')
  const statusCls = {kutilmoqda:'status-ochiq',qabul:'status-yopiq',rad:'status-rad'}

  return (
    <div className="pt">
      <div className="wrap" style={{maxWidth:680}}>
        <div className="line"></div>
        <h1 style={{fontSize:28,fontWeight:800,marginBottom:8}}>Adminlikka ariza</h1>
        <p style={{color:'var(--td)',marginBottom:24}}>Quyidagi formani to'ldiring. Discord bog'langan bo'lishi shart.</p>

        {!user.dc?.is_verified && (
          <div className="alert alert-warn" style={{marginBottom:20}}>
            <Icon name="alert" size={16}/>
            Ariza yuborish uchun avval <Link to="/profile" style={{color:'var(--gold)',fontWeight:700}}>Profil → Sozlamalar</Link>da Discord'ni bog'lang!
          </div>
        )}

        {hasPending ? (
          <div className="alert alert-info">
            <Icon name="clock" size={16}/>Sizning kutilayotgan arizangiz bor. Javobni kuting.
          </div>
        ) : (
          <>
            {msg.text && <div className={`alert alert-${msg.type==='ok'?'ok':'err'}`}>{msg.text}</div>}
            <div className="card">
              <form onSubmit={submit}>
                <div style={{marginBottom:16}}>
                  <label style={{fontSize:13,fontWeight:600,marginBottom:8,display:'block'}}>Yoshingiz <span style={{color:'var(--red)'}}>*</span></label>
                  <input className="inp" type="number" min="13" max="99" value={age} onChange={e=>setAge(e.target.value)} placeholder="Yoshingizni kiriting" required style={{maxWidth:200}}/>
                </div>
                <div className="card" style={{marginBottom:16,padding:14,background:'rgba(124,58,237,.04)',borderColor:'rgba(124,58,237,.15)'}}>
                  <label style={{display:'flex',alignItems:'flex-start',gap:10,cursor:'pointer',fontSize:13,lineHeight:1.6}}>
                    <input type="checkbox" checked={joinedDc} onChange={e=>setJoinedDc(e.target.checked)} style={{marginTop:3,width:16,height:16,accentColor:'var(--p)',flexShrink:0}}/>
                    <span>Men qo'ng'iroq uchun Discord serverga qo'shildim: <a href="https://discord.gg/bAbGcN4s2" target="_blank" rel="noreferrer" style={{color:'var(--pl)',fontWeight:600}}>discord.gg/bAbGcN4s2</a> <span style={{color:'var(--red)'}}>*</span></span>
                  </label>
                </div>
                <div className="card" style={{marginBottom:16,padding:14,background:'rgba(124,58,237,.04)',borderColor:'rgba(124,58,237,.15)'}}>
                  <label style={{display:'flex',alignItems:'flex-start',gap:10,cursor:'pointer',fontSize:13,lineHeight:1.6}}>
                    <input type="checkbox" checked={understood} onChange={e=>setUnderstood(e.target.checked)} style={{marginTop:3,width:16,height:16,accentColor:'var(--p)',flexShrink:0}}/>
                    <span>Agar lavozimda <b>21 kundan kam</b> tursam, men <b>ChSA</b>ga kiritilishimni tushunaman <span style={{color:'var(--red)'}}>*</span></span>
                  </label>
                </div>
                <div style={{marginBottom:16}}>
                  <label style={{fontSize:13,fontWeight:600,marginBottom:8,display:'block'}}>Jamoadagi psixologik muhit siz uchun qanchalik muhim? <span style={{color:'var(--red)'}}>*</span></label>
                  <textarea className="inp" value={atmosphere} onChange={e=>setAtmosphere(e.target.value)} placeholder="Fikringizni yozing..." rows={3} required/>
                </div>
                <div style={{marginBottom:22}}>
                  <label style={{fontSize:13,fontWeight:600,marginBottom:8,display:'block'}}>Sizni o'yinga nima olib keldi? <span style={{color:'var(--red)'}}>*</span></label>
                  <textarea className="inp" value={whyPlay} onChange={e=>setWhyPlay(e.target.value)} placeholder="Batafsil yozing..." rows={4} required/>
                </div>
                <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:13,fontSize:15,borderRadius:10}} disabled={loading}>
                  {loading?<div className="spin"></div>:<><Icon name="send" size={16}/>Ariza yuborish</>}
                </button>
              </form>
            </div>
          </>
        )}

        {myApps.length>0 && (
          <div style={{marginTop:28}}>
            <h3 style={{fontSize:16,fontWeight:700,marginBottom:12}}>Mening arizalarim</h3>
            {myApps.map(a=>(
              <div key={a.id} className="card" style={{marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:a.review_note?8:0}}>
                  <span style={{fontSize:12,color:'var(--td)'}}>{new Date(a.created_at).toLocaleDateString('uz-UZ')}</span>
                  <span className={`badge ${statusCls[a.status]||'badge-p'}`}>{a.status}</span>
                </div>
                {a.review_note && <p style={{fontSize:13,color:'var(--td)',marginTop:6}}>Izoh: {a.review_note}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
