import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Icon } from '../components/Icons'
import api, { adminLvl, teamNames } from '../utils/api'
import { toast } from '../components/Toast'

const STATUS = {ochiq:'Ochiq',korilmoqda:"Ko'rilmoqda",qoshimcha_kerak:"Qo'shimcha kerak",yopiq:'Yopiq',rad:'Rad etilgan',arxiv:'Arxiv'}
const STATUS_CLS = {ochiq:'status-ochiq',korilmoqda:'status-korilmoqda',yopiq:'status-yopiq',rad:'status-rad'}

export default function AdminPanel() {
  const { user, loading:authLoading } = useAuth()
  const [tab, setTab] = useState('complaints')
  const nav = useNavigate()

  useEffect(() => {
    if (!authLoading) {
      if (!user) nav('/login')
      else if (user.admin < 1) nav('/')
    }
  }, [user, authLoading])

  if (!user || user.admin < 1) return null

  const tabs = [
    {id:'complaints',label:'Shikoyatlar',icon:'alert'},
    {id:'commands',label:'Buyruqlar',icon:'zap'},
    {id:'players',label:"O'yinchilar",icon:'users'},
    {id:'activity',label:'Faollik',icon:'activity'},
  ]

  return (
    <div className="pt">
      <div className="wrap">
        {/* Header */}
        <div className="card" style={{marginBottom:22,padding:'20px 24px',display:'flex',alignItems:'center',gap:14,flexWrap:'wrap',background:'linear-gradient(135deg,rgba(124,58,237,.12),rgba(76,29,149,.06))',borderColor:'rgba(124,58,237,.25)'}}>
          <div style={{width:48,height:48,borderRadius:12,background:'linear-gradient(135deg,#7C3AED,#4C1D95)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <Icon name="shield" size={24} color="#fff"/>
          </div>
          <div>
            <h1 style={{fontSize:20,fontWeight:800}}>Admin Panel</h1>
            <span className="badge badge-p" style={{marginTop:4}}>{user.admin_name}</span>
          </div>
        </div>

        <div className="tabs">
          {tabs.map(t=>(
            <button key={t.id} className={`tab ${tab===t.id?'active':''}`} onClick={()=>setTab(t.id)}>
              <Icon name={t.icon} size={14}/>{t.label}
            </button>
          ))}
        </div>

        {tab==='complaints' && <ComplaintsTab/>}
        {tab==='commands' && <CommandsTab adminLevel={user.admin}/>}
        {tab==='players' && <PlayersTab/>}
        {tab==='activity' && <ActivityTab/>}
      </div>
    </div>
  )
}

function ComplaintsTab() {
  const { getToken } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [notes, setNotes] = useState({})

  const load = () => {
    setLoading(true)
    api.get('complaints/admin', filter ? {status:filter} : {}, api.authH(getToken())).then(d => {
      if (d.success) setComplaints(d.complaints)
      setLoading(false)
    })
  }
  useEffect(() => { load() }, [filter])

  const closeC = async (id, status) => {
    const d = await api.post('complaints/close', {id, status, note:notes[id]||''}, api.authH(getToken()))
    if (d.error) { toast.error(d.error); return }
    toast.success('Holat yangilandi!'); load()
  }

  return (
    <div>
      <div style={{display:'flex',gap:8,marginBottom:18,flexWrap:'wrap'}}>
        {['','ochiq','korilmoqda','yopiq'].map(s => (
          <button key={s} onClick={()=>setFilter(s)} className="btn btn-sm"
            style={{background:filter===s?'var(--p)':'transparent',color:filter===s?'#fff':'var(--td)',border:'1px solid var(--b)',borderRadius:8}}>
            {s===''?'Barchasi':STATUS[s]}
          </button>
        ))}
      </div>
      {loading ? <div className="loading"><div className="spin"></div></div> : (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {complaints.map(c => {
            const imgs = Array.isArray(c.images) ? c.images.filter(Boolean) : (c.images||'').split(',').filter(Boolean)
            return (
              <div key={c.id} className="card">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:10,flexWrap:'wrap',gap:8}}>
                  <div>
                    <span style={{fontWeight:700}}>{c.from_player}</span>
                    <span style={{color:'var(--td)',margin:'0 6px'}}>→</span>
                    <span style={{fontWeight:700,color:'var(--pl)'}}>{c.to_player}</span>
                    <span style={{fontSize:11,color:'var(--td)',marginLeft:8}}>#{c.id}</span>
                  </div>
                  <span className={`badge ${STATUS_CLS[c.status]||'badge-p'}`}>{STATUS[c.status]||c.status}</span>
                </div>
                <p style={{fontSize:13,color:'var(--td)',marginBottom:10,lineHeight:1.6}}>{c.description}</p>
                {imgs.length > 0 && (
                  <div style={{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap'}}>
                    {imgs.map((img,i) => (
                      <a key={i} href={img} target="_blank" rel="noreferrer">
                        <img src={img} alt="" style={{width:60,height:60,objectFit:'cover',borderRadius:8,border:'1px solid var(--b)'}}/>
                      </a>
                    ))}
                  </div>
                )}
                {c.status !== 'yopiq' && (
                  <div style={{display:'flex',gap:8,marginTop:8,flexWrap:'wrap'}}>
                    <input className="inp" placeholder="Izoh (ixtiyoriy)" value={notes[c.id]||''}
                      onChange={e=>setNotes({...notes,[c.id]:e.target.value})} style={{flex:1,minWidth:140}}/>
                    <button className="btn btn-success btn-sm" onClick={()=>closeC(c.id,'yopiq')} style={{borderRadius:8}}>
                      <Icon name="check" size={13}/>Yopish
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={()=>closeC(c.id,'korilmoqda')} style={{borderRadius:8}}>
                      Ko'rilmoqda
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={()=>closeC(c.id,'qoshimcha_kerak')} style={{borderRadius:8}}>
                      Qo'shimcha kerak
                    </button>
                  </div>
                )}
              </div>
            )
          })}
          {complaints.length===0 && <div style={{textAlign:'center',color:'var(--td)',padding:60}}><Icon name="check" size={36} color="rgba(16,185,129,.3)"/><p style={{marginTop:12}}>Shikoyat yo'q</p></div>}
        </div>
      )}
    </div>
  )
}

function CommandsTab({ adminLevel }) {
  const { getToken } = useAuth()
  const [action, setAction] = useState('ban')
  const [target, setTarget] = useState('')
  const [value, setValue] = useState('')
  const [reason, setReason] = useState('')
  const [msg, setMsg] = useState({type:'',text:''})
  const [loading, setLoading] = useState(false)

  const actions = [
    {id:'ban',label:'Ban',icon:'ban',needsValue:true,valueLabel:'Vaqt',needsReason:true,color:'var(--red)'},
    {id:'unban',label:'Unban',icon:'unban',color:'var(--green)'},
    {id:'mute',label:'Mute',icon:'ban',needsValue:true,valueLabel:'Daqiqa',needsReason:true,color:'var(--pl)'},
    {id:'unmute',label:'Unmute',icon:'check',color:'var(--green)'},
    {id:'warn',label:'Warn',icon:'alert',needsReason:true,color:'var(--gold)'},
    {id:'unwarn',label:'Unwarn',icon:'check',color:'var(--green)'},
    {id:'kick',label:'Kick',icon:'logout',needsReason:true,color:'var(--gold)'},
    {id:'jail',label:'Jail',icon:'lock',needsValue:true,valueLabel:'Daqiqa',needsReason:true,color:'var(--red)'},
    {id:'unjail',label:'Unjail',icon:'check',color:'var(--green)'},
    {id:'sethp',label:'HP belgilash',icon:'activity',needsValue:true,valueLabel:'HP (0-100)',color:'var(--blue)'},
    {id:'givemoney',label:'Pul berish',icon:'money',needsValue:true,valueLabel:'Miqdor',color:'var(--green)'},
    {id:'takemoney',label:'Pul olish',icon:'money',needsValue:true,valueLabel:'Miqdor',color:'var(--red)'},
    {id:'setlevel',label:'Daraja',icon:'star',needsValue:true,valueLabel:'Daraja (1-100)',color:'var(--gold)'},
    {id:'setrank',label:'Fraksiya rank',icon:'shield',needsValue:true,valueLabel:'Rank',color:'var(--pl)'},
  ]
  const cur = actions.find(a=>a.id===action)

  const submit = async e => {
    e.preventDefault(); setLoading(true)
    const d = await api.post('admin/command', {action, target, value, reason}, api.authH(getToken()))
    setLoading(false)
    if (d.error) { setMsg({type:'err',text:d.error}); return }
    setMsg({type:'ok',text:d.message}); toast.success(d.message)
    setTarget(''); setValue(''); setReason('')
  }

  return (
    <div>
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {actions.map(a=>(
          <button key={a.id} onClick={()=>setAction(a.id)} className="btn btn-sm"
            style={{background:action===a.id?'var(--p)':'transparent',color:action===a.id?'#fff':a.color,border:`1px solid ${action===a.id?'var(--p)':'var(--b)'}`,borderRadius:8}}>
            {a.label}
          </button>
        ))}
      </div>
      <div className="card" style={{maxWidth:520}}>
        <div style={{fontSize:15,fontWeight:700,marginBottom:16,color:cur?.color}}>{cur?.label}</div>
        {msg.text && <div className={`alert alert-${msg.type==='ok'?'ok':'err'}`}>{msg.text}</div>}
        <form onSubmit={submit}>
          <input className="inp" value={target} onChange={e=>setTarget(e.target.value)} placeholder="Nick yoki ID" style={{marginBottom:10}} required/>
          {cur?.needsValue && <input className="inp" value={value} onChange={e=>setValue(e.target.value)} placeholder={cur.valueLabel} style={{marginBottom:10}} required/>}
          {cur?.needsReason && <input className="inp" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Sabab" style={{marginBottom:14}} required/>}
          <button className="btn btn-primary" style={{borderRadius:10}} disabled={loading}>
            {loading?<div className="spin"></div>:<><Icon name="zap" size={15}/>Bajarish</>}
          </button>
        </form>
      </div>
    </div>
  )
}

function PlayersTab() {
  const { getToken } = useAuth()
  const [search, setSearch] = useState('')
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('players', search?{search}:{}, api.authH(getToken())).then(d => {
      if (d.success) setPlayers(d.players)
      setLoading(false)
    })
  }
  useEffect(() => { load() }, [])

  return (
    <div>
      <div style={{display:'flex',gap:8,marginBottom:18}}>
        <input className="inp" placeholder="Nick bo'yicha qidirish..." value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:320}}
          onKeyDown={e=>e.key==='Enter'&&load()}/>
        <button className="btn btn-primary btn-sm" onClick={load} style={{borderRadius:8}}>
          <Icon name="search" size={14}/>Qidirish
        </button>
      </div>
      {loading ? <div className="loading"><div className="spin"></div></div> : (
        <div className="card" style={{padding:0,overflow:'auto'}}>
          <table>
            <thead>
              <tr><th>Nick</th><th>Daraja</th><th>Pul</th><th>Admin</th><th>Warn</th><th>Holat</th></tr>
            </thead>
            <tbody>
              {players.map(p=>(
                <tr key={p.id}>
                  <td style={{fontWeight:700}}>{p.name}</td>
                  <td><span className="badge badge-p" style={{fontSize:10}}>Daraja {p.level}</span></td>
                  <td style={{color:'var(--green)',fontWeight:600}}>${p.money_fmt}</td>
                  <td>{p.admin>0?<span className="badge badge-p" style={{fontSize:10}}>{adminLvl[p.admin]||'Admin'}</span>:'—'}</td>
                  <td style={{color:p.warn>0?'var(--red)':'var(--td)'}}>{p.warn||0}/3</td>
                  <td>{p.online==1?<span style={{color:'var(--green)',fontSize:12,display:'flex',alignItems:'center',gap:4}}><span className="online-dot" style={{width:6,height:6}}></span>Onlayn</span>:<span style={{color:'var(--td)',fontSize:12}}>Oflayn</span>}</td>
                </tr>
              ))}
              {players.length===0 && <tr><td colSpan={6} style={{textAlign:'center',color:'var(--td)',padding:30}}>Topilmadi</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function ActivityTab() {
  const { user, getToken } = useAuth()
  const [data, setData] = useState(null)
  useEffect(()=>{ api.get('admin/activity',{},api.authH(getToken())).then(setData) },[])
  if (!data) return <div className="loading"><div className="spin"></div></div>
  const Box = ({label,val,color='var(--pl)'}) => (
    <div style={{background:'rgba(124,58,237,.06)',borderRadius:10,padding:'14px 12px',textAlign:'center'}}>
      <div style={{fontSize:22,fontWeight:800,color}}>{val||0}</div>
      <div style={{fontSize:11,color:'var(--td)',marginTop:3}}>{label}</div>
    </div>
  )
  return (
    <div className="grid2">
      <div className="card">
        <div style={{fontWeight:700,marginBottom:14}}>⚡ Bugungi aktivlik</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <Box label="Online (daqiqa)" val={data.today?.online_minutes} color="var(--green)"/>
          <Box label="Reportlar" val={data.today?.reports_checked} color="var(--blue)"/>
          <Box label="Shikoyatlar" val={data.today?.complaints_closed} color="var(--gold)"/>
          <Box label="Jazolar" val={data.today?.punishments_given} color="var(--red)"/>
        </div>
      </div>
      <div className="card">
        <div style={{fontWeight:700,marginBottom:14}}>📊 Haftalik aktivlik</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <Box label="Online (daqiqa)" val={data.week?.mins} color="var(--green)"/>
          <Box label="Reportlar" val={data.week?.reports} color="var(--blue)"/>
          <Box label="Shikoyatlar" val={data.week?.complaints} color="var(--gold)"/>
          <Box label="Jazolar" val={data.week?.punishments} color="var(--red)"/>
        </div>
      </div>
    </div>
  )
}
