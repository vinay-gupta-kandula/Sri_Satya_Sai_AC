'use client';

import { useState, useEffect, useRef } from 'react';

export default function AdminDashboard() {
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('services'); // 'services' | 'bookings' | 'settings'
  const [sectionFilter, setSectionFilter] = useState('all'); // 'all' | 'ac' | 'refrigeration'
  const [theme, setTheme] = useState('light');

  // Sync theme with document attribute and localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme') || document.documentElement.getAttribute('data-theme') || 'light';
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('theme', nextTheme);
    } catch {
      // Ignore localStorage errors
    }
  };
  
  // Data states
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modal states for adding/editing services
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    section: 'ac',
    description: '',
    badge: 'Popular Service',
    image: '/images/ac-jet-wash.jpg',
    features: ['Doorstep technician visit', 'Accurate fault diagnosis', 'Genuine spare parts'],
    price: ''
  });
  const [featuresInput, setFeaturesInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  
  // Feedback notification
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };
  const setToastMessage = (msg) => setToast(msg);

  // Check stored auth & load settings
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSettings(data.data);
      })
      .catch((err) => console.error('Error loading settings:', err));

    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch data
  const refreshData = async () => {
    setLoading(true);
    try {
      const [svcRes, bookRes, setRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/bookings'),
        fetch('/api/settings')
      ]);
      const [svcData, bookData, setData] = await Promise.all([
        svcRes.json(),
        bookRes.json(),
        setRes.json()
      ]);
      
      if (svcData.success) setServices(svcData.data);
      if (bookData.success) setBookings(bookData.data);
      if (setData.success) setSettings(setData.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  // Handle Login Password
  const handleLogin = (e) => {
    e.preventDefault();
    const correctPassword = (settings && settings.adminPin) ? settings.adminPin : 'K4242vinay@';
    if (pin.trim() === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      showToast('Welcome back, Admin!');
    } else {
      showToast('Incorrect password. Access denied.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    setPin('');
  };

  // Open modal for Adding new service
  const openAddServiceModal = () => {
    setEditingServiceId(null);
    setServiceForm({
      name: '',
      section: 'ac',
      description: 'Quick on-site diagnosis and repair by certified technician.',
      badge: 'Certified Service',
      image: '/images/ac-jet-wash.jpg',
      features: ['Doorstep technician visit', 'Accurate fault diagnosis', 'Genuine spare parts'],
      price: ''
    });
    setFeaturesInput("Doorstep technician visit\nAccurate fault diagnosis\nGenuine spare parts");
    setIsServiceModalOpen(true);
  };

  // Open modal for Editing service
  const openEditServiceModal = (service) => {
    setEditingServiceId(service.id);
    setServiceForm({
      name: service.name,
      section: service.section,
      description: service.description || '',
      badge: service.badge || '',
      image: service.image || '/images/ac-jet-wash.jpg',
      features: service.features || [],
      price: service.price || ''
    });
    setFeaturesInput((service.features || []).join('\n'));
    setIsServiceModalOpen(true);
  };

  // Handle Image Upload
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setServiceForm((prev) => ({ ...prev, image: data.url }));
        showToast('Photo uploaded successfully!');
      } else {
        showToast(data.message || 'Image upload failed');
      }
    } catch {
      showToast('Network error uploading image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Save (Create or Update) Service
  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!serviceForm.name.trim()) {
      showToast('Please enter a service name.');
      return;
    }

    const featureList = featuresInput
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const payload = {
      ...serviceForm,
      features: featureList
    };

    try {
      let res;
      if (editingServiceId) {
        // Update existing
        res = await fetch(`/api/services/${editingServiceId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new
        res = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.success) {
        showToast(editingServiceId ? 'Service updated successfully!' : 'New service published!');
        setIsServiceModalOpen(false);
        refreshData();
      } else {
        showToast(data.message || 'Error saving service');
      }
    } catch {
      showToast('Failed to save service');
    }
  };

  // Delete Service
  const handleDeleteService = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Service deleted.');
        refreshData();
      } else {
        showToast('Failed to delete service');
      }
    } catch {
      showToast('Network error');
    }
  };

  // Update Booking Status
  const handleUpdateBookingStatus = async (id, newStatus) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Lead marked as ${newStatus}`);
        refreshData();
      }
    } catch {
      showToast('Failed to update status');
    }
  };

  // Update Business Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Business details updated successfully!');
      }
    } catch {
      showToast('Failed to update settings');
    }
  };

  // If NOT authenticated, show Login Screen
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'var(--bg-primary)'
      }}>
        {toast && (
          <div className="toast-notice">
            <i className="fa-solid fa-circle-info"></i>
            <span>{toast}</span>
          </div>
        )}
        
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '36px 32px',
          maxWidth: '420px',
          width: '100%',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
            <button 
              type="button" 
              onClick={toggleTheme} 
              className="theme-toggle-btn"
              title={`Switch to ${theme === 'light' ? 'Dark Mode' : 'Light Mode'}`}
            >
              <i className={theme === 'dark' ? "fa-solid fa-sun" : "fa-solid fa-moon"}></i>
            </button>
          </div>

          <div className="brand-icon-box" style={{ margin: '0 auto 16px', width: '56px', height: '56px', fontSize: '1.6rem' }}>
            <i className="fa-solid fa-lock"></i>
          </div>
          
          <h2 style={{ fontSize: '1.6rem', color: 'var(--text-main)', marginBottom: '6px' }}>Technician Admin</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Sri Satya Sai AC & Refrigeration Services
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">Admin Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="form-input" 
                  placeholder="Enter admin password..." 
                  autoFocus
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  style={{ paddingRight: '42px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              <i className="fa-solid fa-arrow-right-to-bracket"></i> Login to Dashboard
            </button>
          </form>

          <div style={{ marginTop: '20px' }}>
            <a href="/" style={{ color: 'var(--brand-cyan-300)', fontSize: '0.85rem' }}>
              <i className="fa-solid fa-arrow-left" style={{ marginRight: '6px' }}></i> Back to Public Website
            </a>
          </div>
        </div>
      </div>
    );
  }

  const filteredServices = services.filter((s) => {
    if (sectionFilter === 'all') return true;
    return s.section === sectionFilter;
  });

  return (
    <div className="admin-layout">
      {/* Toast Notification */}
      {toast && (
        <div className="toast-notice">
          <i className="fa-solid fa-circle-check"></i>
          <span>{toast}</span>
        </div>
      )}

      {/* Admin Top Header */}
      <header className="admin-header">
        <div className="container admin-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="brand-icon-box" style={{ width: '38px', height: '38px', fontSize: '1.1rem' }}>
              <i className="fa-solid fa-sliders"></i>
            </div>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.1rem' }}>
                Sri Satya Sai Management
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--brand-cyan-300)' }}>
                Services & Leads Control Center
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Theme Toggle Button (Moon / Sun) */}
            <button 
              type="button" 
              onClick={toggleTheme} 
              className="theme-toggle-btn"
              title={`Switch to ${theme === 'light' ? 'Dark Mode' : 'Light Mode'}`}
            >
              <i className={theme === 'dark' ? "fa-solid fa-sun" : "fa-solid fa-moon"}></i>
            </button>
            <a href="/" target="_blank" className="btn btn-secondary btn-sm">
              <i className="fa-solid fa-arrow-up-right-from-square"></i> View Live Website
            </a>
            <button onClick={handleLogout} className="btn btn-danger btn-sm">
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Admin Navigation Tabs */}
      <div className="container">
        <div className="admin-nav-tabs">
          <button 
            className={`admin-tab ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            <i className="fa-solid fa-screwdriver-wrench"></i> Manage Services ({services.length})
          </button>
          <button 
            className={`admin-tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <i className="fa-solid fa-phone-arrow-down-left"></i> Customer Leads ({bookings.length})
          </button>
          <button 
            className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <i className="fa-solid fa-gear"></i> Business Info & Contacts
          </button>
        </div>

        {/* ====================================================
            TAB 1: SERVICES MANAGER
        ==================================================== */}
        {activeTab === 'services' && (
          <div>
            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className={`btn btn-sm ${sectionFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSectionFilter('all')}
                >
                  All ({services.length})
                </button>
                <button 
                  className={`btn btn-sm ${sectionFilter === 'ac' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSectionFilter('ac')}
                >
                  ❄️ AC Services ({services.filter(s => s.section === 'ac').length})
                </button>
                <button 
                  className={`btn btn-sm ${sectionFilter === 'refrigeration' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSectionFilter('refrigeration')}
                >
                  🧊 Refrigerator Services ({services.filter(s => s.section === 'refrigeration').length})
                </button>
              </div>

              <button className="btn btn-primary" onClick={openAddServiceModal}>
                <i className="fa-solid fa-circle-plus"></i> Add New Service
              </button>
            </div>

            {/* Services Table */}
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Section</th>
                    <th>Service Name</th>
                    <th>Description</th>
                    <th>Key Features</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                        Loading services...
                      </td>
                    </tr>
                  ) : filteredServices.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No services found in this section. Click &ldquo;Add New Service&rdquo; above!
                      </td>
                    </tr>
                  ) : (
                    filteredServices.map((service) => (
                      <tr key={service.id}>
                        <td>
                          <img 
                            src={service.image || '/images/ac-jet-wash.jpg'} 
                            alt={service.name} 
                            className="admin-thumb"
                            onError={(e) => { e.target.src = '/images/ac-jet-wash.jpg'; }}
                          />
                        </td>
                        <td>
                          <span className={`service-type-badge ${service.section}`}>
                            {service.section === 'ac' ? '❄️ AC' : '🧊 Fridge'}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{service.name}</strong>
                          {service.badge && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--brand-cyan-300)', marginTop: '2px' }}>
                              Tag: {service.badge}
                            </div>
                          )}
                        </td>
                        <td style={{ maxWidth: '320px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {service.description}
                        </td>
                        <td style={{ fontSize: '0.82rem' }}>
                          {(service.features || []).slice(0, 2).map((f, i) => (
                            <div key={i} style={{ color: 'var(--text-muted)' }}>• {f}</div>
                          ))}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => openEditServiceModal(service)}
                              title="Edit Service"
                            >
                              <i className="fa-solid fa-pen-to-square"></i> Edit
                            </button>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteService(service.id, service.name)}
                              title="Delete Service"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ====================================================
            TAB 2: CUSTOMER LEADS & INQUIRIES
        ==================================================== */}
        {activeTab === 'bookings' && (
          <div>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Customer Callback Requests</h3>
              <button className="btn btn-secondary btn-sm" onClick={refreshData}>
                <i className="fa-solid fa-rotate"></i> Refresh Leads
              </button>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Customer Name</th>
                    <th>Mobile Phone</th>
                    <th>Appliance & Service</th>
                    <th>Address / Colony</th>
                    <th>Notes</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No booking inquiries yet. Submissions on the website will appear here in real-time.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((b) => (
                      <tr key={b.id}>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                          {new Date(b.createdAt).toLocaleDateString()} <br />
                          {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td>
                          <strong style={{ color: 'var(--text-main)' }}>{b.customerName}</strong>
                        </td>
                        <td>
                          <a 
                            href={`tel:${b.phone}`} 
                            className="btn btn-call btn-sm"
                            style={{ padding: '6px 12px' }}
                          >
                            <i className="fa-solid fa-phone"></i> {b.phone}
                          </a>
                        </td>
                        <td>
                          <span className={`service-type-badge ${b.serviceType}`}>
                            {b.serviceType === 'ac' ? 'AC' : 'Fridge'}
                          </span>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '4px' }}>
                            {b.serviceName}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {b.address || 'Not specified'}
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '200px' }}>
                          {b.notes || '—'}
                        </td>
                        <td>
                          <select 
                            className="form-select"
                            style={{ padding: '6px 10px', fontSize: '0.82rem', width: 'auto' }}
                            value={b.status || 'New'}
                            onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                          >
                            <option value="New">🟡 New</option>
                            <option value="Contacted">🔵 Contacted</option>
                            <option value="Completed">🟢 Completed</option>
                            <option value="Cancelled">⚪ Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ====================================================
            TAB 3: SETTINGS & CONTACT CONFIGURATION
        ==================================================== */}
        {activeTab === 'settings' && settings && (
          <div style={{ maxWidth: '750px', background: 'var(--bg-surface)', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)', marginBottom: '8px' }}>
              Business Contact & Information
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Update your phone numbers, address, and hours anytime. Changes will reflect instantly on the live website.
            </p>

            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="form-group">
                <label className="form-label">Business Display Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={settings.businessName || ''}
                  onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Primary Calling Phone</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={settings.displayPhone || settings.phone || ''}
                    onChange={(e) => setSettings({ ...settings, displayPhone: e.target.value, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">WhatsApp Number (with country code)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 919848012345" 
                    value={settings.whatsapp || ''}
                    onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Alternate / Secondary Phone (Optional)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={settings.secondaryPhone || ''}
                    onChange={(e) => setSettings({ ...settings, secondaryPhone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Admin Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    value={settings.adminPin || ''}
                    placeholder="Enter new admin password"
                    onChange={(e) => setSettings({ ...settings, adminPin: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Workshop / Shop Address</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={settings.address || ''}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Service City / Coverage Area</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={settings.city || ''}
                  onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Google Maps Location Link (URL)</label>
                <input 
                  type="url" 
                  className="form-input" 
                  placeholder="https://maps.app.goo.gl/..."
                  value={settings.mapUrl || ''}
                  onChange={(e) => setSettings({ ...settings, mapUrl: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Working Hours</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={settings.workingHours || ''}
                  onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: 'fit-content', marginTop: '10px' }}>
                <i className="fa-solid fa-floppy-disk"></i> Save Business Info
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ====================================================
          MODAL: ADD / EDIT SERVICE
      ==================================================== */}
      {isServiceModalOpen && (
        <div className="modal-overlay" onClick={() => setIsServiceModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.35rem', color: 'var(--text-main)' }}>
                {editingServiceId ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button 
                onClick={() => setIsServiceModalOpen(false)}
                style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSaveService} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Category / Section Selection */}
              <div className="form-group">
                <label className="form-label">Service Section *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    background: serviceForm.section === 'ac' ? 'var(--sky-100)' : 'var(--bg-primary)',
                    border: serviceForm.section === 'ac' ? '1px solid var(--brand-cyan-400)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer'
                  }}>
                    <input 
                      type="radio" 
                      name="section" 
                      value="ac" 
                      checked={serviceForm.section === 'ac'}
                      onChange={() => setServiceForm({ ...serviceForm, section: 'ac' })}
                    />
                    <strong style={{ color: 'var(--text-main)' }}>❄️ AC Services</strong>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    background: serviceForm.section === 'refrigeration' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-primary)',
                    border: serviceForm.section === 'refrigeration' ? '1px solid var(--accent-green)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer'
                  }}>
                    <input 
                      type="radio" 
                      name="section" 
                      value="refrigeration" 
                      checked={serviceForm.section === 'refrigeration'}
                      onChange={() => setServiceForm({ ...serviceForm, section: 'refrigeration' })}
                    />
                    <strong style={{ color: 'var(--text-main)' }}>🧊 Refrigerator</strong>
                  </label>
                </div>
              </div>

              {/* Service Name */}
              <div className="form-group">
                <label className="form-label">Service Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Split AC Jet Pump Cleaning" 
                  required
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Service Description</label>
                <textarea 
                  className="form-textarea" 
                  rows="3"
                  placeholder="Describe what is included in this service..."
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                ></textarea>
              </div>

              {/* Photo Upload & Preview */}
              <div className="form-group">
                <label className="form-label">Service Photo</label>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <img 
                    src={serviceForm.image || '/images/ac-jet-wash.jpg'} 
                    alt="Preview" 
                    style={{ width: '80px', height: '65px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
                    onError={(e) => { e.target.src = '/images/ac-jet-wash.jpg'; }}
                  />
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={handleImageFileChange}
                    />
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      <i className="fa-solid fa-cloud-arrow-up"></i>
                      {uploadingImage ? 'Uploading Photo...' : 'Upload New Photo'}
                    </button>

                    {/* Quick photo picker presets */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Or choose preset:</span>
                      <button 
                        type="button" 
                        onClick={() => setServiceForm({ ...serviceForm, image: '/images/hero-technician.jpg' })}
                        style={{ fontSize: '0.75rem', color: 'var(--brand-cyan-300)', textDecoration: 'underline' }}
                      >
                        AC Tech
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setServiceForm({ ...serviceForm, image: '/images/ac-jet-wash.jpg' })}
                        style={{ fontSize: '0.75rem', color: 'var(--brand-cyan-300)', textDecoration: 'underline' }}
                      >
                        Jet Wash
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setServiceForm({ ...serviceForm, image: '/images/ac-repair-pcb.jpg' })}
                        style={{ fontSize: '0.75rem', color: 'var(--brand-cyan-300)', textDecoration: 'underline' }}
                      >
                        PCB Repair
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setServiceForm({ ...serviceForm, image: '/images/fridge-repair.jpg' })}
                        style={{ fontSize: '0.75rem', color: 'var(--brand-cyan-300)', textDecoration: 'underline' }}
                      >
                        Fridge Repair
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tag / Badge */}
              <div className="form-group">
                <label className="form-label">Badge Tag (Optional)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Best Seller, Recommended, Fast Repair" 
                  value={serviceForm.badge}
                  onChange={(e) => setServiceForm({ ...serviceForm, badge: e.target.value })}
                />
              </div>

              {/* Key Features Bullet points */}
              <div className="form-group">
                <label className="form-label">Key Features / Inclusions (One per line)</label>
                <textarea 
                  className="form-textarea" 
                  rows="3"
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <i className="fa-solid fa-floppy-disk"></i> {editingServiceId ? 'Save Changes' : 'Publish Service'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsServiceModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
