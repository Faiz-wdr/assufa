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
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const isSuperAdmin = profile?.role === 'super_admin';

  // Mobile navigation tabs definition (exactly 5 items)
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
    // Outer container: centers the stretched mobile container on desktop screens
    <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-900 flex justify-center">
      {/* 
        App Shell Container:
        - Constrains width to max-w-md on desktop screens (creating a stretched phone look)
        - Fills viewport completely on mobile screens
      */}
      <div className="relative w-full max-w-md min-h-screen bg-neutral-bg flex flex-col shadow-soft border-x border-neutral-border overflow-hidden">
        
        {/* Sticky App Bar (64px / h-16) */}
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-neutral-border bg-white px-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-primary text-white font-bold text-sm shadow-sm">
              ND
            </div>
            <div className="text-left">
              <h2 className="text-body-lg font-bold text-neutral-textPrimary tracking-tight">
                {isSuperAdmin ? 'Super Admin' : 'Assufa Dars'}
              </h2>
              <p className="text-caption text-primary leading-none font-medium mt-0.5">
                {isSuperAdmin ? 'Admin Panel' : 'Green Class'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button 
              onClick={handleLogout}
              className="flex h-10 w-10 items-center justify-center rounded-btn text-neutral-textSecondary hover:bg-neutral-bg hover:text-neutral-textPrimary transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* 
          Main Scrollable Content Window
          - Bottom margin matches bottom nav height + safety margin (pb-24 / 96px)
        */}
        <main className="flex-1 overflow-y-auto px-4 py-5 pb-24 text-left">
          <Outlet />
        </main>

        {/* Sticky Bottom Navigation (72px / h-[72px]) with 28px rounded top corners */}
        <nav className="fixed bottom-0 z-40 w-full max-w-md h-[72px] border-t border-neutral-border bg-white shadow-sheet rounded-t-sheet flex items-center justify-around px-4 pb-safe-bottom">
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
                      : 'text-neutral-textSecondary hover:text-neutral-textPrimary'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`p-1.5 rounded-btn transition-colors ${isActive ? 'bg-primary-soft text-primary' : 'text-neutral-textSecondary'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-[10px] font-semibold mt-0.5 tracking-tight ${isActive ? 'text-primary font-bold' : 'text-neutral-textSecondary'}`}>
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
