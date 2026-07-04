import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { 
  Home, 
  ClipboardCheck, 
  Users, 
  BarChart2, 
  Settings,
  LogOut
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { profile, organization, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const isSuperAdmin = profile?.role === 'super_admin';

  // Dynamic organization place shown as subtitle in header
  const orgPlace = organization?.location || organization?.name || 'Assufa Dars';

  const navItems = [
    { to: '/dashboard', label: 'Home', icon: Home },
    { to: '/attendance', label: 'Attendance', icon: ClipboardCheck },
    { to: '/students', label: 'Students', icon: Users },
    { to: '/reports', label: 'Reports', icon: BarChart2 },
    { 
      to: isSuperAdmin ? '/admin' : '/organization', 
      label: 'Settings', 
      icon: Settings 
    },
  ];

  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div className="relative w-full max-w-md min-h-screen bg-background flex flex-col shadow-soft border-x border-border overflow-hidden">
        
        {/* Sticky App Bar */}
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border px-4 theme-transition"
          style={{ backgroundColor: 'var(--header-bg)' }}>
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-primary text-white font-bold text-sm shadow-sm">
              AD
            </div>
            <div className="text-left">
              <h2 className="text-body-lg font-bold text-foreground tracking-tight">
                {isSuperAdmin ? 'Super Admin' : 'Assufa Dars'}
              </h2>
              <p className="text-caption text-primary leading-none font-medium mt-0.5">
                {isSuperAdmin ? 'Admin Panel' : orgPlace}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button 
              onClick={handleLogout}
              className="flex h-10 w-10 items-center justify-center rounded-btn text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-4 py-5 pb-24 text-left">
          <Outlet />
        </main>

        {/* Sticky Bottom Navigation */}
        <nav className="fixed bottom-0 z-40 w-full max-w-md h-[72px] border-t border-border shadow-sheet rounded-t-sheet flex items-center justify-around px-4 pb-safe-bottom theme-transition"
          style={{ backgroundColor: 'var(--nav-bg)' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-14 h-14 rounded-btn transition-all duration-150 ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`p-1.5 rounded-btn transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-[10px] font-semibold mt-0.5 tracking-tight ${isActive ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
        
      </div>
    </div>
  );
};
