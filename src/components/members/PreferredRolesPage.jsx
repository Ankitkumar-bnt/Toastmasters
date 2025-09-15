import React, { useState, useEffect } from 'react';
import { Spinner, Alert, Row, Col } from 'react-bootstrap';
import { getAllMeetings } from '../../api/MeetingApi';
import { getAllMembers } from '../../api/UserApi';
import MeetingCard from './MeetingCard';

const PreferredRolesPage = ({ onMeetingClick }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [members, setMembers] = useState([]);
  const [userId, setUserId] = useState(null);

  // Helper function to safely extract role names
  const getRoleName = (role) => {
    if (!role) return '';
    if (typeof role === 'string') return role;
    return role.roleName || role.role_name || role.name || JSON.stringify(role);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const currentUser = JSON.parse(localStorage.getItem('tm_current_user') || '{}');
        const currentUserId = currentUser.userId || currentUser.id;
        if (!currentUserId) {
          throw new Error('User not found. Please log in again.');
        }
        setUserId(currentUserId);

        const [meetingsRes, membersRes] = await Promise.all([
          getAllMeetings(),
          getAllMembers(),
        ]);

        const meetingsList = meetingsRes?.data?.data || (Array.isArray(meetingsRes?.data) ? meetingsRes.data : []);
        const membersList = membersRes?.data?.data || (Array.isArray(membersRes?.data) ? membersRes.data : []);

        setMembers(membersList);
        const filteredMeetings = filterMeetings(meetingsList);
        setMeetings(filteredMeetings);
      } catch (err) {
        setError(err.message || 'Failed to load initial data.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Filter meetings to only show those within the next 30 days
  const filterMeetings = (meetingsList) => {
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    
    return meetingsList.filter(meeting => {
      const meetingDate = new Date(meeting.meetingDate || meeting.date);
      return meetingDate >= today && meetingDate <= thirtyDaysLater;
    }).sort((a, b) => {
      // Sort by date, soonest first
      return new Date(a.meetingDate || a.date) - new Date(b.meetingDate || b.date);
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">{error}</Alert>
    );
  }

  return (
    <div className="preferred-roles-page">
      <h2 className="mb-4 mx-5">Roles</h2>
      
      {meetings.length === 0 ? (
        <Alert variant="info">No meetings found in the next 30 days.</Alert>
      ) : (
        <Row xs={1} md={2} className="g-4 px-5">
          {meetings.map((meeting) => (
            <MeetingCard
              key={meeting.meetingId || meeting.id}
              meeting={{ ...meeting, meetingId: meeting.meetingId || meeting.id }}
              userId={userId}
              members={members}
              onMeetingClick={onMeetingClick}
            />
          ))}
        </Row>
      )}
    </div>
  );
};

export default PreferredRolesPage;
