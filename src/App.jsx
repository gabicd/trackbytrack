import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import AlbumDetails from './pages/AlbumDetails'
import SearchPage from './pages/SearchPage'
import UserProfile from './pages/UserProfile'
import Diary from './pages/Profile/Diary'
import Reviews from './pages/Profile/Reviews'
import ToListen from './pages/Profile/ToListen'
import Lists from './pages/Profile/Lists'
import Likes from './pages/Profile/Likes'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import './App.css'

function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="app">
      {!hideNavbar && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lists" element={<div>Listas</div>} />
          <Route path="/friends" element={<div>Amigos</div>} />
          <Route path="/community" element={<div>Comunidade</div>} />
          <Route path="/profile" element={<UserProfile />} />
          
          <Route path="/profile/diary" element={<Diary />} />
          <Route path="/profile/reviews" element={<Reviews />} />
          <Route path="/profile/to-listen" element={<ToListen />} />
          <Route path="/profile/lists" element={<Lists />} />
          
          <Route path="/profile/likes" element={<Likes />} />
          <Route path="/settings" element={<div>Configurações</div>} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/album/:id" element={<AlbumDetails />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
