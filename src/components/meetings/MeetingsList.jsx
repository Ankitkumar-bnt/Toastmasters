import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner, Card, Pagination, Dropdown } from 'react-bootstrap';
import { Edit, Trash2, Plus, Calendar, Clock, MapPin, FileText, Filter } from 'lucide-react';

const MeetingsList = ({ meetings, loading, onEdit, onDelete, onAdd }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const meetingsPerPage = 6;

  // Reset to first page when meetings change or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [meetings, categoryFilter]);

  // Calculate meeting status counts
  const getMeetingCounts = () => {
    if (!meetings || meetings.length === 0) {
      return { total: 0, upcoming: 0, ongoing: 0, past: 0 };
    }

    let upcoming = 0, ongoing = 0, past = 0;

    meetings.forEach(meeting => {
      const { meetingDate, startTime, endTime } = meeting;
      if (!meetingDate || !startTime || !endTime) return;

      const [year, month, day] = meetingDate.split('-').map(Number);
      const [startHourStr, startMinuteStr] = String(startTime).split(':');
      const [endHourStr, endMinuteStr] = String(endTime).split(':');

      const start = new Date(year, (month || 1) - 1, day, Number(startHourStr), Number(startMinuteStr || 0));
      const end = new Date(year, (month || 1) - 1, day, Number(endHourStr), Number(endMinuteStr || 0));
      const now = new Date();

      if (now < start) upcoming++;
      else if (now >= start && now <= end) ongoing++;
      else past++;
    });

    return { total: meetings.length, upcoming, ongoing, past };
  };

  // Filter meetings by category
  const filteredMeetings = meetings ? meetings.filter(meeting => {
    if (categoryFilter === 'All') return true;
    if (categoryFilter === 'Regular') return !meeting.category || meeting.category === 'Regular';
    return meeting.category === categoryFilter;
  }) : [];

  // Sort meetings by date (most recent first)
  const sortedMeetings = [...filteredMeetings].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Calculate pagination
  const totalPages = Math.ceil(sortedMeetings.length / meetingsPerPage);
  const startIndex = (currentPage - 1) * meetingsPerPage;
  const endIndex = startIndex + meetingsPerPage;
  const currentMeetings = sortedMeetings.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const raw = timeString.includes('T') ? timeString.split('T')[1] : timeString;
    const [hh, mm] = raw.split(':');
    return hh && mm ? `${hh}:${mm}` : raw;
  };

  const getStatusBadge = (meeting) => {
    const { meetingDate, startTime, endTime } = meeting;
    if (!meetingDate || !startTime || !endTime) return <Badge bg="secondary">Unknown</Badge>;

    const [year, month, day] = meetingDate.split('-').map(Number);
    const [startHourStr, startMinuteStr] = String(startTime).split(':');
    const [endHourStr, endMinuteStr] = String(endTime).split(':');

    const start = new Date(year, (month || 1) - 1, day, Number(startHourStr), Number(startMinuteStr || 0));
    const end = new Date(year, (month || 1) - 1, day, Number(endHourStr), Number(endMinuteStr || 0));
    const now = new Date();

    if (now < start) return <Badge bg="primary">Upcoming</Badge>;
    if (now >= start && now <= end) return <Badge bg="success">Ongoing</Badge>;
    return <Badge bg="secondary">Past</Badge>;
  };

  const getCategoryBadge = (category) => {
    if (!category || category === 'Regular') return null;
    
    const badgeConfig = {
      'Special': { bg: 'danger', text: 'Special' },
      'Contest': { bg: 'warning', text: 'Contest' }
    };
    
    const config = badgeConfig[category];
    if (!config) return null;
    
    return (
      <Badge bg={config.bg} className="ms-2">
        {config.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="shadow-sm">
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading meetings...</p>
        </Card.Body>
      </Card>
    );
  }

  if (!meetings || meetings.length === 0) {
    return (
      <Card className="shadow-sm">
        <Card.Body className="text-center py-5">
          <Calendar size={64} className="text-muted mb-4" />
          <h4>No Meetings Found</h4>
          <p className="text-muted mb-4">Start by adding your first meeting</p>
          <Button variant="primary" onClick={onAdd}>
            <Plus size={20} className="me-2" />
            Add First Meeting
          </Button>
        </Card.Body>
      </Card>
    );
  }

  const meetingCounts = getMeetingCounts();

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="mb-1">
            Total Meetings: {meetingCounts.total}
            {totalPages > 1 && (
              <span className="text-muted ms-2">
                (Page {currentPage} of {totalPages})
              </span>
            )}
          </h5>
          <div className="text-muted">
            <Badge bg="success" className="me-2">Upcoming: {meetingCounts.upcoming}</Badge>
            <Badge bg="secondary">Past: {meetingCounts.past}</Badge>
          </div>
        </div>
        <div className="d-flex gap-2">
          <Dropdown>
            <Dropdown.Toggle variant="outline-primary" size="sm" className="shadow-sm border-2">
              <Filter size={16} className="me-2" />
              <strong>Filter:</strong> {categoryFilter}
            </Dropdown.Toggle>
            <Dropdown.Menu className="shadow-lg border-0">
              <Dropdown.Header className="text-muted small">
                <Filter size={14} className="me-1" />
                Meeting Categories
              </Dropdown.Header>
              <Dropdown.Item 
                active={categoryFilter === 'All'} 
                onClick={() => setCategoryFilter('All')}
                className="d-flex align-items-center"
              >
                <span className="me-2">📋</span>
                All Meetings
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item 
                active={categoryFilter === 'Regular'} 
                onClick={() => setCategoryFilter('Regular')}
                className="d-flex align-items-center"
              >
                <span className="me-2">🟢</span>
                Regular
              </Dropdown.Item>
              <Dropdown.Item 
                active={categoryFilter === 'Special'} 
                onClick={() => setCategoryFilter('Special')}
                className="d-flex align-items-center"
              >
                <span className="me-2">🔴</span>
                Special
              </Dropdown.Item>
              <Dropdown.Item 
                active={categoryFilter === 'Contest'} 
                onClick={() => setCategoryFilter('Contest')}
                className="d-flex align-items-center"
              >
                <span className="me-2">🟡</span>
                Contest
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button variant="primary" onClick={onAdd}>
            <Plus size={20} className="me-2" />
            Add Meeting
          </Button>
        </div>
      </div>
      
      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Table responsive className="mb-0">
            <thead className="bg-light">
              <tr>
                <th className="border-0 px-3 py-3">
                  <Calendar size={16} className="me-2" />
                  Date
                </th>
                <th className="border-0 px-3 py-3">
                  <Clock size={16} className="me-2" />
                  Time
                </th>
                <th className="border-0 px-3 py-3">
                  <FileText size={16} className="me-2" />
                  Theme
                </th>
                <th className="border-0 px-3 py-3">
                  <MapPin size={16} className="me-2" />
                  Location
                </th>
                <th className="border-0 px-3 py-3 text-center">Status</th>
                <th className="border-0 px-3 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentMeetings.map((meeting) => (
                <tr key={meeting.meetingId} className="border-bottom" style={{cursor:'pointer'}} onClick={() => onEdit({ ...meeting, __viewOnly: true })}>
                  <td className="px-3 py-3">
                    <strong>{formatDate(meeting.meetingDate)}</strong>
                    {getCategoryBadge(meeting.category)}
                  </td>
                  <td className="px-3 py-3">
                    {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-truncate" style={{ maxWidth: '200px' }} title={meeting.meetingTheme}>
                      {meeting.meetingTheme}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-truncate" style={{ maxWidth: '150px' }} title={meeting.meetingLocation}>
                      {meeting.meetingLocation}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {getStatusBadge(meeting)}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => onEdit(meeting)}
                      title="Edit Meeting"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => onDelete(meeting.meetingId)}
                      title="Delete Meeting"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.First 
              onClick={() => handlePageChange(1)} 
              disabled={currentPage === 1}
            />
            <Pagination.Prev 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
            />
            
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              return (
                <Pagination.Item
                  key={pageNumber}
                  active={pageNumber === currentPage}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </Pagination.Item>
              );
            })}
            
            <Pagination.Next 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
            />
            <Pagination.Last 
              onClick={() => handlePageChange(totalPages)} 
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default MeetingsList; 