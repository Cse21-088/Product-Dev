import { useState } from "react";
import { Eye, EyeOff, LogIn, Lock, Mail } from "lucide-react";
import { auth, firestore } from "../database/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const checkIfAdmin = async (email) => {
    try {
      // Method 1: Check direct document in admins collection
      const adminDocRef = doc(firestore, "admin", email);
      const adminDoc = await getDoc(adminDocRef);

      if (adminDoc.exists()) {
        return true;
      }

      // Method 2: Query admins collection with email
      const adminsRef = collection(firestore, "admin");
      const q = query(adminsRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, check if the email exists in the admins collection
      const isAdmin = await checkIfAdmin(formData.email);

      if (!isAdmin) {
        toast.error("Access denied. Admin credentials required.");
        setLoading(false);
        return;
      }

      // If user is admin, proceed with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      if (userCredential.user) {
        toast.success("Admin Login successful!");
        navigate("/admin/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "An error occurred during login.";

      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No admin account found with this email.";
          break;
        case "auth/wrong-password":
          errorMessage = "Invalid admin credentials.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        default:
          errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 text-white flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text mb-2">
            NEXUS
          </div>
          <p className="text-indigo-300">Welcome back</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-indigo-500/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-indigo-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-gray-900/50 border border-indigo-500/20 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                  placeholder="your@email.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-indigo-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-gray-900/50 border border-indigo-500/20 rounded-lg pl-10 pr-12 py-2.5 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="remember"
                  id="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-indigo-500/20 bg-gray-900/50 text-indigo-500 focus:ring-indigo-500/20"
                  disabled={loading}
                />
                <label
                  htmlFor="remember"
                  className="ml-2 text-sm text-gray-300"
                >
                  Remember me
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <LogIn className="h-5 w-5" />
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>Protected by NEXUS security</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;