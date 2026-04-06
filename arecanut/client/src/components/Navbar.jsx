import { NavLink, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const link = ({ isActive }) =>
    `relative px-4 py-2 text-sm font-medium tracking-wide transition-all duration-200 rounded-lg
     ${isActive
       ? 'text-forest-600 bg-forest-50'
       : 'text-stone-500 hover:text-forest-600 hover:bg-forest-50/60'}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <NavLink to="/home" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-forest-600 flex items-center justify-center text-white text-sm font-bold shadow-sm group-hover:shadow-glow transition-all duration-300">
            N
          </div>
          <span className="font-display text-lg font-bold text-stone-800 tracking-tight">
            NutGrade
          </span>
        </NavLink>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          <NavLink to="/home"      className={link}>Home</NavLink>
          <NavLink to="/dashboard" className={link}>Dashboard</NavLink>
          <NavLink to="/history"   className={link}>History</NavLink>
        </nav>

        {/* User + logout */}
        <div className="flex items-center gap-3">
          {username && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-stone-50 rounded-lg border border-stone-100">
              <div className="w-5 h-5 rounded-full bg-forest-100 flex items-center justify-center">
                <span className="text-forest-700 text-xs font-bold">{username[0].toUpperCase()}</span>
              </div>
              <span className="text-xs text-stone-500 font-medium">{username}</span>
            </div>
          )}
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-stone-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
