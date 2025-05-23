import React, { useState, useEffect } from 'react';
import {
  FaUsers,
  FaEnvelope,
  FaCalendarCheck,
  FaNewspaper,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaChartLine,
  FaChartBar,
  FaChartPie
} from 'react-icons/fa';
import { firestore } from '../../database/firebase';
import { collection, query, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const StatCard = ({ icon: Icon, title, value, change, loading }) => (
  <div className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-sm border border-indigo-500/20 rounded-xl p-6 shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold mt-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          {loading ? '...' : value}
        </h3>
        <p className={`text-sm mt-2 flex items-center gap-1 ${
          change >= 0 ? 'text-green-400' : 'text-indigo-400'
        }`}>
          {change >= 0 ? <FaArrowUp className="text-green-400" /> : <FaArrowDown className="text-indigo-400" />}
          {Math.abs(change)}% from last month
        </p>
      </div>
      <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-4 rounded-xl">
        <Icon className="text-2xl text-indigo-400" />
      </div>
    </div>
  </div>
);

const RecentActivity = ({ type, title, time, description }) => (
  <div className="flex items-center space-x-4 py-4 border-b border-indigo-500/10 last:border-0 hover:bg-gradient-to-r hover:from-indigo-500/5 hover:to-purple-500/5 transition-all duration-300 rounded-lg px-2">
    <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-3 rounded-xl">
      <FaClock className="text-indigo-400" />
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white font-medium">{title}</p>
        <span className="text-xs text-gray-400">{time}</span>
      </div>
      <p className="text-xs text-gray-400 mt-1">{description}</p>
    </div>
  </div>
);

const QuickActionButton = ({ icon: Icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 hover:from-indigo-500/20 hover:to-purple-500/20 text-indigo-400 p-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/10 border border-indigo-500/20"
  >
    <Icon className="text-lg" />
    {label}
  </button>
);

const DashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { icon: FaUsers, title: 'Total Visitors', value: '0', change: 0 },
    { icon: FaEnvelope, title: 'New Inquiries', value: '0', change: 0 },
    { icon: FaCalendarCheck, title: 'Upcoming Events', value: '0', change: 0 },
    { icon: FaNewspaper, title: 'Published Articles', value: '0', change: 0 },
  ]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [visitorData, setVisitorData] = useState({
    labels: [],
    datasets: []
  });
  const [inquiryData, setInquiryData] = useState({
    labels: [],
    datasets: []
  });
  const [solutionDistribution, setSolutionDistribution] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch recent activities
        const activitiesRef = collection(firestore, 'activities');
        const activitiesQuery = query(activitiesRef, orderBy('timestamp', 'desc'), limit(5));
        
        const unsubscribe = onSnapshot(activitiesQuery, (snapshot) => {
          const activities = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setRecentActivities(activities);
        });

        // Fetch visitor data
        const visitorsRef = collection(firestore, 'visitors');
        const visitorsQuery = query(visitorsRef, orderBy('timestamp', 'desc'), limit(7));
        
        const visitorsSnapshot = await getDocs(visitorsQuery);
        const visitorData = visitorsSnapshot.docs.map(doc => doc.data());
        
        setVisitorData({
          labels: visitorData.map(v => new Date(v.timestamp.toDate()).toLocaleDateString()),
          datasets: [{
            label: 'Daily Visitors',
            data: visitorData.map(v => v.count),
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4
          }]
        });

        // Fetch inquiry data
        const inquiriesRef = collection(firestore, 'contactSubmissions');
        const inquiriesQuery = query(inquiriesRef, orderBy('timestamp', 'desc'), limit(7));
        
        const inquiriesSnapshot = await getDocs(inquiriesQuery);
        const inquiryData = inquiriesSnapshot.docs.map(doc => doc.data());
        
        setInquiryData({
          labels: inquiryData.map(i => new Date(i.timestamp.toDate()).toLocaleDateString()),
          datasets: [{
            label: 'Daily Inquiries',
            data: inquiryData.map(i => 1),
            backgroundColor: 'rgba(99, 102, 241, 0.8)',
          }]
        });

        // Fetch solution distribution
        const solutionsRef = collection(firestore, 'gallery');
        const solutionsSnapshot = await getDocs(solutionsRef);
        const solutions = solutionsSnapshot.docs.map(doc => doc.data());
        
        const solutionCounts = solutions.reduce((acc, solution) => {
          acc[solution.industry] = (acc[solution.industry] || 0) + 1;
          return acc;
        }, {});

        setSolutionDistribution({
          labels: Object.keys(solutionCounts),
          datasets: [{
            data: Object.values(solutionCounts),
            backgroundColor: [
              'rgba(99, 102, 241, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(168, 85, 247, 0.8)',
              'rgba(217, 70, 239, 0.8)',
            ],
          }]
        });

        // Update stats with real data
        setStats([
          { icon: FaUsers, title: 'Total Visitors', value: visitorData.reduce((sum, v) => sum + v.count, 0).toString(), change: 12.5 },
          { icon: FaEnvelope, title: 'New Inquiries', value: inquiryData.length.toString(), change: 8.2 },
          { icon: FaCalendarCheck, title: 'Upcoming Events', value: '3', change: 0 },
          { icon: FaNewspaper, title: 'Published Articles', value: solutions.length.toString(), change: -2.4 },
        ]);

        setLoading(false);
        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-sm border border-indigo-500/20 rounded-xl p-6 shadow-xl">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Welcome back, Admin
        </h1>
        <p className="text-gray-400 mt-2">Here's what's happening with your portal today.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} loading={loading} />
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitor Trends */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-sm border border-indigo-500/20 rounded-xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Visitor Trends
          </h2>
          <div className="h-64">
            <Line
              data={visitorData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      color: 'rgb(156, 163, 175)'
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(99, 102, 241, 0.1)'
                    },
                    ticks: {
                      color: 'rgb(156, 163, 175)'
                    }
                  },
                  x: {
                    grid: {
                      color: 'rgba(99, 102, 241, 0.1)'
                    },
                    ticks: {
                      color: 'rgb(156, 163, 175)'
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Inquiry Distribution */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-sm border border-indigo-500/20 rounded-xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Inquiry Distribution
          </h2>
          <div className="h-64">
            <Bar
              data={inquiryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      color: 'rgb(156, 163, 175)'
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(99, 102, 241, 0.1)'
                    },
                    ticks: {
                      color: 'rgb(156, 163, 175)'
                    }
                  },
                  x: {
                    grid: {
                      color: 'rgba(99, 102, 241, 0.1)'
                    },
                    ticks: {
                      color: 'rgb(156, 163, 175)'
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-sm border border-indigo-500/20 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Recent Activities
            </h2>
            <FaChartLine className="text-indigo-400" />
          </div>
          <div className="divide-y divide-indigo-500/10">
            {loading ? (
              <div className="text-gray-400 text-center py-4">Loading activities...</div>
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <RecentActivity
                  key={index}
                  type={activity.type}
                  title={activity.title}
                  time={activity.time}
                  description={activity.description}
                />
              ))
            ) : (
              <div className="text-gray-400 text-center py-4">No recent activities</div>
            )}
          </div>
        </div>

        {/* Solution Distribution */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-sm border border-indigo-500/20 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Solution Distribution
            </h2>
            <FaChartPie className="text-indigo-400" />
          </div>
          <div className="h-64">
            <Pie
              data={solutionDistribution}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      color: 'rgb(156, 163, 175)'
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-sm border border-indigo-500/20 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Quick Actions
          </h2>
          <FaChartBar className="text-indigo-400" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <QuickActionButton
            icon={FaEnvelope}
            label="View Inquiries"
            onClick={() => {}}
          />
          <QuickActionButton
            icon={FaCalendarCheck}
            label="Create Event"
            onClick={() => {}}
          />
          <QuickActionButton
            icon={FaNewspaper}
            label="Add Article"
            onClick={() => {}}
          />
          <QuickActionButton
            icon={FaEye}
            label="View Gallery"
            onClick={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen; 