import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Icon } from '../components/Icons'
import api from '../utils/api'
import { toast } from '../components/Toast'

export default function Transfer() {
  const { user, getToken, refreshUser, loading:authLoading } = useAuth()
  const [toPlayer, setToPlayer] = useState('')
  const [amount, setAmount] = useState('')
  const [msg, setMsg] = useState({type:'',text:''})
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  if (!authLoading && !user) { nav('/login'); return null }
  if (!user) return null

  const submit = async e => {
    e.preventDefault(); setMsg({type:'',text:''}); setLoading(true)
    const d = await api.post('transfer',{to_player:toPlayer,amount:parseInt(amount)},api.authH(getToken()))
    setLoading(false)
    if(d.error){setMsg({type:'err',text:d.error});return}
    setMsg({type:'ok',text:d.message}); toast.success(d.message)
    setToPlayer(''); setAmount(''); refreshUser()
  }

  return (
    <div className="pt">
      <div className="wrap" style={{maxWidth:520}}>
        <div className="line"></div>
        <h1 style={{fontSize:28,fontWeight:800,marginBottom:24}}>Pul o'tkazish</h1>
        <div className="card" style={{marginBottom:20,textAlign:'center',background:'linear-gradient(135deg,rgba(16,185,129,.1),rgba(16,185,129,.04))',borderColor:'rgba(16,185,129,.2)'}}>
          <div style={{fontSize:12,color:'var(--td)',marginBottom:4}}>Sizning balansingiz</div>
          <div style={{fontSize:32,fontWeight:900,color:'var(--green)'}}>${user.money_fmt}</div>
        </div>
        {msg.text && <div className={`alert alert-${msg.type==='ok'?'ok':'err'}`}>{msg.text}</div>}
        <div className="card">
          <form onSubmit={submit}>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,fontWeight:600,color:'var(--td)',marginBottom:6,display:'block'}}>Qabul qiluvchi nick</label>
              <input className="inp" value={toPlayer} onChange={e=>setToPlayer(e.target.value)} placeholder="Ism_Familiya" required/>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:12,fontWeight:600,color:'var(--td)',marginBottom:6,display:'block'}}>Miqdor ($)</label>
              <input className="inp" type="number" min="1" max="10000000" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="10,000" required/>
            </div>
            <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:13,fontSize:15,borderRadius:10}} disabled={loading}>
              {loading?<div className="spin"></div>:<><Icon name="transfer" size={17}/>O'tkazish</>}
            </button>
          </form>
        </div>
        <p style={{textAlign:'center',fontSize:12,color:'var(--td)',marginTop:14}}>Maksimal bir marta: $10,000,000</p>
      </div>
    </div>
  )
}
