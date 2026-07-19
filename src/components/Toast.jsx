import { useState, useEffect } from 'react'
import { Icon } from './Icons'

let listeners = []
let idCounter = 0

export const toast = {
  show: (message, type='info') => { const id=++idCounter; listeners.forEach(fn=>fn({id,message,type})) },
  success: (msg) => toast.show(msg,'success'),
  error: (msg) => toast.show(msg,'error'),
  info: (msg) => toast.show(msg,'info'),
  warning: (msg) => toast.show(msg,'warning'),
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])
  useEffect(() => {
    const handler = (t) => { setToasts(prev=>[...prev,t]); setTimeout(()=>setToasts(prev=>prev.filter(x=>x.id!==t.id)),4000) }
    listeners.push(handler)
    return () => { listeners = listeners.filter(l=>l!==handler) }
  }, [])
  const icons = { success:'check', error:'alert', info:'info', warning:'alert' }
  const colors = { success:'var(--green)', error:'var(--red)', info:'var(--blue)', warning:'var(--gold)' }
  return (
    <div style={{position:'fixed',bottom:20,right:20,zIndex:99999,display:'flex',flexDirection:'column',gap:10,maxWidth:340}}>
      {toasts.map(t => (
        <div key={t.id} className="card" style={{padding:'12px 16px',display:'flex',alignItems:'center',gap:10,borderColor:colors[t.type],animation:'slideIn .25s ease'}}>
          <Icon name={icons[t.type]} size={18} color={colors[t.type]}/>
          <span style={{fontSize:13,flex:1}}>{t.message}</span>
          <button onClick={()=>setToasts(prev=>prev.filter(x=>x.id!==t.id))} style={{background:'none',border:'none',color:'var(--td)',cursor:'pointer',padding:0}}><Icon name="close" size={14}/></button>
        </div>
      ))}
      <style>{`@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
    </div>
  )
}
