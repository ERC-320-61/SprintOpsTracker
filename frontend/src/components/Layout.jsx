import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import ErrorBoundary from "./ErrorBoundary";

export default function Layout() {
  return (
    <div className="layout">
      <Navbar />
      <main className="layout__main">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
