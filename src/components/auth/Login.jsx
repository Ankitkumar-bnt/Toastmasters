import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { login } from '../../api/AuthApi';

function Login({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await login(email, password);
      const { statusCode, message, data } = res.data || {};
      if ((res?.status === 200) && statusCode === 200 && data) {
        try {
          localStorage.setItem('tm_current_user', JSON.stringify(data));
        } catch (_) {}
        Swal.fire({ icon: 'success', title: 'Logged in', text: message || 'Login successful', timer: 1500, showConfirmButton: false });
        onSuccess?.(data);
      } else {
        const errMsg = message || 'Invalid credentials';
        setError(errMsg);
        Swal.fire({ icon: 'error', title: 'Login failed', text: errMsg });
      }
    } catch (err) {
      const apiMessage = err?.response?.data?.message;
      const errMsg = apiMessage || 'Login failed';
      setError(errMsg);
      Swal.fire({ icon: 'error', title: 'Login failed', text: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                <h3 className="mb-3 text-center">Sign in</h3>
                {error ? <Alert variant="danger">{error}</Alert> : null}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" required />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required />
                  </Form.Group>
                  <div className="d-grid">
                    <Button type="submit" variant="primary" disabled={submitting}>
                      {submitting ? 'Signing in...' : 'Login'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;


