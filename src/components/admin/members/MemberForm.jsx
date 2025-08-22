import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';

const MemberForm = ({
  show,
  onHide,
  onSubmit,
  editingUser,
  title
}) => {
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userContact: '',
    userPassword: '',
    address: '',
    gender: '',
    dob: '',
    hobbies: '',
    mentorId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingUser) {
      setFormData({
        userId: editingUser.userId,
        userName: editingUser.userName,
        userEmail: editingUser.userEmail,
        userContact: editingUser.userContact,
        userPassword: editingUser.userPassword,
        address: editingUser.address,
        gender: editingUser.gender,
        dob: editingUser.dob,
        hobbies: editingUser.hobbies,
        mentorId: editingUser.mentorId
      });
    } else {
      setFormData({
        userName: '',
        userEmail: '',
        userContact: '',
        userPassword: '',
        address: '',
        gender: '',
        dob: '',
        hobbies: '',
        mentorId: ''
      });
    }
    setError('');
  }, [editingUser, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit(formData);
      onHide();
    } catch (err) {
      setError('Failed to save member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.userName}
                  onChange={(e) => handleChange('userName', e.target.value)}
                  required
                  placeholder="Enter full name"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email Address *</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.userEmail}
                  onChange={(e) => handleChange('userEmail', e.target.value)}
                  required
                  placeholder="Enter email address"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Contact Number *</Form.Label>
                <Form.Control
                  type="tel"
                  value={formData.userContact}
                  onChange={(e) => handleChange('userContact', e.target.value)}
                  required
                  placeholder="Enter contact number"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Password *</Form.Label>
                <Form.Control
                  type="password"
                  value={formData.userPassword}
                  onChange={(e) => handleChange('userPassword', e.target.value)}
                  required
                  placeholder="Enter password"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Address *</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              required
              placeholder="Enter full address"
            />
          </Form.Group>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Gender *</Form.Label>
                <Form.Select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Date of Birth *</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleChange('dob', e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Mentor ID</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.mentorId}
                  onChange={(e) => handleChange('mentorId', e.target.value)}
                  placeholder="Enter mentor ID"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Hobbies</Form.Label>
            <Form.Control
              type="text"
              value={formData.hobbies}
              onChange={(e) => handleChange('hobbies', e.target.value)}
              placeholder="Enter hobbies (comma separated)"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : editingUser ? 'Update Member' : 'Add Member'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MemberForm; 