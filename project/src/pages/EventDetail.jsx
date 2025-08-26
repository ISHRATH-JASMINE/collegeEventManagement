import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { eventsAPI, registrationsAPI } from '../services/api';
import { Calendar, MapPin, Users, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isStudent } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    rollNumber: '',
    year: ''
  });

  useEffect(() => {
    fetchEvent();
    if (isStudent) {
      checkRegistrationStatus();
    }
  }, [id, isStudent]);

  useEffect(() => {
    if (user && isStudent) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
        rollNumber: user.rollNumber || ''
      }));
    }
  }, [user, isStudent]);

  const fetchEvent = async () => {
    try {
      const response = await eventsAPI.getById(id);
      setEvent(response.data);
    } catch (error) {
      console.error('Error fetching event:', error);
      setError('Event not found');
    } finally {
      setLoading(false);
    }
  };

  const checkRegistrationStatus = async () => {
    try {
      const response = await registrationsAPI.getMyRegistrations();
      const isAlreadyRegistered = response.data.some(reg => reg.eventId._id === id);
      setIsRegistered(isAlreadyRegistered);
    } catch (error) {
      console.error('Error checking registration status:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegistering(true);
    setError('');
    setSuccess('');

    try {
      await registrationsAPI.register({
        eventId: id,
        ...formData
      });
      
      setSuccess('Successfully registered for the event!');
      setIsRegistered(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const isRegistrationOpen = () => {
    if (!event) return false;
    const now = new Date();
    const deadline = new Date(event.registrationDeadline);
    const eventDate = new Date(event.date);
    return now <= deadline && now < eventDate;
  };

  const getAvailableSpots = () => {
    if (!event) return 0;
    return Math.max(0, event.maxParticipants - (event.registrationCount || 0));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Event Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getCategoryColor(event.category)}`}>
                  {event.category}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-3" />
                  <div>
                    <div className="font-medium">{formatDate(event.date)}</div>
                    <div className="text-sm">{formatTime(event.date)}</div>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-3" />
                  <span>{event.venue}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <User className="h-5 w-5 mr-3" />
                  <span>Organized by {event.createdBy?.name}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Users className="h-5 w-5 mr-3" />
                  <div>
                    <div className="font-medium">
                      {getAvailableSpots()} spots available
                    </div>
                    <div className="text-sm">
                      {event.registrationCount || 0} / {event.maxParticipants} registered
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-3" />
                  <div>
                    <div className="font-medium">Registration Deadline</div>
                    <div className="text-sm">{formatDate(event.registrationDeadline)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Event</h2>
              <p className="text-gray-700 leading-relaxed">{event.description}</p>
            </div>
          </div>
        </div>

        {/* Registration Section */}
        {isStudent && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Registration</h2>

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-green-800">{success}</span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                <span className="text-red-800">{error}</span>
              </div>
            )}

            {isRegistered ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  You're Already Registered!
                </h3>
                <p className="text-gray-600">
                  Check your dashboard to view all your registered events.
                </p>
              </div>
            ) : !isRegistrationOpen() ? (
              <div className="text-center py-8">
                <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Registration Closed
                </h3>
                <p className="text-gray-600">
                  {new Date() > new Date(event.registrationDeadline)
                    ? 'The registration deadline has passed.'
                    : 'This event has already occurred.'
                  }
                </p>
              </div>
            ) : getAvailableSpots() === 0 ? (
              <div className="text-center py-8">
                <Users className="h-16 w-16 text-orange-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Event Full
                </h3>
                <p className="text-gray-600">
                  This event has reached its maximum capacity.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department *
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year of Study *
                    </label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Graduate">Graduate</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={registering}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {registering ? 'Registering...' : 'Register for Event'}
                </button>
              </form>
            )}
          </div>
        )}

        {!isAuthenticated && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">
              Want to Register for This Event?
            </h3>
            <p className="text-blue-800 mb-6">
              Please log in as a student to register for events.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Login to Register
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetail;