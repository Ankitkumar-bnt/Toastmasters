import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Dropdown, Table, Badge, Alert, Spinner } from 'react-bootstrap';
import { Calendar, Clock, Users, BookOpen, Award } from 'lucide-react';
import { getAllUpcomingMeetings } from '../../api/MeetingApi';
import { getAgenda } from '../../api/AgendaJoinApi';
import { getUserById } from '../../api/UserApi';
import toastmastersLogo from '../../assets/img/toastmastersLogo.png';

const AgendaView = () => {
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [agendaData, setAgendaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [meetingsLoading, setMeetingsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userCache, setUserCache] = useState({});

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      setMeetingsLoading(true);
      const response = await getAllUpcomingMeetings();
      setMeetings(response.data.data || []);
    } catch (err) {
      console.error('Error loading meetings:', err);
      setError('Failed to load meetings');
    } finally {
      setMeetingsLoading(false);
    }
  };

  const handleMeetingSelect = async (meeting) => {
    setSelectedMeeting(meeting);
    setLoading(true);
    setError(null);

    try {
      const response = await getAgenda(meeting.meetingId);
      setAgendaData(response.data.data);
    } catch (err) {
      console.error('Error loading agenda:', err);
      if (err.code === 'ERR_NETWORK' || err.message.includes('CORS')) {
        setError('Backend server is not running or CORS is not configured. Please start the backend server.');
      } else {
        setError('Failed to load agenda data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (userId) => {
    if (userCache[userId]) return userCache[userId];

    try {
      const response = await getUserById(userId);
      const userData = response.data.data;
      setUserCache(prev => ({ ...prev, [userId]: userData }));
      return userData;
    } catch (err) {
      console.error(`Error fetching user ${userId}:`, err);
      const fallbackUser = { userName: `User ${userId}`, userEmail: 'N/A' };
      setUserCache(prev => ({ ...prev, [userId]: fallbackUser }));
      return fallbackUser;
    }
  };

  // ================== RENDERERS ==================

  const formatMeetingTitle = (meeting) => {
    if (!meeting) return '';
    const meetingDate = new Date(meeting.meetingDate);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return `${meeting.meetingId}th Chapter Meeting, ${meetingDate.toLocaleDateString('en-US', options)}`;
  };

  const formatMeetingTime = (meeting) => {
    if (!meeting || !meeting.startTime || !meeting.endTime) return '';
    const formatTime = (timeString) => {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    };
    return `${formatTime(meeting.startTime)} to ${formatTime(meeting.endTime)}`;
  };

  const getStaticInfo = (key) => {
    if (!agendaData?.agendaStaticInfo) return '';
    const info = agendaData.agendaStaticInfo.find(item => item.infoKey === key);
    return info ? info.infoValue : '';
  };

  const ClubOfficerItem = ({ officer }) => {
    const [userName, setUserName] = useState("Loading...");

    useEffect(() => {
      const loadUser = async () => {
        const user = await fetchUserData(officer.userId);
        setUserName(user.userName || "N/A");
      };
      loadUser();
    }, [officer.userId]);

    return (
      <div className="mb-2 p-2 border rounded bg-light">
        <div className="d-flex justify-content-between">
          <Badge bg="secondary">{officer.leadershipName}</Badge>
          <span>{userName}</span>
        </div>
      </div>
    );
  };

  const renderClubMembers = () => {
    if (!agendaData?.clubOfficers?.length) {
      return (
        <Card className="mb-4">
          <Card.Header className="bg-info text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <Users className="me-2" size={20} />
              Club Officers
            </h5>
            <button className="btn btn-sm btn-light">Edit</button>
          </Card.Header>
          <Card.Body>
            <p className="text-muted">No club officers data available</p>
          </Card.Body>
        </Card>
      );
    }

    const midpoint = Math.ceil(agendaData.clubOfficers.length / 2);
    const leftColumn = agendaData.clubOfficers.slice(0, midpoint);
    const rightColumn = agendaData.clubOfficers.slice(midpoint);

    return (
      <Card className="mb-4">
        <Card.Header className="bg-info text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <Users className="me-2" size={20} />
            Club Officers
          </h5>
          <button className="btn btn-sm btn-light">Edit</button>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              {leftColumn.map((officer, index) => (
                <ClubOfficerItem key={index} officer={officer} />
              ))}
            </Col>
            <Col md={6}>
              {rightColumn.map((officer, index) => (
                <ClubOfficerItem key={index} officer={officer} />
              ))}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  const AgendaTableRow = ({ item, currentTime }) => {
    const [presenterName, setPresenterName] = useState("Loading...");

    useEffect(() => {
      const loadPresenter = async () => {
        const user = await fetchUserData(item.userId);
        setPresenterName(user.userName || "N/A");
      };
      loadPresenter();
    }, [item.userId]);

    return (
      <tr>
        <td>{currentTime}</td>
        <td>{item.minTime} min</td>
        <td>{item.avgTime} min</td>
        <td>{item.maxTime} min</td>
        <td>{item.activity}</td>
        <td>{presenterName}</td>
      </tr>
    );
  };

  const renderAgendaTable = () => {
    if (!agendaData?.agenda?.length || !selectedMeeting) {
      return (
        <Card className="mb-4">
          <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <Clock className="me-2" size={20} />
              Meeting Agenda
            </h5>
            <button className="btn btn-sm btn-light">Edit</button>
          </Card.Header>
          <Card.Body>
            <p className="text-muted">No agenda items available</p>
          </Card.Body>
        </Card>
      );
    }

    let currentTime = new Date(`${selectedMeeting.meetingDate}T${selectedMeeting.startTime}`);

    const formatTime = (date) => {
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHour = hours % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    return (
      <Card className="mb-4">
        <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <Clock className="me-2" size={20} />
            Meeting Agenda
          </h5>
          <button className="btn btn-sm btn-light">Edit</button>
        </Card.Header>
        <Card.Body>
          <Table responsive bordered hover>
            <thead>
              <tr className='text-center'>
                <th>Time</th>
                <th>Min</th>
                <th>Avg</th>
                <th>Max</th>
                <th>Activity</th>
                <th>Presenter</th>
              </tr>
            </thead>
            <tbody className='text-center'>
              {agendaData.agenda.map((item, index) => {
                const rowTime = formatTime(currentTime);
                currentTime = new Date(currentTime.getTime() + item.maxTime * 60000);
                return <AgendaTableRow key={index} item={item} currentTime={rowTime} />;
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    );
  };

  const GrammarianItem = ({ item }) => (
    <div className="mb-3 p-2 border rounded bg-light">
      <h5 className="text-primary">{item.word}</h5>
      <p><strong>Meaning:</strong> {item.meaning}</p>
      <p><strong>Usage:</strong> <em>{item.example}</em></p>
    </div>
  );

  const renderGrammarianSection = () => {
    const wodItems = agendaData?.grammarian?.filter(
      g => (g.wordType || "").trim().toUpperCase() === "WOD"
    ) || [];

    const podItems = agendaData?.grammarian?.filter(
      g => (g.wordType || "").trim().toUpperCase() === "POD"
    ) || [];

    return (
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header className="bg-warning text-dark d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <BookOpen className="me-2" size={20} />
                Word of the Day (WOD)
              </h5>
              <button className="btn btn-sm btn-light">Edit</button>
            </Card.Header>
            <Card.Body>
              {wodItems.length > 0 ? (
                wodItems.map((gram, index) => (
                  <GrammarianItem key={index} item={gram} />
                ))
              ) : (
                <p className="text-muted">No word of the day available</p>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header className="bg-info text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <BookOpen className="me-2" size={20} />
                Phrase of the Day (POD)
              </h5>
              <button className="btn btn-sm btn-light">Edit</button>
            </Card.Header>
            <Card.Body>
              {podItems.length > 0 ? (
                podItems.map((gram, index) => (
                  <GrammarianItem key={index} item={gram} />
                ))
              ) : (
                <p className="text-muted">No phrase of the day available</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };

  const renderAbbreviations = () => {
    if (!agendaData?.abbreviations?.length) {
      return (
        <Row>
          <Col md={12}>
            <Card className="mb-4">
              <Card.Header className="bg-secondary text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Abbreviations</h5>
                <button className="btn btn-sm btn-light">Edit</button>
              </Card.Header>
              <Card.Body>
                <p className="text-muted">No abbreviations available</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      );
    }

    const midpoint = Math.ceil(agendaData.abbreviations.length / 2);
    const leftColumn = agendaData.abbreviations.slice(0, midpoint);
    const rightColumn = agendaData.abbreviations.slice(midpoint);

    return (
      <Row>
        <Col md={12}>
          <Card className="mb-4">
            <Card.Header className="bg-secondary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Abbreviations</h5>
              <button className="btn btn-sm btn-light">Edit</button>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  {leftColumn.map((abbr, index) => (
                    <div key={index} className="mb-2 p-2 border rounded bg-light">
                      <div className="d-flex justify-content-between">
                        <strong>{abbr.abbreviation}</strong>
                        <span>{abbr.meaning}</span>
                      </div>
                    </div>
                  ))}
                </Col>
                <Col md={6}>
                  {rightColumn.map((abbr, index) => (
                    <div key={index} className="mb-2 p-2 border rounded bg-light">
                      <div className="d-flex justify-content-between">
                        <strong>{abbr.abbreviation}</strong>
                        <span>{abbr.meaning}</span>
                      </div>
                    </div>
                  ))}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };

  const renderClubInfo = () => (
    <Card className="mb-4">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <Award className="me-2" size={20} />
          Club Information
        </h5>
        <button className="btn btn-sm btn-light">Edit</button>
      </Card.Header>
      <Card.Body className="text-center">

        <h4 className="mb-2">{getStaticInfo('Club Name') || 'Toastmasters Club'}</h4>
        <p className="text-muted mb-3">
          <strong>Club # {getStaticInfo('Club Id') || 'N/A'}</strong> |{" "}
          <strong>{getStaticInfo('Area') || 'N/A'}</strong> |{" "}
          <strong>{getStaticInfo('District') || 'N/A'}</strong>
        </p>
        <img src={toastmastersLogo} alt="My Photo" width="200" />

        <h6 className="mb-3">
          <strong>Theme:</strong> {selectedMeeting?.meetingTheme || 'N/A'}
        </h6>

        <h5 className="mb-2">{formatMeetingTitle(selectedMeeting)}</h5>

        <p className="text-muted mb-1">
          Inperson Meeting
        </p>

        <p className="text-muted mb-3">
          Time: {formatMeetingTime(selectedMeeting)}
        </p>

        <div className="mt-4 me-5 ms-5 pt-2 px-5 text-justify border border-2 rounded">
          <p>
            <strong>Club Mission:</strong>{" "}
            {getStaticInfo('Club Mission') ||
              'We provide a supportive and positive learning experience in which members are empowered to develop communication and leadership skills, resulting in greater self-confidence and personal growth.'}
          </p>
        </div>
      </Card.Body>

    </Card>
  );

  return (
    <Container fluid>
      <div className="mb-4">
        <h2>Meeting Agenda</h2>
        <p className="text-muted">Select a meeting to view its agenda and details</p>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6}>
              <label className="form-label fw-bold">Select Meeting:</label>
              <Dropdown>
                <Dropdown.Toggle variant="outline-primary" className="w-400 text-start">
                  {selectedMeeting
                    ? `${selectedMeeting.meetingTheme} - ${new Date(selectedMeeting.meetingDate).toLocaleDateString()}`
                    : 'Choose a meeting...'}
                </Dropdown.Toggle>
                <Dropdown.Menu className="w-100" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {meetingsLoading ? (
                    <Dropdown.Item disabled>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Loading meetings...
                    </Dropdown.Item>
                  ) : meetings.length === 0 ? (
                    <Dropdown.Item disabled>No upcoming meetings found</Dropdown.Item>
                  ) : (
                    meetings.map((meeting) => (
                      <Dropdown.Item
                        key={meeting.meetingId}
                        onClick={() => handleMeetingSelect(meeting)}
                      >
                        <div>
                          <strong>{meeting.meetingTheme}</strong>
                          <br />
                          <small className="text-muted">
                            {new Date(meeting.meetingDate).toLocaleDateString()} - {meeting.meetingLocation}
                          </small>
                        </div>
                      </Dropdown.Item>
                    ))
                  )}
                </Dropdown.Menu>
              </Dropdown>
            </Col>
            <Col md={6}>
              {loading && (
                <div className="text-center">
                  <Spinner animation="border" className="me-2" />
                  Loading agenda data...
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {selectedMeeting && agendaData && !loading && (
        <>
          {renderClubInfo()}
          {renderClubMembers()}
          {renderAgendaTable()}
          {renderGrammarianSection()}
          {renderAbbreviations()}
        </>
      )}

      {selectedMeeting && !agendaData && !loading && !error && (
        <Alert variant="info">
          Please select speaker and grammarian to load agenda data.
        </Alert>
      )}
    </Container>
  );
};

export default AgendaView;
