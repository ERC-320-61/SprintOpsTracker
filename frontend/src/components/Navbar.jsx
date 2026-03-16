import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <h2>SprintOpsTracker</h2>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/">Dashboard</Link>
        <Link to="/backlog">Backlog</Link>
        <Link to="/sprint-board">Sprint Board</Link>
        <Link to="/sprints">Sprint Management</Link>
      </div>
    </nav>
  )
}

export default Navbar