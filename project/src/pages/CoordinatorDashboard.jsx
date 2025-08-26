import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { eventsAPI, registrationsAPI } from '../services/api';
import { Plus, Calendar, Users, Eye, Edit, Trash2, Clock, MapPin, CheckCircle } from 'lucide-react';

const CoordinatorDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const response = await eventsAPI.getMyEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load your events');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventRegistrations = async (eventId) => {
    try {
      const response = await registrationsAPI.getEventRegistrations(eventId);
      setRegistrations(response.data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      alert('Failed to load registrations');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await eventsAPI.delete(eventId);
      setEvents(prev => prev.filter(event => event._id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const handleViewRegistrations = async (event) => {
    setSelectedEvent(event);
    await fetchEventRegistrations(event._id);
    setShowRegistrationsModal(true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      technical: 'bg-blue-100 text-blue-800',
      cultural: 'bg-purple-100 text-purple-800',
      sports: 'bg-green-100 text-green-800',
      academic: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  const getEventStatus = (eventDate) => {
    const now = new Date();
    const event = new Date(eventDate);
    
    if (event < now) {
      return { label: 'Completed', color: 'text-gray-500' };
    } else if (event.toDateString() === now.toDateString()) {
      return { label: 'Today', color: 'text-green-600' };
    } else {
      return { label: 'Upcoming', color: 'text-blue-600' };
    }
  };

  const exportRegistrations = () => {
    if (!selectedEvent || registrations.length === 0) return;

    const csvContent = [
      ['Name', 'Email', 'Phone', 'Department', 'Roll Number', 'Year', 'Registration Date'],
      ...registrations.map(reg => [
        reg.name,
        reg.email,
        reg.phone,
        reg.department,
        reg.rollNumber,
        reg.year,
        new Date(reg.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedEvent.title}_registrations.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Coordinator Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}!</p>
          </div>
          <Link
            to="/create-event"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Create Event</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.filter(event => new Date(event.date) >= new Date()).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.reduce((sum, event) => sum + (event.registrationCount || 0), 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.filter(event => new Date(event.date) < new Date()).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">My Events</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Created</h3>
              <p className="text-gray-600 mb-6">You haven't created any events yet.</p>
              <Link
                to="/create-event"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="h-4 w-4" />
                <span>Create Your First Event</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {events.map((event) => {
                const status = getEventStatus(event.date);

                return (
                  <div key={event._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                            {event.category}
                          </span>
                          <div className={`flex items-center space-x-1 ${status.color}`}>
                            <span className="text-sm font-medium">{status.label}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3">{event.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-gray-500 text-sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatDate(event.date)} at {formatTime(event.date)}</span>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{event.venue}</span>
                      </div>
                      <div className="flex items-center text-green-600 text-sm font-medium">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{event.registrationCount || 0} / {event.maxParticipants} registered</span>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Deadline: {formatDate(event.registrationDeadline)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-500">
                        Created on {formatDate(event.createdAt)}
                      </div>
                      <div className="flex items-center space-x-3">
                        <Link
                          to={`/events/${event._id}`}
                          className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </Link>
                        <button
                          onClick={() => handleViewRegistrations(event)}
                          className="inline-flex items-center space-x-1 text-green-600 hover:text-green-700 font-medium text-sm"
                        >
                          <Users className="h-4 w-4" />
                          <span>Registrations</span>
                        </button>
                        <Link
                          to={`/edit-event/${event._id}`}
                          className="inline-flex items-center space-x-1 text-orange-600 hover:text-orange-700 font-medium text-sm"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </Link>
                        <button
                          onClick={() => handleDeleteEvent(event._id)}
                          className="inline-flex items-center space-x-1 text-red-600 hover:text-red-700 font-medium text-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Registrations Modal */}
      {showRegistrationsModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Registrations for {selectedEvent.title}
                </h2>
                <div className="flex items-center space-x-3">
                  {registrations.length > 0 && (
                    <button
                      onClick={exportRegistrations}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                    >
                      Export CSV
                    </button>
                  )}
                  <button
                    onClick={() => setShowRegistrationsModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {registrations.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Registrations Yet</h3>
                  <p className="text-gray-600">No one has registered for this event yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Phone</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Department</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Roll No.</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Year</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map((registration) => (
                        <tr key={registration._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900">{registration.name}</td>
                          <td className="py-3 px-4 text-gray-600">{registration.email}</td>
                          <td className="py-3 px-4 text-gray-600">{registration.phone}</td>
                          <td className="py-3 px-4 text-gray-600">{registration.department}</td>
                          <td className="py-3 px-4 text-gray-600">{registration.rollNumber}</td>
                          <td className="py-3 px-4 text-gray-600">{registration.year}</td>
                          <td className="py-3 px-4 text-gray-600">
                            {formatDate(registration.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoordinatorDashboard;