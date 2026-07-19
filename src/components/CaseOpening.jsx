import { useState, useRef, useEffect } from 'react'
import { Icon } from './Icons'

const ITEM_WIDTH = 130
const REEL_LENGTH = 60
const WINNER_INDEX = 52

function pickWeighted(items) {
  const total = items.reduce((s, i) => s + (i.chance || 1), 0)
  let roll = Math.random() * total
  for (const item of items) { roll -= (item.chance || 1); if (roll <= 0) return item }
  return items[items.length - 1]
}

export default function CaseOpening({ items, winner, onComplete }) {
  const [reel, setReel] = useState([])
  const [translateX, setTranslateX] = useState(0)
  const [spinning, setSpinning] = useState(true)
  const [revealed, setRevealed] = useState(false)
  const viewportRef = useRef(null)

  useEffect(() => {
    if (!items?.length || !winner) return
    const sequence = []
    for (let i = 0; i < REEL_LENGTH; i++) sequence.push(i === WINNER_INDEX ? winner : pickWeighted(items))
    setReel(sequence)
    setTranslateX(0)
    setSpinning(true)
    setRevealed(false)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const viewportWidth = viewportRef.current?.offsetWidth || 640
        const jitter = (Math.random() - 0.5) * (ITEM_WIDTH * 0.5)
        const targetX = -(WINNER_INDEX * ITEM_WIDTH + ITEM_WIDTH / 2 - viewportWidth / 2) + jitter
        setTranslateX(targetX)
      })
    })

    const t = setTimeout(() => { setSpinning(false); setRevealed(true); onComplete?.(winner) }, 5800)
    return () => clearTimeout(t)
  }, [items, winner])

  if (!items?.length) return null

  return (
    <div>
      <div className="case-reel-viewport" ref={viewportRef}>
        <div className="case-reel-pointer"></div>
        <div className="case-reel-track" style={{ transform: `translateX(${translateX}px)`, transition: spinning ? 'transform 5.5s cubic-bezier(0.12, 0.72, 0.14, 1)' : 'none' }}>
          {reel.map((item, i) => (
            <div key={i} className={`case-reel-item rarity-${item.rarity||'common'}`}>
              <Icon name={item.icon||'gift'} size={32} color={rarityColor(item.rarity)} />
              <div className="case-reel-item-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
      {revealed && (
        <div className="case-winner-reveal">
          <div style={{fontSize:12,color:'var(--td)',marginBottom:8}}>Siz yutdingiz:</div>
          <div className="card" style={{display:'inline-flex',alignItems:'center',gap:14,padding:'16px 28px',borderColor:rarityColor(winner.rarity)}}>
            <Icon name={winner.icon||'gift'} size={36} color={rarityColor(winner.rarity)} />
            <div style={{textAlign:'left'}}>
              <div className={winner.rarity==='legendary'?'legendary-glow':''} style={{fontSize:20,fontWeight:800,color:winner.rarity==='legendary'?undefined:'#fff'}}>{winner.label}</div>
              <div style={{fontSize:11,color:rarityColor(winner.rarity),textTransform:'uppercase',fontWeight:700,letterSpacing:1}}>{rarityLabel(winner.rarity)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function rarityColor(rarity) { return { common:'#9CA3AF', uncommon:'#22C55E', rare:'#3B82F6', epic:'#A855F7', legendary:'#F59E0B' }[rarity] || '#9CA3AF' }
function rarityLabel(rarity) { return { common:'Oddiy', uncommon:'Yaxshi', rare:'Kamyob', epic:'Epik', legendary:'Afsonaviy' }[rarity] || 'Oddiy' }
