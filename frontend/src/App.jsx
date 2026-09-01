import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Placeholder from "./pages/Placeholder";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Placeholder title="SprintOps-Tracker" />} />
        <Route path="projects/:projectKey">
          <Route index element={<Navigate to="board" replace />} />
          <Route path="backlog" element={<Placeholder title="Backlog" />} />
          <Route path="board" element={<Placeholder title="Sprint Board" />} />
          <Route path="sprints" element={<Placeholder title="Sprints" />} />
        </Route>
        <Route path="*" element={<Placeholder title="Not found" />} />
      </Route>
    </Routes>
  );
}
