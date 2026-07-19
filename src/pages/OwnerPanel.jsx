import { useState, useEffect } from 'react'
import { Icon } from '../components/Icons'
import api, { adminLvl, uploadFile } from '../utils/api'
import { toast } from '../components/Toast'

const STATUS = {ochiq:'Ochiq',korilmoqda:"Ko'rilmoqda",yopiq:'Yopiq',rad:'Rad',arxiv:'Arxiv'}

export default function OwnerPanel() {
  const [auth, setAuth] = useState(false)
  const [login, setLogin] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [section, setSection] = useState('dashboard')

  useEffect(() => {
    const s = sessionStorage.getItem('owner_auth')
    if (s) { const {l,p}=JSON.parse(s); setLogin(l); setPass(p); setAuth(true) }
  }, [])

  const doLogin = async e => {
    e.preventDefault()
    const d = await api.post('owner/login', {login, password:pass})
    if (d.error) { setErr(d.error); return }
    sessionStorage.setItem('owner_auth', JSON.stringify({l:login,p:pass})); setAuth(true)
  }

  if (!auth) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'radial-gradient(ellipse 60% 50% at 50% 0%,rgba(124,58,237,.15),transparent)'}}>
      <div style={{width:'100%',maxWidth:400,padding:'0 20px'}}>
        <div className="card" style={{padding:36}}>
          <div style={{textAlign:'center',marginBottom:24}}>
            <div style={{width:56,height:56,borderRadius:16,background:'linear-gradient(135deg,#F59E0B,#D97706)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',boxShadow:'0 8px 24px rgba(245,158,11,.3)'}}>
              <Icon name="crown" size={28} color="#fff"/>
            </div>
            <h2 style={{fontSize:22,fontWeight:800}}>Owner Panel</h2>
          </div>
          {err && <div className="alert alert-err">{err}</div>}
          <form onSubmit={doLogin}>
            <input className="inp" placeholder="Login" value={login} onChange={e=>setLogin(e.target.value)} style={{marginBottom:10}} required/>
            <input className="inp" type="password" placeholder="Parol" value={pass} onChange={e=>setPass(e.target.value)} style={{marginBottom:16}} required/>
            <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:12,borderRadius:10}}>Kirish</button>
          </form>
        </div>
      </div>
    </div>
  )

  const headers = api.ownerH(login, pass)
  const secs = [
    {id:'dashboard',label:'Dashboard',icon:'chart'},
    {id:'news',label:'Yangiliklar',icon:'news'},
    {id:'complaints',label:'Shikoyatlar',icon:'alert'},
    {id:'players',label:"O'yinchilar",icon:'users'},
    {id:'admins',label:'Adminlar',icon:'shield'},
    {id:'activity',label:'Faollik',icon:'activity'},
    {id:'commands',label:'Buyruqlar',icon:'zap'},
    {id:'support',label:"Yordam so'rovlari",icon:'support'},
    {id:'discipline',label:'Tanbex/VIG',icon:'alert'},
    {id:'keys',label:'Kalitlar',icon:'key'},
    {id:'curators',label:'Kuratorlar',icon:'user'},
    {id:'permissions',label:'Ruxsatlar',icon:'lock'},
    {id:'applications',label:'Arizalar',icon:'file'},
    {id:'blacklist',label:'ChSA',icon:'ban'},
    {id:'apk',label:'APK',icon:'android'},
    {id:'settings',label:'Sozlamalar',icon:'settings'},
    {id:'logs',label:'Loglar',icon:'list'},
  ]

  return (
    <div style={{paddingTop:66}}>
      <div className="sidebar-layout">
        <div className="sidebar">
          <div style={{padding:'16px 12px 8px',fontSize:10,color:'var(--td)',fontWeight:700,letterSpacing:1,textTransform:'uppercase'}}>Owner Panel</div>
          {secs.map(s=>(
            <button key={s.id} className={`sidebar-item ${section===s.id?'active':''}`} onClick={()=>setSection(s.id)}>
              <Icon name={s.icon} size={15}/>{s.label}
            </button>
          ))}
          <div style={{borderTop:'1px solid var(--b)',margin:'12px 0 0'}}/>
          <button className="sidebar-item" onClick={()=>{sessionStorage.removeItem('owner_auth');setAuth(false)}} style={{color:'var(--red)'}}>
            <Icon name="logout" size={15}/>Chiqish
          </button>
        </div>
        <div className="sidebar-content">
          {section==='dashboard'   && <DashboardSec/>}
          {section==='news'        && <NewsSec headers={headers}/>}
          {section==='complaints'  && <ComplaintsSec headers={headers}/>}
          {section==='players'     && <PlayersSec headers={headers}/>}
          {section==='admins'      && <AdminsSec/>}
          {section==='activity'    && <ActivitySec headers={headers}/>}
          {section==='commands'    && <CommandsSec headers={headers}/>}
          {section==='support'     && <SupportSec headers={headers}/>}
          {section==='discipline'  && <DisciplineSec headers={headers}/>}
          {section==='keys'        && <KeysSec headers={headers}/>}
          {section==='curators'    && <CuratorsSec headers={headers}/>}
          {section==='permissions' && <PermissionsSec headers={headers}/>}
          {section==='applications'&& <ApplicationsSec headers={headers}/>}
          {section==='blacklist'   && <BlacklistSec headers={headers}/>}
          {section==='apk'         && <ApkSec headers={headers}/>}
          {section==='settings'    && <SettingsSec headers={headers}/>}
          {section==='logs'        && <LogsSec headers={headers}/>}
        </div>
      </div>
    </div>
  )
}

