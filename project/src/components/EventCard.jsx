import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

const EventCard = ({ event, showRegistrationCount = false }) => {
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

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
              {event.title}
            </h3>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
              {event.category}
            </span>
          </div>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>

        <div className="space-y-2 mb-6">
          <div className="flex items-center text-gray-500 text-sm">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDate(event.date)} at {formatTime(event.date)}</span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{event.venue}</span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <Users className="h-4 w-4 mr-2" />
            <span>Max: {event.maxParticipants} participants</span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <Clock className="h-4 w-4 mr-2" />
            <span>Registration deadline: {formatDate(event.registrationDeadline)}</span>
          </div>
          {showRegistrationCount && (
            <div className="flex items-center text-green-600 text-sm font-medium">
              <Users className="h-4 w-4 mr-2" />
              <span>{event.registrationCount || 0} registered</span>
            </div>
          )}
        </div>

        <Link
          to={`/events/${event._id}`}
          className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EventCard;