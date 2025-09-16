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
      const list = Array.isArray(response) ? response : [];
      setGemData(list);
    } catch (err) {
      console.error('Error fetching gem of month data:', err);
      setError('Failed to load Gem of Month data. Please ensure your Spring Boot backend is running on port 8888.');
    } finally {
      setLoading(false);
    }
  };

  const monthIndexFromString = (raw) => {
    if (!raw || typeof raw !== 'string') return -1;
    const s = raw.trim().toLowerCase();
    const abbr = s.slice(0, 3);
    const map = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    if (map[abbr] !== undefined) return map[abbr];
    const d = Date.parse(`${raw} 1, 2000`);
    if (!Number.isNaN(d)) return new Date(d).getMonth();
    return -1;
  };

  const getMonthString = (gem) => {
    return (
      (gem?.month && String(gem.month)) ||
      (gem?.monthName && String(gem.monthName)) ||
      (gem?.months && String(gem.months)) ||
      (gem?.month_label && String(gem.month_label)) ||
      ''
    );
  };

  const sortByMonthDesc = (a, b) => monthIndexFromString(b?.month) - monthIndexFromString(a?.month);

  const now = new Date();
  const currentMonthIndex = now.getMonth();

  const dataMonthIndexes = (gemData || [])
    .map(g => monthIndexFromString(getMonthString(g)))
    .filter(idx => idx >= 0 && idx < currentMonthIndex);

  const fallbackLastIndex = dataMonthIndexes.length > 0 ? Math.max(...dataMonthIndexes) : currentMonthIndex - 1;
  const effectiveLastIndex = (gemData || []).some(g => monthIndexFromString(getMonthString(g)) === fallbackLastIndex)
    ? fallbackLastIndex
    : fallbackLastIndex;

  const effectiveLastName = new Date(2000, effectiveLastIndex, 1).toLocaleString('default', { month: 'long' });

  // Swap the data: show otherPastMonthsGems in first section and lastMonthGems in second
  const lastMonthGems = (gemData || [])
    .filter(gem => monthIndexFromString(getMonthString(gem)) !== effectiveLastIndex)
    .sort(sortByMonthDesc);

  const otherPastMonthsGems = (gemData || [])
    .filter(gem => monthIndexFromString(getMonthString(gem)) === effectiveLastIndex);

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
            {getMonthString(gem)}
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
            {/* Top Section: Last Month's Gems (now showing otherPastMonthsGems) */}
            <div className="mb-4">
              <div className="d-flex align-items-center mb-4">
                <Award size={24} className="text-warning me-2" />
                <h4 className="mb-0 text-primary">Last Month's Gems ({effectiveLastName})</h4>
              </div>
              {lastMonthGems.length > 0 ? (
                <Row>
                  {lastMonthGems.map((gem, index) => renderGemCard(gem, `last-${index}`))}
                </Row>
              ) : (
                <Card className="border-0 bg-light">
                  <Card.Body className="text-center py-4">
                    <Award size={48} className="text-muted mb-3" />
                    <h6 className="text-muted">No gems awarded for {effectiveLastName}</h6>
                  </Card.Body>
                </Card>
              )}
            </div>

            <hr className="my-4" />

            {/* Bottom Section: Other Past Months (now showing lastMonthGems) */}
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
