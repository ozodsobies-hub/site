import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Icon } from '../components/Icons'
import CaseOpening from '../components/CaseOpening'
import api, { fmt, adminLvl, teamNames } from '../utils/api'
import { toast } from '../components/Toast'

export default function Profile() {
  const { user, logout, getToken, refreshUser, loading:authLoading } = useAuth()
  const [tab, setTab] = useState('overview')
  const nav = useNavigate()
  useEffect(()=>{if(!authLoading&&!user)nav('/login')},[user,authLoading])
  if(!user) return null

  const tabs=[{id:'overview',label:'Umumiy',icon:'user'},{id:'keys',label:'Kalitlar',icon:'key'},{id:'settings',label:'Sozlamalar',icon:'settings'}]
  if(user.admin>0) tabs.splice(1,0,{id:'activity',label:'Aktivlik',icon:'activity'},{id:'admin',label:'Admin panel',icon:'shield'})

  return (
    <div className="pt">
      <div className="wrap">
        {/* PROFIL HEADER */}
        <div className="card" style={{marginBottom:22,padding:0,overflow:'hidden'}}>
          <div style={{height:80,background:'linear-gradient(135deg,rgba(124,58,237,.4),rgba(76,29,149,.2))'}}/>
          <div style={{padding:'0 24px 20px',position:'relative'}}>
            <div style={{width:64,height:64,borderRadius:16,background:'linear-gradient(135deg,#7C3AED,#4C1D95)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:26,color:'#fff',border:'3px solid var(--bg)',marginTop:-32,boxShadow:'0 8px 24px rgba(124,58,237,.4)'}}>
              {user.name[0]}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:10,marginTop:10}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
                  <h2 style={{fontSize:22,fontWeight:800}}>{user.name}</h2>
                  {user.online==1 && <span className="badge badge-green"><span className="online-dot"></span>Onlayn</span>}
                  {user.admin>0 && <span className="badge badge-p"><Icon name="shield" size={11}/>{user.admin_name}</span>}
                  {user.premium==1 && <span className="badge badge-gold"><Icon name="star" size={11}/>Premium</span>}
                  {user.curator && <span className="badge badge-blue">{user.curator} kurator</span>}
                </div>
                <div style={{fontSize:13,color:'var(--td)',marginTop:4}}>{user.team} • Daraja {user.level} • {user.reg_time}dan</div>
              </div>
              <button onClick={()=>{logout();nav('/')}} className="btn btn-outline btn-sm"><Icon name="logout" size={14}/>Chiqish</button>
            </div>
          </div>
        </div>

        <div className="tabs">
          {tabs.map(t=>(<button key={t.id} className={`tab ${tab===t.id?'active':''}`} onClick={()=>setTab(t.id)}><Icon name={t.icon} size={13}/>{t.label}</button>))}
        </div>

        {tab==='overview' && <OverviewTab user={user}/>}
        {tab==='activity' && user.admin>0 && <ActivityTab/>}
        {tab==='keys' && <KeysTab/>}
        {tab==='settings' && <SettingsTab user={user} refreshUser={refreshUser}/>}
        {tab==='admin' && user.admin>0 && (
          <div style={{textAlign:'center',padding:48}}>
            <div style={{width:72,height:72,borderRadius:20,background:'linear-gradient(135deg,rgba(124,58,237,.2),rgba(76,29,149,.1))',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}><Icon name="shield" size={32} color="var(--pl)"/></div>
            <h3 style={{fontSize:20,fontWeight:700,marginBottom:8}}>{user.admin_name}</h3>
            <p style={{color:'var(--td)',marginBottom:20}}>Batafsil boshqaruv uchun Admin panelga o'ting</p>
            <Link to="/admin" className="btn btn-primary" style={{borderRadius:10}}>Admin Panelga o'tish</Link>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({label,val,last,danger,color}){
  return <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:last?'none':'1px solid rgba(124,58,237,.07)'}}>
    <span style={{color:'var(--td)',fontSize:13}}>{label}</span>
    <b style={{color:danger?'var(--red)':color||undefined,fontSize:13}}>{val}</b>
  </div>
}

function OverviewTab({user}){
  return (
    <div>
      {/* Intizom holati */}
      {user.admin>0 && (user.discipline?.tanbex_count>0||user.discipline?.vig_count>0) && (
        <div className="card" style={{marginBottom:16,borderColor:'rgba(239,68,68,.3)',background:'rgba(239,68,68,.04)'}}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:10,color:'var(--red)',display:'flex',alignItems:'center',gap:8}}><Icon name="alert" size={16} color="var(--red)"/>Intizom holati</div>
          <div style={{display:'flex',gap:24}}>
            <div style={{textAlign:'center'}}><div style={{fontSize:22,fontWeight:800,color:'var(--gold)'}}>{user.discipline.tanbex_count}/2</div><div style={{fontSize:11,color:'var(--td)'}}>Tanbex</div></div>
            <div style={{textAlign:'center'}}><div style={{fontSize:22,fontWeight:800,color:'var(--red)'}}>{user.discipline.vig_count}/3</div><div style={{fontSize:11,color:'var(--td)'}}>VIG</div></div>
          </div>
        </div>
      )}
      <div className="grid2">
        <div className="card">
          <div style={{fontSize:13,fontWeight:700,marginBottom:14,display:'flex',alignItems:'center',gap:8}}><Icon name="money" size={15} color="var(--green)"/>Moliya</div>
          <Row label="Naqd pul" val={`$${user.money_fmt}`} color="var(--green)"/>
          <Row label="Bank" val={`$${user.bank_fmt}`}/>
          <Row label="Donat" val={`${fmt(user.donate)} RUB`} last/>
        </div>
        <div className="card">
          <div style={{fontSize:13,fontWeight:700,marginBottom:14,display:'flex',alignItems:'center',gap:8}}><Icon name="chart" size={15} color="var(--blue)"/>Statistika</div>
          <Row label="Daraja" val={user.level}/>
          <Row label="Score (EXP)" val={user.score}/>
          <Row label="O'ynagan vaqti" val={`${user.totalhour} soat`} last/>
        </div>
        <div className="card">
          <div style={{fontSize:13,fontWeight:700,marginBottom:14,display:'flex',alignItems:'center',gap:8}}><Icon name="shield" size={15} color="var(--pl)"/>Holat</div>
          <Row label="HP" val={<span style={{display:'flex',alignItems:'center',gap:6}}><span style={{flex:1,height:4,background:'rgba(16,185,129,.2)',borderRadius:2,overflow:'hidden'}}><span style={{display:'block',height:'100%',width:`${user.health}%`,background:'var(--green)',borderRadius:2}}/></span>{user.health}/100</span>}/>
          <Row label="Ogohlantirish" val={`${user.warn||0}/3`} danger={user.warn>=2}/>
          <Row label="Qamoq" val={user.jail>0?`${user.jail} daqiqa`:"Yo'q"} last/>
        </div>
        <div className="card">
          <div style={{fontSize:13,fontWeight:700,marginBottom:14,display:'flex',alignItems:'center',gap:8}}><Icon name="info" size={15} color="var(--gold)"/>Ma'lumot</div>
          <Row label="Email" val={user.email||'—'}/>
          <Row label="Oxirgi kirish" val={user.last_login}/>
          <Row label="Discord" val={user.dc?.is_verified?<span style={{color:'var(--green)',display:'flex',alignItems:'center',gap:4}}><Icon name="check" size={12} color="var(--green)"/>Bog'langan</span>:"Bog'lanmagan"} last/>
        </div>
        {/* Kalitlar */}
        <div className="card" style={{gridColumn:'1/-1'}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:14,display:'flex',alignItems:'center',gap:8}}><Icon name="key" size={15} color="var(--gold)"/>Kalitlar</div>
          <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
            {[{type:'oddiy',label:'Oddiy',color:'var(--td)'},{type:'oltin',label:'Oltin',color:'var(--gold)'},{type:'pul',label:'Pul',color:'var(--green)'},{type:'exp',label:'EXP',color:'var(--blue)'},{type:'mashina',label:'Mashina',color:'var(--pl)'},{type:'avia',label:'Aviatsiya',color:'var(--red)'}].map(k=>(
              <div key={k.type} style={{textAlign:'center',background:'rgba(124,58,237,.06)',borderRadius:10,padding:'12px 16px',minWidth:80}}>
                <div style={{fontSize:20,fontWeight:800,color:k.color}}>{user.keys?.[k.type]||0}</div>
                <div style={{fontSize:11,color:'var(--td)',marginTop:3}}>{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ActivityTab(){
  const {getToken}=useAuth()
  const [data,setData]=useState(null)
  useEffect(()=>{api.get('admin/activity',{},api.authH(getToken())).then(setData)},[])
  if(!data) return <div className="loading"><div className="spin"></div></div>
  const StatBox=({label,val,color='var(--pl)'})=>(
    <div style={{background:'rgba(124,58,237,.06)',borderRadius:10,padding:14,textAlign:'center'}}>
      <div style={{fontSize:22,fontWeight:800,color}}>{val||0}</div>
      <div style={{fontSize:11,color:'var(--td)',marginTop:3}}>{label}</div>
    </div>
  )
  return (
    <div className="grid2">
      <div className="card">
        <div style={{fontWeight:700,marginBottom:14,display:'flex',alignItems:'center',gap:8}}><Icon name="zap" size={15} color="var(--gold)"/>Bugungi aktivlik</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <StatBox label="Online (daqiqa)" val={data.today?.online_minutes||0} color="var(--green)"/>
          <StatBox label="Reportlar" val={data.today?.reports_checked||0} color="var(--blue)"/>
          <StatBox label="Shikoyatlar" val={data.today?.complaints_closed||0} color="var(--gold)"/>
          <StatBox label="Jazolar" val={data.today?.punishments_given||0} color="var(--red)"/>
        </div>
      </div>
      <div className="card">
        <div style={{fontWeight:700,marginBottom:14,display:'flex',alignItems:'center',gap:8}}><Icon name="chart" size={15} color="var(--pl)"/>Haftalik aktivlik</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <StatBox label="Online (daqiqa)" val={data.week?.mins||0} color="var(--green)"/>
          <StatBox label="Reportlar" val={data.week?.reports||0} color="var(--blue)"/>
          <StatBox label="Shikoyatlar" val={data.week?.complaints||0} color="var(--gold)"/>
          <StatBox label="Jazolar" val={data.week?.punishments||0} color="var(--red)"/>
        </div>
      </div>
    </div>
  )
}

function KeysTab(){
  const {getToken}=useAuth()
  const [data,setData]=useState(null)
  const [loading,setLoading]=useState(true)
  const [opening,setOpening]=useState(null)
  const [busy,setBusy]=useState(false)
  const load=()=>api.get('keys',{},api.authH(getToken())).then(d=>{setData(d);setLoading(false)})
  useEffect(()=>{load()},[])

  const openCase = async kase => {
    setBusy(true)
    const d = await api.post('keys/open',{case_id:kase.id},api.authH(getToken()))
    setBusy(false)
    if(d.error){toast.error(d.error);return}
    // items ni kase.items dan olamiz (backend JSON parse qilib beradi)
    const items = Array.isArray(kase.items) ? kase.items : []
    setOpening({case:kase, items, winner:d.reward})
  }
  const finish = winner => {
    // onComplete chaqirilganda faqat toast ko'rsatamiz, yopmAYmiz
    // Foydalanuvchi o'zi "Yopish" tugmasini bosadi
    toast.success(`🎉 Tabriklaymiz! Siz yutdingiz: ${winner?.label||'Mukofot'}`)
    load() // Kalit sonini yangilaymiz
  }
  const closeOpening = () => setOpening(null)

  const keyMap={}; data?.keys?.forEach(k=>keyMap[k.key_type]=k.cnt)
  const caseColors={oddiy:'var(--td)',oltin:'var(--gold)',pul:'var(--green)',exp:'var(--blue)',mashina:'var(--pl)',avia:'var(--red)'}
  const caseIcons={oddiy:'key',oltin:'award',pul:'money',exp:'zap',mashina:'car',avia:'award'}
  const rarityC={common:'#9CA3AF',uncommon:'#22C55E',rare:'#3B82F6',epic:'#A855F7',legendary:'#F59E0B'}

  if(loading) return <div className="loading"><div className="spin"></div></div>
  return (
    <div>
      {opening && (
        <div className="card" style={{marginBottom:24,padding:'32px 20px',textAlign:'center'}}>
          <h3 style={{fontWeight:800,fontSize:18,marginBottom:20}}>{opening.case.name} ochilmoqda...</h3>
          <CaseOpening items={opening.items} winner={opening.winner} onComplete={finish}/>
          <button className="btn btn-outline btn-sm" onClick={()=>setOpening(null)} style={{marginTop:20}}>Yopish</button>
        </div>
      )}
      {/* Kalit soni */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:12,marginBottom:24}}>
        {[{type:'oddiy',label:'Oddiy'},{type:'oltin',label:'Oltin'},{type:'pul',label:'Pul'},{type:'exp',label:'EXP'},{type:'mashina',label:'Mashina'},{type:'avia',label:'Aviatsiya'}].map(k=>(
          <div key={k.type} className="card" style={{textAlign:'center',padding:16,borderColor:`${caseColors[k.type]}33`}}>
            <Icon name={caseIcons[k.type]} size={22} color={caseColors[k.type]}/>
            <div style={{fontSize:24,fontWeight:900,color:caseColors[k.type],margin:'8px 0 2px'}}>{keyMap[k.type]||0}</div>
            <div style={{fontSize:11,color:'var(--td)'}}>{k.label}</div>
          </div>
        ))}
      </div>
      {/* Case-lar */}
      <div className="grid2">
        {data?.cases?.map(c=>(
          <div key={c.id} className="card" style={{borderLeft:`3px solid ${caseColors[c.type]||'var(--b)'}`}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
              <Icon name={caseIcons[c.type]||'gift'} size={20} color={caseColors[c.type]||'var(--pl)'}/>
              <div style={{fontWeight:700,fontSize:15}}>{c.name}</div>
            </div>
            <p style={{fontSize:12,color:'var(--td)',marginBottom:12}}>{c.description}</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:14}}>
              {c.items?.map((it,i)=>(
                <span key={i} style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:12,border:`1px solid ${rarityC[it.rarity]||'#9CA3AF'}44`,color:rarityC[it.rarity]||'#9CA3AF',background:`${rarityC[it.rarity]||'#9CA3AF'}11`}}>{it.label}</span>
              ))}
            </div>
            <button className="btn btn-primary btn-sm" style={{width:'100%',justifyContent:'center',borderRadius:8,background:keyMap[c.type]>0?undefined:'rgba(124,58,237,.1)'}} disabled={busy||!keyMap[c.type]} onClick={()=>openCase(c)}>
              {busy?<div className="spin"></div>:keyMap[c.type]?<><Icon name="key" size={14}/>Ochish ({keyMap[c.type]} ta)</>:`${c.name} yo'q`}
            </button>
          </div>
        ))}
      </div>
      <p style={{textAlign:'center',fontSize:12,color:'var(--td)',marginTop:20}}>💡 90 daqiqa o'ynasangiz = 1 Oddiy kalit | 3 soat = 1 Oltin kalit</p>
    </div>
  )
}

function DiscordCard({user}){
  const {getToken}=useAuth()
  const [dcId,setDcId]=useState('')
  const [req,setReq]=useState(null)
  const [msg,setMsg]=useState('')
  const load=()=>api.get('auth/link-discord/status',{},api.authH(getToken())).then(d=>{if(d.success)setReq(d.request)})
  useEffect(()=>{load();const iv=setInterval(load,5000);return()=>clearInterval(iv)},[])

  const submit=async()=>{
    if(!/^\d{15,25}$/.test(dcId)){setMsg("To'g'ri Discord ID kiriting");return}
    const d=await api.post('auth/link-discord',{dc_user_id:dcId},api.authH(getToken()))
    if(d.error){setMsg(d.error);return}
    toast.success("So'rov yuborildi! Discord DM'ni tekshiring."); setDcId(''); setMsg(''); load()
  }
  if(user.dc?.is_verified) return (
    <div className="card">
      <div style={{fontSize:14,fontWeight:700,marginBottom:10,display:'flex',alignItems:'center',gap:8}}><Icon name="discord" size={16}/>Discord</div>
      <span className="badge badge-green"><Icon name="check" size={11}/>Bog'langan: {user.dc.dc_username}</span>
    </div>
  )
  return (
    <div className="card">
      <div style={{fontSize:14,fontWeight:700,marginBottom:10,display:'flex',alignItems:'center',gap:8}}><Icon name="discord" size={16}/>Discord bog'lash</div>
      {msg && <div className="alert alert-err" style={{fontSize:12,padding:'8px 12px'}}>{msg}</div>}
      {req?.status==='sent' && <div className="alert alert-info" style={{fontSize:12,padding:'8px 12px'}}><Icon name="bell" size={13}/>Discord DM'ni tekshiring — Ha/Yo'q tugmalar yuborildi!</div>}
      {req?.status==='rejected' && <div className="alert alert-err" style={{fontSize:12,padding:'8px 12px'}}>Oxirgi so'rov rad etildi.</div>}
      <p style={{fontSize:12,color:'var(--td)',marginBottom:10}}>Discord ID kiriting → Bot sizga DM yuboradi → Ha tugmasini bosing</p>
      <div style={{display:'flex',gap:8}}>
        <input className="inp" placeholder="Discord ID (faqat raqamlar)" value={dcId} onChange={e=>setDcId(e.target.value)}/>
        <button className="btn btn-primary btn-sm" onClick={submit} style={{whiteSpace:'nowrap'}}>Yuborish</button>
      </div>
      <p style={{fontSize:11,color:'var(--td)',marginTop:8}}>Discord ID olish: Sozlamalar → Rivojlantiruvchi rejimi → Profilingizga o'ng klik → ID nusxalash</p>
    </div>
  )
}

function SessionsCard(){
  const {getToken}=useAuth()
  const [sessions,setSessions]=useState([])
  const load=()=>api.get('auth/sessions',{},api.authH(getToken())).then(d=>{if(d.success)setSessions(d.sessions)})
  useEffect(()=>{load()},[])
  const revoke=async id=>{await api.post('auth/sessions/revoke',{id},api.authH(getToken()));toast.success('Sessiya chiqarildi');load()}
  return (
    <div className="card">
      <div style={{fontSize:14,fontWeight:700,marginBottom:12,display:'flex',alignItems:'center',gap:8}}><Icon name="lock" size={15}/>Faol sessiyalar</div>
      {sessions.map(s=>(
        <div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid rgba(124,58,237,.07)'}}>
          <div>
            <div style={{fontSize:12,fontWeight:600}}>{s.device} {s.remember_me==1&&<span className="badge badge-p" style={{fontSize:9,padding:'1px 6px'}}>30 kun</span>}</div>
            <div style={{fontSize:11,color:'var(--td)'}}>{s.ip} • {new Date(s.last_active).toLocaleString('uz-UZ')}</div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={()=>revoke(s.id)}>Chiqar</button>
        </div>
      ))}
      {sessions.length===0 && <div style={{textAlign:'center',color:'var(--td)',fontSize:13,padding:16}}>Faol sessiya yo'q</div>}
    </div>
  )
}

function LoginHistoryCard(){
  const {getToken}=useAuth()
  const [history,setHistory]=useState([])
  useEffect(()=>{api.get('auth/login-history',{},api.authH(getToken())).then(d=>{if(d.success)setHistory(d.history)})},[])
  return (
    <div className="card">
      <div style={{fontSize:14,fontWeight:700,marginBottom:12,display:'flex',alignItems:'center',gap:8}}><Icon name="clock" size={15}/>Login tarixi</div>
      <div style={{maxHeight:240,overflowY:'auto'}}>
        {history.map((h,i)=>(
          <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:i<history.length-1?'1px solid rgba(124,58,237,.07)':'none'}}>
            <div>
              <div style={{fontSize:12,fontWeight:600}}>{h.device} {h.suspicious==1&&<span style={{color:'var(--red)'}}>⚠️</span>}</div>
              <div style={{fontSize:11,color:'var(--td)'}}>{h.ip} • {new Date(h.created_at).toLocaleString('uz-UZ')}</div>
            </div>
            <span className={`badge ${h.success==1?'badge-green':'badge-red'}`}>{h.success==1?'OK':'Xato'}</span>
          </div>
        ))}
        {history.length===0&&<div style={{textAlign:'center',color:'var(--td)',fontSize:13,padding:16}}>Tarix yo'q</div>}
      </div>
    </div>
  )
}

function SettingsTab({user,refreshUser}){
  const {getToken}=useAuth()
  const [oldPass,setOldPass]=useState('')
  const [newPass,setNewPass]=useState('')
  const [newEmail,setNewEmail]=useState('')
  const [emailPass,setEmailPass]=useState('')
  const [msg,setMsg]=useState({type:'',text:''})

  const changePassword=async e=>{
    e.preventDefault()
    const d=await api.post('auth/change-password',{old_password:oldPass,new_password:newPass},api.authH(getToken()))
    if(d.error){setMsg({type:'err',text:d.error});return}
    setMsg({type:'ok',text:"Parol o'zgartirildi!"}); toast.success("Parol o'zgartirildi!"); setOldPass('');setNewPass('')
  }
  const changeEmail=async e=>{
    e.preventDefault()
    const d=await api.post('auth/change-email',{new_email:newEmail,password:emailPass},api.authH(getToken()))
    if(d.error){setMsg({type:'err',text:d.error});return}
    setMsg({type:'ok',text:"Email o'zgartirildi!"}); toast.success("Email o'zgartirildi!"); setNewEmail('');setEmailPass(''); refreshUser()
  }

  return (
    <div>
      {msg.text&&<div className={`alert alert-${msg.type==='ok'?'ok':'err'}`} style={{marginBottom:16}}>{msg.text}</div>}
      <div className="grid2">
        <DiscordCard user={user}/>
        <SessionsCard/>
        <LoginHistoryCard/>
        <div className="card">
          <div style={{fontSize:14,fontWeight:700,marginBottom:14,display:'flex',alignItems:'center',gap:8}}><Icon name="lock" size={15}/>Parol o'zgartirish</div>
          <form onSubmit={changePassword}>
            <input className="inp" type="password" placeholder="Joriy parol" value={oldPass} onChange={e=>setOldPass(e.target.value)} required style={{marginBottom:10}}/>
            <input className="inp" type="password" placeholder="Yangi parol (kamida 6 belgi)" value={newPass} onChange={e=>setNewPass(e.target.value)} required style={{marginBottom:14}}/>
            <button className="btn btn-primary btn-sm" style={{borderRadius:8}}>O'zgartirish</button>
          </form>
        </div>
        <div className="card">
          <div style={{fontSize:14,fontWeight:700,marginBottom:14,display:'flex',alignItems:'center',gap:8}}><Icon name="edit" size={15}/>Email o'zgartirish</div>
          <form onSubmit={changeEmail}>
            <input className="inp" type="email" placeholder="Yangi email" value={newEmail} onChange={e=>setNewEmail(e.target.value)} required style={{marginBottom:10}}/>
            <input className="inp" type="password" placeholder="Joriy parol" value={emailPass} onChange={e=>setEmailPass(e.target.value)} required style={{marginBottom:14}}/>
            <button className="btn btn-primary btn-sm" style={{borderRadius:8}}>O'zgartirish</button>
          </form>
        </div>
      </div>
    </div>
  )
}