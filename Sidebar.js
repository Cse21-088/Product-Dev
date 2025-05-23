import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaUsers,
  FaCalendarAlt,
  FaImages,
  FaNewspaper,
  FaChartBar,
  FaUserCircle,
  FaBars,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaCog
} from 'react-icons/fa';
import { auth, firestore } from '../database/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import {
  LayoutDashboard,
  Mail,
  Settings,
} from "lucide-react";

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const q = query(
            collection(firestore, "admin"),
            where("email", "==", user.email)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setCurrentUser(userData);
          } else {
            console.log("No admin account found.");
            setCurrentUser(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const menuItems = useMemo(() => [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      title: "Analytics",
      icon: FaChartBar,
      path: "/admin/analytics",
    },
    {
      title: "Enquiries",
      icon: Mail,
      path: "/admin/enquiries",
    },
    {
      title: "Customer Groups",
      icon: FaUsers,
      path: "/admin/customer-groups",
    },
    {
      title: "Events",
      icon: FaCalendarAlt,
      path: "/admin/events",
    },
    {
      title: "Gallery",
      icon: FaImages,
      path: "/admin/gallery",
    },
    {
      title: "Articles",
      icon: FaNewspaper,
      path: "/admin/articles",
    },

  ], []);

  const renderUserProfile = () => {
    if (!currentUser) {
      return (
        <>
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-5 mx-auto mb-4">
            <div className="h-full w-full rounded-full bg-gray-900 flex items-center justify-center">
              <div className="animate-spin h-6 w-6 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
            </div>
          </div>
          <h2 className="text-lg font-bold text-white mb-1 truncate text-center">
            <div className="animate-pulse">
              <div className="h-4 w-32 bg-indigo-500/20 rounded mx-auto"></div>
            </div>
          </h2>
        </>
      );
    }

    return (
      <>
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 mx-auto mb-4">
            <div className="h-full w-full rounded-full bg-gray-900 flex items-center justify-center">
              <FaUserCircle className="text-indigo-400 text-4xl" />
            </div>
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="bg-green-500 w-3 h-3 rounded-full border-2 border-gray-900"></div>
          </div>
        </div>
        <h2 className="text-lg font-bold text-white mb-1 truncate text-center">
          {`${currentUser.firstname} ${currentUser.lastname}`}
        </h2>
      </>
    );
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white p-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-indigo-500/25"
      >
        {!isCollapsed ? <FaTimes /> : <FaBars />}
      </button>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-gray-900 to-gray-950 border-r border-indigo-500/20 text-white transition-all duration-300 ease-in-out z-40
          ${isCollapsed ? 'w-0 lg:w-20' : 'w-72'}
          ${isHovered && isCollapsed ? 'lg:w-72' : ''}
          ${isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
          shadow-2xl`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-6 relative h-full flex flex-col">
          {/* Collapse Toggle Button (Desktop) */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex absolute -right-3 top-8 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white p-1.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-indigo-500/25"
          >
            {isCollapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
          </button>

          {/* Logo */}
          <div className={`mb-8 transition-all duration-300 ${isCollapsed && !isHovered ? 'scale-0 h-0 mb-0 opacity-0' : 'scale-100 opacity-100'}`}>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              NEXUS
            </h1>
            <p className="text-xs text-gray-400 mt-1">Admin Portal</p>
          </div>

          {/* User Profile Section */}
          <div className={`mb-8 transition-all duration-300 ${isCollapsed && !isHovered ? 'scale-0 h-0 mb-0 opacity-0' : 'scale-100 opacity-100'}`}>
            {renderUserProfile()}
            <p className="text-sm text-gray-400 text-center">Administrator</p>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 transition-opacity duration-300 ${isCollapsed && !isHovered ? 'lg:opacity-100 opacity-0' : 'opacity-100'}`}>
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center p-3 rounded-lg transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-400 shadow-lg shadow-indigo-500/10'
                          : 'text-gray-300 hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-purple-500/10 hover:text-indigo-400'
                      }`}
                      title={item.title}
                    >
                      <Icon 
                        size={20} 
                        className={`${isActive ? 'text-indigo-400' : ''} ${!isCollapsed || isHovered ? 'mr-3' : 'mx-auto'}`} 
                      />
                      <span className={`transition-all duration-300 ${isCollapsed && !isHovered ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                        {item.title}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Settings Button */}
          <div className={`mt-auto transition-opacity duration-300 ${isCollapsed && !isHovered ? 'opacity-0' : 'opacity-100'}`}>
            <Link 
              to="/admin/settings"
              className="w-full flex items-center p-3 rounded-lg text-gray-300 hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-purple-500/10 hover:text-indigo-400 transition-all duration-300"
            >
              <FaCog className={`${!isCollapsed || isHovered ? 'mr-3' : 'mx-auto'}`} />
              <span className={`transition-all duration-300 ${isCollapsed && !isHovered ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                Settings
              </span>
            </Link>
          </div>

          {/* Footer */}
          <div className={`mt-4 text-center border-t border-indigo-500/20 pt-4 transition-opacity duration-300 ${isCollapsed && !isHovered ? 'opacity-0' : 'opacity-100'}`}>
            <p className="text-xs text-gray-400">© 2024 NEXUS</p>
            <p className="text-xs text-gray-500 mt-1">Version 2.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;