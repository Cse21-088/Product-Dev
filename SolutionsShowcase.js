import { useState, useEffect } from "react";
import {
  Star,
  Calendar,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  Home,
  Check,
} from "lucide-react";
import ContactUs from "./ContactUs";
import { motion } from "framer-motion";
import { collection, getDocs, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage';
import { firestore } from '../database/firebase';
import { useNavigate } from 'react-router-dom';

// Rating Component
const RatingStars = ({ rating, onRate, disabled = false }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={20}
          className={`cursor-pointer transition-colors ${
            (hoverRating || rating) >= star
              ? "fill-yellow-500 text-yellow-500"
              : "text-gray-400"
          }`}
          onClick={disabled ? null : () => onRate(star)}
          onMouseEnter={disabled ? null : () => setHoverRating(star)}
          onMouseLeave={disabled ? null : () => setHoverRating(0)}
        />
      ))}
    </div>
  );
};

const SolutionsShowcase = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null); // New state for selected event
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    industry: '',
    features: '',
    image: null
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  // Rating system states
  const [ratings, setRatings] = useState({});
  const [userRatings, setUserRatings] = useState({});
  // State to track which solutions have expanded descriptions
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  // Handler to navigate back to landing page
  const handleBackToLanding = () => {
    navigate('/');
  };

  // Function to toggle description expansion
  const toggleDescription = (id, event) => {
    // Stop propagation to prevent card click event from firing
    event.stopPropagation();
    setExpandedDescriptions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const testimonials = [
    {
      name: "Colen Smith",
      company: "TechCorp Global",
      comment:
        "NEXUS solutions transformed our data processing capabilities.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/men/30.jpg",
    },
    {
      name: "Vin Mashaba",
      company: "Healthcare Plus",
      comment: "Outstanding results in patient data analysis.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/men/31.jpg",
    },
    {
      name: "Sarah Johnson",
      company: "FinTech Innovations",
      comment: "Their AI-powered fraud detection system saved us millions in potential losses.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      name: "Michael Chen",
      company: "Global Retail Solutions",
      comment: "Nexus AI transformed our supply chain management with predictive analytics.",
      rating: 4,
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      name: "Amara Okafor",
      company: "EduTech Partners",
      comment: "The custom learning algorithms they developed have revolutionized our online education platform.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/68.jpg",
    },
  ];

  const articles = [
    {
      title: "The Future of Digital Solutions",
      excerpt: "How AI and machine learning are revolutionizing business operations across industries",
      date: "2025-01-15",
      image: "https://images.pexels.com/photos/8439061/pexels-photo-8439061.jpeg?auto=compress&cs=tinysrgb&w=1200",
      url: "https://hbr.org/2023/09/how-generative-ai-is-changing-creative-work",
    },
    {
      title: "Cloud Computing Breakthroughs",
      excerpt: "New developments in cloud infrastructure powering the next generation of AI applications",
      date: "2025-01-10",
      image: "https://media.istockphoto.com/id/1453664340/photo/a-futuristic-glowing-quantum-computer-unit-3d-render.jpg?b=1&s=612x612&w=0&k=20&c=kk44vbu8yWdpQUoKX5uf0JRXnJXT87lgHo8S5gegcI4=",
      url: "https://cloud.google.com/blog/topics/inside-google-cloud/how-were-making-generative-ai-on-google-cloud-more-powerful",
    },
    {
      title: "AI Ethics in Software Development",
      excerpt: "Building responsible AI systems that align with human values and societal needs",
      date: "2025-02-20",
      image: "https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=1200",
      url: "https://www.ibm.com/topics/ai-ethics",
    },
    {
      title: "The Rise of Quantum Machine Learning",
      excerpt: "How quantum computing is set to revolutionize AI capabilities and applications",
      date: "2025-03-05", 
      image: "https://images.pexels.com/photos/8566526/pexels-photo-8566526.jpeg?auto=compress&cs=tinysrgb&w=1200",
      url: "https://research.ibm.com/blog/quantum-machine-learning",
    },
  ];

  const events = [
    {
      title: "Tech Summit 2025",
      date: "October 15, 2025",
      location: "San Francisco, CA",
      description: "Annual gathering of industry leaders",
      image: "https://images.pexels.com/photos/7862616/pexels-photo-7862616.jpeg?auto=compress&cs=tinysrgb&w=1200"
    },
    {
      title: "Nvidia X Nexus AI-Solutions Summit",
      date: "June 5, 2025",
      location: "London, UK",
      description: "Showcase of latest technologies",
    },
    {
      title: "AI Healthcare Innovation Conference",
      date: "August 12, 2025",
      location: "Boston, MA",
      description: "Exploring the intersection of AI and healthcare technologies",
      image: "https://images.pexels.com/photos/3825529/pexels-photo-3825529.jpeg?auto=compress&cs=tinysrgb&w=1200"
    },
    {
      title: "African AI Summit",
      date: "July 23, 2025",
      location: "Gaborone, Botswana",
      description: "Showcasing AI innovations across the African continent",
      image: "https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=1200"
    },
    {
      title: "AI Ethics & Governance Forum",
      date: "September 8, 2025",
      location: "Geneva, Switzerland",
      description: "Global discussion on ethical AI implementation and regulatory frameworks",
      image: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1200"
    },
    {
      title: "Machine Learning Developer Workshop",
      date: "November 3, 2025",
      location: "Singapore",
      description: "Hands-on workshop for cutting-edge ML techniques and implementation",
      image: "https://images.pexels.com/photos/8851651/pexels-photo-8851651.jpeg?auto=compress&cs=tinysrgb&w=1200"
    },
  ];

  const handleSolutionClick = (solution) => {
    setSelectedSolution(solution);
    setSelectedEvent(null); // Clear any selected event
    setShowContactForm(true);
  };

  // New handler for event registration
  const handleEventRegistration = (event) => {
    setSelectedEvent(event);
    setSelectedSolution(null); // Clear any selected solution
    setShowContactForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  // Rating system functions
  const handleRateSolution = async (solutionId, rating) => {
    try {
      // Check if solution has ratings collection
      const ratingRef = collection(firestore, `gallery/${solutionId}/ratings`);
      
      // Add the new rating
      await addDoc(ratingRef, {
        rating: rating,
        timestamp: new Date(),
        // You could add user ID here if you have authentication
        // userId: currentUser.uid
      });
      
      // Store user rating in local state
      setUserRatings(prev => ({
        ...prev,
        [solutionId]: rating
      }));
      
      // Save to localStorage to remember user's ratings
      localStorage.setItem('userRatings', JSON.stringify({
        ...userRatings,
        [solutionId]: rating
      }));
      
      // Refetch ratings for this solution
      fetchSolutionRatings(solutionId);
    } catch (error) {
      console.error('Error adding rating:', error);
    }
  };

  const fetchSolutionRatings = async (solutionId) => {
    try {
      const ratingRef = collection(firestore, `gallery/${solutionId}/ratings`);
      const ratingSnapshot = await getDocs(ratingRef);
      
      if (!ratingSnapshot.empty) {
        // Calculate average rating
        let total = 0;
        ratingSnapshot.forEach(doc => {
          total += doc.data().rating;
        });
        const average = total / ratingSnapshot.size;
        
        // Update ratings state
        setRatings(prev => ({
          ...prev,
          [solutionId]: {
            average: average.toFixed(1),
            count: ratingSnapshot.size
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.image || !uploadData.title || !uploadData.description) return;

    try {
      setUploadProgress(0);
      const storage = getStorage();
      // Upload image to Firebase Storage
      const imageRef = ref(storage, `solutions/${uploadData.image.name}`);
      const uploadTask = uploadBytes(imageRef, uploadData.image);
      
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Error uploading image:', error);
          setError('Failed to upload image. Please try again.');
        },
        async () => {
          // Get download URL
          const downloadURL = await getDownloadURL(imageRef);
          
          // Add solution to Firestore
          const solutionData = {
            title: uploadData.title,
            description: uploadData.description,
            industry: uploadData.industry,
            features: uploadData.features.split(',').map(f => f.trim()),
            imageData: downloadURL,
            createdAt: new Date()
          };

          await addDoc(collection(firestore, 'gallery'), solutionData);
          
          // Reset form and refresh solutions
          setUploadData({
            title: '',
            description: '',
            industry: '',
            features: '',
            image: null
          });
          setShowUploadForm(false);
          fetchGalleryItems();
        }
      );
    } catch (error) {
      console.error('Error adding solution:', error);
      setError('Failed to add solution. Please try again.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const fetchGalleryItems = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(firestore, 'gallery'));
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSolutions(items);
      setError(null);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
      setError('Failed to load solutions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryItems();
    
    // Load user ratings from localStorage
    const savedRatings = localStorage.getItem('userRatings');
    if (savedRatings) {
      setUserRatings(JSON.parse(savedRatings));
    }
  }, []);

  // Add another useEffect to fetch ratings when solutions load
  useEffect(() => {
    solutions.forEach(solution => {
      fetchSolutionRatings(solution.id);
    });
  }, [solutions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Back Button - Added at the top */}
      <div className="fixed top-4 left-4 z-10">
        <motion.button
          onClick={handleBackToLanding}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors shadow-lg"
        >
          <Home size={18} />
          <span>Back to Home</span>
        </motion.button>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Software Solutions Section */}
        <motion.section
          className="mb-20"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="flex justify-between items-center mb-8">
            <motion.h2
              className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text"
              variants={itemVariants}
            >
              Our Solutions
            </motion.h2>
            {/* <button
              onClick={() => setShowUploadForm(true)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Upload size={20} />
              Add Solution
            </button> */}
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-indigo-500 p-4 bg-indigo-500/10 rounded-lg">
              {error}
            </div>
          ) : solutions.length === 0 ? (
            <div className="text-center text-gray-400 p-4">
              No solutions available at the moment.
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={containerVariants}
            >
              {solutions.map((solution, index) => (
                <motion.div
                  key={solution.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-indigo-500/20 p-6 hover:border-indigo-500 transition-all cursor-pointer"
                  onClick={() => handleSolutionClick(solution)}
                >
                  <div className="overflow-hidden rounded-lg mb-4">
                    <motion.img
                      src={solution.imageData}
                      alt={solution.title}
                      className="w-full h-48 object-cover hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                      }}
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{solution.title}</h3>
                  <div className="relative">
                    <p className="text-gray-400 mb-4 line-clamp-5 overflow-hidden">
                      {solution.description}
                    </p>
                    {solution.description && solution.description.length > 200 && (
                      <button 
                        className="text-indigo-400 hover:text-indigo-300 text-sm mt-1"
                        onClick={(e) => toggleDescription(solution.id, e)}
                      >
                        {expandedDescriptions[solution.id] ? "Show less" : "Show more"}
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {Array.isArray(solution.features) && solution.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="inline-block bg-indigo-500/10 text-indigo-400 text-sm px-3 py-1 rounded-full mr-2 mb-2"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  
                  {/* Rating System */}
                  <div className="mt-4 border-t border-indigo-500/10 pt-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Solution Rating</p>
                        <div className="flex items-center gap-2">
                          <RatingStars 
                            rating={userRatings[solution.id] || 0} 
                            onRate={(rating) => handleRateSolution(solution.id, rating)} 
                          />
                          {ratings[solution.id] && (
                            <span className="text-sm text-gray-400">
                              {ratings[solution.id].average} ({ratings[solution.id].count})
                            </span>
                          )}
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ x: 5 }}
                        className="text-indigo-400 flex items-center gap-2"
                      >
                        Learn More <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.section>

        {/* Testimonials Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text mb-8">
            Client Feedback
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-indigo-500/20 p-6"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/64x64?text=Profile';
                    }}
                  />
                  <div>
                    <div className="flex gap-1 mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-indigo-500 text-indigo-500"
                        />
                      ))}
                    </div>
                    <p className="text-gray-300 mb-2">
                      "{testimonial.comment}"
                    </p>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-gray-400">
                      {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Articles Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text mb-8">
            Latest Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {articles.map((article, index) => (
              <div
                key={index}
                className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-indigo-500/20 overflow-hidden group"
              >
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-400 mb-4">{article.excerpt}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">
                      {article.date}
                    </span>
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 group-hover:text-indigo-300 flex items-center gap-2 transition-colors"
                    >
                      Read more <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Events Section - Updated to include registration button */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text mb-8">
            Upcoming Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-indigo-500/20 p-6 hover:border-indigo-500 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-indigo-500/10 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">
                      {event.title}
                    </h3>
                    <p className="text-indigo-400 mb-1">{event.date}</p>
                    <p className="text-gray-400 mb-2">{event.location}</p>
                    <p className="text-gray-300 mb-4">{event.description}</p>
                    <motion.button
                      onClick={() => handleEventRegistration(event)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-full justify-center"
                    >
                      <Check size={16} /> Register Interest
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Photo Gallery */}
        <section>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text mb-8">
            Event Gallery
          </h2>
          <div className="relative">
            <div className="overflow-hidden rounded-xl aspect-video">
              <img
                src="https://images.pexels.com/photos/7862616/pexels-photo-7862616.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Event"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 flex justify-between w-full px-4">
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + 3) % 3)}
                className="bg-gray-900/50 hover:bg-gray-900/70 text-white p-2 rounded-full backdrop-blur-sm"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % 3)}
                className="bg-gray-900/50 hover:bg-gray-900/70 text-white p-2 rounded-full backdrop-blur-sm"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </section>

        {/* Upload Solution Modal */}
        {showUploadForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gray-900 rounded-xl border border-indigo-500/20 p-6 w-full max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Add New Solution</h2>
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <form onSubmit={handleUpload} className="space-y-4">
                {/* Upload form fields remain the same */}
                {/* ... */}
              </form>
            </div>
          </div>
        )}

        {/* Contact Form Modal */}
        {showContactForm && (
          <ContactUs
            onClose={() => {
              setShowContactForm(false);
              setSelectedEvent(null);
              setSelectedSolution(null);
            }}
            initialData={
              selectedSolution 
                ? {
                    jobDetails: `I'm interested in your ${selectedSolution.title} solution for the ${selectedSolution.industry} industry.\n\nSpecific requirements: ${selectedSolution.description}`
                  } 
                : selectedEvent
                  ? {
                      jobDetails: `I'm interested in attending the "${selectedEvent.title}" event on ${selectedEvent.date} in ${selectedEvent.location}.\n\nPlease provide me with registration details and any additional information about this event.`
                    }
                  : null
            }
          />
        )}
      </div>
    </div>
  );
};

export default SolutionsShowcase;