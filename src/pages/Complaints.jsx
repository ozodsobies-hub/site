import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Icon } from '../components/Icons'
import api, { uploadFiles } from '../utils/api'
import { toast } from '../components/Toast'

const STATUS = {ochiq:'Ochiq',korilmoqda:"Ko'rilmoqda",qoshimcha_kerak:"Qo'shimcha kerak",yopiq:'Yopiq',rad:'Rad etilgan',arxiv:'Arxiv'}
const STATUS_CLS = {ochiq:'status-ochiq',korilmoqda:'status-korilmoqda',yopiq:'status-yopiq',rad:'status-rad',arxiv:'badge-p',qoshimcha_kerak:'status-ochiq'}

export function ComplaintsList() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  useEffect(() => { setLoading(true); api.get('complaints/public',status?{status}:{}).then(d=>{if(d.success)setComplaints(d.complaints);setLoading(false)}) }, [status])
  return (
    <div className="pt">
      <div className="wrap">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:12}}>
          <div><div className="line"></div><h1 style={{fontSize:32,fontWeight:800}}>Shikoyatlar</h1></div>
          <Link to="/my-complaints" className="btn btn-primary" style={{borderRadius:10}}><Icon name="plus" size={15}/>Shikoyat yozish</Link>
        </div>
        <div style={{display:'flex',gap:8,marginBottom:24,flexWrap:'wrap'}}>
          {['','ochiq','korilmoqda','yopiq'].map(s=>(
            <button key={s} onClick={()=>setStatus(s)} className="btn btn-sm" style={{background:status===s?'var(--p)':'transparent',color:status===s?'#fff':'var(--td)',border:'1px solid var(--b)',borderRadius:8}}>{s===''?'Barchasi':STATUS[s]}</button>
          ))}
        </div>
        {loading ? <div className="loading"><div className="spin"></div></div> : (
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {complaints.map(c=>(
              <Link key={c.id} to={`/complaint/${c.id}`} className="card card-hover" style={{display:'block'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:10,flexWrap:'wrap',gap:8}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                    <span style={{fontWeight:700}}>{c.from_player}</span>
                    <span style={{color:'var(--td)',fontSize:13}}>→</span>
                    <span style={{fontWeight:700,color:'var(--pl)'}}>{c.to_player}</span>
                  </div>
                  <span className={`badge ${STATUS_CLS[c.status]||'badge-p'}`}>{STATUS[c.status]||c.status}</span>
                </div>
                <p style={{fontSize:13,color:'var(--td)',marginBottom:10,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{c.description}</p>
                {Array.isArray(c.images) && c.images.filter(Boolean).length>0 && (
                  <div style={{display:'flex',gap:6,marginBottom:10}}>
                    {c.images.filter(Boolean).slice(0,4).map((img,i)=>(
                      <img key={i} src={img} alt="" style={{width:52,height:52,objectFit:'cover',borderRadius:7,border:'1px solid var(--b)'}}/>
                    ))}
                    {c.images.filter(Boolean).length>4 && <div style={{width:52,height:52,background:'rgba(124,58,237,.1)',borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'var(--td)',border:'1px solid var(--b)'}}>+{c.images.filter(Boolean).length-4}</div>}
                  </div>
                )}
                <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--td)'}}>
                  <span>{new Date(c.created_at).toLocaleDateString('uz-UZ')}</span>
                  <span>{c.comment_count||0} izoh</span>
                </div>
              </Link>
            ))}
            {complaints.length===0 && <div style={{textAlign:'center',color:'var(--td)',padding:80}}><Icon name="alert" size={40} color="rgba(124,58,237,.2)"/><p style={{marginTop:14}}>Shikoyat yo'q</p></div>}
          </div>
        )}
      </div>
    </div>
  )
}

export function ComplaintDetail() {
  const { id } = useParams()
  const { user, getToken } = useAuth()
  const [data, setData] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [commentImg, setCommentImg] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const load = () => api.get(`complaints/${id}`).then(d=>{if(d.success){setData(d.complaint);setComments(d.comments)};setLoading(false)})
  useEffect(()=>{load()},[id])

  const uploadImg = async e => {
    const file = e.target.files[0]; if(!file) return
    setUploading(true)
    const fd = new FormData(); fd.append('file',file)
    const d = await api.upload('upload/image',fd)
    setUploading(false)
    if(d.success) setCommentImg(d.url)
  }
  const submitComment = async () => {
    if(!comment.trim()) return
    await api.post(`complaints/${id}/comment`,{comment,image_url:commentImg||null},api.authH(getToken()))
    setComment(''); setCommentImg(''); load(); toast.success("Izoh qo'shildi")
  }

  if(loading) return <div className="pt loading"><div className="spin"></div></div>
  if(!data) return <div className="pt wrap" style={{textAlign:'center',padding:80,color:'var(--td)'}}>Topilmadi</div>

  const imgs = Array.isArray(data.images) ? data.images.filter(Boolean) : []

  return (
    <div className="pt">
      <div className="wrap" style={{maxWidth:720}}>
        <Link to="/complaints" className="btn btn-outline btn-sm" style={{marginBottom:20}}><Icon name="transfer" size={14}/>Orqaga</Link>
        <div className="card" style={{marginBottom:20}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:14,flexWrap:'wrap',gap:8}}>
            <div>
              <span style={{fontWeight:800,fontSize:17}}>{data.from_player}</span>
              <span style={{color:'var(--td)',margin:'0 8px'}}>shikoyat yozdi</span>
              <span style={{fontWeight:800,fontSize:17,color:'var(--pl)'}}>{data.to_player}</span>
              <span style={{color:'var(--td)'}}>{' '}ustidan</span>
            </div>
            <span className={`badge ${STATUS_CLS[data.status]||'badge-p'}`}>{STATUS[data.status]||data.status}</span>
          </div>
          <p style={{fontSize:14,lineHeight:1.8,marginBottom:16,color:'var(--t)'}}>{data.description}</p>
          {imgs.length>0 && (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:8,marginBottom:14}}>
              {imgs.map((img,i)=>(
                <a key={i} href={img} target="_blank" rel="noreferrer">
                  <img src={img} alt="" style={{width:'100%',height:110,objectFit:'cover',borderRadius:10,border:'1px solid var(--b)'}}/>
                </a>
              ))}
            </div>
          )}
          {data.admin_note && (
            <div style={{background:'rgba(124,58,237,.07)',border:'1px solid rgba(124,58,237,.2)',borderRadius:10,padding:14}}>
              <div style={{fontSize:11,color:'var(--pl)',fontWeight:700,marginBottom:4}}>Admin izohi ({data.closed_by}):</div>
              <div style={{fontSize:13}}>{data.admin_note}</div>
            </div>
          )}
          <div style={{fontSize:11,color:'var(--td)',marginTop:12}}>{new Date(data.created_at).toLocaleString('uz-UZ')}</div>
        </div>

        <h3 style={{fontSize:16,fontWeight:700,marginBottom:14}}>Izohlar ({comments.length})</h3>
        {comments.map(c=>(
          <div key={c.id} className="card" style={{marginBottom:10}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:30,height:30,borderRadius:8,background:'linear-gradient(135deg,rgba(124,58,237,.3),rgba(76,29,149,.2))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13}}>{c.player_name[0]}</div>
                <b style={{fontSize:13}}>{c.player_name}</b>
              </div>
              <span style={{fontSize:11,color:'var(--td)'}}>{new Date(c.created_at).toLocaleString('uz-UZ')}</span>
            </div>
            <p style={{fontSize:13,lineHeight:1.6}}>{c.comment}</p>
            {c.image_url && <img src={c.image_url} alt="" style={{maxWidth:220,borderRadius:8,marginTop:10,border:'1px solid var(--b)'}}/>}
          </div>
        ))}

        {user && (
          <div className="card" style={{marginTop:16}}>
            <textarea className="inp" placeholder="Izoh yozing..." value={comment} onChange={e=>setComment(e.target.value)} rows={3} style={{marginBottom:10}}/>
            <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
              <input type="file" ref={fileRef} accept="image/*" onChange={uploadImg} style={{display:'none'}}/>
              <button className="btn btn-outline btn-sm" onClick={()=>fileRef.current.click()} disabled={uploading}>
                {uploading?<div className="spin"></div>:<><Icon name="image" size={13}/>Rasm</>}
              </button>
              {commentImg && <img src={commentImg} alt="" style={{width:36,height:36,objectFit:'cover',borderRadius:6}}/>}
              <button className="btn btn-primary btn-sm" onClick={submitComment} style={{marginLeft:'auto',borderRadius:8}}>
                <Icon name="send" size={13}/>Yuborish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function MyComplaints() {
  const { user, getToken, loading:authLoading } = useAuth()
  const [tab, setTab] = useState('new')
  const [mine, setMine] = useState([])
  const [toPlayer, setToPlayer] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState({type:'',text:''})
  const [loading, setLoading] = useState(false)
  const fileRef = useRef(null)
  const nav = useNavigate()

  useEffect(()=>{if(!authLoading&&!user)nav('/login')},[user,authLoading])
  useEffect(()=>{if(user&&tab==='mine')api.get('complaints/my',{},api.authH(getToken())).then(d=>{if(d.success)setMine(d.complaints)})},[tab,user])

  const handleFiles = async e => {
    const files = Array.from(e.target.files).slice(0,10); if(!files.length) return
    setUploading(true)
    const d = await uploadFiles(files, getToken())
    setUploading(false)
    if(d.success) setImages(prev=>[...prev,...d.urls])
  }

  const submit = async e => {
    e.preventDefault()
    if(images.length===0){setMsg({type:'err',text:'Kamida 1 ta rasm kerak!'});return}
    if(description.length<20){setMsg({type:'err',text:'Tavsif kamida 20 belgi bo\'lishi kerak'});return}
    setLoading(true)
    const d = await api.post('complaints',{to_player:toPlayer,description,images},api.authH(getToken()))
    setLoading(false)
    if(d.error){setMsg({type:'err',text:d.error});return}
    setMsg({type:'ok',text:'Shikoyat yuborildi!'}); toast.success('Shikoyat yuborildi!')
    setToPlayer('');setDescription('');setImages([])
  }

  if(!user) return null

  return (
    <div className="pt">
      <div className="wrap" style={{maxWidth:700}}>
        <div className="line"></div>
        <h1 style={{fontSize:28,fontWeight:800,marginBottom:20}}>Shikoyat yozish</h1>
        <div className="tabs" style={{marginBottom:20}}>
          <button className={`tab ${tab==='new'?'active':''}`} onClick={()=>setTab('new')}>Yangi shikoyat</button>
          <button className={`tab ${tab==='mine'?'active':''}`} onClick={()=>setTab('mine')}>Mening shikoyatlarim</button>
        </div>

        {tab==='new' && (
          <>
            {msg.text && <div className={`alert alert-${msg.type==='ok'?'ok':'err'}`}>{msg.text}</div>}
            <div className="card">
              <form onSubmit={submit}>
                <div style={{marginBottom:14}}>
                  <label style={{fontSize:12,fontWeight:600,color:'var(--td)',marginBottom:6,display:'block'}}>Kimga shikoyat (nick)</label>
                  <input className="inp" value={toPlayer} onChange={e=>setToPlayer(e.target.value)} placeholder="Ism_Familiya" required/>
                </div>
                <div style={{marginBottom:14}}>
                  <label style={{fontSize:12,fontWeight:600,color:'var(--td)',marginBottom:6,display:'block'}}>Tavsif <span style={{color:'var(--red)'}}>*</span> (kamida 20 belgi)</label>
                  <textarea className="inp" value={description} onChange={e=>setDescription(e.target.value)} placeholder="Nima bo'lganini batafsil yozing..." rows={5} required/>
                  <div style={{fontSize:11,color:description.length<20?'var(--red)':'var(--green)',marginTop:4}}>{description.length} belgi</div>
                </div>
                <div style={{marginBottom:20}}>
                  <label style={{fontSize:12,fontWeight:600,color:'var(--td)',marginBottom:6,display:'block'}}>Rasmlar <span style={{color:'var(--red)'}}>*</span> (majburiy)</label>
                  <div className="upload-zone" onClick={()=>fileRef.current.click()} style={{position:'relative'}}>
                    <input type="file" ref={fileRef} accept="image/*" multiple onChange={handleFiles} style={{display:'none'}}/>
                    {uploading ? <><div className="spin" style={{margin:'0 auto'}}></div><p style={{color:'var(--td)',fontSize:12,marginTop:8}}>Yuklanmoqda...</p></>
                      : <><Icon name="upload" size={28} color="rgba(124,58,237,.4)"/><p style={{fontSize:13,color:'var(--td)',marginTop:10}}>Rasm yuklash uchun bosing</p><p style={{fontSize:11,color:'var(--td)',marginTop:4}}>JPG, PNG, GIF • Maksimum 10 ta</p></>}
                  </div>
                  {images.length>0 && (
                    <div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}>
                      {images.map((img,i)=>(
                        <div key={i} style={{position:'relative'}}>
                          <img src={img} alt="" style={{width:64,height:64,objectFit:'cover',borderRadius:9,border:'1px solid var(--b)'}}/>
                          <button type="button" onClick={()=>setImages(prev=>prev.filter((_,j)=>j!==i))} style={{position:'absolute',top:-6,right:-6,width:20,height:20,borderRadius:'50%',background:'var(--red)',border:'2px solid var(--bg)',color:'#fff',fontSize:11,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button className="btn btn-primary" style={{borderRadius:10}} disabled={loading||images.length===0}>
                  {loading?<div className="spin"></div>:<><Icon name="send" size={16}/>Shikoyat yuborish</>}
                </button>
              </form>
            </div>
          </>
        )}

        {tab==='mine' && (
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {mine.map(c=>(
              <Link key={c.id} to={`/complaint/${c.id}`} className="card card-hover">
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                  <span>Kimga: <b style={{color:'var(--pl)'}}>{c.to_player}</b></span>
                  <span className={`badge ${STATUS_CLS[c.status]||'badge-p'}`}>{STATUS[c.status]||c.status}</span>
                </div>
                <p style={{fontSize:13,color:'var(--td)'}}>{c.description.slice(0,120)}...</p>
                <div style={{fontSize:11,color:'var(--td)',marginTop:8}}>{new Date(c.created_at).toLocaleDateString('uz-UZ')}</div>
              </Link>
            ))}
            {mine.length===0 && <div style={{textAlign:'center',color:'var(--td)',padding:60}}><Icon name="alert" size={36} color="rgba(124,58,237,.2)"/><p style={{marginTop:12}}>Shikoyat yo'q</p></div>}
          </div>
        )}
      </div>
    </div>
  )
}
