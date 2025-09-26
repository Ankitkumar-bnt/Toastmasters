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
  const [validationErrors, setValidationErrors] = useState({});

  // Validation functions
  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!name.trim()) {
      return 'Name is required';
    }
    if (!nameRegex.test(name)) {
      return 'Name should contain only letters and spaces';
    }
    return '';
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validateContact = (contact) => {
    const contactRegex = /^\d{10}$/;
    if (!contact.trim()) {
      return 'Contact number is required';
    }
    if (!contactRegex.test(contact)) {
      return 'Contact number should be exactly 10 digits';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password should be at least 6 characters long';
    }
    if (password.length > 15) {
      return 'Password should be less than 15 characters long';
    }
    return '';
  };

  const validateField = (field, value) => {
    let error = '';
    switch (field) {
      case 'userName':
        error = validateName(value);
        break;
      case 'userEmail':
        error = validateEmail(value);
        break;
      case 'userContact':
        error = validateContact(value);
        break;
      case 'userPassword':
        error = validatePassword(value);
        break;
      default:
        break;
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
    
    return error === '';
  };

  const validateForm = () => {
    const errors = {};
    errors.userName = validateName(formData.userName);
    errors.userEmail = validateEmail(formData.userEmail);
    errors.userContact = validateContact(formData.userContact);
    errors.userPassword = validatePassword(formData.userPassword);
    
    setValidationErrors(errors);
    
    return Object.values(errors).every(error => error === '');
  };

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
    setValidationErrors({});
  }, [editingUser, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form before submission
    if (!validateForm()) {
      setLoading(false);
      setError('Please fix the validation errors before submitting.');
      return;
    }

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
    // For contact field, only allow numbers
    if (field === 'userContact') {
      value = value.replace(/\D/g, '');
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation for key fields
    if (['userName', 'userEmail', 'userContact', 'userPassword'].includes(field)) {
      validateField(field, value);
    }
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
                  isInvalid={!!validationErrors.userName}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.userName}
                </Form.Control.Feedback>
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
                  isInvalid={!!validationErrors.userEmail}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.userEmail}
                </Form.Control.Feedback>
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
                  placeholder="Enter 10-digit contact number"
                  maxLength={10}
                  isInvalid={!!validationErrors.userContact}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.userContact}
                </Form.Control.Feedback>
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
                  placeholder="Enter password (6-15 characters)"
                  isInvalid={!!validationErrors.userPassword}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.userPassword}
                </Form.Control.Feedback>
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