function SH({title,children}) { return <><h2 style={{fontSize:22,fontWeight:800,marginBottom:6}}>{title}</h2>{children}</> }

function DashboardSec() {
  const [stats,setStats]=useState(null)
  useEffect(()=>{ api.get('stats').then(d=>{if(d.success)setStats(d.stats)}) },[])
  const cards=[{label:"O'yinchilar",val:stats?.total_players,icon:'users',color:'var(--pl)'},{label:'Onlayn',val:stats?.online_players,icon:'zap',color:'var(--green)'},{label:'Adminlar',val:stats?.total_admins,icon:'shield',color:'var(--gold)'},{label:'Ochiq shikoyat',val:stats?.open_complaints,icon:'alert',color:'var(--red)'}]
  return <SH title="Dashboard">
    <div className="grid4" style={{marginTop:16}}>
      {cards.map((c,i)=>(
        <div key={i} className="card" style={{textAlign:'center',borderColor:`${c.color}33`}}>
          <Icon name={c.icon} size={24} color={c.color}/>
          <div style={{fontSize:28,fontWeight:900,color:c.color,margin:'8px 0 4px'}}>{c.val||0}</div>
          <div style={{fontSize:12,color:'var(--td)'}}>{c.label}</div>
        </div>
      ))}
    </div>
  </SH>
}

function NewsSec({headers}) {
  const [news,setNews]=useState([])
  const [mode,setMode]=useState('list')
  const [title,setTitle]=useState(''),  [content,setContent]=useState(''), [htmlC,setHtmlC]=useState(''), [cssC,setCssC]=useState('')
  const [cat,setCat]=useState('Yangilik'), [imgUrl,setImgUrl]=useState(''), [vidUrl,setVidUrl]=useState('')
  const [gallery,setGallery]=useState([]), [edTab,setEdTab]=useState('content'), [uploading,setUploading]=useState(false)

  const load=()=>api.get('news',{limit:50}).then(d=>{if(d.success)setNews(d.news)})
  useEffect(()=>{load()},[])

  const uploadImg=async e=>{const f=e.target.files[0];if(!f)return;setUploading(true);const d=await uploadFile(f,'image');setUploading(false);if(d.success)setImgUrl(d.url)}
  const uploadVid=async e=>{const f=e.target.files[0];if(!f)return;setUploading(true);const d=await uploadFile(f,'video');setUploading(false);if(d.success)setVidUrl(d.url)}
  const uploadGallery=async e=>{const files=Array.from(e.target.files);setUploading(true);for(const f of files){const d=await uploadFile(f,'image');if(d.success)setGallery(p=>[...p,d.url])};setUploading(false)}

  const submit=async()=>{
    if(!title||!content){toast.error('Sarlavha va matn kerak');return}
    const d=await api.post('owner/news',{title,content,html_content:htmlC,css_content:cssC,image_url:imgUrl,video_url:vidUrl,gallery,category:cat},headers)
    if(d.error){toast.error(d.error);return}
    toast.success('Yangilik yaratildi!'); setTitle('');setContent('');setHtmlC('');setCssC('');setImgUrl('');setVidUrl('');setGallery([]);load();setMode('list')
  }
  const del=async id=>{if(!confirm("O'chirilsinmi?"))return;await api.post('owner/news/delete',{id},headers);load()}
  const pin=async(id,pinned)=>{await api.post('owner/news/pin',{id,pinned:!pinned},headers);load()}

  if(mode==='list') return (
    <SH title="Yangiliklar">
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:16}}>
        <button className="btn btn-primary btn-sm" onClick={()=>setMode('create')} style={{borderRadius:8}}><Icon name="plus" size={14}/>Yangi yangilik</button>
      </div>
      {news.map(n=>(
        <div key={n.id} className="card" style={{marginBottom:10,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
          <div>
            <div style={{fontWeight:700,display:'flex',alignItems:'center',gap:8}}>{n.title} {n.pinned==1&&<Icon name="pin" size={12} color="var(--gold)"/>}</div>
            <div style={{fontSize:12,color:'var(--td)',marginTop:2}}>{n.category} • {new Date(n.created_at).toLocaleDateString('uz-UZ')} • {n.views} ko'rildi</div>
          </div>
          <div style={{display:'flex',gap:6}}>
            <button className="btn btn-outline btn-sm" onClick={()=>pin(n.id,n.pinned)} style={{borderRadius:8}}><Icon name="pin" size={12}/></button>
            <button className="btn btn-danger btn-sm" onClick={()=>del(n.id)} style={{borderRadius:8}}><Icon name="trash" size={12}/></button>
          </div>
        </div>
      ))}
    </SH>
  )

  return (
    <SH title="Yangi yangilik">
      <button className="btn btn-outline btn-sm" onClick={()=>setMode('list')} style={{marginBottom:16,borderRadius:8}}>← Orqaga</button>
      <div className="grid2" style={{marginBottom:12}}>
        <input className="inp" placeholder="Sarlavha" value={title} onChange={e=>setTitle(e.target.value)}/>
        <select className="inp" value={cat} onChange={e=>setCat(e.target.value)}>
          {['Yangilik','Yangilanish','Event','Muhim'].map(c=><option key={c}>{c}</option>)}
        </select>
      </div>
      <textarea className="inp" placeholder="Qisqacha matn" value={content} onChange={e=>setContent(e.target.value)} rows={2} style={{marginBottom:12}}/>
      <div className="grid3" style={{marginBottom:12}}>
        <div><label style={{fontSize:11,color:'var(--td)',marginBottom:4,display:'block'}}>Asosiy rasm</label><input type="file" accept="image/*" onChange={uploadImg}/>{imgUrl&&<img src={imgUrl} alt="" style={{height:48,borderRadius:6,marginTop:6}}/>}</div>
        <div><label style={{fontSize:11,color:'var(--td)',marginBottom:4,display:'block'}}>Video</label><input type="file" accept="video/*" onChange={uploadVid}/>{vidUrl&&<video src={vidUrl} style={{height:48,borderRadius:6,marginTop:6}}/>}</div>
        <div><label style={{fontSize:11,color:'var(--td)',marginBottom:4,display:'block'}}>Galereya</label><input type="file" accept="image/*" multiple onChange={uploadGallery}/>{gallery.length>0&&<span style={{fontSize:11,color:'var(--green)'}}>{gallery.length} ta rasm</span>}</div>
      </div>
      {uploading&&<div className="alert alert-info" style={{fontSize:12,marginBottom:12}}><div className="spin"></div>Yuklanmoqda...</div>}
      <div style={{background:'#1E1E2E',borderRadius:12,border:'1px solid var(--b)',overflow:'hidden',marginBottom:14}}>
        <div style={{display:'flex',borderBottom:'1px solid var(--b)'}}>
          {['content','css'].map(t=>(
            <button key={t} onClick={()=>setEdTab(t)} style={{padding:'9px 18px',background:edTab===t?'#252540':'transparent',border:'none',color:edTab===t?'#fff':'var(--td)',fontSize:12,fontWeight:700,cursor:'pointer'}}>
              {t==='content'?'index.html':'style.css'}
            </button>
          ))}
        </div>
        <textarea className="code-editor" style={{borderRadius:0,border:'none'}} rows={14}
          placeholder={edTab==='content'?'<h2>Yangilik matni...</h2>':'.news-content h2 { color: red; }'}
          value={edTab==='content'?htmlC:cssC} onChange={e=>edTab==='content'?setHtmlC(e.target.value):setCssC(e.target.value)}/>
      </div>
      <button className="btn btn-primary" onClick={submit} style={{borderRadius:10}}><Icon name="send" size={15}/>Nashr qilish</button>
    </SH>
  )
}

