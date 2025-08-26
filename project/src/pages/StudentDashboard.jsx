import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { registrationsAPI } from '../services/api';
import { Calendar, MapPin, Clock, User, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyRegistrations();
  }, []);

  const fetchMyRegistrations = async () => {
    try {
      const response = await registrationsAPI.getMyRegistrations();
      setRegistrations(response.data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setError('Failed to load your registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (registrationId) => {
    if (!confirm('Are you sure you want to cancel this registration?')) {
      return;
    }

    try {
      await registrationsAPI.cancel(registrationId);
      setRegistrations(prev => 
        prev.filter(reg => reg._id !== registrationId)
      );
    } catch (error) {
      console.error('Error cancelling registration:', error);
      alert('Failed to cancel registration');
    }
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
      return { label: 'Completed', color: 'text-gray-500', icon: CheckCircle };
    } else if (event.toDateString() === now.toDateString()) {
      return { label: 'Today', color: 'text-green-600', icon: AlertTriangle };
    } else {
      return { label: 'Upcoming', color: 'text-blue-600', icon: Clock };
    }
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                <p className="text-2xl font-bold text-gray-900">{registrations.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {registrations.filter(reg => new Date(reg.eventId.date) >= new Date()).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {registrations.filter(reg => new Date(reg.eventId.date) < new Date()).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Calendar className="h-4 w-4" />
              <span>Browse Events</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/edit-profile"
              className="inline-flex items-center space-x-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* My Registrations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">My Registered Events</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {registrations.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Registered</h3>
              <p className="text-gray-600 mb-6">You haven't registered for any events yet.</p>
              <Link
                to="/"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Calendar className="h-4 w-4" />
                <span>Browse Events</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {registrations.map((registration) => {
                const event = registration.eventId;
                const status = getEventStatus(event.date);
                const StatusIcon = status.icon;

                return (
                  <div key={registration._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                            {event.category}
                          </span>
                          <div className={`flex items-center space-x-1 ${status.color}`}>
                            <StatusIcon className="h-4 w-4" />
                            <span className="text-sm font-medium">{status.label}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3">{event.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-gray-500 text-sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatDate(event.date)} at {formatTime(event.date)}</span>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{event.venue}</span>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm">
                        <User className="h-4 w-4 mr-2" />
                        <span>Registered on {formatDate(registration.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-500">
                        Registration ID: {registration._id.slice(-8)}
                      </div>
                      <div className="flex items-center space-x-3">
                        <Link
                          to={`/events/${event._id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          View Details
                        </Link>
                        {new Date(event.date) > new Date() && (
                          <button
                            onClick={() => handleCancelRegistration(registration._id)}
                            className="text-red-600 hover:text-red-700 font-medium text-sm"
                          >
                            Cancel Registration
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;