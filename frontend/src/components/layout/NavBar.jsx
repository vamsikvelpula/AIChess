import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function NavBar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">&#9818;</span>
        <span>AIChess</span>
      </div>
      <nav className="navbar-links">
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/puzzles">Puzzles</NavLink>
        <NavLink to="/lessons">Lessons</NavLink>
        <NavLink to="/history">History</NavLink>
      </nav>
      <div className="navbar-user">
        <span className="navbar-username">{user?.name}</span>
        <button type="button" className="btn btn-ghost" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}
