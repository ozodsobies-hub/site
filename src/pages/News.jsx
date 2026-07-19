import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Icon } from '../components/Icons'
import api from '../utils/api'

export function NewsList() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [cat, setCat] = useState('')
  const cats = ['','Yangilik','Yangilanish','Event','Muhim']

  useEffect(() => {
    setLoading(true)
    api.get('news', { page, limit:9, ...(cat?{category:cat}:{}) }).then(d => {
      if(d.success){ setNews(d.news); setPages(d.pages||1) }
      setLoading(false)
    })
  }, [page, cat])

  return (
    <div className="pt">
      <div className="wrap">
        <div className="line"></div>
        <h1 style={{fontSize:32,fontWeight:800,marginBottom:6}}>Yangiliklar</h1>
        <p style={{color:'var(--td)',marginBottom:24}}>Shadows RP yangiliklari va e'lonlari</p>
        <div style={{display:'flex',gap:8,marginBottom:28,flexWrap:'wrap'}}>
          {cats.map(c=>(
            <button key={c} onClick={()=>{setCat(c);setPage(1)}} className="btn btn-sm" style={{background:cat===c?'var(--p)':'transparent',color:cat===c?'#fff':'var(--td)',border:'1px solid var(--b)',borderRadius:8}}>
              {c||'Barchasi'}
            </button>
          ))}
        </div>
        {loading ? <div className="loading"><div className="spin"></div><span>Yuklanmoqda...</span></div> : (
          <>
            <div className="grid3">
              {news.map(n=>(
                <Link key={n.id} to={`/news/${n.id}`} className="card card-hover" style={{padding:0,overflow:'hidden',display:'flex',flexDirection:'column'}}>
                  <div style={{position:'relative'}}>
                    {n.image_url
                      ? <img src={n.image_url} alt="" style={{width:'100%',height:190,objectFit:'cover'}}/>
                      : <div style={{height:120,background:'linear-gradient(135deg,rgba(124,58,237,.2),rgba(76,29,149,.1))',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name="news" size={36} color="rgba(124,58,237,.3)"/></div>
                    }
                    {n.pinned==1 && <span style={{position:'absolute',top:10,right:10}} className="badge badge-gold"><Icon name="pin" size={10}/>Pin</span>}
                  </div>
                  <div style={{padding:18,flex:1,display:'flex',flexDirection:'column'}}>
                    <span className="badge badge-p" style={{marginBottom:10,alignSelf:'flex-start'}}>{n.category}</span>
                    <h3 style={{fontSize:15,fontWeight:700,marginBottom:'auto',lineHeight:1.4}}>{n.title}</h3>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--td)',marginTop:14,paddingTop:12,borderTop:'1px solid rgba(124,58,237,.08)'}}>
                      <span>{n.author}</span>
                      <span style={{display:'flex',alignItems:'center',gap:4}}><Icon name="eye" size={11}/>{n.views||0}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {news.length===0 && <div style={{textAlign:'center',color:'var(--td)',padding:80}}><Icon name="news" size={40} color="rgba(124,58,237,.2)"/><p style={{marginTop:14}}>Yangilik topilmadi</p></div>}
            {pages>1 && (
              <div style={{display:'flex',justifyContent:'center',gap:8,marginTop:36}}>
                {Array.from({length:pages},(_,i)=>i+1).map(p=>(
                  <button key={p} onClick={()=>setPage(p)} className="btn btn-sm" style={{background:p===page?'var(--p)':'transparent',color:p===page?'#fff':'var(--td)',border:'1px solid var(--b)',minWidth:36}}>{p}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export function NewsDetail() {
  const { id } = useParams()
  const [news, setNews] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { api.get(`news/${id}`).then(d=>{ if(d.success)setNews(d.news); setLoading(false) }) }, [id])

  if (loading) return <div className="pt loading"><div className="spin"></div></div>
  if (!news) return <div className="pt wrap" style={{textAlign:'center',padding:80,color:'var(--td)'}}>Yangilik topilmadi</div>

  let gallery = []
  try { gallery = JSON.parse(news.gallery||'[]') } catch {}

  return (
    <div className="pt">
      <div className="wrap" style={{maxWidth:820}}>
        <Link to="/news" className="btn btn-outline btn-sm" style={{marginBottom:24}}>
          <Icon name="transfer" size={14} style={{transform:'rotate(180deg)'}}/> Orqaga
        </Link>
        {news.image_url && <img src={news.image_url} alt="" style={{width:'100%',maxHeight:440,objectFit:'cover',borderRadius:14,marginBottom:24}}/>}
        {news.video_url && <video src={news.video_url} controls style={{width:'100%',borderRadius:14,marginBottom:24}}/>}
        <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
          <span className="badge badge-p">{news.category}</span>
          {news.pinned==1 && <span className="badge badge-gold"><Icon name="pin" size={10}/>Pin</span>}
        </div>
        <h1 style={{fontSize:30,fontWeight:900,marginBottom:16,lineHeight:1.2}}>{news.title}</h1>
        <div style={{display:'flex',gap:16,fontSize:12,color:'var(--td)',marginBottom:28,paddingBottom:22,borderBottom:'1px solid var(--b)',flexWrap:'wrap'}}>
          <span><Icon name="user" size={12}/> {news.author}</span>
          <span><Icon name="clock" size={12}/> {new Date(news.created_at).toLocaleString('uz-UZ')}</span>
          <span><Icon name="eye" size={12}/> {news.views} ko'rildi</span>
        </div>
        {news.html_content
          ? <div className="news-content" dangerouslySetInnerHTML={{__html:news.html_content}}/>
          : <div className="news-content" style={{whiteSpace:'pre-wrap',lineHeight:1.8}}>{news.content}</div>
        }
        {gallery.length>0 && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:10,marginTop:24}}>
            {gallery.map((img,i)=><a key={i} href={img} target="_blank" rel="noreferrer"><img src={img} alt="" style={{width:'100%',height:130,objectFit:'cover',borderRadius:10,transition:'transform .2s'}} onMouseOver={e=>e.target.style.transform='scale(1.03)'} onMouseOut={e=>e.target.style.transform='scale(1)'}/></a>)}
          </div>
        )}
        {news.css_content && <style dangerouslySetInnerHTML={{__html:news.css_content}}/>}
      </div>
    </div>
  )
}
