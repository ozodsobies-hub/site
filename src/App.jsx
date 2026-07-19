import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ToastContainer from './components/Toast'
import Home from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import { NewsList, NewsDetail } from './pages/News'
import Support from './pages/Support'
import Transfer from './pages/Transfer'
import Leaderboard from './pages/Leaderboard'
import Faction from './pages/Faction'
import { ComplaintsList, ComplaintDetail, MyComplaints } from './pages/Complaints'
import AdminApply from './pages/AdminApply'
import AdminPanel from './pages/AdminPanel'
import OwnerPanel from './pages/OwnerPanel'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/profile" element={<Profile/>}/>
          <Route path="/news" element={<NewsList/>}/>
          <Route path="/news/:id" element={<NewsDetail/>}/>
          <Route path="/support" element={<Support/>}/>
          <Route path="/transfer" element={<Transfer/>}/>
          <Route path="/leaderboard" element={<Leaderboard/>}/>
          <Route path="/faction/:teamId" element={<Faction/>}/>
          <Route path="/complaints" element={<ComplaintsList/>}/>
          <Route path="/complaint/:id" element={<ComplaintDetail/>}/>
          <Route path="/my-complaints" element={<MyComplaints/>}/>
          <Route path="/admin-apply" element={<AdminApply/>}/>
          <Route path="/admin" element={<AdminPanel/>}/>
          <Route path="/owner" element={<OwnerPanel/>}/>
        </Routes>
        <Footer/>
        <ToastContainer/>
      </BrowserRouter>
    </AuthProvider>
  )
}
