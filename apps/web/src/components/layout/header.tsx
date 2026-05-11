import { useNavigate } from "react-router-dom";
import { Bell, Menu, Search, LogOut, User, Settings } from "lucide-react";
import { useAuth } from "../../providers/auth-provider";
import { useUnreadCount } from "../../hooks/use-notifications";
import { getInitials } from "../../lib/utils";
import { useState, useRef, useEffect } from "react";

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: unreadCount = 0 } = useUnreadCount();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 w-64">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents..."
            className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          onClick={() => navigate("/notifications")}
          className="relative inline-flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {user ? getInitials(user.firstName, user.lastName) : "U"}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-700">
                {user ? `${user.firstName} ${user.lastName}` : "User"}
              </p>
              <p className="text-xs text-slate-500">
                {user?.role || "viewer"}
              </p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-lg animate-fade-in">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-medium text-slate-900">
                  {user ? `${user.firstName} ${user.lastName}` : "User"}
                </p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate("/settings");
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate("/users");
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <User className="h-4 w-4" />
                Profile
              </button>
              <div className="border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
