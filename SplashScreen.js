import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SplashScreen = () => {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const loadingTexts = [
    "Initializing Systems",
    "Loading Modules",
    "Preparing Interface",
    "Almost Ready",
  ];

  // Progress bar animation
  useEffect(() => {
    if (progress < 100) {
      const timer = setTimeout(() => {
        setProgress((prev) => prev + 1);
      }, 40);
      return () => clearTimeout(timer);
    } else {
      navigate("/LandingPage");
    }
  }, [progress, navigate]);

  // Text animation
  useEffect(() => {
    const textIndex = Math.floor((progress / 100) * loadingTexts.length);
    const currentText = loadingTexts[Math.min(textIndex, loadingTexts.length - 1)];
    setText(currentText);
  }, [progress]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/20 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute top-1/3 right-1/3 w-[300px] h-[300px] bg-purple-500/20 rounded-full filter blur-3xl animate-pulse delay-700"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-8 w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text animate-gradient">
            NEXUS
          </div>
          <div className="text-indigo-300 text-sm tracking-widest">
            INTELLIGENT SOLUTIONS
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-indigo-900/30 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          >
            <div className="h-full w-full animate-pulse"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-4">
          <div className="text-indigo-300 text-lg font-medium h-6">{text}</div>
          <div className="text-indigo-400 text-2xl font-bold">{progress}%</div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-4 left-4 w-32 h-32 border border-indigo-500/20 rounded-lg animate-spin-slow"></div>
          <div className="absolute bottom-4 right-4 w-24 h-24 border border-purple-500/20 rounded-full animate-bounce-slow"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
