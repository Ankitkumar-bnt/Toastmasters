import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert, Badge, Row, Col } from 'react-bootstrap';
import { getMemberPreferredRoles } from '../../api/PreferredRoleApi';
import { getMemberAssignedRole } from '../../api/AssignedRoleApi';
import { getMeetingById, getAllMeetings } from '../../api/MeetingApi';

const PreferredRolesPage = ({ onMeetingClick }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get current user from localStorage
        const currentUser = JSON.parse(localStorage.getItem('tm_current_user') || '{}');
        const userId = currentUser.userId || currentUser.id;
        
        if (!userId) {
          throw new Error('User not found. Please log in again.');
        }

        console.log('Fetching meetings...');
        // Fetch all meetings
        const meetingsRes = await getAllMeetings();
        console.log('Raw meetings response:', meetingsRes);
        
        // Handle different response formats
        let meetingsList = [];
        if (meetingsRes && meetingsRes.data) {
          console.log('Meetings data structure:', {
            isArray: Array.isArray(meetingsRes.data),
            hasDataProperty: meetingsRes.data.data !== undefined,
            dataKeys: Object.keys(meetingsRes.data)
          });
          
          meetingsList = Array.isArray(meetingsRes.data) 
            ? meetingsRes.data 
            : (meetingsRes.data.data || []);
        }
        
        console.log('Meetings list:', meetingsList);

        if (meetingsList.length === 0) {
          setMeetings([]);
          setLoading(false);
          return;
        }

        // For each meeting, get preferred and assigned roles
        const meetingsWithRoles = [];
        
        // Process meetings sequentially to avoid too many parallel requests
        for (const meeting of meetingsList) {
          try {
            const meetingId = meeting.meetingId || meeting.id;
            if (!meetingId) continue;

            console.log(`Fetching roles for meeting ${meetingId}...`);
            
            // Fetch preferred roles
            let preferredRoles = [];
            try {
              console.log(`Fetching preferred roles for user ${userId}, meeting ${meetingId}`);
              const preferredRes = await getMemberPreferredRoles(userId, meetingId);
              console.log('Preferred roles response:', {
                status: preferredRes?.status,
                data: preferredRes?.data,
                dataStructure: {
                  isArray: Array.isArray(preferredRes?.data),
                  hasDataProperty: preferredRes?.data?.data !== undefined,
                  dataType: typeof preferredRes?.data
                }
              });
              
              // Handle different response formats
              if (Array.isArray(preferredRes?.data)) {
                preferredRoles = preferredRes.data;
              } else if (preferredRes?.data?.data) {
                preferredRoles = preferredRes.data.data;
              } else if (preferredRes?.data) {
                preferredRoles = [preferredRes.data];
              }
              
              console.log('Processed preferred roles:', preferredRoles);
            } catch (err) {
              console.error('Error fetching preferred roles:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
              });
            }

            // Fetch assigned roles
            let assignedRoles = [];
            try {
              console.log(`Fetching assigned roles for user ${userId}, meeting ${meetingId}`);
              const assignedRes = await getMemberAssignedRole(userId, meetingId);
              console.log('Assigned roles response:', {
                status: assignedRes?.status,
                data: assignedRes?.data,
                dataStructure: {
                  isArray: Array.isArray(assignedRes?.data),
                  hasDataProperty: assignedRes?.data?.data !== undefined,
                  dataType: typeof assignedRes?.data
                }
              });
              
              // Handle different response formats
              if (Array.isArray(assignedRes?.data)) {
                assignedRoles = assignedRes.data;
              } else if (assignedRes?.data?.data) {
                assignedRoles = assignedRes.data.data;
              } else if (assignedRes?.data) {
                assignedRoles = [assignedRes.data];
              }
              
              console.log('Processed assigned roles:', assignedRoles);
            } catch (err) {
              console.error('Error fetching assigned roles:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
              });
            }

            meetingsWithRoles.push({
              ...meeting,
              meetingId, // Ensure meetingId is set
              preferredRoles,
              assignedRoles
            });

          } catch (err) {
            console.error(`Error processing meeting ${meeting.meetingId}:`, err);
            // Continue with next meeting even if one fails
          }
        }

        console.log('Final meetings with roles:', meetingsWithRoles);
        // Filter meetings to only show those within the next 30 days
        const filteredMeetings = filterMeetings(meetingsWithRoles);
        setMeetings(filteredMeetings);
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError(err.message || 'Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      <Alert variant="danger">
        {error}
      </Alert>
    );
  }

  // Debug: Log the final meetings data
  console.log('Final meetings data:', meetings);

  // Helper function to safely extract role names
  const getRoleName = (role) => {
    if (!role) return '';
    if (typeof role === 'string') return role;
    return role.roleName || role.role_name || role.name || JSON.stringify(role);
  };

  return (
    <div className="preferred-roles-page">
      <h2 className="mb-4 mx-5">Roles</h2>
      
      {meetings.length === 0 ? (
        <Alert variant="info">
          No meetings found in the next 30 days.
        </Alert>
      ) : (
        <Row xs={1} md={2} className="g-4 px-5">
          {meetings.map((meeting) => {
            const meetingId = meeting.meetingId || meeting.id || 'unknown';
            const theme = meeting.theme || meeting.meetingTheme || 'No Theme';
            const venue = meeting.venue || meeting.meetingVenue || 'Not specified';
            const date = meeting.meetingDate || meeting.date || null;
            
            // Ensure roles are arrays
            const preferredRoles = Array.isArray(meeting.preferredRoles) 
              ? meeting.preferredRoles 
              : (meeting.preferredRoles ? [meeting.preferredRoles] : []);
              
            const assignedRoles = Array.isArray(meeting.assignedRoles) 
              ? meeting.assignedRoles 
              : (meeting.assignedRoles ? [meeting.assignedRoles] : []);

            // Debug log
            console.log('Rendering meeting:', {
              meetingId,
              theme,
              venue,
              date,
              preferredRoles,
              assignedRoles,
              rawMeeting: meeting // Log the raw meeting object for debugging
            });

            return (
              <Col key={meetingId}>
                <Card 
                  className="h-100 shadow-sm hover-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onMeetingClick(meeting)}
                >
                  <Card.Header className="bg-light">
                    <h5 className="mb-0">{theme}</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <div className="text-muted small">Date</div>
                      <div>{formatDate(date)}</div>
                    </div>
                    

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-semibold">Preferred Roles</span>
                      </div>
                      <div className="d-flex flex-wrap gap-1">
                        {preferredRoles.length > 0 ? (
                          preferredRoles.map((role, idx) => (
                            <Badge key={`pref-${idx}`} bg="info" className="me-1 mb-1">
                              {getRoleName(role)}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted">No preferred roles selected</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-semibold">Assigned Roles</span>
                      </div>
                      <div className="d-flex flex-wrap gap-1">
                        {assignedRoles.length > 0 ? (
                          assignedRoles.map((role, idx) => (
                            <Badge key={`assigned-${idx}`} bg="success" className="me-1 mb-1">
                              {getRoleName(role)}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted">No roles assigned yet</span>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default PreferredRolesPage;
