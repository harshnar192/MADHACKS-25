import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Container, Nav, Navbar, NavDropdown, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import './TopNavMenu.css';

function TopNavMenu() {
  const { isAuthenticated, user, isGuest, logout, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const mainNavItems = [
    { path: '/', label: 'Insights', icon: '📊' },
    { path: '/check-in', label: 'Check-in', icon: '✍️' },
    { path: '/summary', label: 'Summary', icon: '📋' },
    { path: '/voice', label: 'Voice', icon: '🎤' },
    { path: '/goals', label: 'Goals', icon: '🎯' },
  ];

  const settingsItems = [
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: '👤',
      iconColor: '#8ab4f8',
      href: '#profile'
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: '🔔',
      iconColor: '#fdd663',
      href: '#notifications'
    },
    { 
      id: 'preferences', 
      label: 'Preferences', 
      icon: '🎨',
      iconColor: '#aecbfa',
      href: '#preferences'
    },
    { 
      id: 'help', 
      label: 'Help & Support', 
      icon: '❓',
      iconColor: '#f28b82',
      href: '#help'
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    setExpanded(false);
  };

  const handleBrandClick = () => {
    navigate('/about');
    setExpanded(false);
  };

  const handleContinueAsGuest = () => {
    continueAsGuest();
    navigate('/');
    setExpanded(false);
  };

  return (
    <>
      <Navbar 
        expand="lg" 
        className="top-nav-menu"
        expanded={expanded}
        onToggle={setExpanded}
      >
        <Container fluid className="nav-container">
          <NavLink
            to="/about"
            className="app-brand"
            onClick={() => setExpanded(false)}
          >
            <span className="brand-icon">💎</span>
            Clarity
          </NavLink>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" className="navbar-toggle-custom" />
          
          <Navbar.Collapse id="basic-navbar-nav">
            {isAuthenticated ? (
              <>
                {/* Authenticated Navigation */}
                <Nav className="me-auto main-nav">
                  {mainNavItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `nav-link-custom ${isActive ? 'active' : ''}`
                      }
                      onClick={() => setExpanded(false)}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                    </NavLink>
                  ))}
                </Nav>
                
                <Nav className="nav-actions">
                  {/* User Info */}
                  <div className="user-info">
                    <span className="user-name">{user?.name || 'User'}</span>
                  </div>
                  
                  {/* Settings Dropdown */}
                  <NavDropdown 
                    title={
                      <span className="settings-toggle">
                        <span className="settings-icon">⚙️</span>
                        <span className="settings-label">Settings</span>
                        <span className="dropdown-arrow">▼</span>
                      </span>
                    } 
                    id="settings-dropdown"
                    className="nav-dropdown-custom"
                    align="end"
                  >
                    <NavDropdown.Item 
                      href={settingsItems[0].href}
                      className="settings-dropdown-item"
                    >
                      <span 
                        className="dropdown-item-icon"
                        style={{ color: settingsItems[0].iconColor }}
                      >
                        {settingsItems[0].icon}
                      </span>
                      <span className="dropdown-item-label">{settingsItems[0].label}</span>
                    </NavDropdown.Item>
                    <NavDropdown.Item 
                      href={settingsItems[1].href}
                      className="settings-dropdown-item"
                    >
                      <span 
                        className="dropdown-item-icon"
                        style={{ color: settingsItems[1].iconColor }}
                      >
                        {settingsItems[1].icon}
                      </span>
                      <span className="dropdown-item-label">{settingsItems[1].label}</span>
                    </NavDropdown.Item>
                    <NavDropdown.Item 
                      href={settingsItems[2].href}
                      className="settings-dropdown-item"
                    >
                      <span 
                        className="dropdown-item-icon"
                        style={{ color: settingsItems[2].iconColor }}
                      >
                        {settingsItems[2].icon}
                      </span>
                      <span className="dropdown-item-label">{settingsItems[2].label}</span>
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item 
                      href={settingsItems[3].href}
                      className="settings-dropdown-item"
                    >
                      <span 
                        className="dropdown-item-icon"
                        style={{ color: settingsItems[3].iconColor }}
                      >
                        {settingsItems[3].icon}
                      </span>
                      <span className="dropdown-item-label">{settingsItems[3].label}</span>
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item 
                      onClick={handleLogout}
                      className="settings-dropdown-item logout-item"
                    >
                      <span className="dropdown-item-icon" style={{ color: '#f28b82' }}>
                        🚪
                      </span>
                      <span className="dropdown-item-label">Logout</span>
                    </NavDropdown.Item>
                  </NavDropdown>
                </Nav>
              </>
            ) : (
              <>
                {/* Unauthenticated Navigation */}
                <Nav className="ms-auto nav-actions">
                  <NavLink 
                    to="/login"
                    className="nav-link-custom auth-nav-link"
                    onClick={() => setExpanded(false)}
                  >
                    <span className="nav-label">Login</span>
                  </NavLink>
                  <NavLink 
                    to="/signup"
                    className="nav-link-custom auth-nav-link"
                    onClick={() => setExpanded(false)}
                  >
                    <span className="nav-label">Sign up</span>
                  </NavLink>
                  <Button 
                    className="btn-secondary-custom auth-nav-button"
                    onClick={handleContinueAsGuest}
                  >
                    Continue as guest
                  </Button>
                </Nav>
              </>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>

    </>
  );
}

export default TopNavMenu;
