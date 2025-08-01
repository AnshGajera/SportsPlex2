import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Users, Trophy, Bell, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';


const Home = () => {
  const { currentUser } = useAuth();
  console.log('Current user data:', currentUser); // Add logging to debug
  const firstName = currentUser?.firstName || '';
  const lastName = currentUser?.lastName || '';
  const userName = currentUser ? `${firstName} ${lastName}`.trim() || 'User' : 'User';
  
  const stats = [
    { 
      icon: Package, 
      count: 0, 
      label: 'Active Requests',
      color: '#3b82f6',
      iconBg: '#f0f7ff'
    },
    { 
      icon: Users, 
      count: 0, 
      label: 'Joined Clubs',
      color: '#10b981',
      iconBg: '#ecfdf5'
    },
    { 
      icon: Trophy, 
      count: 0, 
      label: 'Live Matches',
      color: '#f59e0b',
      iconBg: '#fffbeb'
    },
    { 
      icon: Bell, 
      count: 0, 
      label: 'New Announcements',
      color: '#8b5cf6',
      iconBg: '#f5f3ff'
    }
  ];

  const quickActions = [
    {
      icon: Package,
      title: 'Request Equipment',
      description: 'Browse and request equipment',
      link: '/equipment',
      bgColor: '#f0f7ff'
    },
    {
      icon: Users,
      title: 'Join Clubs',
      description: 'Explore and join sports clubs',
      link: '/clubs',
      bgColor: '#ecfdf5'
    },
    {
      icon: Trophy,
      title: 'Live Scores',
      description: 'View ongoing match scores',
      link: '/matches',
      bgColor: '#fffbeb'
    },
    {
      icon: Bell,
      title: 'Announcements',
      description: 'Stay updated with latest news',
      link: '/announcements',
      bgColor: '#f5f3ff'
    }
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Welcome, {userName}</h1>
        <p className="text-gray-600">Manage your sports activities and stay updated</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
              <div style={{ backgroundColor: stat.iconBg }} className="w-12 h-12 rounded-lg flex items-center justify-center">
                <IconComponent size={24} style={{ color: stat.color }} />
              </div>
              <div>
                <div className="text-2xl font-bold mb-1" style={{ color: stat.color }}>{stat.count}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            // Define colors for each action
            const actionColors = {
              '/profile': '#f59e0b',
              '/equipment': '#3b82f6', 
              '/clubs': '#10b981',
              '/matches': '#f59e0b',
              '/announcements': '#8b5cf6'
            };
            const iconColor = actionColors[action.link] || '#6b7280';
            
            return (
              <Link key={index} to={action.link} className="block">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div style={{ backgroundColor: action.bgColor }} className="w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <IconComponent size={24} style={{ color: iconColor }} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-gray-600 text-sm">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activities and Live Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activities</h3>
          <div className="text-center py-12">
            <Package size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-6">No recent activities</p>
            <Link
              to="/equipment"
              className="inline-flex px-6 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Request Equipment
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Live Matches</h3>
          <div className="text-center py-12">
            <Trophy size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-6">No live matches</p>
            <Link
              to="/matches"
              className="inline-flex px-6 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Matches
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;