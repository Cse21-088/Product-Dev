import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, 
  FaUsers, 
  FaGlobe, 
  FaDesktop, 
  FaEnvelope, 
  FaIndustry,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaChartPie
} from 'react-icons/fa';
import { firestore } from '../../database/firebase';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StatCard = ({ title, value, icon: Icon, change, loading }) => (
  <div className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-sm border border-indigo-500/20 rounded-xl p-6 shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold mt-1 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          {loading ? '...' : value}
        </h3>
        {change && (
          <p className={`text-sm mt-1 flex items-center gap-1 ${change >= 0 ? 'text-green-400' : 'text-indigo-400'}`}>
            {change >= 0 ? <FaArrowUp className="text-green-400" /> : <FaArrowDown className="text-indigo-400" />}
            {Math.abs(change)}% from last month
          </p>
        )}
      </div>
      <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-3 rounded-xl">
        <Icon className="text-indigo-400 text-xl" />
      </div>
    </div>
  </div>
);

const AnalyticsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalInquiries: 0,
    recentInquiries: 0,
    countries: {},
    industries: {},
    monthlyInquiries: {},
    responseRate: 0,
    monthlyData: {
      labels: [],
      values: []
    }
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const inquiriesRef = collection(firestore, 'contactSubmissions');
        const repliesRef = collection(firestore, 'replies');

        // Get all inquiries
        const inquiriesSnapshot = await getDocs(inquiriesRef);
        const inquiries = inquiriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Get all replies
        const repliesSnapshot = await getDocs(repliesRef);
        const replies = repliesSnapshot.docs.length;

        // Calculate analytics
        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

        const countries = {};
        const industries = {};
        const monthlyInquiries = {};

        let recentInquiries = 0;

        inquiries.forEach(inquiry => {
          // Count countries
          countries[inquiry.country] = (countries[inquiry.country] || 0) + 1;

          // Count industries (based on job titles/companies)
          const industry = determineIndustry(inquiry.jobTitle, inquiry.company);
          industries[industry] = (industries[industry] || 0) + 1;

          // Count monthly inquiries
          const month = new Date(inquiry.timestamp.seconds * 1000).toLocaleString('default', { month: 'short' });
          monthlyInquiries[month] = (monthlyInquiries[month] || 0) + 1;

          // Count recent inquiries
          if (new Date(inquiry.timestamp.seconds * 1000) > thirtyDaysAgo) {
            recentInquiries++;
          }
        });

        // Process monthly data
        const monthlyCount = {};
        inquiries.forEach(doc => {
          const data = doc.data();
          const date = new Date(data.timestamp.seconds * 1000);
          const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
          monthlyCount[monthYear] = (monthlyCount[monthYear] || 0) + 1;
        });

        // Sort months chronologically
        const sortedMonths = Object.keys(monthlyCount).sort((a, b) => {
          return new Date(a) - new Date(b);
        });

        setAnalytics({
          totalInquiries: inquiries.length,
          recentInquiries,
          countries,
          industries,
          monthlyInquiries,
          responseRate: (replies / inquiries.length) * 100,
          monthlyData: {
            labels: sortedMonths,
            values: sortedMonths.map(month => monthlyCount[month])
          }
        });

      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Helper function to determine industry
  const determineIndustry = (jobTitle, company) => {
    const techKeywords = ['tech', 'software', 'it', 'digital'];
    const financeKeywords = ['finance', 'bank', 'investment'];
    const healthcareKeywords = ['health', 'medical', 'hospital'];
    
    const text = `${jobTitle} ${company}`.toLowerCase();
    
    if (techKeywords.some(keyword => text.includes(keyword))) return 'Technology';
    if (financeKeywords.some(keyword => text.includes(keyword))) return 'Finance';
    if (healthcareKeywords.some(keyword => text.includes(keyword))) return 'Healthcare';
    return 'Other';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-sm border border-indigo-500/20 rounded-xl p-6 shadow-xl">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Analytics Overview
        </h1>
        <p className="text-gray-400 mt-2">Track and analyze your portal's performance</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Inquiries"
          value={analytics.totalInquiries}
          icon={FaEnvelope}
          loading={loading}
        />
        <StatCard
          title="Recent Inquiries (30d)"
          value={analytics.recentInquiries}
          icon={FaUsers}
          change={15}
          loading={loading}
        />
        <StatCard
          title="Response Rate"
          value={`${analytics.responseRate.toFixed(1)}%`}
          icon={FaChartLine}
          loading={loading}
        />
        <StatCard
          title="Countries Reached"
          value={Object.keys(analytics.countries).length}
          icon={FaGlobe}
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Inquiries Trend */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-sm border border-indigo-500/20 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Monthly Inquiries
            </h3>
            <FaChartLine className="text-indigo-400" />
          </div>
          <div className="h-[300px]">
            {!loading && (
              <Line
                data={{
                  labels: analytics.monthlyData.labels,
                  datasets: [{
                    label: 'Inquiries',
                    data: analytics.monthlyData.values,
                    borderColor: 'rgb(99, 102, 241)',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                    },
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                    }
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Industry Distribution */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-sm border border-indigo-500/20 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Industry Distribution
            </h3>
            <FaChartPie className="text-indigo-400" />
          </div>
          <div className="h-[300px]">
            <Pie
              data={{
                labels: Object.keys(analytics.industries),
                datasets: [{
                  data: Object.values(analytics.industries),
                  backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(251, 191, 36, 0.8)'
                  ]
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      color: 'rgba(255, 255, 255, 0.7)'
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Geographical Distribution */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-sm border border-indigo-500/20 rounded-xl p-6 shadow-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Geographical Distribution
            </h3>
            <FaGlobe className="text-indigo-400" />
          </div>
          <div className="h-[300px]">
            <Bar
              data={{
                labels: Object.keys(analytics.countries),
                datasets: [{
                  label: 'Inquiries by Country',
                  data: Object.values(analytics.countries),
                  backgroundColor: 'rgba(99, 102, 241, 0.8)'
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                  },
                  x: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                  }
                },
                plugins: {
                  legend: {
                    labels: {
                      color: 'rgba(255, 255, 255, 0.7)'
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsScreen;