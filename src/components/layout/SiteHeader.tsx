import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/ai", label: "Play vs AI" },
  { to: "/home", label: "Lobby" },
  { to: "/dashboard", label: "Dashboard" },
];

const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2" aria-label="Checkmate Chess Home">
          <span className="inline-block h-6 w-6 rounded-md bg-gradient-primary shadow-glow" />
          <span className="font-semibold">Checkmate</span>
        </Link>
        <div className="hidden gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm transition-colors hover:text-foreground ${isActive ? "text-foreground" : "text-muted-foreground"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/home">Find Match</Link>
          </Button>
          <Button asChild variant="hero" size="sm">
            <Link to="/ai">Play AI</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default SiteHeader;
