import React, { useState, useEffect } from 'react';
import { Card, Spinner, Table, Badge, Dropdown, Pagination, Button } from 'react-bootstrap';
import { Calendar, Clock, Filter } from 'lucide-react';
import { getAllMeetings } from '../../api/MeetingApi';

const ViewMeetings = ({ onOpenDetails, onOpenAssignedWodPod, onOpenAssignedSpeech, onOpenAgenda }) => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const meetingsPerPage = 6; // Show 6 meetings per page

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        const response = await getAllMeetings();
        console.log('API Response:', response);
        
        // Handle the response based on its structure
        let meetingsData = [];
        if (Array.isArray(response.data)) {
          meetingsData = response.data;
        } else if (response.data && Array.isArray(response.data.content)) {
          // Handle Spring Data REST pagination response
          meetingsData = response.data.content;
        } else if (response.data && Array.isArray(response.data.data)) {
          // Handle custom API response with data wrapper
          meetingsData = response.data.data;
        }
        
        console.log('Processed meetings:', meetingsData);
        setMeetings(meetingsData || []);
      } catch (err) {
        console.error('Error fetching meetings:', err);
        setError('Failed to load meetings. Please try again later.');
        setMeetings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  // Determine if a meeting is published (supports multiple backend representations)
  const isMeetingPublished = (meeting) => {
    const raw = meeting?.isPublish ?? meeting?.isPublished ?? meeting?.published;
    if (typeof raw === 'boolean') return raw;
    if (typeof raw === 'number') return raw === 1;
    if (typeof raw === 'string') {
      const s = raw.trim().toLowerCase();
      if (s.startsWith('0x')) {
        const num = Number.parseInt(s, 16);
        return num === 1;
      }
      return s === 'true' || s === '1' || s === 'yes' || s === 'published';
    }
    return false;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    // Parse the date string (assuming format YYYY-MM-DD from Java LocalDate)
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    // Format time from HH:MM:SS to HH:MM
    return timeString.split(':').slice(0, 2).join(':');
  };

  const getCategoryBadgeVariant = (category) => {
    const c = (category || '').toLowerCase();
    if (c === 'contest') return 'warning'; // yellow
    if (c === 'special') return 'danger';  // red
    return 'info'; // default blue
  };

  const getStatusBadge = (meeting) => {
    const { meetingDate, startTime, endTime } = meeting;
    if (!meetingDate || !startTime || !endTime) return <Badge bg="secondary">Unknown</Badge>;
    
    const now = new Date();
    // Convert Java LocalDate and LocalTime to JavaScript Date
    const start = new Date(meetingDate + 'T' + startTime);
    const end = new Date(meetingDate + 'T' + endTime);

    if (now < start) return <Badge bg="primary">Upcoming</Badge>;
    if (now >= start && now <= end) return <Badge bg="success">Ongoing</Badge>;
    return <Badge bg="secondary">Past</Badge>;
  };

  // Filter meetings by category and exclude past meetings
  const filteredMeetings = meetings.filter(meeting => {
    // Exclude past meetings
    const now = new Date();
    const meetingDate = new Date(meeting.meetingDate + 'T' + (meeting.endTime || '23:59:59'));
    if (meetingDate < now) return false;
    
    // Apply category filter
    if (categoryFilter === 'All') return true;
    if (categoryFilter === 'Regular') return !meeting.category || meeting.category === 'Regular';
    return meeting.category === categoryFilter;
  });

  // Sort (ascending by date and start time), then paginate
  const sortedMeetings = [...filteredMeetings].sort((a, b) => {
    const aHas = a.meetingDate && a.startTime;
    const bHas = b.meetingDate && b.startTime;
    if (!aHas && !bHas) return 0;
    if (!aHas) return 1; // push items without date/time to the end
    if (!bHas) return -1;
    const aDt = new Date(a.meetingDate + 'T' + a.startTime);
    const bDt = new Date(b.meetingDate + 'T' + b.startTime);
    return aDt - bDt;
  });

  // Pagination
  const indexOfLastMeeting = currentPage * meetingsPerPage;
  const indexOfFirstMeeting = indexOfLastMeeting - meetingsPerPage;
  const currentMeetings = sortedMeetings.slice(indexOfFirstMeeting, indexOfLastMeeting);
  const totalPages = Math.ceil(sortedMeetings.length / meetingsPerPage);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="shadow-sm p-4">
        <div className="alert alert-danger">{error}</div>
      </Card>
    );
  }

  return (
    <div style={{ width: '88%', margin: '0 auto' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Meetings</h5>
        <div className="d-flex align-items-center gap-2">
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" size="sm">
              <Filter size={16} className="me-2" />
              Filter: {categoryFilter}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setCategoryFilter('All')}>All Meetings</Dropdown.Item>
              <Dropdown.Item onClick={() => setCategoryFilter('Regular')}>Regular</Dropdown.Item>
              <Dropdown.Item onClick={() => setCategoryFilter('Special')}>Special</Dropdown.Item>
              <Dropdown.Item onClick={() => setCategoryFilter('Contest')}>Contest</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button size="sm" variant="primary" onClick={() => onOpenAssignedWodPod && onOpenAssignedWodPod()}>
            Assigned WOD/POD
          </Button>
          <Button size="sm" variant="success" onClick={() => onOpenAssignedSpeech && onOpenAssignedSpeech()}>
            Assigned Speech
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th className="px-3 py-3">ID</th>
                <th className="px-3 py-3">
                  <Calendar size={16} className="me-2" />
                  Date
                </th>
                <th className="px-3 py-3">
                  <Clock size={16} className="me-2" />
                  Time
                </th>
                <th className="px-3 py-3">Theme</th>
                <th className="px-3 py-3">Location</th>
                <th className="px-3 py-3">Agenda</th>
              </tr>
            </thead>
            <tbody>
              {currentMeetings.length > 0 ? (
                currentMeetings.map((meeting) => (
                  <tr
                    key={meeting.meetingId}
                    onClick={() => onOpenDetails && onOpenDetails(meeting)}
                    style={{ cursor: onOpenDetails ? 'pointer' : 'default' }}
                    title={onOpenDetails ? 'Click to view meeting details' : undefined}
                  >
                    <td className="px-3 py-3 fw-semibold">
                      {meeting.meetingId || 'N/A'}
                    </td>
                    <td className="px-3 py-3">
                      {formatDate(meeting.meetingDate)}
                      {meeting.category && meeting.category !== 'Regular' && (
                        <Badge bg={getCategoryBadgeVariant(meeting.category)} className="ms-2">
                          {meeting.category}
                        </Badge>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                    </td>
                    <td className="px-3 py-3">{meeting.meetingTheme || 'N/A'}</td>
                    <td className="px-3 py-3">{meeting.meetingLocation || 'N\u00A0A'}</td>
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      {(() => {
                        const published = isMeetingPublished(meeting);
                        return (
                          <Button
                            variant={published ? 'primary' : 'outline-secondary'}
                            size="sm"
                            disabled={!published}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onOpenAgenda) onOpenAgenda(meeting.meetingId);
                            }}
                            title={published ? 'View Agenda' : 'Agenda not published yet'}
                          >
                            View Agenda
                          </Button>
                        );
                      })()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No meetings found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination>
            <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
            <Pagination.Prev 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1} 
            />
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Pagination.Item 
                  key={pageNum}
                  active={pageNum === currentPage}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Pagination.Item>
              );
            })}
            <Pagination.Next 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages} 
            />
            <Pagination.Last 
              onClick={() => setCurrentPage(totalPages)} 
              disabled={currentPage === totalPages} 
            />
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default ViewMeetings;
