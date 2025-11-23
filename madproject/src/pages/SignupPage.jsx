import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import './AuthPages.css';

function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const success = await signup(formData.email, formData.password, formData.name);
      if (success) {
        navigate('/');
      } else {
        setError('Signup failed. Please try again.');
      }
    } catch (error) {
      setError(error.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <Container className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Create account</h1>
            <p className="auth-subtitle muted-text">Sign up to get started</p>
          </div>

          <Form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <Form.Group className="mb-3">
              <Form.Label className="auth-label">Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                className="auth-input"
                required
                autoComplete="name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="auth-label">Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="auth-input"
                required
                autoComplete="email"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="auth-label">Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                className="auth-input"
                required
                autoComplete="new-password"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="auth-label">Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="auth-input"
                required
                autoComplete="new-password"
              />
            </Form.Group>

            <Button
              type="submit"
              className="btn-primary-custom auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </Button>
          </Form>

          <div className="auth-footer">
            <p className="muted-text">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Login
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default SignupPage;
