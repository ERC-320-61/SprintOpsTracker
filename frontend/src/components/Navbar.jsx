import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const navOuterStyle = {
    width: "100%",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  };

  const navInnerStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 1.5rem",
  };

  const brandStyle = {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
    letterSpacing: "0.3px",
  };

  const linksWrapperStyle = {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  };

  const getLinkStyle = (isActive) => ({
    textDecoration: "none",
    color: isActive ? "#ffffff" : "#374151",
    backgroundColor: isActive ? "#111827" : "#f3f4f6",
    padding: "0.55rem 0.9rem",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: "500",
    transition: "all 0.2s ease",
  });

  return (
    <nav style={navOuterStyle}>
      <div style={navInnerStyle}>
        <h2 style={brandStyle}>Sprint-Ops Tracker</h2>

        <div style={linksWrapperStyle}>
          <Link to="/" style={getLinkStyle(location.pathname === "/")}>
            Dashboard
          </Link>

          <Link
            to="/backlog"
            style={getLinkStyle(location.pathname === "/backlog")}
          >
            Backlog
          </Link>

          <Link
            to="/sprint-board"
            style={getLinkStyle(location.pathname === "/sprint-board")}
          >
            Sprint Board
          </Link>

          <Link
            to="/sprints"
            style={getLinkStyle(location.pathname === "/sprints")}
          >
            Sprint Management
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;