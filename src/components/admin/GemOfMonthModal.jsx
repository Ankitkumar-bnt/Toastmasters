import React, { useState, useEffect } from 'react';
import { Modal, Button, Card, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import { Award, Calendar, User } from 'lucide-react';
import { getGemOfMonth } from '../../api/MeetingAwardsApi';

const GemOfMonthModal = ({ show, onHide }) => {
  const [gemData, setGemData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show) {
      fetchGemData();
    }
  }, [show]);

  const fetchGemData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getGemOfMonth();
      
      // Get current date for filtering
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); // 0-based (0 = January, 8 = September)
      
      // Filter out current and future months, keep only past months
      const pastMonthsData = response.data.filter(gem => {
        const gemDate = new Date(Date.parse(gem.month + " 1, " + currentYear));
        return gemDate.getMonth() < currentMonth;
      });
      
      // Sort past months data in descending order (most recent first)
      const sortedData = pastMonthsData.sort((a, b) => {
        const monthA = new Date(Date.parse(a.month + " 1, " + currentYear));
        const monthB = new Date(Date.parse(b.month + " 1, " + currentYear));
        return monthB - monthA;
      });
      
      setGemData(sortedData);
    } catch (err) {
      console.error('Error fetching gem of month data:', err);
      
      setError('Failed to load Gem of Month data. Please ensure your Spring Boot backend is running on port 8888.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMonth = () => {
    const now = new Date();
    return now.toLocaleString('default', { month: 'long' });
  };

  const getLastMonth = () => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return lastMonth.toLocaleString('default', { month: 'long' });
  };

  const lastMonthName = getLastMonth();

  // Since gemData is already filtered to contain only past months,
  // we just need to separate last month from other past months
  const lastMonthGems = gemData.filter(gem => gem.month === lastMonthName);
  const otherPastMonthsGems = gemData.filter(gem => gem.month !== lastMonthName);

  const renderGemCard = (gem, index) => (
    <Col md={6} lg={4} key={index} className="mb-3">
      <Card className="h-100 shadow-sm border-0">
        <Card.Body className="text-center">
          <Award size={40} className="text-warning mb-3" />
          <h6 className="fw-bold">{gem.user?.userName || 'Unknown User'}</h6>
          <p className="text-muted mb-2">
            <User size={16} className="me-1" />
            {gem.user?.userEmail || 'No email'}
          </p>
          <Badge bg="primary" className="mb-2">
            <Calendar size={14} className="me-1" />
            {gem.month}
          </Badge>
          <div className="mt-2">
            <small className="text-success fw-bold">
              {gem.dayCount} days active
            </small>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <Award size={24} className="me-2" />
          Gem of the Month Awards
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading Gem of Month data...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center">
            <Alert.Heading>Error</Alert.Heading>
            {error}
            <div className="mt-3">
              <Button variant="outline-danger" onClick={fetchGemData}>
                Try Again
              </Button>
            </div>
          </Alert>
        ) : (
          <>
            {/* Last Month's Gems Section */}
            <div className="mb-5">
              <div className="d-flex align-items-center mb-4">
                <Award size={24} className="text-warning me-2" />
                <h4 className="mb-0 text-primary">Last Month's Gems ({lastMonthName})</h4>
              </div>
              {lastMonthGems.length > 0 ? (
                <Row>
                  {lastMonthGems.map((gem, index) => renderGemCard(gem, `last-${index}`))}
                </Row>
              ) : (
                <Card className="border-0 bg-light">
                  <Card.Body className="text-center py-4">
                    <Award size={48} className="text-muted mb-3" />
                    <h6 className="text-muted">No gems awarded for {lastMonthName}</h6>
                  </Card.Body>
                </Card>
              )}
            </div>

            {/* Other Past Months Section */}
            <div>
              <div className="d-flex align-items-center mb-4">
                <Calendar size={24} className="text-info me-2" />
                <h4 className="mb-0 text-secondary">Other Past Months</h4>
              </div>
              {otherPastMonthsGems.length > 0 ? (
                <Row>
                  {otherPastMonthsGems.map((gem, index) => renderGemCard(gem, `other-${index}`))}
                </Row>
              ) : (
                <Card className="border-0 bg-light">
                  <Card.Body className="text-center py-4">
                    <Calendar size={48} className="text-muted mb-3" />
                    <h6 className="text-muted">No other past month gems to display</h6>
                  </Card.Body>
                </Card>
              )}
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={fetchGemData} disabled={loading}>
          Refresh Data
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GemOfMonthModal;