function ComplaintsSec({headers}) {
  const [list,setList]=useState([]),  [filter,setFilter]=useState('')
  const load=()=>api.get('complaints/admin',filter?{status:filter}:{},headers).then(d=>{if(d.success)setList(d.complaints)})
  useEffect(()=>{load()},[filter])
  const close=async(id,st)=>{await api.post('complaints/close',{id,status:st},headers);load()}
  const del=async id=>{if(!confirm("O'chirilsinmi?"))return;await api.post('complaints/delete',{id},headers);load()}
  return (
    <SH title="Barcha shikoyatlar">
      <div style={{display:'flex',gap:8,margin:'12px 0 16px',flexWrap:'wrap'}}>
        {['','ochiq','korilmoqda','yopiq'].map(s=>(
          <button key={s} onClick={()=>setFilter(s)} className="btn btn-sm" style={{background:filter===s?'var(--p)':'transparent',border:'1px solid var(--b)',color:filter===s?'#fff':'var(--td)',borderRadius:8}}>{s===''?'Barchasi':STATUS[s]}</button>
        ))}
      </div>
      {list.map(c=>{
        const imgs=Array.isArray(c.images)?c.images.filter(Boolean):(c.images||'').split(',').filter(Boolean)
        return (
          <div key={c.id} className="card" style={{marginBottom:10}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8,flexWrap:'wrap',gap:6}}>
              <span><b>{c.from_player}</b> → <b style={{color:'var(--pl)'}}>{c.to_player}</b> <span style={{fontSize:11,color:'var(--td)'}}>#{c.id}</span></span>
              <span className={`badge ${c.status==='ochiq'?'status-ochiq':c.status==='yopiq'?'status-yopiq':'status-korilmoqda'}`}>{STATUS[c.status]||c.status}</span>
            </div>
            <p style={{fontSize:13,color:'var(--td)',marginBottom:8}}>{c.description}</p>
            {imgs.length>0&&<div style={{display:'flex',gap:6,marginBottom:8,flexWrap:'wrap'}}>{imgs.map((img,i)=><a key={i} href={img} target="_blank" rel="noreferrer"><img src={img} alt="" style={{width:52,height:52,objectFit:'cover',borderRadius:7}}/></a>)}</div>}
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {c.status!=='yopiq'&&<button className="btn btn-success btn-sm" onClick={()=>close(c.id,'yopiq')} style={{borderRadius:8}}>Yopish</button>}
              <button className="btn btn-danger btn-sm" onClick={()=>del(c.id)} style={{borderRadius:8}}>O'chirish</button>
            </div>
          </div>
        )
      })}
      {list.length===0&&<div style={{textAlign:'center',color:'var(--td)',padding:40}}>Yo'q</div>}
    </SH>
  )
}

