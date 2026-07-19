const BASE = 'https://backend-production-af62.up.railway.app'

export const api = {
  get: async (endpoint, query = {}, headers = {}) => {
    const qs = new URLSearchParams(query).toString()
    try {
      const res = await fetch(`${BASE}/${endpoint}${qs?'?'+qs:''}`, { headers })
      return JSON.parse(await res.text())
    } catch { return { error: 'Server xatosi' } }
  },
  post: async (endpoint, body = {}, headers = {}) => {
    try {
      const res = await fetch(`${BASE}/${endpoint}`, {
        method:'POST', headers:{ 'Content-Type':'application/json', ...headers }, body: JSON.stringify(body)
      })
      return JSON.parse(await res.text())
    } catch { return { error: 'Server xatosi' } }
  },
  upload: async (endpoint, formData, headers = {}) => {
    try {
      const res = await fetch(`${BASE}/${endpoint}`, { method:'POST', headers, body: formData })
      return await res.json()
    } catch { return { error: 'Yuklash xatosi' } }
  },
  authH: (token) => ({ Authorization: `Bearer ${token}` }),
  ownerH: (l,p) => ({ 'X-Owner-Login':l, 'X-Owner-Pass':p }),
}

export const fmt = v => Number(v||0).toLocaleString('ru-RU')

export const teamNames = { 0:'Fuqaro',1:'Politsiya UMVD',2:'SSV-A Arzamas',3:'Harbiy QK',4:'FCB',5:'SSV-J Yujniy',6:'GIBD Yujniy',7:'OBV Hukumat',8:'Arzamas OPG',9:'Litkarino OPG' }
export const teamColors = { 0:'#6B6B8A',1:'#3B82F6',2:'#10B981',3:'#6B7280',4:'#EF4444',5:'#14B8A6',6:'#8B5CF6',7:'#F59E0B',8:'#EC4899',9:'#F97316' }
export const adminLvl = { 0:"O'yinchi",1:'Yangi Admin',2:'Admin 1',3:'Admin 2',4:'Admin 3',5:'Admin 4',6:'Admin 5',7:'Katta Admin',8:'Bosh Admin',9:'Maxsus Administrator',10:'Kurator',11:'Server Kuratori',13:'Owner' }
export const rarityColors = { common:'#9CA3AF', uncommon:'#22C55E', rare:'#3B82F6', epic:'#A855F7', legendary:'#F59E0B' }

export const uploadFile = async (file, type='image', token='') => {
  const fd = new FormData(); fd.append('file', file)
  const endpoint = type==='video'?'upload/video':type==='support'?'upload/support':'upload/image'
  return await api.upload(endpoint, fd, token?{Authorization:`Bearer ${token}`}:{})
}
export const uploadFiles = async (files, token='', type='complaint') => {
  const fd = new FormData(); for (const f of files) fd.append('files', f)
  const endpoint = type==='support'?'upload/support':'upload/complaint'
  return await api.upload(endpoint, fd, token?{Authorization:`Bearer ${token}`}:{})
}

export default api
