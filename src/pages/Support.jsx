import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { Icon } from '../components/Icons'
import api, { uploadFiles } from '../utils/api'
import { toast } from '../components/Toast'

const CATS = ['Umumiy','Texnik muammo','Hisob muammosi','Donat masalasi','Taklif','Boshqa']
const statusCls = {ochiq:'status-ochiq',jarayonda:'status-korilmoqda',yopiq:'status-yopiq'}

export default function Support() {
  const { user, getToken } = useAuth()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [category, setCategory] = useState('Umumiy')
  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({type:'',text:''})
  const [tickets, setTickets] = useState([])
  const fileRef = useRef(null)

  useEffect(() => {
    if(user) api.get('support/my',{},api.authH(getToken())).then(d=>{if(d.success)setTickets(d.tickets)})
  }, [user])

  const handleFiles = async e => {
    const files = Array.from(e.target.files).slice(0,5); if(!files.length) return
    setUploading(true)
    const d = await uploadFiles(files, getToken(), 'support')
    setUploading(false)
    if(d.success) setAttachments(prev=>[...prev,...d.urls])
  }

  const submit = async e => {
    e.preventDefault()
    if(!user){setMsg({type:'err',text:'Avval tizimga kiring!'});return}
    setLoading(true)
    const d = await api.post('support',{subject,message,category,attachments},api.authH(getToken()))
    setLoading(false)
    if(d.error){setMsg({type:'err',text:d.error});return}
    setMsg({type:'ok',text:"So'rovingiz yuborildi! Tez orada javob beramiz."})
    toast.success("So'rov yuborildi!")
    setSubject('');setMessage('');setAttachments([])
    api.get('support/my',{},api.authH(getToken())).then(d=>{if(d.success)setTickets(d.tickets)})
  }

  return (
    <div className="pt">
      <div className="wrap" style={{maxWidth:820}}>
        <div className="line"></div>
        <h1 style={{fontSize:32,fontWeight:800,marginBottom:6}}>Yordam markazi</h1>
        <p style={{color:'var(--td)',marginBottom:28}}>Savolingiz yoki muammoingiz bo'lsa, batafsil yozing</p>

        {msg.text && <div className={`alert alert-${msg.type==='ok'?'ok':'err'}`} style={{marginBottom:20}}>{msg.text}</div>}

        <div className="card" style={{marginBottom:32}}>
          <h3 style={{fontWeight:700,marginBottom:18}}>Yangi murojaat</h3>
          <form onSubmit={submit}>
            <div className="grid2" style={{marginBottom:14}}>
              <div>
                <label style={{fontSize:12,fontWeight:600,color:'var(--td)',marginBottom:6,display:'block'}}>Kategoriya</label>
                <select className="inp" value={category} onChange={e=>setCategory(e.target.value)}>
                  {CATS.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:600,color:'var(--td)',marginBottom:6,display:'block'}}>Mavzu</label>
                <input className="inp" value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Muammoingizni qisqacha..." required/>
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,fontWeight:600,color:'var(--td)',marginBottom:6,display:'block'}}>Batafsil tavsif</label>
              <textarea className="inp" value={message} onChange={e=>setMessage(e.target.value)} placeholder="Muammoingizni to'liq yozing..." rows={5} required/>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:12,fontWeight:600,color:'var(--td)',marginBottom:6,display:'block'}}>Screenshot / Video (ixtiyoriy)</label>
              <input type="file" ref={fileRef} accept="image/*,video/*" multiple onChange={handleFiles} style={{display:'none'}}/>
              <button type="button" className="btn btn-outline btn-sm" onClick={()=>fileRef.current.click()} disabled={uploading}>
                {uploading?<div className="spin"></div>:<><Icon name="upload" size={14}/>Fayl yuklash</>}
              </button>
              {attachments.length>0 && (
                <div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}>
                  {attachments.map((a,i)=>(
                    <div key={i} style={{position:'relative'}}>
                      <img src={a} alt="" style={{width:56,height:56,objectFit:'cover',borderRadius:8,border:'1px solid var(--b)'}}/>
                      <button type="button" onClick={()=>setAttachments(prev=>prev.filter((_,j)=>j!==i))} style={{position:'absolute',top:-6,right:-6,width:18,height:18,borderRadius:'50%',background:'var(--red)',border:'none',color:'#fff',fontSize:11,cursor:'pointer',lineHeight:1}}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="btn btn-primary" style={{borderRadius:10}} disabled={loading}>
              {loading?<div className="spin"></div>:<><Icon name="send" size={16}/>Yuborish</>}
            </button>
          </form>
        </div>

        {user && tickets.length>0 && (
          <div>
            <h3 style={{fontSize:18,fontWeight:700,marginBottom:14}}>Mening murojaatlarim</h3>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {tickets.map(t=>(
                <div key={t.id} className="card">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:8,flexWrap:'wrap',gap:8}}>
                    <div>
                      <span className="badge badge-p" style={{marginBottom:6}}>{t.category}</span>
                      <div style={{fontWeight:700,marginTop:4}}>{t.subject}</div>
                    </div>
                    <span className={`badge ${statusCls[t.status]||'badge-p'}`}>{t.status}</span>
                  </div>
                  <p style={{fontSize:13,color:'var(--td)',marginBottom:8}}>{t.message}</p>
                  {t.admin_reply && (
                    <div style={{background:'rgba(16,185,129,.06)',border:'1px solid rgba(16,185,129,.15)',borderRadius:10,padding:'12px 14px',marginTop:10}}>
                      <div style={{fontSize:11,color:'var(--green)',fontWeight:700,marginBottom:4}}>Admin javobi ({t.closed_by}):</div>
                      <div style={{fontSize:13}}>{t.admin_reply}</div>
                    </div>
                  )}
                  <div style={{fontSize:11,color:'var(--td)',marginTop:10}}>{new Date(t.created_at).toLocaleString('uz-UZ')}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
