import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icons'
import api from '../utils/api'

export default function Home() {
  const [stats, setStats] = useState(null)
  const [news, setNews] = useState([])
  const [settings, setSettings] = useState({})

  useEffect(() => {
    Promise.all([api.get('stats'), api.get('news',{limit:3}), api.get('settings')]).then(([s,n,st]) => {
      if(s.success) setStats(s.stats)
      if(n.success) setNews(n.news)
      if(st.success) setSettings(st.settings)
    })
  }, [])

  return (
    <div>
      {/* HERO */}
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',position:'relative',overflow:'hidden',background:'radial-gradient(ellipse 80% 60% at 50% -10%,rgba(124,58,237,.25),transparent)'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(rgba(124,58,237,.07) 1px,transparent 1px)',backgroundSize:'40px 40px'}}/>
        <div className="wrap" style={{position:'relative',zIndex:2,textAlign:'center',width:'100%',padding:'120px 24px 80px'}}>
          <div className="badge badge-p" style={{marginBottom:24,fontSize:12,padding:'6px 16px',gap:8}}>
            <span className="online-dot"></span>
            {stats?.online_players||0} o'yinchi hozir onlayn
          </div>
          <h1 style={{fontSize:'clamp(36px,7vw,72px)',fontWeight:900,lineHeight:1.05,marginBottom:20,letterSpacing:-2}}>
            Shadows<span style={{background:'linear-gradient(135deg,#9D4EDD,#7C3AED)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>RP</span> ga<br/>Xush kelibsiz
          </h1>
          <p style={{fontSize:'clamp(14px,2vw,18px)',color:'var(--td)',maxWidth:560,margin:'0 auto 40px',lineHeight:1.7}}>
            O'zbekistondagi eng katta SA-MP Role Play jamoasi. Unutilmas hikoyalar, do'stlar va tajribalar!
          </p>
          <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
            <a href={settings.apk_url||'#'} className="btn btn-primary" style={{padding:'14px 32px',fontSize:15,borderRadius:10}}>
              <Icon name="download" size={18}/> APK Yuklab olish
            </a>
            <Link to="/login" className="btn btn-outline" style={{padding:'14px 32px',fontSize:15,borderRadius:10}}>
              <Icon name="login" size={18}/> Saytga kirish
            </Link>
          </div>

          {/* STATS */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,maxWidth:700,margin:'60px auto 0'}}>
            {[
              {label:"O'yinchilar",val:stats?.total_players||0,icon:'users',color:'var(--pl)'},
              {label:'Onlayn',val:stats?.online_players||0,icon:'zap',color:'var(--green)'},
              {label:'Adminlar',val:stats?.total_admins||0,icon:'shield',color:'var(--gold)'},
              {label:'Yangiliklar',val:stats?.total_news||0,icon:'news',color:'var(--blue)'},
            ].map((s,i)=>(
              <div key={i} className="card" style={{textAlign:'center',padding:'18px 12px',borderColor:`${s.color}22`}}>
                <Icon name={s.icon} size={22} color={s.color}/>
                <div style={{fontSize:26,fontWeight:900,marginTop:8,color:s.color}}>{s.val}</div>
                <div style={{fontSize:11,color:'var(--td)',marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* YANGILIKLAR */}
      <div className="wrap" style={{padding:'60px 24px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
          <div><div className="line"></div><h2 style={{fontSize:28,fontWeight:800}}>So'nggi yangiliklar</h2></div>
          <Link to="/news" className="btn btn-outline btn-sm">Barchasi <Icon name="externalLink" size={13}/></Link>
        </div>
        <div className="grid3">
          {news.map(n=>(
            <Link key={n.id} to={`/news/${n.id}`} className="card card-hover" style={{padding:0,overflow:'hidden'}}>
              {n.image_url
                ? <img src={n.image_url} alt="" style={{width:'100%',height:180,objectFit:'cover'}}/>
                : <div style={{height:100,background:'linear-gradient(135deg,rgba(124,58,237,.2),rgba(76,29,149,.1))',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name="news" size={32} color="var(--b)"/></div>
              }
              <div style={{padding:18}}>
                <span className="badge badge-p" style={{marginBottom:10}}>{n.category}</span>
                <h3 style={{fontSize:15,fontWeight:700,marginBottom:8,lineHeight:1.4}}>{n.title}</h3>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--td)'}}>
                  <span>{n.author}</span>
                  <span style={{display:'flex',alignItems:'center',gap:4}}><Icon name="eye" size={11}/>{n.views}</span>
                </div>
              </div>
            </Link>
          ))}
          {news.length===0 && <div style={{gridColumn:'1/-1',textAlign:'center',color:'var(--td)',padding:60}}>Hali yangilik yo'q</div>}
        </div>
      </div>

      {/* FRAKSIYALAR */}
      <div className="wrap" style={{padding:'0 24px 60px'}}>
        <div className="line"></div>
        <h2 style={{fontSize:28,fontWeight:800,marginBottom:24}}>Fraksiyalar</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12}}>
          {[
            {id:1,name:'Politsiya UMVD',color:'#3B82F6',icon:'shield'},
            {id:2,name:'SSV-A Arzamas',color:'#10B981',icon:'shield'},
            {id:3,name:'Harbiy QK',color:'#6B7280',icon:'shield'},
            {id:4,name:'FCB',color:'#EF4444',icon:'shield'},
            {id:5,name:'SSV-J Yujniy',color:'#14B8A6',icon:'shield'},
            {id:6,name:'GIBD Yujniy',color:'#8B5CF6',icon:'shield'},
            {id:7,name:'OBV Hukumat',color:'#F59E0B',icon:'shield'},
            {id:8,name:'Arzamas OPG',color:'#EC4899',icon:'ban'},
            {id:9,name:'Litkarino OPG',color:'#F97316',icon:'ban'},
          ].map(f=>(
            <Link key={f.id} to={`/faction/${f.id}`} className="card card-hover" style={{display:'flex',alignItems:'center',gap:12,padding:14,borderLeft:`3px solid ${f.color}`}}>
              <Icon name={f.icon} size={18} color={f.color}/>
              <span style={{fontSize:13,fontWeight:600}}>{f.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* IJTIMOIY */}
      <div className="wrap" style={{padding:'0 24px 80px'}}>
        <div className="card" style={{textAlign:'center',padding:48,background:'linear-gradient(135deg,rgba(124,58,237,.12),rgba(76,29,149,.06))',borderColor:'rgba(124,58,237,.3)'}}>
          <h2 style={{fontSize:26,fontWeight:800,marginBottom:10}}>Jamiyatimizga qo'shiling!</h2>
          <p style={{color:'var(--td)',marginBottom:28,maxWidth:400,margin:'0 auto 28px'}}>Discord, Telegram va YouTube orqali biz bilan bog'laning</p>
          <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
            <a href={settings.discord_link||'#'} target="_blank" rel="noreferrer" className="btn btn-primary" style={{borderRadius:10}}>
              <Icon name="discord" size={18}/>Discord
            </a>
            <a href={settings.telegram_link||'#'} target="_blank" rel="noreferrer" className="btn btn-outline" style={{borderRadius:10}}>
              <Icon name="telegram" size={18}/>Telegram
            </a>
            <a href={settings.youtube_link||'#'} target="_blank" rel="noreferrer" className="btn btn-outline" style={{borderRadius:10}}>
              <Icon name="youtube" size={18}/>YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
