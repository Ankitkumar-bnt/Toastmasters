import React, { useState, useEffect } from 'react';
import { Modal, Button, Card, Row, Col, Badge, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { Award, Calendar, CheckCircle2 } from 'lucide-react';
import { getAllGemOfMonth, gemsOfTheLastMonth, selectGemOfMonth } from '../../api/MeetingAwardsApi';

const GemOfMonthModal = ({ show, onHide }) => {
  const [gemData, setGemData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectOpen, setSelectOpen] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [candidatesError, setCandidatesError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (show) {
      fetchGemData();
    }
  }, [show]);

  const fetchGemData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllGemOfMonth();
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
    if (raw == null) return -1;
    const s = String(raw).trim().toLowerCase();
    if (!s) return -1;

    // Try to extract alphabetic month token first (handles e.g., "Sep", "September 2025", "Sep-25")
    const alphaMatch = s.match(/[a-zA-Z]+/);
    const map = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    if (alphaMatch) {
      const abbr = alphaMatch[0].slice(0, 3).toLowerCase();
      if (map[abbr] !== undefined) return map[abbr];
    }

    // Handle ISO-like formats: YYYY-MM or YYYY/MM or YYYY-MM-DD
    const isoMatch = s.match(/^(\d{4})[-/](\d{1,2})(?:[-/](\d{1,2}))?/);
    if (isoMatch) {
      const m = parseInt(isoMatch[2], 10);
      if (m >= 1 && m <= 12) return m - 1;
    }

    // If numeric month provided, support both 0-based (0-11) and 1-based (1-12)
    const numMatch = s.match(/^\d{1,2}$/);
    if (numMatch) {
      const n = parseInt(numMatch[0], 10);
      if (n >= 0 && n <= 11) return n;      // treat as 0-based
      if (n >= 1 && n <= 12) return n - 1;  // treat as 1-based
    }

    // Fallback: try Date.parse on sensible formats
    const d1 = Date.parse(`${s} 1, 2000`);
    if (!Number.isNaN(d1)) return new Date(d1).getMonth();
    const d2 = Date.parse(`1 ${s} 2000`);
    if (!Number.isNaN(d2)) return new Date(d2).getMonth();

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

  const yearFromString = (raw) => {
    if (raw == null) return NaN;
    const s = String(raw).trim().toLowerCase();
    // Match YYYY optionally followed by -MM or /MM etc.
    const isoMatch = s.match(/^(\d{4})(?:[-/](\d{1,2})(?:[-/](\d{1,2}))?)?/);
    if (isoMatch) {
      return parseInt(isoMatch[1], 10);
    }
    // Fallback: try Date.parse
    const d = Date.parse(s);
    if (!Number.isNaN(d)) return new Date(d).getFullYear();
    return NaN;
  };

  const sortByMonthDesc = (a, b) =>
    monthIndexFromString(getMonthString(b)) - monthIndexFromString(getMonthString(a));

  const now = new Date();
  const currentMonthIndex = now.getMonth();
  // Always use the immediate previous calendar month as "last month"
  const effectiveLastIndex = (currentMonthIndex + 11) % 12;
  const lastMonthDate = new Date(now.getFullYear(), currentMonthIndex - 1, 1);
  const lastMonthLocalDate = new Date(Date.UTC(lastMonthDate.getFullYear(), lastMonthDate.getMonth(), 1))
    .toISOString()
    .slice(0, 10); // yyyy-MM-dd

  const effectiveLastYear = lastMonthDate.getFullYear();
  const effectiveLastName = new Date(2000, effectiveLastIndex, 1).toLocaleString('default', { month: 'long' });

  // Partition data: last month's gems on top, older months below (most recent first)
  const lastMonthGems = (gemData || [])
    .filter(gem => (
      monthIndexFromString(getMonthString(gem)) === effectiveLastIndex &&
      yearFromString(getMonthString(gem)) === effectiveLastYear
    ));

  const otherPastMonthsGems = (gemData || [])
    .filter(gem => !(
      monthIndexFromString(getMonthString(gem)) === effectiveLastIndex &&
      yearFromString(getMonthString(gem)) === effectiveLastYear
    ))
    .sort(sortByMonthDesc);

  const openSelectGem = async () => {
    try {
      setCandidatesError(null);
      setCandidatesLoading(true);
      setSelectedCandidate(null);
      const list = await gemsOfTheLastMonth();
      const arr = Array.isArray(list) ? list : [];
      // Admin view: remove zero-count members and sort by dayCount DESCENDING
      const processed = arr
        .filter(item => Number(item.dayCount ?? 0) > 0)
        .sort((a, b) => Number(b.dayCount ?? 0) - Number(a.dayCount ?? 0));
      console.debug('Gem candidates count:', processed.length, processed);
      setCandidates(processed);
      setSelectOpen(true);
    } catch (e) {
      console.error('Error loading last month members:', e);
      setCandidatesError('Failed to load last month members.');
    } finally {
      setCandidatesLoading(false);
    }
  };

  const handleConfirmSelect = async () => {
    if (!selectedCandidate) return;
    const payload = {
      month: lastMonthLocalDate,
      userId: selectedCandidate.userId,
      userName: selectedCandidate.userName,
      dayCount: selectedCandidate.dayCount ?? 0,
    };
    try {
      setSaving(true);
      await selectGemOfMonth(payload);
      setSelectOpen(false);
      await fetchGemData();
    } catch (e) {
      console.error('Error saving gem of month:', e);
      setCandidatesError('Failed to save selection.');
    } finally {
      setSaving(false);
    }
  };

  const renderGemCard = (gem, index) => (
    <Col md={6} lg={4} key={index} className="mb-3">
      <Card className="h-100 shadow-sm border-0">
        <Card.Body className="text-center">
          <Award size={40} className="text-warning mb-3" />
          <h6 className="fw-bold">{gem.userName || 'Unknown User'}</h6>
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
        <Modal.Title className="w-100 text-center">
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
            <div className="mb-4 text-center">
              <div className="d-flex flex-column align-items-center mb-4">
                <Award size={24} className="text-warning mb-2" />
                <h4 className="mb-0 text-primary">Last Month's Gems ({effectiveLastName})</h4>
              </div>
              {lastMonthGems.length > 0 ? (
                <Row className="justify-content-center">
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

            {/* Bottom Section: Other Past Months */}
            <div className="text-center">
              <div className="d-flex flex-column align-items-center mb-4">
                <Calendar size={24} className="text-info mb-2" />
                <h4 className="mb-0 text-secondary">Other Past Months</h4>
              </div>
              {otherPastMonthsGems.length > 0 ? (
                <Row className="justify-content-center">
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
        <Button variant="success" onClick={openSelectGem} disabled={candidatesLoading}>
          <CheckCircle2 size={16} className="me-2" /> Select Gem of Last Month
        </Button>
      </Modal.Footer>

      {/* Select Gem of Last Month Modal */}
      <Modal show={selectOpen} onHide={() => setSelectOpen(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="w-100 text-center">Select Gem of Last Month ({effectiveLastName})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {candidatesLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p className="mt-2">Loading members...</p>
            </div>
          ) : candidatesError ? (
            <Alert variant="danger" className="text-center">{candidatesError}</Alert>
          ) : candidates.length === 0 ? (
            <Alert variant="info" className="text-center">No eligible members found for {effectiveLastName}.</Alert>
          ) : (
            <ListGroup style={{ maxHeight: '50vh', overflowY: 'auto' }}>
              {candidates.map((c, idx) => {
                const id = c.userId;
                const name = c.userName;
                const activeDays = Number(c.dayCount ?? 0);
                const isSelected = selectedCandidate && selectedCandidate.userId === id;
                return (
                  <ListGroup.Item
                    key={`${id ?? 'na'}-${idx}`}
                    action
                    active={!!isSelected}
                    onClick={() => setSelectedCandidate(c)}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div className="fw-semibold">{name}</div>
                    <Badge bg="secondary">{activeDays} days</Badge>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="success" onClick={handleConfirmSelect} disabled={!selectedCandidate || saving}>
            {saving ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" /> Saving...
              </>
            ) : (
              'Confirm Selection'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Modal>
  );
};

export default GemOfMonthModal;
