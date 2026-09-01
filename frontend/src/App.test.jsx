import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("application shell", () => {
  it("renders the brand and the home placeholder at /", () => {
    renderAt("/");
    expect(screen.getByRole("link", { name: "SprintOps-Tracker" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(
      screen.getByRole("heading", { name: "SprintOps-Tracker" }),
    ).toBeInTheDocument();
  });

  it("hides project nav links outside a project", () => {
    renderAt("/");
    expect(screen.queryByRole("link", { name: "Backlog" })).toBeNull();
  });

  it("shows project-scoped nav links inside a project, marking the active one", () => {
    renderAt("/projects/SOT/board");
    expect(screen.getByRole("link", { name: "Backlog" })).toHaveAttribute(
      "href",
      "/projects/SOT/backlog",
    );
    const board = screen.getByRole("link", { name: "Sprint Board" });
    expect(board).toHaveAttribute("href", "/projects/SOT/board");
    expect(board).toHaveAttribute("aria-current", "page");
  });

  it("renders a not-found placeholder for unknown routes", () => {
    renderAt("/nope");
    expect(screen.getByRole("heading", { name: "Not found" })).toBeInTheDocument();
  });
});

describe("ErrorBoundary", () => {
  it("renders a fallback instead of crashing the app", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const Bomb = () => {
      throw new Error("boom");
    };
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong.");
    spy.mockRestore();
  });
});
