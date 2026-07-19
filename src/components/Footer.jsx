import { Link } from 'react-router-dom'
import { Icon } from './Icons'

export default function Footer() {
  return (
    <footer style={{borderTop:'1px solid var(--b)',padding:'40px 0 24px',marginTop:60}}>
      <div className="wrap">
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:32,marginBottom:28}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
              <div style={{width:32,height:32,borderRadius:8,background:'linear-gradient(135deg,#7C3AED,#4C1D95)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:14,color:'#fff'}}>S</div>
              <span style={{fontWeight:800,fontSize:16}}>Shadows<span style={{color:'var(--pl)'}}>RP</span></span>
            </div>
            <p style={{fontSize:13,color:'var(--td)',lineHeight:1.7,maxWidth:320}}>O'zbekistondagi eng yaxshi SA-MP Role Play serveri.</p>
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:700,marginBottom:12,color:'#fff'}}>Sahifalar</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <Link to="/news" style={{fontSize:13,color:'var(--td)'}}>Yangiliklar</Link>
              <Link to="/leaderboard" style={{fontSize:13,color:'var(--td)'}}>Reyting</Link>
              <Link to="/complaints" style={{fontSize:13,color:'var(--td)'}}>Shikoyatlar</Link>
              <Link to="/support" style={{fontSize:13,color:'var(--td)'}}>Yordam</Link>
            </div>
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:700,marginBottom:12,color:'#fff'}}>Akkaunt</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <Link to="/login" style={{fontSize:13,color:'var(--td)'}}>Kirish</Link>
              <Link to="/admin-apply" style={{fontSize:13,color:'var(--td)'}}>Adminlikka ariza</Link>
            </div>
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:700,marginBottom:12,color:'#fff'}}>Ijtimoiy tarmoqlar</div>
            <div style={{display:'flex',gap:10}}>
              <a href="https://discord.gg/bAbGcN4s2" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{padding:8}}><Icon name="discord" size={16}/></a>
              <a href="https://t.me/Shadows_Rp1" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{padding:8}}><Icon name="telegram" size={16}/></a>
              <a href="https://www.youtube.com/@shadows_rp1" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{padding:8}}><Icon name="youtube" size={16}/></a>
            </div>
          </div>
        </div>
        <div style={{borderTop:'1px solid var(--b)',paddingTop:20,textAlign:'center',fontSize:12,color:'var(--td)'}}>© 2026 Shadows RP. Barcha huquqlar himoyalangan.</div>
      </div>
    </footer>
  )
}
