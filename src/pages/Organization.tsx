import React from 'react';

export const Organization: React.FC = () => {
  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Class Settings</h1>
        <p className="text-sm text-slate-500">Manage class details and tenant configurations.</p>
      </div>
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-800">
        <p className="text-sm text-muted-foreground">Class metadata, organization settings, and localized tenant settings will be integrated here.</p>
      </div>
    </div>
  );
};
