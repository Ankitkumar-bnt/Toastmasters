import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert, Badge, Row, Col, Button } from 'react-bootstrap';
import { getMemberPreferredRoles, addMemberPreferredRole, deleteMemberPreferredRole } from '../../api/PreferredRoleApi';
import { getMemberAssignedRole, getAllMemberAssignedRolesByMeeting } from '../../api/AssignedRoleApi';
import { getMeetingById, getAllMeetings } from '../../api/MeetingApi';
import { getAllMeetingRoleCombineByMeeting } from '../../api/MeetingRoleApi';
import { getAllMemberAvailabilityByMeetingId, getAvailabilityById } from '../../api/AvailableMembersApi';
import { getAllMembers } from '../../api/UserApi';
import { getAllAssignedEvaluatorsBySpeakerAndMeeting, getAllAssignedEvaluatorsByEvaluatorAndMeeting, getAllAssignedEvaluatorsByMeeting } from '../../api/AssignEvaluatorApi';

const PreferredRolesPage = ({ onMeetingClick }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [updatingPreferences, setUpdatingPreferences] = useState({});

  // Helper function to safely extract role names
  const getRoleName = (role) => {
    if (!role) return '';
    if (typeof role === 'string') return role;
    return role.roleName || role.role_name || role.name || JSON.stringify(role);
  };

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

        // Preload all members for name mapping
        let members = [];
        try {
          const membersRes = await getAllMembers();
          members = membersRes.data?.data || [];
        } catch (e) {
          console.warn('Failed to load members for name mapping');
        }

        // For each meeting, get preferred roles, assigned roles, availability and evaluator assignments (if speaker)
        const meetingsWithRoles = [];
        
        // Process meetings sequentially to avoid too many parallel requests
        for (const meeting of meetingsList) {
          try {
            const meetingId = meeting.meetingId || meeting.id;
            if (!meetingId) continue;

            console.log(`Fetching roles for meeting ${meetingId}...`);
            
            // Fetch preferred roles for current user
            let preferredRoles = [];
            try {
              console.log(`Fetching preferred roles for user ${userId}, meeting ${meetingId}`);
              const preferredRes = await getMemberPreferredRoles(userId, meetingId);
              
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
              console.error('Error fetching preferred roles:', err);
            }

            // Fetch assigned roles for current user
            let assignedRoles = [];
            try {
              console.log(`Fetching assigned roles for user ${userId}, meeting ${meetingId}`);
              const assignedRes = await getMemberAssignedRole(userId, meetingId);
              
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
              console.error('Error fetching assigned roles:', err);
            }

            // Fetch all available roles with counts for this meeting
            let availableRoles = [];
            try {
              console.log(`Fetching available roles for meeting ${meetingId}...`);
              const rolesRes = await getAllMeetingRoleCombineByMeeting(meetingId);
              const rolesData = rolesRes.data?.data || rolesRes.data || [];
              
              // Fetch all assigned roles for this meeting to calculate availability
              const allAssignedRes = await getAllMemberAssignedRolesByMeeting(meetingId);
              const allAssignedData = allAssignedRes.data?.data || allAssignedRes.data || [];
              
              // Calculate available counts for each role
              const roleCounts = {};
              rolesData.forEach(role => {
                roleCounts[role.roleName] = role.roleCount || 1;
              });
              
              // Subtract assigned roles from available counts
              allAssignedData.forEach(assignment => {
                const roleName = assignment.roleName || assignment.role?.roleName;
                if (roleName && roleCounts[roleName] > 0) {
                  roleCounts[roleName] -= 1;
                }
              });
              
              // Show all roles that have available slots (including those assigned to current user)
              availableRoles = rolesData.map(role => ({
                ...role,
                availableCount: roleCounts[role.roleName] || 0
              }));
              
              console.log('Available roles with counts:', availableRoles);
            } catch (err) {
              console.error('Error fetching available roles:', err);
            }

            // Determine availability status for current user for this meeting
            let availabilityStatus = -1; // -1 not marked
            try {
              const currentUser = JSON.parse(localStorage.getItem('tm_current_user') || '{}');
              const userId = currentUser.userId || currentUser.id;
              
              // First try to get user's availability for this meeting
              const availRes = await getAvailabilityById(userId);
              const userAvailabilities = availRes.data?.data || availRes.data || [];
              
              // Find the record for this meeting
              const record = userAvailabilities.find(a => 
                a.meetingId === meetingId || 
                a.meeting?.meetingId === meetingId
              );
              
              // Get status from record, with fallbacks
              let status = record?.status ?? record?.availability ?? record?.availableStatus ?? -1;
              
              // Normalize status to number
              if (typeof status === 'string') {
                const s = status.toLowerCase().trim();
                if (['1', 'available', 'yes', 'true'].includes(s)) status = 1;
                else if (['0', 'not available', 'no', 'false', 'notavailable'].includes(s)) status = 0;
                else if (['2', 'tentative', 'maybe'].includes(s)) status = 2;
                else status = -1; // Default to -1 for any unknown string
              }
              
              availabilityStatus = Number(status);
              console.log('Availability for meeting', meetingId, 'status:', availabilityStatus, 'record:', record);
              
            } catch (e) {
              console.error('Error fetching availability:', e);
              // Fallback to old method if new one fails
              try {
                const availRes = await getAllMemberAvailabilityByMeetingId(meetingId);
                const allForMeeting = availRes.data?.data || availRes.data || [];
                const currentUser = JSON.parse(localStorage.getItem('tm_current_user') || '{}');
                const userId = currentUser.userId || currentUser.id;
                const record = allForMeeting.find(a => 
                  String(a.userId || a.memberId || a.user?.userId) === String(userId)
                );
                if (record) {
                  let status = record.status ?? record.availability ?? record.availableStatus ?? -1;
                  availabilityStatus = Number(status);
                  console.log('Fallback availability for meeting', meetingId, 'status:', availabilityStatus);
                }
              } catch (fallbackError) {
                console.error('Fallback availability fetch failed:', fallbackError);
              }
            }

            // If user is a speaker for this meeting, fetch assigned evaluators
            let assignedEvaluators = [];
            // If user is an evaluator for this meeting, fetch assigned speakers
            let assignedSpeakers = [];
            try {
              const roleNames = assignedRoles.map(r => getRoleName(r).toLowerCase());
              const isSpeaker = roleNames.some(n => n.startsWith('speaker'));
              const isEvaluator = roleNames.some(n => n.startsWith('evaluator'));
              if (isSpeaker) {
                const currentUser = JSON.parse(localStorage.getItem('tm_current_user') || '{}');
                const userId = currentUser.userId || currentUser.id;
                console.log('Fetching AssignedEvaluatorsBySpeakerAndMeeting for', { speakerId: userId, meetingId });
                const evalRes = await getAllAssignedEvaluatorsBySpeakerAndMeeting(Number(userId), Number(meetingId));
                console.log('Speaker-level evaluator response:', evalRes);
                const evalData = evalRes?.data?.data ?? evalRes?.data ?? [];
                // Map to display list with ID - Name
                if (Array.isArray(evalData) && evalData.length > 0) {
                  assignedEvaluators = evalData.map(item => {
                    const evaluatorId = item.evaluatorId ?? item.userId ?? item.id;
                    const member = members.find(m => String(m.userId) === String(evaluatorId));
                    const name = member?.userName || [member?.firstName, member?.lastName].filter(Boolean).join(' ');
                    return name ? `${evaluatorId} - ${name}` : `${evaluatorId}`;
                  });
                }
                // Fallback: if API returns empty, fetch all for meeting and filter by this speaker
                if (assignedEvaluators.length === 0) {
                  try {
                    console.log('Falling back to meeting-level fetch for evaluators', { meetingId });
                    const allRes = await getAllAssignedEvaluatorsByMeeting(Number(meetingId));
                    const allData = allRes?.data?.data ?? allRes?.data ?? [];
                    assignedEvaluators = allData
                      .filter(a => String(a.speakerId) === String(userId))
                      .map(item => {
                        const evaluatorId = item.evaluatorId ?? item.userId ?? item.id;
                        const member = members.find(m => String(m.userId) === String(evaluatorId));
                        const name = member?.userName || [member?.firstName, member?.lastName].filter(Boolean).join(' ');
                        return name ? `${evaluatorId} - ${name}` : `${evaluatorId}`;
                      });
                  } catch (e) {
                    // ignore
                  }
                }
                console.log('Assigned evaluators for meeting', meetingId, assignedEvaluators);
              }

              if (isEvaluator) {
                try {
                  const currentUser = JSON.parse(localStorage.getItem('tm_current_user') || '{}');
                  const userId = currentUser.userId || currentUser.id;
                  console.log('Fetching AssignedEvaluatorsByEvaluatorAndMeeting for', { evaluatorId: userId, meetingId });
                  const spRes = await getAllAssignedEvaluatorsByEvaluatorAndMeeting(Number(userId), Number(meetingId));
                  console.log('Evaluator-level speaker response:', spRes);
                  const spData = spRes?.data?.data ?? spRes?.data ?? [];
                  assignedSpeakers = Array.isArray(spData) ? spData.map(item => {
                    const speakerId = item.speakerId ?? item.userId ?? item.id;
                    const member = members.find(m => String(m.userId) === String(speakerId));
                    const name = member?.userName || [member?.firstName, member?.lastName].filter(Boolean).join(' ');
                    return name ? `${speakerId} - ${name}` : `${speakerId}`;
                  }) : [];
                  // Fallback: filter meeting-level data
                  if (assignedSpeakers.length === 0) {
                    try {
                      console.log('Falling back to meeting-level fetch for speakers', { meetingId });
                      const allRes = await getAllAssignedEvaluatorsByMeeting(Number(meetingId));
                      const allData = allRes?.data?.data ?? allRes?.data ?? [];
                      assignedSpeakers = allData
                        .filter(a => String(a.evaluatorId) === String(userId))
                        .map(item => {
                          const speakerId = item.speakerId ?? item.userId ?? item.id;
                          const member = members.find(m => String(m.userId) === String(speakerId));
                          const name = member?.userName || [member?.firstName, member?.lastName].filter(Boolean).join(' ');
                          return name ? `${speakerId} - ${name}` : `${speakerId}`;
                        });
                    } catch (e) {
                      // ignore
                    }
                  }
                  console.log('Assigned speakers for meeting', meetingId, assignedSpeakers);
                } catch (e) {
                  // ignore individual errors
                }
              }
            } catch (e) {
              // ignore if fails
            }

            // Absolute fallback using meeting-level assignments (independent of role strings)
            try {
              if (assignedEvaluators.length === 0 || assignedSpeakers.length === 0) {
                const currentUser = JSON.parse(localStorage.getItem('tm_current_user') || '{}');
                const userId = currentUser.userId || currentUser.id;
                const allRes = await getAllAssignedEvaluatorsByMeeting(Number(meetingId));
                const allData = allRes?.data?.data ?? allRes?.data ?? [];

                if (assignedEvaluators.length === 0) {
                  assignedEvaluators = allData
                    .filter(a => String(a.speakerId) === String(userId))
                    .map(item => {
                      const evaluatorId = item.evaluatorId ?? item.userId ?? item.id;
                      const member = members.find(m => String(m.userId) === String(evaluatorId));
                      const name = member?.userName || [member?.firstName, member?.lastName].filter(Boolean).join(' ');
                      return name ? `${evaluatorId} - ${name}` : `${evaluatorId}`;
                    });
                }

                if (assignedSpeakers.length === 0) {
                  assignedSpeakers = allData
                    .filter(a => String(a.evaluatorId) === String(userId))
                    .map(item => {
                      const speakerId = item.speakerId ?? item.userId ?? item.id;
                      const member = members.find(m => String(m.userId) === String(speakerId));
                      const name = member?.userName || [member?.firstName, member?.lastName].filter(Boolean).join(' ');
                      return name ? `${speakerId} - ${name}` : `${speakerId}`;
                    });
                }
                console.log('Computed from meeting-level assignments', { meetingId, assignedEvaluators, assignedSpeakers });
              }
            } catch (e) {
              // ignore
            }

            meetingsWithRoles.push({
              ...meeting,
              meetingId, // Ensure meetingId is set
              preferredRoles,
              assignedRoles,
              availableRoles,
              availabilityStatus,
              assignedEvaluators,
              assignedSpeakers
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

  // (moved getRoleName above to avoid temporal dead zone when used earlier)

  // Handle role preference selection
  const handleRolePreferenceToggle = async (meetingId, roleName) => {
    const currentUser = JSON.parse(localStorage.getItem('tm_current_user') || '{}');
    const userId = currentUser.userId || currentUser.id;
    
    if (!userId) return;

    const updateKey = `${meetingId}-${roleName}`;
    setUpdatingPreferences(prev => ({ ...prev, [updateKey]: true }));

    try {
      // Find the meeting
      const meeting = meetings.find(m => m.meetingId === meetingId);
      if (!meeting) return;

      const preferredRoleNames = meeting.preferredRoles.map(role => getRoleName(role));
      const isCurrentlyPreferred = preferredRoleNames.includes(roleName);

      if (isCurrentlyPreferred) {
        // Remove from preferences
        await deleteMemberPreferredRole(userId, meetingId, [roleName]);
      } else {
        // Add to preferences
        await addMemberPreferredRole(userId, meetingId, [roleName]);
      }

      // Refresh the data for this meeting
      await refreshMeetingData(meetingId, userId);
      
    } catch (err) {
      console.error('Error updating role preference:', err);
    } finally {
      setUpdatingPreferences(prev => ({ ...prev, [updateKey]: false }));
    }
  };

  // Refresh data for a specific meeting
  const refreshMeetingData = async (meetingId, userId) => {
    try {
      // Fetch updated preferred roles
      const preferredRes = await getMemberPreferredRoles(userId, meetingId);
      let preferredRoles = [];
      if (Array.isArray(preferredRes?.data)) {
        preferredRoles = preferredRes.data;
      } else if (preferredRes?.data?.data) {
        preferredRoles = preferredRes.data.data;
      } else if (preferredRes?.data) {
        preferredRoles = [preferredRes.data];
      }

      // Update the meetings state
      setMeetings(prev => prev.map(meeting => 
        meeting.meetingId === meetingId 
          ? { ...meeting, preferredRoles }
          : meeting
      ));
    } catch (err) {
      console.error('Error refreshing meeting data:', err);
    }
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
              assignedEvaluators: meeting.assignedEvaluators,
              assignedSpeakers: meeting.assignedSpeakers,
              rawMeeting: meeting // Log the raw meeting object for debugging
            });

            // Determine card border color based on availability
            const status = typeof meeting.availabilityStatus !== 'undefined' 
              ? Number(meeting.availabilityStatus) 
              : -1; // Default to -1 (blue) if not set
              
            const borderClass = status === 1
              ? 'border-success' // Available - Green
              : status === 0
              ? 'border-danger'  // Not Available - Red
              : status === 2
              ? 'border-warning' // Tentative - Yellow
              : 'border-primary'; // Not Set - Blue
              
            const statusColor = status === 1
              ? '#198754' // green
              : status === 0
              ? '#dc3545' // red
              : status === 2
              ? '#ffc107' // yellow
              : '#0d6efd'; // blue (default)

            return (
              <Col key={meetingId}>
                <Card 
                  className={`h-100 shadow-sm hover-card border-2 ${borderClass}`}
                  style={{ cursor: 'pointer', borderLeft: `6px solid ${statusColor}` }}
                  onClick={() => onMeetingClick(meeting)}
                >
                  <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{theme}</h5>
                    <Badge bg="secondary" className="ms-2">ID: {meetingId}</Badge>
                  </Card.Header>
                  <Card.Body style={{ minHeight: '260px' }}>
                    <div className="mb-3">
                      <div className="text-muted small">Date</div>
                      <div>{formatDate(date)}</div>
                    </div>

                    {/* Available Roles Section */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-semibold">Available Roles</span>
                        <Badge bg="light" text="dark" className="small">
                          {meeting.availableRoles?.length || 0} roles
                        </Badge>
                      </div>
                      <div className="d-flex flex-wrap gap-1">
                        {meeting.availableRoles && meeting.availableRoles.length > 0 ? (
                          meeting.availableRoles.map((role, idx) => {
                            const preferredRoleNames = meeting.preferredRoles.map(r => getRoleName(r));
                            const isPreferred = preferredRoleNames.includes(role.roleName);
                            const updateKey = `${meetingId}-${role.roleName}`;
                            const isUpdating = updatingPreferences[updateKey];
                            
                            return (
                              <Badge 
                                key={`avail-${idx}`} 
                                bg={isPreferred ? "info" : "secondary"} 
                                className="me-1 mb-1 d-flex align-items-center"
                                style={{ 
                                  cursor: isUpdating ? 'wait' : 'pointer',
                                  opacity: isUpdating ? 0.6 : 1,
                                  transition: 'all 0.2s'
                                }}
                                onClick={() => !isUpdating && handleRolePreferenceToggle(meetingId, role.roleName)}
                                title={isPreferred ? 'Click to remove from preferences' : 'Click to add to preferences'}
                              >
                                {role.roleName}
                                {role.availableCount > 1 && (
                                  <span className="ms-1 badge bg-light text-dark">
                                    {role.availableCount}
                                  </span>
                                )}
                                {isPreferred && (
                                  <span className="ms-1">★</span>
                                )}
                                {isUpdating && (
                                  <Spinner size="sm" className="ms-1" />
                                )}
                              </Badge>
                            );
                          })
                        ) : (
                          <span className="text-muted">No roles available</span>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-semibold">Your Preferred Roles</span>
                      </div>
                      <div className="d-flex flex-wrap gap-1">
                        {preferredRoles.length > 0 ? (
                          preferredRoles.map((role, idx) => {
                            const roleName = getRoleName(role);
                            return (
                              <Badge key={`pref-${idx}`} bg="info" className="me-1 mb-1 d-flex align-items-center">
                                <span className="me-1">{idx + 1}.</span>
                                {roleName}
                              </Badge>
                            );
                          })
                        ) : (
                          <span className="text-muted">No preferred roles selected</span>
                        )}
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-semibold">Your Assigned Roles</span>
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

                    {/* Assigned Evaluators (only if the user is a speaker for this meeting) */}
                    {Array.isArray(meeting.assignedEvaluators) && meeting.assignedEvaluators.length > 0 && (
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-semibold">Assigned Evaluators</span>
                          <Badge bg="light" text="dark">{meeting.assignedEvaluators.length}</Badge>
                        </div>
                        <div className="d-flex flex-wrap gap-1">
                          {meeting.assignedEvaluators.map((label, idx) => (
                            <Badge key={`eval-${idx}`} bg="secondary" className="me-1 mb-1">
                              {label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Assigned Speakers (only if the user is an evaluator for this meeting) */}
                    {Array.isArray(meeting.assignedSpeakers) && meeting.assignedSpeakers.length > 0 && (
                      <div className="mt-2">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-semibold">Assigned Speakers</span>
                          <Badge bg="light" text="dark">{meeting.assignedSpeakers.length}</Badge>
                        </div>
                        <div className="d-flex flex-wrap gap-1">
                          {meeting.assignedSpeakers.map((label, idx) => (
                            <Badge key={`spk-${idx}`} bg="info" className="me-1 mb-1">
                              {label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
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
