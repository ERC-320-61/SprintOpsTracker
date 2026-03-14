import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import DashboardPage from './pages/DashboardPage'
import BacklogPage from './pages/BacklogPage'
import SprintBoardPage from './pages/SprintBoardPage'
import SprintManagementPage from './pages/SprintManagementPage'

function App() {
  return (
    <>
      <Navbar />
      <main style={{ padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/backlog" element={<BacklogPage />} />
          <Route path="/sprint-board" element={<SprintBoardPage />} />
          <Route path="/sprints" element={<SprintManagementPage />} />
        </Routes>
      </main>
    </>
  )
}

export default App