import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaPlus, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import { firestore } from '../../database/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { toast } from 'react-toastify';

const EventsScreen = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'webinar',
    status: 'upcoming'
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const q = query(collection(firestore, 'events'), orderBy('date', 'asc'));
      const snapshot = await getDocs(q);
      const eventsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsList);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const eventData = {
        ...formData,
        updatedAt: new Date(),
        ...(editingEvent ? {} : { createdAt: new Date() })
      };

      if (editingEvent) {
        await updateDoc(doc(firestore, 'events', editingEvent.id), eventData);
        toast.success('Event updated successfully');
      } else {
        await addDoc(collection(firestore, 'events'), eventData);
        toast.success('Event created successfully');
      }

      setShowModal(false);
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        type: 'webinar',
        status: 'upcoming'
      });
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      type: event.type,
      status: event.status
    });
    setShowModal(true);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteDoc(doc(firestore, 'events', eventId));
        toast.success('Event deleted successfully');
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'webinar':
        return 'bg-blue-500/20 text-blue-400';
      case 'workshop':
        return 'bg-purple-500/20 text-purple-400';
      case 'conference':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getEventStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'ongoing':
        return 'bg-green-500/20 text-green-400';
      case 'completed':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/50 backdrop-blur-sm border border-indigo-500/20 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-white">Events Management</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 p-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <FaPlus /> New Event
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <FaSpinner className="animate-spin text-indigo-400 text-4xl mx-auto" />
            <p className="text-gray-400 mt-2">Loading events...</p>
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-medium">{event.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getEventTypeColor(event.type)}`}>
                        {event.type}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getEventStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                    <p className="text-gray-300">{event.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <FaCalendarAlt />
                        <span>{event.date}</span>
                      </div>
                      <div>{event.time}</div>
                      <div>{event.location}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(event)}
                      className="p-2 hover:bg-indigo-500/20 rounded-lg text-gray-400 hover:text-indigo-400 transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FaCalendarAlt className="text-gray-700 text-4xl mx-auto" />
            <p className="text-gray-500 mt-2">No events scheduled</p>
          </div>
        )}
      </div>

      {/* Add/Edit Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingEvent ? 'Edit Event' : 'New Event'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-800 border border-indigo-500/20 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-800 border border-indigo-500/20 rounded-lg px-4 py-2 text-white h-32"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-gray-800 border border-indigo-500/20 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-gray-800 border border-indigo-500/20 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-gray-800 border border-indigo-500/20 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-gray-800 border border-indigo-500/20 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="webinar">Webinar</option>
                    <option value="workshop">Workshop</option>
                    <option value="conference">Conference</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-gray-800 border border-indigo-500/20 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEvent(null);
                    setFormData({
                      title: '',
                      description: '',
                      date: '',
                      time: '',
                      location: '',
                      type: 'webinar',
                      status: 'upcoming'
                    });
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsScreen; 