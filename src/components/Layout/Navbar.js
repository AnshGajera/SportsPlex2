import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [showDropdown, setShowDropdown] = React.useState(false);
  
  // Generate initials from user's name
  const getInitials = () => {
    if (!currentUser) return '';
    const firstName = currentUser.firstName || '';
    const lastName = currentUser.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.profile-menu')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDropdown]);

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/img2.jpg" className="h-8 w-8" alt="SportsPlex Logo" />
              <span className="ml-2 text-xl font-semibold text-gray-900">SportsPlex</span>
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            <Link to={currentUser && currentUser.role === 'admin' ? '/admin' : '/Home'} className={`px-3 py-2 text-sm font-medium rounded-lg ${location.pathname === '/Home' || location.pathname === '/admin' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>Home</Link>
            <Link to="/Equipment" className={`px-3 py-2 text-sm font-medium rounded-lg ${location.pathname === '/Equipment' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>Equipment</Link>
            <Link to="/Clubs" className={`px-3 py-2 text-sm font-medium rounded-lg ${location.pathname === '/Clubs' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>Clubs</Link>
            <Link to="/Matches" className={`px-3 py-2 text-sm font-medium rounded-lg ${location.pathname === '/Matches' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>Matches</Link>
            <Link to="/Announcements" className={`px-3 py-2 text-sm font-medium rounded-lg ${location.pathname === '/Announcements' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>Announcements</Link>
            
            {/* Profile Menu */}
            <div className="relative profile-menu">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-medium hover:bg-blue-200 transition-colors"
              >
                {getInitials()}
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                  {/* User Info */}
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{currentUser?.firstName} {currentUser?.lastName}</p>
                    <p className="text-sm text-gray-500">{currentUser?.email}</p>
                  </div>

                  {/* Menu Items */}
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    Profile
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;