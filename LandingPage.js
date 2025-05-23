import { useState, useEffect } from "react";
import { Menu, X, ChevronRight, Database, Cpu, Brain } from "lucide-react";
import ContactUs from "./ContactUs";
import LoginPage from "./LoginPage";
import AIAssistant from "../components/AIAssistant";

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const features = [
    {
      title: "Smart Analytics",
      description: "Advanced data processing and visualization",
      icon: Brain,
    },
    {
      title: "Cloud Computing",
      description: "Scalable infrastructure for your needs",
      icon: Cpu,
    },
    {
      title: "Data Management",
      description: "Secure and efficient data handling",
      icon: Database,
    },
  ];

  // Add particle effect
  useEffect(() => {
    const canvas = document.getElementById("particle-canvas");
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const particles = [];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${particle.opacity})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 text-white overflow-hidden relative">
      {/* Particle Canvas */}
      <canvas id="particle-canvas" className="absolute inset-0 z-0" />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-indigo-900/20 backdrop-blur-sm bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
                NEXUS
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {["Solutions", "Technology", "About", "Contact"].map((item) => (
                  <a
                    key={item}
                    onClick={() => item === "Contact" && setIsContactOpen(true)}
                    className="text-gray-300 hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-400 hover:text-white"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute w-full bg-gray-900/95 border-b border-indigo-900/20">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {["Solutions", "Technology", "About", "Contact"].map((item) => (
                <a
                  key={item}
                  onClick={() => item === "Contact" && setIsContactOpen(true)}
                  className="text-gray-300 hover:text-indigo-400 block px-3 py-2 rounded-md text-base font-medium"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 to-transparent">
            <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/30 rounded-full filter blur-3xl animate-pulse"></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24">
          <div className="lg:flex lg:items-center lg:gap-12">
            <div className="lg:w-1/2 space-y-6 sm:space-y-8 animate-fade-in">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
                  Next Generation
                </span>
                <br />
                Digital Solutions
              </h1>
              <p className="text-gray-400 text-base sm:text-lg max-w-xl">
                Transform your business with cutting-edge technology solutions. Harness
                the power of cloud computing and data analytics for unprecedented results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/LoginPage" className="w-full sm:w-auto">
                  <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all">
                    Get Started <ChevronRight size={20} />
                  </button>
                </a>
                <a href="/SolutionsShowcase" className="w-full sm:w-auto">
                  <button className="w-full border border-indigo-500 text-indigo-400 hover:bg-indigo-500/10 px-6 py-3 rounded-lg font-medium transition-colors">
                    Learn More
                  </button>
                </a>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="lg:w-1/2 mt-12 lg:mt-0 grid gap-4 sm:gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-indigo-500/20 p-4 sm:p-6 hover:bg-indigo-500/5 transition-all duration-300 transform hover:scale-[1.02]"
                  style={{
                    animationDelay: `${index * 200}ms`,
                    animation: "slideIn 0.5s ease-out forwards",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <feature.icon className="text-indigo-400" size={24} />
                    <div>
                      <h3 className="text-lg font-semibold">{feature.title}</h3>
                      <p className="text-gray-400 mt-1 text-sm sm:text-base">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {isContactOpen && <ContactUs onClose={() => setIsContactOpen(false)} />}

      {/* Login Form Modal */}
      {isLoginOpen && <LoginPage onClose={() => setIsLoginOpen(false)} />}

      {/* AI Assistant Toggle Button */}
      <button
        onClick={() => setShowAIAssistant(!showAIAssistant)}
        className="fixed bottom-4 right-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full p-3 shadow-lg transition-colors z-50"
      >
        <Brain size={24} />
      </button>

      {/* AI Assistant */}
      {showAIAssistant && <AIAssistant />}
    </div>
  );
};

export default LandingPage;
