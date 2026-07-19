import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Icon } from '../components/Icons'
import api, { teamNames, teamColors } from '../utils/api'

export default function Faction() {
  const { teamId } = useParams()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { api.get(`faction/${teamId}`).then(d=>{if(d.success)setMembers(d.members);setLoading(false)}) }, [teamId])

  const color = teamColors[teamId]||'#7C3AED'
  const name = teamNames[teamId]||'Fraksiya'
  const online = members.filter(m=>m.online==1).length

  return (
    <div className="pt">
      <div className="wrap">
        <div className="card" style={{marginBottom:24,background:`linear-gradient(135deg,${color}18,transparent)`,borderLeft:`4px solid ${color}`}}>
          <div style={{display:'flex',alignItems:'center',gap:18,flexWrap:'wrap'}}>
            <div style={{width:60,height:60,borderRadius:14,background:`${color}22`,border:`2px solid ${color}44`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <Icon name="shield" size={28} color={color}/>
            </div>
            <div>
              <h1 style={{fontSize:26,fontWeight:800}}>{name}</h1>
              <div style={{fontSize:13,color:'var(--td)',marginTop:4,display:'flex',gap:16}}>
                <span style={{color:'var(--green)',display:'flex',alignItems:'center',gap:5}}><span className="online-dot"></span>{online} onlayn</span>
                <span>{members.length} a'zo</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? <div className="loading"><div className="spin"></div></div> : (
          <div className="card" style={{padding:0,overflow:'hidden'}}>
            <table>
              <thead>
                <tr><th>#</th><th>Nick</th><th>Daraja</th><th>Rank</th><th>Vaqt</th><th>Holat</th></tr>
              </thead>
              <tbody>
                {members.map((m,i)=>(
                  <tr key={m.id}>
                    <td style={{color:'var(--td)'}}>{i+1}</td>
                    <td style={{fontWeight:700}}>{m.name}</td>
                    <td><span className="badge badge-p" style={{fontSize:10}}>Daraja {m.level}</span></td>
                    <td><span style={{color,fontWeight:700}}>Rank {m.subdivison||0}</span></td>
                    <td style={{color:'var(--td)',fontSize:12}}>{m.totalhour||0}s</td>
                    <td>{m.online==1?<span style={{color:'var(--green)',fontSize:12,display:'flex',alignItems:'center',gap:4}}><span className="online-dot" style={{width:6,height:6}}></span>Onlayn</span>:<span style={{color:'var(--td)',fontSize:12}}>Oflayn</span>}</td>
                  </tr>
                ))}
                {members.length===0 && <tr><td colSpan={6} style={{textAlign:'center',color:'var(--td)',padding:40}}>A'zo yo'q</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
