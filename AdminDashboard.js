import React, { useState, useEffect } from "react";
import { Outlet, useLocation, Routes, Route, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/NavBars/Navbar";
import EnquiriesManagement from "./AdminScreens/EnquiriesManagement";
import CustomerGroups from "./AdminScreens/CustomerGroups";
import AnalyticsScreen from "./AdminScreens/AnalyticsScreen";
import ArticlesScreen from "./AdminScreens/ArticlesScreen";
import GalleryScreen from "./AdminScreens/GalleryScreen";
import EventsScreen from "./AdminScreens/EventsScreen";
import DashboardScreen from "./AdminScreens/DashboardScreen";

const AdminDashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 1024);
  const location = useLocation();

  // Add window resize handler
  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Sidebar className="p-3" isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      <Navbar isCollapsed={isCollapsed} />

      <div
        className={`transition-all duration-300 pt-24 p-8 relative ${
          isCollapsed ? "lg:ml-16" : "lg:ml-64"
        } ml-0`}
      >
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text mb-6">
          {location.pathname.split("/").pop().charAt(0).toUpperCase() +
            location.pathname.split("/").pop().slice(1)}
        </h1>

        <Routes>
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/enquiries" element={<EnquiriesManagement />} />
          <Route path="/customer-groups" element={<CustomerGroups />} />
          <Route path="/analytics" element={<AnalyticsScreen />} />
          <Route path="/articles" element={<ArticlesScreen />} />
          <Route path="/gallery" element={<GalleryScreen />} />
          <Route path="/events" element={<EventsScreen />} />
          <Route path="/" element={<Outlet />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;