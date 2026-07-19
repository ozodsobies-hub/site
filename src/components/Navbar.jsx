import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Icon } from './Icons'

export default function Navbar() {
  const { user, notifications, loadNotifications, markNotificationsRead, getToken } = useAuth()
  const [notifOpen, setNotifOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [fracOpen, setFracOpen] = useState(false)
  const loc = useLocation()
  const menuRef = useRef(null)

  useEffect(() => { setNotifOpen(false); setMenuOpen(false); setFracOpen(false) }, [loc.pathname])
  useEffect(() => {
    if (user) {
      const t = getToken(); loadNotifications(t)
      const iv = setInterval(() => loadNotifications(t), 30000)
      return () => clearInterval(iv)
    }
  }, [user])
  useEffect(() => {
    const handler = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unread = notifications.filter(n => !n.is_read).length
  const openNotif = () => { setNotifOpen(!notifOpen); if (!notifOpen && unread > 0) markNotificationsRead() }

  const factions = [
    {id:1,name:'Politsiya UMVD'},{id:2,name:'SSV-A Arzamas'},{id:3,name:'Harbiy QK'},{id:4,name:'FCB'},
    {id:5,name:'SSV-J Yujniy'},{id:6,name:'GIBD Yujniy'},{id:7,name:'OBV Hukumat'},
    {id:8,name:'Arzamas OPG'},{id:9,name:'Litkarino OPG'},
  ]

  const navLinks = [
    {to:'/',label:'Bosh sahifa',icon:'home'},
    {to:'/news',label:'Yangiliklar',icon:'news'},
    {to:'/leaderboard',label:'Reyting',icon:'trophy'},
    {to:'/complaints',label:'Shikoyatlar',icon:'alert'},
    {to:'/support',label:'Yordam',icon:'support'},
    {to:'/transfer',label:'Pul o\'tkazish',icon:'transfer'},
    {to:'/admin-apply',label:'Admin ariza',icon:'file'},
  ]

  return (
    <>
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:1000,background:'rgba(8,8,15,.95)',backdropFilter:'blur(16px)',borderBottom:'1px solid var(--b)'}}>
        <div className="wrap" style={{display:'flex',alignItems:'center',justifyContent:'space-between',height:66,gap:12}}>

          {/* LOGO */}
          <Link to="/" style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
            <div style={{width:36,height:36,borderRadius:9,background:'linear-gradient(135deg,#7C3AED,#4C1D95)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:16,color:'#fff',boxShadow:'0 4px 12px rgba(124,58,237,.35)'}}>S</div>
            <span style={{fontWeight:800,fontSize:17}}>Shadows<span style={{color:'var(--pl)'}}>RP</span></span>
          </Link>

          {/* DESKTOP NAV */}
          <div style={{display:'flex',alignItems:'center',gap:2,flex:1,justifyContent:'center'}} className="desktop-nav">
            {navLinks.slice(0,4).map(l => (
              <Link key={l.to} to={l.to} className="btn btn-outline btn-sm" style={{border:'none',borderRadius:8,color:loc.pathname===l.to?'var(--pl)':'var(--td)',background:loc.pathname===l.to?'rgba(124,58,237,.1)':'transparent'}}>
                <Icon name={l.icon} size={14}/>{l.label}
              </Link>
            ))}
            {/* Fraksiyalar dropdown */}
            <div style={{position:'relative'}}>
              <button onClick={() => setFracOpen(!fracOpen)} className="btn btn-outline btn-sm" style={{border:'none',borderRadius:8,color:'var(--td)',background:'transparent'}}>
                <Icon name="shield" size={14}/>Fraksiyalar
              </button>
              {fracOpen && (
                <div className="card" style={{position:'absolute',top:44,left:0,width:200,padding:8,zIndex:200,boxShadow:'0 16px 48px rgba(0,0,0,.4)'}}>
                  {factions.map(f => (
                    <Link key={f.id} to={`/faction/${f.id}`} style={{display:'block',padding:'8px 12px',borderRadius:8,fontSize:13,transition:'background .15s'}}
                      onMouseOver={e=>e.currentTarget.style.background='rgba(124,58,237,.1)'}
                      onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                      {f.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link to="/support" className="btn btn-outline btn-sm" style={{border:'none',borderRadius:8,color:'var(--td)',background:'transparent'}}>
              <Icon name="support" size={14}/>Yordam
            </Link>
          </div>

          {/* RIGHT */}
          <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
            {user ? (
              <>
                <div style={{position:'relative'}}>
                  <button onClick={openNotif} style={{width:38,height:38,borderRadius:9,background:'rgba(124,58,237,.1)',border:'1px solid var(--b)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',position:'relative'}}>
                    <Icon name="bell" size={17}/>
                    {unread > 0 && <span className="notif-dot">{unread > 9 ? '9+' : unread}</span>}
                  </button>
                  {notifOpen && (
                    <div className="card" style={{position:'absolute',top:46,right:0,width:320,maxHeight:380,overflowY:'auto',padding:0,zIndex:200,boxShadow:'0 16px 48px rgba(0,0,0,.4)'}}>
                      <div style={{padding:'12px 16px',borderBottom:'1px solid var(--b)',fontWeight:700,fontSize:13}}>Bildirishnomalar</div>
                      {notifications.length === 0
                        ? <div style={{padding:24,textAlign:'center',color:'var(--td)',fontSize:13}}>Bildirishnoma yo'q</div>
                        : notifications.map(n => (
                          <div key={n.id} style={{padding:'10px 16px',borderBottom:'1px solid rgba(124,58,237,.06)',opacity:n.is_read?0.6:1,background:n.is_read?'transparent':'rgba(124,58,237,.03)'}}>
                            <div style={{fontSize:12,fontWeight:700,marginBottom:2}}>{n.title}</div>
                            <div style={{fontSize:11,color:'var(--td)',lineHeight:1.4}}>{n.message}</div>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
                <Link to="/profile" className="btn btn-primary btn-sm" style={{borderRadius:9}}>
                  <Icon name="user" size={14}/><span className="hide-sm">{user.name}</span>
                </Link>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm" style={{borderRadius:9}}>
                <Icon name="login" size={14}/><span className="hide-sm">Kirish</span>
              </Link>
            )}

            {/* BURGER */}
            <button onClick={() => setMenuOpen(!menuOpen)} ref={menuRef}
              style={{width:38,height:38,borderRadius:9,background:'rgba(124,58,237,.1)',border:'1px solid var(--b)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}
              className="burger-btn">
              <Icon name={menuOpen ? 'close' : 'list'} size={18}/>
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE/BURGER MENU */}
      {menuOpen && (
        <div style={{position:'fixed',top:66,left:0,right:0,bottom:0,zIndex:999,background:'rgba(8,8,15,.98)',backdropFilter:'blur(16px)',overflowY:'auto',display:'flex',flexDirection:'column',padding:'16px 0'}}>
          <div style={{padding:'0 16px 16px',borderBottom:'1px solid var(--b)',marginBottom:8}}>
            {user && (
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12,padding:'12px 4px'}}>
                <div style={{width:42,height:42,borderRadius:12,background:'linear-gradient(135deg,#7C3AED,#4C1D95)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:18,flexShrink:0}}>{user.name[0]}</div>
                <div>
                  <div style={{fontWeight:700}}>{user.name}</div>
                  <div style={{fontSize:12,color:'var(--pl)'}}>{user.admin_name}</div>
                </div>
              </div>
            )}
          </div>
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} style={{display:'flex',alignItems:'center',gap:12,padding:'14px 20px',fontSize:15,fontWeight:600,color:loc.pathname===l.to?'var(--pl)':'var(--t)',borderLeft:loc.pathname===l.to?'3px solid var(--p)':'3px solid transparent',background:loc.pathname===l.to?'rgba(124,58,237,.08)':'transparent'}}>
              <Icon name={l.icon} size={18} color={loc.pathname===l.to?'var(--pl)':'var(--td)'}/>{l.label}
            </Link>
          ))}
          <div style={{borderTop:'1px solid var(--b)',marginTop:8,paddingTop:8}}>
            <div style={{padding:'8px 20px',fontSize:11,color:'var(--td)',fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>Fraksiyalar</div>
            {factions.map(f => (
              <Link key={f.id} to={`/faction/${f.id}`} style={{display:'flex',alignItems:'center',gap:12,padding:'11px 20px',fontSize:14,color:'var(--td)'}}>
                <Icon name="shield" size={15} color="var(--pl)"/>{f.name}
              </Link>
            ))}
          </div>
          {user ? (
            <div style={{borderTop:'1px solid var(--b)',marginTop:8,paddingTop:8}}>
              <Link to="/profile" style={{display:'flex',alignItems:'center',gap:12,padding:'14px 20px',fontSize:15,fontWeight:600}}>
                <Icon name="user" size={18} color="var(--pl)"/>Profilim
              </Link>
              {user.admin > 0 && <Link to="/admin" style={{display:'flex',alignItems:'center',gap:12,padding:'14px 20px',fontSize:15,fontWeight:600}}>
                <Icon name="shield" size={18} color="var(--gold)"/>Admin Panel
              </Link>}
            </div>
          ) : (
            <div style={{padding:'12px 16px'}}>
              <Link to="/login" className="btn btn-primary" style={{width:'100%',justifyContent:'center',borderRadius:10,padding:13}}>
                <Icon name="login" size={16}/>Kirish
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        .hide-sm { }
        .desktop-nav { }
        @media(max-width:768px) {
          .desktop-nav { display: none !important; }
          .hide-sm { display: none; }
        }
        @media(min-width:769px) {
          .burger-btn { display: none !important; }
        }
      `}</style>
    </>
  )
}
