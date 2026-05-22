import { Menu, UserRound, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import { useAuth } from "../state/AuthContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/lobby", label: "Lobby" },
  { to: "/about", label: "About" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, signOut, user } = useAuth();

  const linkClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-semibold transition ${
      isActive ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-ink/75 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <BrandLogo />

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                <img
                  src={user?.avatarlink || "/logo.png"}
                  alt=""
                  className="h-7 w-7 rounded-full bg-white object-cover"
                />
                {user?.username || "Profile"}
              </Link>
              <button
                className="min-h-[46px] rounded-lg border border-white/10 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/15"
                onClick={signOut}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">
                Sign in
              </Link>
              <Link to="/register" className="btn-primary">
                Join free
              </Link>
            </>
          )}
        </div>

        <button
          aria-label="Toggle navigation"
          className="rounded-lg border border-white/10 p-2 text-white md:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-ink px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass} onClick={() => setOpen(false)}>
                {link.label}
              </NavLink>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="btn-secondary justify-center" onClick={() => setOpen(false)}>
                    <UserRound className="h-4 w-4" />
                    Profile
                  </Link>
                  <button className="btn-secondary justify-center" onClick={signOut}>
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary justify-center" onClick={() => setOpen(false)}>
                    Sign in
                  </Link>
                  <Link to="/register" className="btn-primary justify-center" onClick={() => setOpen(false)}>
                    Join free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
