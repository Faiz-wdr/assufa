import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md rounded-card border border-neutral-border dark:border-neutral-700 bg-white dark:bg-neutral-800 p-6 shadow-lifted">
        <div className="flex flex-col items-center space-y-2">
          {/* App Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-[18px] overflow-hidden shadow-sm">
            <img
              src="/favicon.svg"
              alt="Assufa Dars"
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-textPrimary dark:text-white">Assufa Dars</h1>
          <p className="text-xs text-neutral-textSecondary dark:text-neutral-400">Attendance Management System</p>
        </div>
        <div className="mt-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
