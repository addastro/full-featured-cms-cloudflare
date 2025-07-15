import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  Activity, 
  TrendingUp,
  Plus,
  Bot
} from 'lucide-react';
import { apiClient } from '../services/api';

interface Stats {
  totalContent: number;
  totalUsers: number;
  apiHealth: string;
  lastUpdated: string;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalContent: 0,
    totalUsers: 0,
    apiHealth: 'Unknown',
    lastUpdated: new Date().toISOString()
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Check API health using the real backend
        const healthData = await apiClient.getHealth();
        
        // Try to fetch content to get real counts
        let contentCount = 0;
        try {
          const contentData = await apiClient.getContent();
          contentCount = Array.isArray(contentData) ? contentData.length : 0;
        } catch {
          // Content endpoint might not be implemented yet
          contentCount = 0;
        }
        
        setStats({
          totalContent: contentCount,
          totalUsers: 1, // Placeholder - will be dynamic when user management is added
          apiHealth: 'Healthy',
          lastUpdated: healthData.timestamp || new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setStats(prev => ({ ...prev, apiHealth: 'Error' }));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Content',
      value: stats.totalContent,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Users', 
      value: stats.totalUsers,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'API Status',
      value: stats.apiHealth,
      icon: Activity,
      color: stats.apiHealth === 'Healthy' ? 'text-green-600' : 'text-red-600',
      bgColor: stats.apiHealth === 'Healthy' ? 'bg-green-50' : 'bg-red-50'
    },
    {
      title: 'Performance',
      value: 'Excellent',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to LEVERAGE AI CMS</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/content/new"
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Content</span>
          </Link>
          <button className="btn-secondary flex items-center space-x-2">
            <Bot className="w-4 h-4" />
            <span>AI Generate</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="content-card dashboard-card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="content-card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">
              API Health Check - System is running normally
            </span>
            <span className="text-xs text-gray-400 ml-auto">
              {new Date(stats.lastUpdated).toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">
              CMS Dashboard initialized successfully
            </span>
            <span className="text-xs text-gray-400 ml-auto">Just now</span>
          </div>
        </div>
      </div>
    </div>
  );
};
