import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('srp_token')
    const saved = localStorage.getItem('srp_user')
    if (token && saved) {
      setUser(JSON.parse(saved))
      api.get('auth/profile', {}, api.authH(token)).then(d => {
        if (d.success) { setUser(d.player); localStorage.setItem('srp_user', JSON.stringify(d.player)) }
        else logout()
      }).catch(()=>{}).finally(()=>setLoading(false))
    } else setLoading(false)
  }, [])

  const loadNotifications = async (token) => {
    const d = await api.get('notifications', {}, api.authH(token))
    if (d.notifications) setNotifications(d.notifications)
  }

  const login = (token, player) => {
    localStorage.setItem('srp_token', token)
    localStorage.setItem('srp_user', JSON.stringify(player))
    setUser(player)
    if ('Notification' in window && Notification.permission==='default') Notification.requestPermission()
  }

  const logout = () => {
    const t = localStorage.getItem('srp_token')
    if (t) api.post('auth/logout', {}, api.authH(t)).catch(()=>{})
    localStorage.removeItem('srp_token'); localStorage.removeItem('srp_user')
    setUser(null); setNotifications([])
  }

  const getToken = () => localStorage.getItem('srp_token')

  const refreshUser = async () => {
    const token = getToken(); if (!token) return
    const d = await api.get('auth/profile', {}, api.authH(token))
    if (d.success) { setUser(d.player); localStorage.setItem('srp_user', JSON.stringify(d.player)) }
  }

  const markNotificationsRead = async () => {
    const token = getToken(); if (!token) return
    await api.post('notifications/read', {}, api.authH(token))
    setNotifications(prev => prev.map(n=>({...n, is_read:1})))
  }

  return (
    <Ctx.Provider value={{ user, login, logout, loading, getToken, refreshUser, notifications, loadNotifications, markNotificationsRead }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
