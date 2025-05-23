import { useState, useEffect } from 'react';
import { firestore } from '../../database/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { Mail, CheckCircle, XCircle, Clock } from 'lucide-react';

const EnquiriesManagement = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [response, setResponse] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const q = query(collection(firestore, 'contactSubmissions'), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const enquiriesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
      setEnquiries(enquiriesList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRespond = async (enquiryId) => {
    if (!response.trim()) {
      setError('Please enter a response message');
      return;
    }

    setError('');
    setSending(true);

    try {
      // Update the enquiry document with the response
      await updateDoc(doc(firestore, 'contactSubmissions', enquiryId), {
        response,
        respondedAt: new Date(),
        status: 'responded'
      });

      // Add email to the 'emails' collection for sending
      // This collection can be monitored by a Cloud Function that actually sends the email
      await addDoc(collection(firestore, 'emailQueue'), {
        to: selectedEnquiry.email,
        subject: `Response to your enquiry - ${selectedEnquiry.company}`,
        html: response,
        text: response,
        createdAt: new Date(),
        status: 'pending',
        enquiryId: enquiryId,
        senderName: 'Your Company Name', // Replace with your company name or admin name
      });

      setSuccess('Response sent successfully!');
      setResponse('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (error) {
      console.error('Error responding to enquiry:', error);
      setError('Failed to send response. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleSelectEnquiry = (enquiry) => {
    setSelectedEnquiry(enquiry);
    // If there's an existing response, pre-fill the textarea
    if (enquiry.status === 'responded' && enquiry.response) {
      setResponse(enquiry.response);
    } else {
      // Generate a template response
      setResponse(
        `Dear ${enquiry.name},\n\nThank you for reaching out to us about your project. We appreciate your interest in our services.\n\n[Your personalized response here]\n\nBest regards,\nYour Name\nYour Company`
      );
    }
    setError('');
    setSuccess('');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'responded':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />;
      default:
        return <Mail className="text-blue-500" size={20} />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'responded':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">Responded</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">Pending</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">New</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enquiries List */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-indigo-500/20 p-6">
          <h2 className="text-xl font-semibold mb-4">Customer Enquiries</h2>
          <div className="space-y-4">
            {enquiries.length > 0 ? (
              enquiries.map((enquiry) => (
                <div
                  key={enquiry.id}
                  className={`p-4 rounded-lg border ${
                    selectedEnquiry?.id === enquiry.id
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-indigo-500/20 hover:border-indigo-500/40'
                  } cursor-pointer transition-all`}
                  onClick={() => handleSelectEnquiry(enquiry)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(enquiry.status)}
                      <span className="font-medium">{enquiry.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(enquiry.status)}
                      <span className="text-sm text-gray-400">
                        {enquiry.timestamp?.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2">{enquiry.jobDetails}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                No enquiries found
              </div>
            )}
          </div>
        </div>

        {/* Response Panel */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-indigo-500/20 p-6">
          {selectedEnquiry ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Respond to Enquiry</h2>
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-lg">
                  {success}
                </div>
              )}
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">From</h3>
                    <p>{selectedEnquiry.name}</p>
                    <p className="text-sm text-gray-400">{selectedEnquiry.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Company</h3>
                    <p>{selectedEnquiry.company || 'Not specified'}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Enquiry Details</h3>
                  <p className="text-gray-300 bg-gray-800/50 p-3 rounded-lg border border-gray-700 mt-1">
                    {selectedEnquiry.jobDetails}
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-400">Your Response</h3>
                    <div className="text-xs text-gray-500">
                      Will be sent to: {selectedEnquiry.email}
                    </div>
                  </div>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="w-full h-48 bg-gray-800 border border-indigo-500/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors resize-none"
                    placeholder="Type your response..."
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedEnquiry(null)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRespond(selectedEnquiry.id)}
                    disabled={sending}
                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white rounded-lg px-4 py-2 transition-colors flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail size={16} />
                        Send Response
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Mail size={48} className="mb-4 text-indigo-500/50" />
              <p>Select an enquiry to respond</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnquiriesManagement;