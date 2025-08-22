import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';

const MeetingForm = ({ show, onHide, onSubmit, editingMeeting, title }) => {
  const [formData, setFormData] = useState({
    meetingDate: '',
    startTime: '',
    endTime: '',
    meetingTheme: '',
    meetingLocation: '',
    category: 'Regular'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingMeeting) {
      setFormData({
        meetingDate: editingMeeting.meetingDate ? editingMeeting.meetingDate.split('T')[0] : '',
        startTime: editingMeeting.startTime || '',
        endTime: editingMeeting.endTime || '',
        meetingTheme: editingMeeting.meetingTheme || '',
        meetingLocation: editingMeeting.meetingLocation || '',
        category: editingMeeting.category || 'Regular'
      });
    } else {
      setFormData({
        meetingDate: '',
        startTime: '',
        endTime: '',
        meetingTheme: '',
        meetingLocation: '',
        category: 'Regular'
      });
    }
  }, [editingMeeting, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.meetingDate || !formData.startTime || !formData.endTime || 
        !formData.meetingTheme || !formData.meetingLocation) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all required fields.',
      });
      return;
    }

    if (formData.startTime >= formData.endTime) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Time',
        text: 'End time must be after start time.',
      });
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      onHide();
    } catch (err) {
      console.error('Error submitting meeting:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to save meeting. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Meeting Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="meetingDate"
                  value={formData.meetingDate}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Meeting Location *</Form.Label>
                <Form.Control
                  type="text"
                  name="meetingLocation"
                  value={formData.meetingLocation}
                  onChange={handleChange}
                  placeholder="Enter meeting location"
                  maxLength={100}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Start Time *</Form.Label>
                <Form.Control
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>End Time *</Form.Label>
                <Form.Control
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Meeting Type *</Form.Label>
                {editingMeeting && editingMeeting.__viewOnly ? (
                  <Form.Control
                    type="text"
                    name="category"
                    value={formData.category}
                    readOnly
                    className="bg-light"
                  />
                ) : (
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="Regular">Regular</option>
                    <option value="Special">Special</option>
                    <option value="Contest">Contest</option>
                  </Form.Select>
                )}
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Meeting Theme *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="meetingTheme"
              value={formData.meetingTheme}
              onChange={handleChange}
              placeholder="Enter meeting theme or agenda"
              maxLength={350}
              required
            />
            <Form.Text className="text-muted">
              Maximum 350 characters
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : (editingMeeting ? 'Update Meeting' : 'Add Meeting')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MeetingForm; 