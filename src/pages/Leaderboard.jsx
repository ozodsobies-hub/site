import { useState, useEffect } from 'react'
import { Icon } from '../components/Icons'
import api, { teamNames, adminLvl } from '../utils/api'

export default function Leaderboard() {
  const [type, setType] = useState('level')
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { setLoading(true); api.get('leaderboard',{type}).then(d=>{if(d.success)setPlayers(d.players);setLoading(false)}) }, [type])

  const types = [
    {id:'level',label:'Daraja',icon:'star',color:'var(--gold)'},
    {id:'money',label:'Boylik',icon:'money',color:'var(--green)'},
    {id:'score',label:'Score',icon:'zap',color:'var(--blue)'},
    {id:'hours',label:'Vaqt',icon:'clock',color:'var(--pl)'},
  ]
  const getVal = p => type==='money'?`$${Number(p.money).toLocaleString('ru-RU')}`:type==='hours'?`${p.totalhour||0} soat`:type==='score'?`${p.score||0} exp`:`${p.level} lvl`
  const medals = ['🥇','🥈','🥉']

  return (
    <div className="pt">
      <div className="wrap">
        <div className="line"></div>
        <h1 style={{fontSize:32,fontWeight:800,marginBottom:6}}>Reyting jadvali</h1>
        <p style={{color:'var(--td)',marginBottom:24}}>Eng yaxshi o'yinchilar</p>

        <div style={{display:'flex',gap:10,marginBottom:28,flexWrap:'wrap'}}>
          {types.map(t=>(
            <button key={t.id} onClick={()=>setType(t.id)} className="btn btn-sm" style={{
              background:type===t.id?'var(--p)':'transparent', color:type===t.id?'#fff':'var(--td)',
              border:`1px solid ${type===t.id?'var(--p)':'var(--b)'}`, borderRadius:10, gap:6
            }}>
              <Icon name={t.icon} size={14} color={type===t.id?'#fff':t.color}/>{t.label}
            </button>
          ))}
        </div>

        {loading ? <div className="loading"><div className="spin"></div></div> : (
          <div className="card" style={{padding:0,overflow:'hidden'}}>
            {players.map((p,i)=>(
              <div key={p.name} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 20px',borderBottom:i<players.length-1?'1px solid rgba(124,58,237,.07)':'none',background:i<3?`rgba(${i===0?'245,158,11':i===1?'156,163,175':'180,120,60'},.04)`:'transparent'}}>
                <div style={{width:36,textAlign:'center',fontSize:i<3?22:14,fontWeight:800,color:i<3?'var(--gold)':'var(--td)',flexShrink:0}}>
                  {i<3 ? medals[i] : `#${i+1}`}
                </div>
                <div style={{width:38,height:38,borderRadius:10,background:'linear-gradient(135deg,rgba(124,58,237,.3),rgba(76,29,149,.2))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:15,flexShrink:0}}>
                  {p.name[0]}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                    <span style={{fontWeight:700,fontSize:15}}>{p.name}</span>
                    {p.admin>0 && <span className="badge badge-p" style={{fontSize:10,padding:'2px 7px'}}><Icon name="shield" size={9}/>{adminLvl[p.admin]||'Admin'}</span>}
                    {p.premium==1 && <span className="badge badge-gold" style={{fontSize:10,padding:'2px 7px'}}><Icon name="star" size={9}/>Premium</span>}
                  </div>
                  <div style={{fontSize:11,color:'var(--td)',marginTop:2}}>{teamNames[p.team]||'Fuqaro'}</div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontWeight:800,fontSize:16,color:'var(--pl)'}}>{getVal(p)}</div>
                  {p.online==1 && <span style={{fontSize:10,color:'var(--green)',display:'flex',alignItems:'center',gap:3,justifyContent:'flex-end'}}><span className="online-dot" style={{width:5,height:5}}></span>Onlayn</span>}
                </div>
              </div>
            ))}
            {players.length===0 && <div style={{textAlign:'center',color:'var(--td)',padding:60}}>Ma'lumot yo'q</div>}
          </div>
        )}
      </div>
    </div>
  )
}
