import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (user !== undefined) {
      setLoading(false);
    }
  }, [user]);

  const handleMouseEnter = (dropdown) => {
    setActiveDropdown(dropdown);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavigation = (path, e) => {
    if (e) e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login', { state: { returnUrl: path } });
      return;
    }

    navigate(path);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderDropdownMenu = (items) => (
    <ul className="absolute z-10 bg-white border rounded-md shadow-lg py-1 mt-1 w-48 transition-all duration-300 ease-in-out opacity-0 transform scale-95 origin-top-right group-hover:opacity-100 group-hover:scale-100">
      {items.map((item, index) => (
        <li key={index}>
          {item.protected ? (
            <button
              onClick={() => handleNavigation(item.path)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 whitespace-nowrap"
            >
              {item.label}
            </button>
          ) : (
            <Link
              to={item.path}
              className="block px-4 py-2 hover:bg-gray-100 whitespace-nowrap"
            >
              {item.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );

  const dropdowns = {
    candidates: [{ label: 'Find a Job', path: '/FindJob' }],
    employers: [
      { label: 'Post a Job', path: '/PostJob', protected: true },
      { label: 'Job Dashboard', path: '/JobDashboard', protected: true },
    ],
    pages: [
      { label: 'Blog', path: '/Blog' },
      { label: 'Contact Us', path: '/ContactUs' },
    ],
  };

  const renderUserProfile = () => (
    <div className="relative group">
      <button
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
        onMouseEnter={() => handleMouseEnter('profile')}
        onMouseLeave={handleMouseLeave}
      >
        <User className="h-5 w-5" />
        <span className="text-sm font-medium">{user?.email}</span>
        <ChevronDown className="h-4 w-4" />
      </button>
      <ul className="absolute right-0 z-10 bg-white border rounded-md shadow-lg py-1 mt-1 w-48 transition-all duration-300 ease-in-out opacity-0 transform scale-95 origin-top-right group-hover:opacity-100 group-hover:scale-100">
        <li className="px-4 py-2 text-sm text-gray-500">
          Role: {user?.role}
          {user?.companyName && (
            <div className="text-xs text-gray-400">{user.companyName}</div>
          )}
        </li>
        <li>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </li>
      </ul>
    </div>
  );

  if (loading) {
    return null;
  }

  return (
    <div>
      <nav className="bg-white shadow-md z-50 fixed top-0 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex-shrink-0">
              <Link to="/" className="text-xl sm:text-2xl font-bold text-indigo-600 whitespace-nowrap">
                JobBoard
              </Link>
            </div>

            {/* Dropdown Menus */}
            <div className="hidden md:flex justify-center flex-grow space-x-4">
              {Object.entries(dropdowns).map(([key, items]) => (
                <div
                  key={key}
                  className="relative group"
                  onMouseEnter={() => handleMouseEnter(key)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button className="flex items-center text-gray-500 hover:text-gray-700 px-2 sm:px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                  {renderDropdownMenu(items)}
                </div>
              ))}
            </div>

            {/* Post a Job and Login/Signup/Profile Section */}
            <div className="hidden md:flex items-center space-x-2 sm:space-x-4">
              {isAuthenticated && user?.role === 'employer' && (
                <button
                  onClick={() => handleNavigation('/PostJob')}
                  className="bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap"
                >
                  Post a Job
                </button>
              )}
              {isAuthenticated ? (
                renderUserProfile()
              ) : (
                <Link
                  to="/Login"
                  state={{ returnUrl: location.pathname }}
                  className="bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap"
                >
                  Login/Signup
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={toggleMenu}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden px-4 sm:px-6 py-4 bg-white shadow-md">
            {isAuthenticated && user && (
              <div className="border-b border-gray-200 pb-3 mb-3">
                <div className="flex items-center px-4 py-2">
                  <User className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">{user.email}</div>
                    <div className="text-xs text-gray-500">Role: {user.role}</div>
                    {user.companyName && (
                      <div className="text-xs text-gray-500">{user.companyName}</div>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-2 w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
            {Object.entries(dropdowns).map(([key, items]) => (
              <div key={key} className="py-2">
                <p className="text-gray-600 font-medium mb-1">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </p>
                <ul>
                  {items.map((item, index) => (
                    <li key={index} className="py-1">
                      {item.protected ? (
                        <button
                          onClick={() => handleNavigation(item.path)}
                          className="w-full text-left px-4 py-2 text-indigo-600 hover:bg-gray-100 rounded-md whitespace-nowrap"
                        >
                          {item.label}
                        </button>
                      ) : (
                        <Link
                          to={item.path}
                          className="block px-4 py-2 text-indigo-600 hover:bg-gray-100 rounded-md whitespace-nowrap"
                        >
                          {item.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
