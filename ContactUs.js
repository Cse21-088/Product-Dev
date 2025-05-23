import { useState } from "react";
import { Send, CheckCircle, X } from "lucide-react";
import { firestore } from "../database/firebase";
import { collection, addDoc } from "firebase/firestore";

const ContactUs = ({ onClose, initialData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    country: "",
    jobTitle: "",
    jobDetails: initialData?.jobDetails || "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submissionData = {
        ...formData,
        timestamp: new Date(),
      };

      await addDoc(collection(firestore, "contactSubmissions"), submissionData);

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          country: "",
          jobTitle: "",
          jobDetails: "",
        });
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("There was an error submitting your form. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-md flex justify-center items-center z-50">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
      </div>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-white"
      >
        <X size={24} />
      </button>
      <div className="relative max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text mb-4">Contact Us</h2>
          <p className="text-gray-400">
            Let's discuss how NEXUS can transform your business
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-indigo-500/20"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-900/50 border border-indigo-500/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                placeholder="Your name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-900/50 border border-indigo-500/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                placeholder="your@email.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-gray-900/50 border border-indigo-500/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Company Name
              </label>
              <input
                type="text"
                name="company"
                required
                value={formData.company}
                onChange={handleChange}
                className="w-full bg-gray-900/50 border border-indigo-500/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                placeholder="Your company"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Country
              </label>
              <input
                type="text"
                name="country"
                required
                value={formData.country}
                onChange={handleChange}
                className="w-full bg-gray-900/50 border border-indigo-500/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                placeholder="Your country"
              />
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Job Title
              </label>
              <input
                type="text"
                name="jobTitle"
                required
                value={formData.jobTitle}
                onChange={handleChange}
                className="w-full bg-gray-900/50 border border-indigo-500/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                placeholder="Your role"
              />
            </div>
          </div>

          {/* Job Details */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Job Details
            </label>
            <textarea
              name="jobDetails"
              required
              value={formData.jobDetails}
              onChange={handleChange}
              rows={4}
              className="w-full bg-gray-900/50 border border-indigo-500/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors resize-none"
              placeholder="Please describe your specific requirements..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={submitted || isLoading}
              className={`
                flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-all
                ${submitted
                  ? "bg-green-500 text-white cursor-default"
                  : isLoading
                    ? "bg-gray-500 text-white cursor-wait"
                    : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                }
              `}
            >
              {submitted ? (
                <>
                  <CheckCircle size={20} />
                  Submitted
                </>
              ) : isLoading ? (
                <>
                  <span className="animate-spin">⌛</span>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Send Message
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;
