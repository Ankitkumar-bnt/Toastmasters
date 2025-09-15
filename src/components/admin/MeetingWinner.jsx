import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { Trophy, Calendar, Tag, Plus } from 'lucide-react';
import { getAllMeetings } from '../../api/MeetingApi';
import AddWinnerModal from './AddWinnerModal';
import WinnersListModal from './WinnersListModal';

const MeetingWinner = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddWinnerModal, setShowAddWinnerModal] = useState(false);
  const [showWinnersModal, setShowWinnersModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllMeetings();
      
      // Filter past meetings and sort in descending order by date
      const now = new Date();
      const pastMeetings = response.data.data.filter(meeting => {
        const meetingDate = new Date(meeting.meetingDate);
        return meetingDate < now;
      }).sort((a, b) => new Date(b.meetingDate) - new Date(a.meetingDate));
      
      setMeetings(pastMeetings);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError('Failed to load meetings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWinner = (meeting) => {
    setSelectedMeeting(meeting);
    setShowAddWinnerModal(true);
  };

  const handleViewWinners = (meeting) => {
    setSelectedMeeting(meeting);
    setShowWinnersModal(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderMeetingCard = (meeting) => (
    <Col md={6} lg={4} key={meeting.meetingId} className="mb-4">
      <Card className="h-100 shadow-sm border-0 hover-card">
        <Card.Body className="d-flex flex-column">
          <div className="mb-3">
            <Trophy size={32} className="text-warning mb-2" />
            <h6 className="fw-bold text-truncate">{meeting.meetingTheme || 'No Theme'}</h6>
          </div>
          
          <div className="mb-3 flex-grow-1">
            <div className="d-flex align-items-center mb-2">
              <Calendar size={16} className="text-muted me-2" />
              <small className="text-muted">{formatDate(meeting.meetingDate)}</small>
            </div>
            <div className="d-flex align-items-center">
              <Tag size={16} className="text-muted me-2" />
              <Badge bg="primary" className="text-truncate">
                {meeting.category || 'Regular'}
              </Badge>
            </div>
          </div>
          
          <div className="d-grid gap-2">
            <Button 
              variant="success" 
              size="sm" 
              onClick={() => handleAddWinner(meeting)}
            >
              <Plus size={16} className="me-1" />
              Add Winner
            </Button>
            <Button 
              variant="outline-primary" 
              size="sm" 
              onClick={() => handleViewWinners(meeting)}
            >
              View Winners
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading past meetings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="text-center">
        <Alert.Heading>Error</Alert.Heading>
        {error}
        <div className="mt-3">
          <Button variant="outline-danger" onClick={fetchMeetings}>
            Try Again
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2>Meeting Winners</h2>
        <p className="text-muted">Manage winners for past meetings</p>
      </div>

      {meetings.length === 0 ? (
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <Trophy size={64} className="text-muted mb-3" />
            <h4>No Past Meetings Found</h4>
            <p className="text-muted">There are no past meetings to display winners for.</p>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {meetings.map(meeting => renderMeetingCard(meeting))}
        </Row>
      )}

      <AddWinnerModal
        show={showAddWinnerModal}
        onHide={() => setShowAddWinnerModal(false)}
        meeting={selectedMeeting}
        onWinnerAdded={fetchMeetings}
      />

      <WinnersListModal
        show={showWinnersModal}
        onHide={() => setShowWinnersModal(false)}
        meeting={selectedMeeting}
      />
    </div>
  );
};

export default MeetingWinner;