function PlayersSec({headers}) {
  const [players,setPlayers]=useState([]),  [search,setSearch]=useState('')
  const load=()=>api.get('players',search?{search}:{},headers).then(d=>{if(d.success)setPlayers(d.players)})
  useEffect(()=>{load()},[])
  return (
    <SH title="O'yinchilar">
      <div style={{display:'flex',gap:8,margin:'12px 0 16px'}}>
        <input className="inp" placeholder="Nick bo'yicha qidirish..." value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:280}} onKeyDown={e=>e.key==='Enter'&&load()}/>
        <button className="btn btn-primary btn-sm" onClick={load} style={{borderRadius:8}}><Icon name="search" size={14}/>Qidirish</button>
      </div>
      <div className="card" style={{padding:0,overflow:'auto'}}>
        <table><thead><tr><th>Nick</th><th>Daraja</th><th>Pul</th><th>Admin</th><th>Warn</th><th>Holat</th></tr></thead>
          <tbody>{players.map(p=>(
            <tr key={p.id}>
              <td style={{fontWeight:700}}>{p.name}</td><td>{p.level}</td><td style={{color:'var(--green)'}}>${p.money_fmt}</td>
              <td>{p.admin>0?<span className="badge badge-p" style={{fontSize:10}}>{adminLvl[p.admin]}</span>:'—'}</td>
              <td style={{color:p.warn>0?'var(--red)':'var(--td)'}}>{p.warn||0}/3</td>
              <td>{p.online==1?<span style={{color:'var(--green)',fontSize:11}}>● Onlayn</span>:<span style={{color:'var(--td)',fontSize:11}}>Oflayn</span>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </SH>
  )
}

function AdminsSec() {
  const [admins,setAdmins]=useState([])
  useEffect(()=>{api.get('admins').then(d=>{if(d.success)setAdmins(d.admins)})},[])
  return (
    <SH title="Adminlar">
      <div className="card" style={{padding:0,overflow:'auto',marginTop:16}}>
        <table><thead><tr><th>Nick</th><th>Daraja</th><th>Vaqt</th><th>Holat</th></tr></thead>
          <tbody>{admins.map(a=>(
            <tr key={a.name}>
              <td style={{fontWeight:700}}>{a.name}</td>
              <td><span className="badge badge-p" style={{fontSize:10}}>{adminLvl[a.admin]}</span></td>
              <td style={{color:'var(--td)'}}>{a.totalhour||0}s</td>
              <td>{a.online==1?<span style={{color:'var(--green)',fontSize:11}}>● Onlayn</span>:<span style={{color:'var(--td)',fontSize:11}}>Oflayn</span>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </SH>
  )
}

function ActivitySec({headers}) {
  const [period,setPeriod]=useState('today'),  [data,setData]=useState([])
  useEffect(()=>{api.get('owner/activities',{period},headers).then(d=>{if(d.success)setData(d.activities)})},[period])
  return (
    <SH title="Adminlar faolligi">
      <div style={{display:'flex',gap:8,margin:'12px 0 16px'}}>
        {['today','week'].map(p=>(
          <button key={p} onClick={()=>setPeriod(p)} className="btn btn-sm" style={{background:period===p?'var(--p)':'transparent',border:'1px solid var(--b)',color:period===p?'#fff':'var(--td)',borderRadius:8}}>{p==='today'?'Bugun':'Haftalik'}</button>
        ))}
      </div>
      <div className="card" style={{padding:0,overflow:'auto'}}>
        <table><thead><tr><th>Nick</th><th>Daraja</th><th>Online (daqiqa)</th><th>Reportlar</th><th>Jazolar</th><th>Holat</th></tr></thead>
          <tbody>{data.map(a=>(
            <tr key={a.name}>
              <td style={{fontWeight:700}}>{a.name}</td>
              <td><span className="badge badge-p" style={{fontSize:10}}>{adminLvl[a.admin]}</span></td>
              <td style={{color:'var(--green)'}}>{a.mins||0}</td>
              <td>{a.reports||0}</td>
              <td style={{color:a.punishments>0?'var(--pl)':'var(--td)'}}>{a.punishments||0}</td>
              <td>{a.online==1?<span style={{color:'var(--green)',fontSize:11}}>● Onlayn</span>:<span style={{color:'var(--td)',fontSize:11}}>Oflayn</span>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </SH>
  )
}

function CommandsSec({headers}) {
  const [action,setAction]=useState('makeadmin'), [target,setTarget]=useState(''), [value,setValue]=useState(''), [msg,setMsg]=useState({type:'',text:''})
  const RANKS=[{v:1,l:'Yangi Admin'},{v:2,l:'Admin 1'},{v:3,l:'Admin 2'},{v:4,l:'Admin 3'},{v:5,l:'Admin 4'},{v:6,l:'Admin 5'},{v:7,l:'Katta Admin'},{v:8,l:'Bosh Admin'},{v:9,l:'Maxsus Administrator'},{v:10,l:'Kurator'},{v:11,l:'Server Kuratori'}]
  const actions=[
    {id:'makeadmin',label:'Admin qilish',rankSelect:true},{id:'unadmin',label:"Admin'likdan olish",noValue:true},
    {id:'setlevel',label:'Daraja',vl:'Daraja (1-100)'},{id:'givemoney',label:'Pul berish',vl:'Miqdor'},
    {id:'takemoney',label:'Pul olish',vl:'Miqdor'},{id:'givedonate',label:'Donat berish',vl:'RUB miqdori'},
    {id:'ban',label:'Ban',vl:'Vaqt'},{id:'unban',label:'Unban',noValue:true},
    {id:'givekey',label:'Kalit berish',vl:'Kalit nomi (oddiy/oltin/pul/exp/mashina/avia)'},
    {id:'deleteaccount',label:"Akkauntni o'chirish",noValue:true},
  ]
  const cur=actions.find(a=>a.id===action)
  const submit=async e=>{
    e.preventDefault()
    const d=await api.post('admin/command',{action,target,value},headers)
    if(d.error){setMsg({type:'err',text:d.error});return}
    setMsg({type:'ok',text:d.message}); toast.success(d.message); setTarget('');setValue('')
  }
  return (
    <SH title="Owner buyruqlari">
      <div className="card" style={{maxWidth:520,marginTop:16}}>
        {msg.text&&<div className={`alert alert-${msg.type==='ok'?'ok':'err'}`}>{msg.text}</div>}
        <form onSubmit={submit}>
          <select className="inp" value={action} onChange={e=>setAction(e.target.value)} style={{marginBottom:12}}>{actions.map(a=><option key={a.id} value={a.id}>{a.label}</option>)}</select>
          <input className="inp" placeholder="Nick" value={target} onChange={e=>setTarget(e.target.value)} style={{marginBottom:12}} required/>
          {!cur?.noValue && cur?.rankSelect && <select className="inp" value={value} onChange={e=>setValue(e.target.value)} style={{marginBottom:16}} required><option value="">Darajani tanlang</option>{RANKS.map(r=><option key={r.v} value={r.v}>{r.l}</option>)}</select>}
          {!cur?.noValue && !cur?.rankSelect && <input className="inp" placeholder={cur?.vl} value={value} onChange={e=>setValue(e.target.value)} style={{marginBottom:16}} required/>}
          <button className="btn btn-primary" style={{borderRadius:10}}>Bajarish</button>
        </form>
      </div>
    </SH>
  )
}

function SupportSec({headers}) {
  const [tickets,setTickets]=useState([]), [status,setStatus]=useState('ochiq'), [reply,setReply]=useState({})
  const load=()=>api.get('owner/support',{status},headers).then(d=>{if(d.success)setTickets(d.tickets)})
  useEffect(()=>{load()},[status])
  const send=async id=>{if(!reply[id])return;await api.post('owner/support/reply',{id,reply:reply[id],status:'yopiq'},headers);toast.success('Javob yuborildi');load()}
  return (
    <SH title="Yordam so'rovlari">
      <div style={{display:'flex',gap:8,margin:'12px 0 16px'}}>
        {['ochiq','jarayonda','yopiq'].map(s=>(
          <button key={s} onClick={()=>setStatus(s)} className="btn btn-sm" style={{background:status===s?'var(--p)':'transparent',border:'1px solid var(--b)',color:status===s?'#fff':'var(--td)',borderRadius:8}}>{s}</button>
        ))}
      </div>
      {tickets.map(t=>(
        <div key={t.id} className="card" style={{marginBottom:12}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:8,flexWrap:'wrap',gap:6}}>
            <div><b>{t.player_name}</b> <span className="badge badge-p" style={{fontSize:10}}>{t.category}</span></div>
            <span className={`badge ${t.status==='yopiq'?'status-yopiq':'status-ochiq'}`}>{t.status}</span>
          </div>
          <div style={{fontWeight:700,marginBottom:4}}>{t.subject}</div>
          <p style={{fontSize:13,color:'var(--td)',marginBottom:10}}>{t.message}</p>
          {t.admin_reply ? <div style={{background:'rgba(16,185,129,.06)',borderRadius:8,padding:'10px 14px',fontSize:13}}><b>Javob ({t.closed_by}):</b> {t.admin_reply}</div>
            : <div style={{display:'flex',gap:8}}><input className="inp" placeholder="Javob yozing..." value={reply[t.id]||''} onChange={e=>setReply({...reply,[t.id]:e.target.value})} style={{flex:1}}/><button className="btn btn-primary btn-sm" onClick={()=>send(t.id)} style={{borderRadius:8}}><Icon name="send" size={13}/>Yuborish</button></div>}
        </div>
      ))}
      {tickets.length===0&&<div style={{textAlign:'center',color:'var(--td)',padding:40}}>So'rov yo'q</div>}
    </SH>
  )
}

function DisciplineSec({headers}) {
  const [list,setList]=useState([]), [former,setFormer]=useState([]), [nick,setNick]=useState(''), [reason,setReason]=useState(''), [msg,setMsg]=useState('')
  const load=()=>{api.get('owner/discipline',{},headers).then(d=>{if(d.success)setList(d.list)});api.get('owner/former-admins',{},headers).then(d=>{if(d.success)setFormer(d.list)})}
  useEffect(()=>{load()},[])
  const giveTanbex=async()=>{if(!nick||!reason)return;const d=await api.post('admin/tanbex',{player_name:nick,reason},headers);setMsg(d.message||'Tanbex berildi!');setNick('');setReason('');load()}
  const giveVig=async()=>{if(!nick||!reason)return;await api.post('admin/vig',{player_name:nick,reason},headers);setMsg('VIG berildi!');setNick('');setReason('');load()}
  const remTanbex=async n=>{const r=prompt('Sabab:')||'';await api.post('admin/tanbex/remove',{player_name:n,reason:r},headers);load()}
  const remVig=async n=>{const r=prompt('Sabab:')||'';await api.post('admin/vig/remove',{player_name:n,reason:r},headers);load()}
  const returnAdmin=async n=>{const l=prompt('Qaysi daraja? (1-11)','1');if(!l)return;await api.post('owner/former-admins/return',{player_name:n,level:parseInt(l)},headers);load()}
  return (
    <SH title="Tanbex / VIG tizimi">
      <p style={{fontSize:13,color:'var(--td)',margin:'8px 0 16px'}}>2 ta tanbex = 1 ta VIG • 3 ta VIG = adminlikdan olib tashlash</p>
      {msg&&<div className="alert alert-info">{msg}</div>}
      <div className="card" style={{maxWidth:500,marginBottom:20}}>
        <input className="inp" placeholder="Admin nicki" value={nick} onChange={e=>setNick(e.target.value)} style={{marginBottom:10}}/>
        <input className="inp" placeholder="Sabab" value={reason} onChange={e=>setReason(e.target.value)} style={{marginBottom:14}}/>
        <div style={{display:'flex',gap:8}}><button className="btn btn-outline btn-sm" onClick={giveTanbex} style={{borderRadius:8}}>Tanbex berish</button><button className="btn btn-danger btn-sm" onClick={giveVig} style={{borderRadius:8}}>To'g'ridan VIG</button></div>
      </div>
      <h3 style={{fontSize:15,fontWeight:700,marginBottom:12}}>Faol tanbex/vig'lar</h3>
      {list.map(l=>(
        <div key={l.player_name} className="card" style={{marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
          <div><b>{l.player_name}</b> — Tanbex: <b style={{color:'var(--gold)'}}>{l.tanbex_count}/2</b> | VIG: <b style={{color:'var(--red)'}}>{l.vig_count}/3</b></div>
          <div style={{display:'flex',gap:6}}>
            {l.tanbex_count>0&&<button className="btn btn-outline btn-sm" onClick={()=>remTanbex(l.player_name)} style={{borderRadius:8}}>Tanbex olish</button>}
            {l.vig_count>0&&<button className="btn btn-outline btn-sm" onClick={()=>remVig(l.player_name)} style={{borderRadius:8}}>VIG olish</button>}
          </div>
        </div>
      ))}
      {list.length===0&&<p style={{color:'var(--td)',fontSize:13}}>Yo'q</p>}
      <h3 style={{fontSize:15,fontWeight:700,margin:'20px 0 12px'}}>Adminlikdan ketganlar</h3>
      {former.map(f=>(
        <div key={f.id} className="card" style={{marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
          <div><b>{f.player_name}</b> — {f.reason} <span style={{fontSize:11,color:'var(--td)'}}>({new Date(f.removed_at).toLocaleDateString('uz-UZ')})</span></div>
          <button className="btn btn-success btn-sm" onClick={()=>returnAdmin(f.player_name)} style={{borderRadius:8}}>Qaytarish</button>
        </div>
      ))}
      {former.length===0&&<p style={{color:'var(--td)',fontSize:13}}>Yo'q</p>}
    </SH>
  )
}

function KeysSec({headers}) {
  const [nick,setNick]=useState(''), [type,setType]=useState('oddiy'), [count,setCount]=useState('1'), [msg,setMsg]=useState('')
  const give=async()=>{if(!nick)return;const d=await api.post('owner/keys/give',{player_name:nick,key_type:type,count:parseInt(count)||1},headers);if(d.error){setMsg(d.error);return};setMsg(`${count} ta ${type} kalit ${nick} ga berildi!`);setNick('')}
  return (
    <SH title="O'yinchiga kalit berish">
      <div className="card" style={{maxWidth:500,marginTop:16}}>
        {msg&&<div className="alert alert-ok">{msg}</div>}
        <div className="grid3" style={{gap:10,marginBottom:14}}>
          <input className="inp" placeholder="Nick" value={nick} onChange={e=>setNick(e.target.value)}/>
          <select className="inp" value={type} onChange={e=>setType(e.target.value)}>
            {['oddiy','oltin','pul','exp','mashina','avia'].map(t=><option key={t} value={t}>{t}</option>)}
          </select>
          <input className="inp" type="number" min="1" max="100" value={count} onChange={e=>setCount(e.target.value)}/>
        </div>
        <button className="btn btn-primary btn-sm" onClick={give} style={{borderRadius:8}}>Berish</button>
      </div>
    </SH>
  )
}

function CuratorsSec({headers}) {
  const [list,setList]=useState([]), [nick,setNick]=useState(''), [type,setType]=useState('server')
  const load=()=>api.get('owner/curators',{},headers).then(d=>{if(d.success)setList(d.curators)})
  useEffect(()=>{load()},[])
  const add=async()=>{const d=await api.post('owner/curators/add',{player_name:nick,curator_type:type},headers);if(!d.error){setNick('');load()}}
  const remove=async n=>{await api.post('owner/curators/remove',{player_name:n},headers);load()}
  const types=['server','admin','leader','discord','news']
  return (
    <SH title="Kuratorlar">
      <div className="card" style={{maxWidth:500,marginTop:16,marginBottom:16}}>
        <input className="inp" placeholder="Nick" value={nick} onChange={e=>setNick(e.target.value)} style={{marginBottom:10}}/>
        <select className="inp" value={type} onChange={e=>setType(e.target.value)} style={{marginBottom:14}}>{types.map(t=><option key={t} value={t}>{t} Kuratori</option>)}</select>
        <button className="btn btn-primary btn-sm" onClick={add} style={{borderRadius:8}}>Qo'shish</button>
      </div>
      {list.map(c=>(
        <div key={c.id} className="card" style={{marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div><b>{c.player_name}</b> — <span className="badge badge-p" style={{fontSize:10}}>{c.curator_type} Kurator</span></div>
          <button className="btn btn-danger btn-sm" onClick={()=>remove(c.player_name)} style={{borderRadius:8}}>O'chirish</button>
        </div>
      ))}
      {list.length===0&&<p style={{color:'var(--td)',fontSize:13}}>Kurator yo'q</p>}
    </SH>
  )
}

function PermissionsSec({headers}) {
  const [data,setData]=useState(null)
  const load=()=>api.get('owner/permissions',{},headers).then(d=>{if(d.success)setData(d)})
  useEffect(()=>{load()},[])
  const toggle=async(rl,pk,cur)=>{
    setData(p=>({...p,matrix:{...p.matrix,[rl]:{...p.matrix[rl],[pk]:!cur}}}))
    await api.post('owner/permissions',{rank_level:rl,permission_key:pk,enabled:!cur},headers)
  }
  if(!data) return <div className="loading"><div className="spin"></div></div>
  const ranks=Object.keys(data.ranks).map(Number).filter(r=>r>0&&r!==13).sort((a,b)=>a-b)
  return (
    <SH title="Ruxsatlar matritsasi">
      <p style={{fontSize:13,color:'var(--td)',margin:'8px 0 16px'}}>Har bir daraja va amal uchun ruxsatni yoqing/o'chiring. Owner har doim hamma narsaga ruxsatli.</p>
      <div className="card" style={{padding:0,overflow:'auto'}}>
        <table>
          <thead>
            <tr>
              <th style={{position:'sticky',left:0,background:'rgba(0,0,0,.6)',minWidth:160,zIndex:2}}>Amal</th>
              {ranks.map(r=><th key={r} style={{whiteSpace:'nowrap',fontSize:10,minWidth:80}}>{data.ranks[r]}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.permission_keys.map(pk=>(
              <tr key={pk.key}>
                <td style={{fontWeight:600,position:'sticky',left:0,background:'#111120',zIndex:1,whiteSpace:'nowrap'}}>{pk.label}</td>
                {ranks.map(r=>{
                  const en=!!data.matrix[r]?.[pk.key]
                  return <td key={r} style={{textAlign:'center'}}>
                    <input type="checkbox" checked={en} onChange={()=>toggle(r,pk.key,en)} style={{width:16,height:16,cursor:'pointer',accentColor:'var(--p)'}}/>
                  </td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SH>
  )
}

function ApplicationsSec({headers}) {
  const [apps,setApps]=useState([]), [status,setStatus]=useState('kutilmoqda')
  const load=()=>api.get('owner/applications',{status},headers).then(d=>{if(d.success)setApps(d.applications)})
  useEffect(()=>{load()},[status])
  const review=async(id,st)=>{const note=st==='rad'?prompt('Rad sababi:'):'';await api.post('owner/applications/review',{id,status:st,note},headers);load()}
  return (
    <SH title="Adminlikka arizalar">
      <div style={{display:'flex',gap:8,margin:'12px 0 16px'}}>
        {['kutilmoqda','qabul','rad'].map(s=>(
          <button key={s} onClick={()=>setStatus(s)} className="btn btn-sm" style={{background:status===s?'var(--p)':'transparent',border:'1px solid var(--b)',color:status===s?'#fff':'var(--td)',borderRadius:8}}>{s}</button>
        ))}
      </div>
      {apps.map(a=>(
        <div key={a.id} className="card" style={{marginBottom:12}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:8,flexWrap:'wrap',gap:6}}>
            <div><b>{a.player_name}</b> ({a.age} yosh) {a.dc_username&&<span className="badge badge-blue" style={{fontSize:10}}>{a.dc_username}</span>}</div>
            <span style={{fontSize:11,color:'var(--td)'}}>{new Date(a.created_at).toLocaleDateString('uz-UZ')}</span>
          </div>
          {a.statistics&&<div className="card" style={{marginBottom:8,padding:'8px 12px',background:'rgba(124,58,237,.05)'}}><div style={{fontSize:11,color:'var(--td)'}}>Statistika (bot orqali): {a.statistics}</div></div>}
          <div style={{fontSize:13,color:'var(--td)',marginBottom:4}}><b>Muhit:</b> {a.team_atmosphere}</div>
          <div style={{fontSize:13,marginBottom:12}}><b>Nima olib keldi:</b> {a.why_play}</div>
          {status==='kutilmoqda'&&(
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-success btn-sm" onClick={()=>review(a.id,'qabul')} style={{borderRadius:8}}><Icon name="check" size={13}/>Qabul qilish</button>
              <button className="btn btn-danger btn-sm" onClick={()=>review(a.id,'rad')} style={{borderRadius:8}}>Rad etish</button>
            </div>
          )}
          {a.review_note&&<p style={{fontSize:12,color:'var(--td)',marginTop:8}}>Izoh: {a.review_note}</p>}
        </div>
      ))}
      {apps.length===0&&<div style={{textAlign:'center',color:'var(--td)',padding:40}}>Ariza yo'q</div>}
    </SH>
  )
}

function BlacklistSec({headers}) {
  const [list,setList]=useState([]), [name,setName]=useState(''), [reason,setReason]=useState(''), [days,setDays]=useState('0')
  const load=()=>api.get('owner/blacklist',{},headers).then(d=>{if(d.success)setList(d.list)})
  useEffect(()=>{load()},[])
  const add=async()=>{await api.post('blacklist/add',{player_name:name,reason,days:parseInt(days)},headers);setName('');setReason('');load()}
  const rem=async n=>{await api.post('blacklist/remove',{player_name:n},headers);load()}
  return (
    <SH title="ChSA (Qora ro'yxat)">
      <div className="card" style={{maxWidth:560,marginTop:16,marginBottom:16}}>
        <div className="grid3" style={{gap:10,marginBottom:12}}>
          <input className="inp" placeholder="Nick" value={name} onChange={e=>setName(e.target.value)}/>
          <input className="inp" placeholder="Sabab" value={reason} onChange={e=>setReason(e.target.value)}/>
          <input className="inp" type="number" placeholder="Kun (0=umrbod)" value={days} onChange={e=>setDays(e.target.value)}/>
        </div>
        <button className="btn btn-primary btn-sm" onClick={add} style={{borderRadius:8}}>Qo'shish</button>
      </div>
      {list.map(l=>(
        <div key={l.id} className="card" style={{marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
          <div><b>{l.player_name}</b> — {l.reason} <span style={{fontSize:11,color:'var(--td)'}}>{l.days>0?`(${l.days} kun)`:'(umrbod)'}</span></div>
          <button className="btn btn-danger btn-sm" onClick={()=>rem(l.player_name)} style={{borderRadius:8}}>O'chirish</button>
        </div>
      ))}
    </SH>
  )
}

function ApkSec({headers}) {
  const [url,setUrl]=useState(''), [ver,setVer]=useState(''), [msg,setMsg]=useState('')
  const save=async()=>{await api.post('owner/apk',{url,version:ver},headers);setMsg('Saqlandi!');toast.success('APK yangilandi!')}
  return (
    <SH title="APK boshqaruvi">
      <div className="card" style={{maxWidth:500,marginTop:16}}>
        {msg&&<div className="alert alert-ok">{msg}</div>}
        <label style={{fontSize:12,color:'var(--td)',marginBottom:6,display:'block'}}>APK URL</label>
        <input className="inp" placeholder="https://..." value={url} onChange={e=>setUrl(e.target.value)} style={{marginBottom:10}}/>
        <label style={{fontSize:12,color:'var(--td)',marginBottom:6,display:'block'}}>Versiya</label>
        <input className="inp" placeholder="1.0.0" value={ver} onChange={e=>setVer(e.target.value)} style={{marginBottom:14}}/>
        <button className="btn btn-primary" onClick={save} style={{borderRadius:10}}>Saqlash</button>
      </div>
    </SH>
  )
}

function SettingsSec({headers}) {
  const [settings,setSettings]=useState({}), [newLogin,setNewLogin]=useState(''), [newPass,setNewPass]=useState(''), [msg,setMsg]=useState('')
  useEffect(()=>{api.get('settings').then(d=>{if(d.success)setSettings(d.settings)})},[])
  const upd=async(key,value)=>{await api.post('owner/settings',{key,value},headers);setMsg('Saqlandi!')}
  const creds=async()=>{if(!newLogin||!newPass)return;await api.post('owner/creds',{login:newLogin,password:newPass},headers);toast.success('Login/parol yangilandi!')}
  return (
    <SH title="Sozlamalar">
      {msg&&<div className="alert alert-ok" style={{marginTop:12}}>{msg}</div>}
      <div className="grid2" style={{marginTop:16}}>
        <div className="card">
          <div style={{fontWeight:700,marginBottom:14}}>Ijtimoiy tarmoqlar</div>
          {[['discord_link','Discord'],['telegram_link','Telegram'],['youtube_link','YouTube'],['server_ip','Server IP']].map(([k,l])=>(
            <div key={k} style={{marginBottom:10}}>
              <label style={{fontSize:11,color:'var(--td)',marginBottom:4,display:'block'}}>{l}</label>
              <input className="inp" defaultValue={settings[k]} onBlur={e=>upd(k,e.target.value)}/>
            </div>
          ))}
        </div>
        <div className="card">
          <div style={{fontWeight:700,marginBottom:14}}>Owner login / parol</div>
          <input className="inp" placeholder="Yangi login" value={newLogin} onChange={e=>setNewLogin(e.target.value)} style={{marginBottom:10}}/>
          <input className="inp" type="password" placeholder="Yangi parol" value={newPass} onChange={e=>setNewPass(e.target.value)} style={{marginBottom:14}}/>
          <button className="btn btn-primary btn-sm" onClick={creds} style={{borderRadius:8}}>O'zgartirish</button>
        </div>
      </div>
    </SH>
  )
}

function LogsSec({headers}) {
  const [type,setType]=useState('admin'), [logs,setLogs]=useState([])
  useEffect(()=>{api.get('owner/logs',{type},headers).then(d=>{if(d.success)setLogs(d.logs)})},[type])
  return (
    <SH title="Loglar">
      <div style={{display:'flex',gap:8,margin:'12px 0 16px'}}>
        {['admin','punishment','dc'].map(t=>(
          <button key={t} onClick={()=>setType(t)} className="btn btn-sm" style={{background:type===t?'var(--p)':'transparent',border:'1px solid var(--b)',color:type===t?'#fff':'var(--td)',borderRadius:8}}>{t}</button>
        ))}
      </div>
      <div className="card" style={{padding:0,maxHeight:520,overflow:'auto'}}>
        <table>
          <thead><tr><th>Kim</th><th>Amal</th><th>Tafsilot</th><th>Vaqt</th></tr></thead>
          <tbody>
            {logs.map((l,i)=>(
              <tr key={i}>
                <td style={{fontWeight:700,whiteSpace:'nowrap'}}>{l.admin_name||l.admin_nick||l.username||'—'}</td>
                <td style={{color:'var(--pl)'}}>{l.action||l.type}</td>
                <td style={{color:'var(--td)',fontSize:12,maxWidth:280,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.details||l.reason||'—'}</td>
                <td style={{fontSize:11,color:'var(--td)',whiteSpace:'nowrap'}}>{new Date(l.created_at).toLocaleString('uz-UZ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length===0&&<div style={{textAlign:'center',color:'var(--td)',padding:30}}>Log yo'q</div>}
      </div>
    </SH>
  )
}
