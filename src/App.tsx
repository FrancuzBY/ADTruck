import { Navigate, Route, Routes } from 'react-router'
import { AppShell } from './components/AppShell'
import { Flota } from './pages/Flota'
import { Kampanie } from './pages/Kampanie'
import { Landing } from './pages/Landing'
import { Mapa } from './pages/Mapa'
import { Profil } from './pages/Profil'
import { Zamow } from './pages/Zamow'
import { ZamowPodsumowanie } from './pages/ZamowPodsumowanie'
import { ZamowPotwierdzenie } from './pages/ZamowPotwierdzenie'

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Landing />} />
        <Route path="zamow" element={<Zamow />} />
        <Route path="zamow/podsumowanie" element={<ZamowPodsumowanie />} />
        <Route path="zamow/potwierdzenie" element={<ZamowPotwierdzenie />} />
        <Route path="mapa" element={<Mapa />} />
        <Route path="kampanie" element={<Kampanie />} />
        <Route path="flota" element={<Flota />} />
        <Route path="profil" element={<Profil />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
