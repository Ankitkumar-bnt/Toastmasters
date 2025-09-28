import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';

const GuestForm = ({ show, onHide, onSubmit, title = 'Add Guest', editingGuest }) => {
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userContact: '',
    gender: '',
    dob: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Validators (same rules as MemberForm for consistency)
  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!name.trim()) return 'Name is required';
    if (!nameRegex.test(name)) return 'Name should contain only letters and spaces';
    return '';
  };
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };
  const validateContact = (contact) => {
    const contactRegex = /^\d{10}$/;
    if (!contact.trim()) return 'Contact number is required';
    if (!contactRegex.test(contact)) return 'Contact number should be exactly 10 digits';
    return '';
  };

  const validateForm = () => {
    const errors = {};
    errors.userName = validateName(formData.userName);
    errors.userEmail = validateEmail(formData.userEmail);
    errors.userContact = validateContact(formData.userContact);
    errors.gender = !formData.gender ? 'Gender is required' : '';
    errors.dob = !formData.dob ? 'Date of Birth is required' : '';
    setValidationErrors(errors);
    return Object.values(errors).every((e) => e === '');
  };

  const handleChange = (field, value) => {
    if (field === 'userContact') value = value.replace(/\D/g, '');
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Prefill when editing
  useEffect(() => {
    if (show) {
      if (editingGuest) {
        const dob = editingGuest.dob ? String(editingGuest.dob).slice(0, 10) : '';
        setFormData({
          userName: editingGuest.userName || '',
          userEmail: editingGuest.userEmail || '',
          userContact: editingGuest.userContact || '',
          gender: editingGuest.gender || '',
          dob: dob || ''
        });
      } else {
        setFormData({ userName: '', userEmail: '', userContact: '', gender: '', dob: '' });
      }
      setError('');
      setValidationErrors({});
    }
  }, [show, editingGuest]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!validateForm()) {
      setLoading(false);
      setError('Please fix the validation errors before submitting.');
      return;
    }
    try {
      // Build payload exactly as backend expects
      const payload = {
        userName: formData.userName,
        userEmail: formData.userEmail,
        userContact: formData.userContact,
        userPassword: null,
        joinDate: null,
        active: 'false',
        address: null,
        gender: formData.gender,
        dob: formData.dob,
        userType: 'guest',
        deleteStatus: 1,
        hobbies: null,
        mentorId: null
      };
      await onSubmit(payload);
      onHide();
    } catch (err) {
      setError('Failed to save guest. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.userName}
                  onChange={(e) => handleChange('userName', e.target.value)}
                  isInvalid={!!validationErrors.userName}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.userName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.userEmail}
                  onChange={(e) => handleChange('userEmail', e.target.value)}
                  isInvalid={!!validationErrors.userEmail}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.userEmail}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Contact Number *</Form.Label>
                <Form.Control
                  type="tel"
                  value={formData.userContact}
                  onChange={(e) => handleChange('userContact', e.target.value)}
                  maxLength={10}
                  isInvalid={!!validationErrors.userContact}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.userContact}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
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
            <Col md={6}>
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
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : (editingGuest ? 'Update Guest' : 'Add Guest')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default GuestForm;
