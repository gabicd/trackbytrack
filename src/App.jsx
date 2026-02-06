import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import AlbumDetails from './pages/AlbumDetails'
import SearchPage from './pages/SearchPage'
import UserProfile from './pages/UserProfile'
import Activity from './pages/Profile/Activity'
import Diary from './pages/Profile/Diary'
import Reviews from './pages/Profile/Reviews'
import ToListen from './pages/Profile/ToListen'
import Lists from './pages/Profile/Lists'
import Tags from './pages/Profile/Tags'
import Likes from './pages/Profile/Likes'
import './App.css'

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lists" element={<div>Listas</div>} />
          <Route path="/friends" element={<div>Amigos</div>} />
          <Route path="/community" element={<div>Comunidade</div>} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/profile/activity" element={<Activity />} />
          <Route path="/profile/diary" element={<Diary />} />
          <Route path="/profile/reviews" element={<Reviews />} />
          <Route path="/profile/to-listen" element={<ToListen />} />
          <Route path="/profile/lists" element={<Lists />} />
          <Route path="/profile/tags" element={<Tags />} />
          <Route path="/profile/likes" element={<Likes />} />
          <Route path="/settings" element={<div>Configurações</div>} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/album/:id" element={<AlbumDetails />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
