import React from 'react';
import { User, Settings, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="cms-header">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">LEVERAGE AI CMS</h1>
          <span className="bg-white/20 px-2 py-1 rounded text-sm">v1.0.0</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span className="text-sm">Admin User</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-white/10 rounded transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
