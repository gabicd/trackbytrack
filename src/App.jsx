import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import AlbumDetails from './pages/AlbumDetails'
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
          <Route path="/profile" element={<div>Perfil</div>} />
          <Route path="/settings" element={<div>Configurações</div>} />
          <Route path="/search" element={<div>Busca</div>} />
          <Route path="/album" element={<AlbumDetails />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
