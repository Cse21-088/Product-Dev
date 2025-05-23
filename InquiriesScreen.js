import React, { useState, useEffect } from 'react';
import {
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaGlobe,
  FaUser,
  FaBriefcase,
  FaClock,
  FaReply,
  FaTimes,
  FaTrash,
  FaSpinner,
  FaCheck,
  FaFilter
} from 'react-icons/fa';
import { firestore } from '../../database/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc,
  doc,
  Timestamp,
  getDocs,
  updateDoc,
  where
} from 'firebase/firestore';
import { toast } from 'react-toastify';

const InquiryCard = ({ inquiry, onDelete }) => {
  const [showPopover, setShowPopover] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDate = (timestamp) => {
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(firestore, 'contactSubmissions', inquiry.id));
      toast.success('Inquiry deleted successfully');
      if (onDelete) onDelete(inquiry.id);
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      toast.error('Failed to delete inquiry');
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSending(true);
    try {
      // Add reply to firestore
      await addDoc(collection(firestore, 'replies'), {
        inquiryId: inquiry.id,
        reply: replyText,
        timestamp: Timestamp.now(),
        to: inquiry.email,
        companyName: inquiry.company
      });

      toast.success(`Reply sent to ${inquiry.email}`);
      setReplyText('');
      setShowPopover(false);
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg relative group">
      {/* Main Card Content */}
      <div className="flex items-start justify-between">
        <div className="space-y-4 flex-1">
          {/* Header */}
          <div className="flex justify-between items-start">
            <h3 className="text-white font-medium text-lg">{inquiry.company}</h3>
            <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-sm">
              New
            </span>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center text-gray-400">
              <FaUser className="mr-2 text-indigo-400" />
              <span>{inquiry.name}</span>
            </div>
            <div className="flex items-center text-gray-400">
              <FaBriefcase className="mr-2 text-indigo-400" />
              <span>{inquiry.jobTitle}</span>
            </div>
            <div className="flex items-center text-gray-400">
              <FaEnvelope className="mr-2 text-indigo-400" />
              <span>{inquiry.email}</span>
            </div>
            <div className="flex items-center text-gray-400">
              <FaPhone className="mr-2 text-indigo-400" />
              <span>{inquiry.phone}</span>
            </div>
            <div className="flex items-center text-gray-400">
              <FaGlobe className="mr-2 text-indigo-400" />
              <span>{inquiry.country}</span>
            </div>
            <div className="flex items-center text-gray-400">
              <FaClock className="mr-2 text-indigo-400" />
              <span>{formatDate(inquiry.timestamp)}</span>
            </div>
          </div>

          {/* Job Details */}
          <div className="bg-gray-900/50 p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Job Details</h4>
            <p className="text-gray-400 text-sm">{inquiry.jobDetails}</p>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowPopover(true)}
              className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 p-2 rounded-lg transition-colors"
            >
              <FaReply />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 p-2 rounded-lg transition-colors"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md relative">
            <h3 className="text-white font-medium mb-4">Confirm Delete</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this inquiry from {inquiry.company}?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Popover */}
      {showPopover && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-xl relative">
            <button
              onClick={() => setShowPopover(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-indigo-400"
            >
              <FaTimes />
            </button>

            <h3 className="text-white font-medium mb-4">
              Reply to {inquiry.name} ({inquiry.company})
            </h3>

            <form onSubmit={handleSubmitReply} className="space-y-4">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
                className="w-full h-40 bg-gray-900 border border-indigo-500/20 rounded-lg p-4 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                disabled={sending}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={sending}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaReply className="mr-2" /> Send Reply
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const InquiriesScreen = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, resolved
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const q = query(
        collection(firestore, 'contactSubmissions'),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      const inquiriesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInquiries(inquiriesList);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (inquiryId, newStatus) => {
    try {
      await updateDoc(doc(firestore, 'contactSubmissions', inquiryId), {
        status: newStatus,
        updatedAt: new Date()
      });
      toast.success(`Inquiry marked as ${newStatus}`);
      fetchInquiries();
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      toast.error('Failed to update inquiry status');
    }
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'pending' ? inquiry.status === 'pending' :
      filter === 'resolved' ? inquiry.status === 'resolved' : true;

    const matchesDateRange = 
      (!dateRange.start || new Date(inquiry.timestamp.seconds * 1000) >= new Date(dateRange.start)) &&
      (!dateRange.end || new Date(inquiry.timestamp.seconds * 1000) <= new Date(dateRange.end));

    return matchesSearch && matchesFilter && matchesDateRange;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'resolved':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/50 backdrop-blur-sm border border-indigo-500/20 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-white">Inquiries Management</h2>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search inquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border border-indigo-500/20 rounded-lg px-4 py-2 pl-10 text-white w-64"
              />
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-800 border border-indigo-500/20 rounded-lg px-4 py-2 text-white flex items-center gap-2"
            >
              <FaFilter />
              Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full bg-gray-800 border border-indigo-500/20 rounded-lg px-4 py-2 text-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full bg-gray-800 border border-indigo-500/20 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full bg-gray-800 border border-indigo-500/20 rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <FaSpinner className="animate-spin text-indigo-400 text-4xl mx-auto" />
            <p className="text-gray-400 mt-2">Loading inquiries...</p>
          </div>
        ) : filteredInquiries.length > 0 ? (
          <div className="space-y-4">
            {filteredInquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-medium">{inquiry.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(inquiry.status)}`}>
                        {inquiry.status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{inquiry.email}</p>
                    <p className="text-gray-300">{inquiry.message}</p>
                    <p className="text-gray-500 text-sm">
                      Received on {inquiry.timestamp?.toDate().toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {inquiry.status === 'pending' ? (
                      <button
                        onClick={() => handleStatusChange(inquiry.id, 'resolved')}
                        className="p-2 hover:bg-green-500/20 rounded-lg text-gray-400 hover:text-green-400 transition-colors"
                        title="Mark as resolved"
                      >
                        <FaCheck />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(inquiry.id, 'pending')}
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
            <p className="text-gray-500 mt-2">No inquiries found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InquiriesScreen; 