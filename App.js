import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { createStore } from "redux";
import rootReducer from "./redux/reducers";
import { auth } from "./database/firebase";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

// Lazy loaded pages
const LandingPage = lazy(() => import("./screens/LandingPage"));
const SolutionsShowcase = lazy(() => import("./screens/SolutionsShowcase"));
const LoginPage = lazy(() => import("./screens/LoginPage"));
const ContactUs = lazy(() => import("./screens/ContactUs"));
const SplashScreen = lazy(() => import("./screens/SplashScreen"));
const AdminDashboard = lazy(() => import("./screens/AdminDashboard"));

// Lazy loaded admin screens
const DashboardScreen = lazy(() =>
  import("./screens/AdminScreens/DashboardScreen")
);
const AnalyticsScreen = lazy(() =>
  import("./screens/AdminScreens/AnalyticsScreen")
);
const EnquiriesManagement = lazy(() =>
  import("./screens/AdminScreens/EnquiriesManagement")
);
const CustomerGroups = lazy(() =>
  import("./screens/AdminScreens/CustomerGroups")
);
const EventsScreen = lazy(() => import("./screens/AdminScreens/EventsScreen"));
const GalleryScreen = lazy(() =>
  import("./screens/AdminScreens/GalleryScreen")
);
const ArticlesScreen = lazy(() =>
  import("./screens/AdminScreens/ArticlesScreen")
);
const InquiriesScreen = lazy(() =>
  import("./screens/AdminScreens/InquiriesScreen")
);

// Create Redux store
const store = createStore(rootReducer);

// Function to check if user is authenticated
const isAuthenticated = () => {
  return auth.currentUser !== null;
};

// Private Route component to handle authentication
const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/LoginPage" replace />;
};

// Loading component
const LoadingFallback = () => (
  <div className="w-full h-screen flex items-center justify-center bg-black text-white">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
      <p>Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<SplashScreen />} />
            <Route path="/LoginPage" element={<LoginPage />} />
            <Route path="/ContactUs" element={<ContactUs />} />
            <Route path="/LandingPage" element={<LandingPage />} />
            <Route path="/SolutionsShowcase" element={<SolutionsShowcase />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            >
              <Route
                index
                element={<Navigate to="/admin/dashboard" replace />}
              />
              <Route path="dashboard" element={<DashboardScreen />} />
              <Route path="analytics" element={<AnalyticsScreen />} />
              <Route path="enquiries" element={<EnquiriesManagement />} />
              <Route path="customer-groups" element={<CustomerGroups />} />
              <Route path="events" element={<EventsScreen />} />
              <Route path="gallery" element={<GalleryScreen />} />
              <Route path="articles" element={<ArticlesScreen />} />
              <Route path="inquiries" element={<InquiriesScreen />} />
              <Route
                path="*"
                element={<Navigate to="/admin/dashboard" replace />}
              />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </Router>
    </Provider>
  );
}

export default App;
