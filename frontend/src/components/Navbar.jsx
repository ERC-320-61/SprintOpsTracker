import { Link, NavLink, useMatch } from "react-router-dom";

const projectLinks = [
  { segment: "backlog", label: "Backlog" },
  { segment: "board", label: "Sprint Board" },
  { segment: "sprints", label: "Sprints" },
];

export default function Navbar() {
  const match = useMatch("/projects/:projectKey/*");
  const projectKey = match?.params.projectKey;

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__brand">
        SprintOps-Tracker
      </Link>

      {projectKey && (
        <div className="navbar__links">
          {projectLinks.map(({ segment, label }) => (
            <NavLink
              key={segment}
              to={`/projects/${projectKey}/${segment}`}
              className={({ isActive }) =>
                isActive ? "navbar__link navbar__link--active" : "navbar__link"
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
