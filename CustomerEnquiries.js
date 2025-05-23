import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaSpinner, FaCheck, FaTimes, FaSearch } from 'react-icons/fa';
import { firestore } from '../../database/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, where } from 'firebase/firestore';
import { toast } from 'react-toastify';

const CustomerEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, resolved

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      const q = query(
        collection(firestore, 'contactSubmissions'),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      const enquiriesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEnquiries(enquiriesList);
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      toast.error('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (enquiryId, newStatus) => {
    try {
      await updateDoc(doc(firestore, 'contactSubmissions', enquiryId), {
        status: newStatus,
        updatedAt: new Date()
      });
      toast.success(`Enquiry marked as ${newStatus}`);
      fetchEnquiries();
    } catch (error) {
      console.error('Error updating enquiry status:', error);
      toast.error('Failed to update enquiry status');
    }
  };

  const filteredEnquiries = enquiries.filter(enquiry => {
    const matchesSearch = 
      enquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'pending' ? enquiry.status === 'pending' :
      filter === 'resolved' ? enquiry.status === 'resolved' : true;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/50 backdrop-blur-sm border border-indigo-500/20 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-white">Customer Enquiries</h2>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search enquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border border-indigo-500/20 rounded-lg px-4 py-2 pl-10 text-white w-64"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-800 border border-indigo-500/20 rounded-lg px-4 py-2 text-white"
            >
              <option value="all">All Enquiries</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <FaSpinner className="animate-spin text-indigo-400 text-4xl mx-auto" />
            <p className="text-gray-400 mt-2">Loading enquiries...</p>
          </div>
        ) : filteredEnquiries.length > 0 ? (
          <div className="space-y-4">
            {filteredEnquiries.map((enquiry) => (
              <div
                key={enquiry.id}
                className="bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-medium">{enquiry.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        enquiry.status === 'resolved'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {enquiry.status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{enquiry.email}</p>
                    <p className="text-gray-300">{enquiry.message}</p>
                    <p className="text-gray-500 text-sm">
                      Received on {enquiry.timestamp?.toDate().toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {enquiry.status === 'pending' ? (
                      <button
                        onClick={() => handleStatusChange(enquiry.id, 'resolved')}
                        className="p-2 hover:bg-green-500/20 rounded-lg text-gray-400 hover:text-green-400 transition-colors"
                        title="Mark as resolved"
                      >
                        <FaCheck />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(enquiry.id, 'pending')}
                        className="p-2 hover:bg-yellow-500/20 rounded-lg text-gray-400 hover:text-yellow-400 transition-colors"
                        title="Mark as pending"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FaEnvelope className="text-gray-700 text-4xl mx-auto" />
            <p className="text-gray-500 mt-2">No enquiries found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerEnquiries;