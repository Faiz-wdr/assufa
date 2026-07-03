import React from 'react';

export const Admin: React.FC = () => {
  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Super Admin Control</h1>
        <p className="text-sm text-slate-500">Manage tenant organizations, create class sessions, and disable accounts globally.</p>
      </div>
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-800">
        <p className="text-sm text-muted-foreground">SaaS management panels and global operations will be integrated here.</p>
      </div>
    </div>
  );
};
