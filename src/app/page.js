'use client';

import { useState, useEffect, useRef } from 'react';

export default function HomePage() {
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState({
    businessName: "Sri Satya Sai AC and Refrigeration Services",
    phone: "+91 96664 58789",
    whatsapp: "919666458789",
    displayPhone: "+91 96664 58789",
    address: "Seshagiri Rao St, Rama Rao Peta, beside SUBBAYYA GARI HOTEL",
    city: "Kakinada, Andhra Pradesh 533004",
    mapUrl: "https://maps.app.goo.gl/kghuMkcFyQrAzcYv7",
    workingHours: "Monday - Sunday: 8:00 AM - 9:30 PM",
    emergencyService: "Prompt Doorstep Visits Across Kakinada & Surrounding Areas",
    experienceYears: "25+"
  });

  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  // Sync theme state with document attribute and localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme') || document.documentElement.getAttribute('data-theme') || 'light';
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } catch {
      // Ignore localStorage access errors
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('theme', nextTheme);
    } catch {
      // Ignore localStorage access errors
    }
  };

  // Booking modal state
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form submission state
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    serviceType: 'ac',
    serviceName: '',
    otherProblem: '',
    address: '',
    notes: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Fetch initial data
  useEffect(() => {
    async function loadData() {
      try {
        const [servicesRes, settingsRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/settings')
        ]);

        const servicesData = await servicesRes.json();
        const settingsData = await settingsRes.json();

        if (servicesData.success) {
          setServices(servicesData.data);
        }
        if (settingsData.success) {
          setSettings(settingsData.data);
        }
      } catch (err) {
        console.error('Failed to load website data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // Filter services by active tab
  const filteredServices = services.filter((svc) => {
    if (activeTab === 'all') return true;
    return svc.section === activeTab;
  });

  // Services available for the selected appliance in the form
  const availableServicesForForm = services.filter((s) => s.section === formData.serviceType);
  const filteredDropdownServices = availableServicesForForm.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openBookingFor = (service) => {
    setSelectedService(service);
    setFormData((prev) => ({
      ...prev,
      serviceType: service.section,
      serviceName: service.name,
      otherProblem: ''
    }));
    setSearchQuery(service.name);
    setIsModalOpen(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.phone.trim()) {
      showToast('Please enter your name and phone number.');
      return;
    }

    if (formData.serviceName === 'Others / Not Listed' && !formData.otherProblem.trim()) {
      showToast('Please specify the problem with your appliance.');
      return;
    }

    setSubmitting(true);
    try {
      const finalServiceName = formData.serviceName || 'General Inspection';
      const compiledNotes = formData.serviceName === 'Others / Not Listed'
        ? `[Custom Problem]: ${formData.otherProblem.trim()} ${formData.notes ? ' | Notes: ' + formData.notes.trim() : ''}`
        : (formData.notes ? formData.notes.trim() : '');

      const payload = {
        ...formData,
        serviceName: finalServiceName,
        notes: compiledNotes
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Request received! Our technician will call you shortly.');
        setIsModalOpen(false);
        setFormData({
          customerName: '',
          phone: '',
          serviceType: 'ac',
          serviceName: '',
          otherProblem: '',
          address: '',
          notes: ''
        });
        setSearchQuery('');
      } else {
        showToast(data.message || 'Something went wrong. Please call directly.');
      }
    } catch {
      showToast('Failed to send request. Please call us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const cleanWhatsAppNumber = (settings.whatsapp || '919666458789').replace(/\D/g, '');
  const cleanTelNumber = (settings.phone || '9666458789').replace(/\s+/g, '');

  const getWhatsAppLink = (customText) => {
    const text = customText || `Hello ${settings.businessName}, I would like to book a doorstep service for my AC / Refrigerator in Kakinada.`;
    return `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="site-wrapper">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notice">
          <i className="fa-solid fa-circle-check"></i>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Announcement Bar */}
      <div className="top-announcement">
        <div className="container top-bar-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="top-badge-pulse"></span>
            <span>Doorstep Service in 60-90 Mins • All Brands Handled • Genuine Spare Parts</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <span><i className="fa-regular fa-clock" style={{ marginRight: '6px' }}></i>{settings.workingHours}</span>
            <a href="/admin" style={{ opacity: 0.8, fontSize: '0.8rem', textDecoration: 'underline' }}>
              <i className="fa-solid fa-lock" style={{ marginRight: '4px' }}></i>Admin Portal
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="navbar">
        <div className="container navbar-inner">
          <a href="#" className="brand-logo">
            <div className="brand-icon-box">
              <i className="fa-solid fa-snowflake"></i>
            </div>
            <div>
              <div className="brand-title">{settings.businessName}</div>
              <div className="brand-subtitle">AC & REFRIGERATION TECHNICIAN SPECIALIST</div>
            </div>
          </a>

          <ul className="nav-links">
            <li><a href="#services" className="nav-link"><i className="fa-solid fa-screwdriver-wrench"></i> Services</a></li>
            <li><a href="#why-us" className="nav-link"><i className="fa-solid fa-shield-halved"></i> Why Us</a></li>
            <li><a href="#book-section" className="nav-link"><i className="fa-solid fa-calendar-check"></i> Book Visit</a></li>
            <li><a href="#contact" className="nav-link"><i className="fa-solid fa-location-dot"></i> Contact</a></li>
          </ul>

          <div className="nav-contact-actions">
            {/* Compact Theme Toggle Button (Moon / Sun) */}
            <button 
              type="button"
              onClick={toggleTheme} 
              className="theme-toggle-btn"
              aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
              title={`Switch to ${theme === 'light' ? 'Dark Mode' : 'Light Mode'}`}
            >
              <i className={theme === 'dark' ? "fa-solid fa-sun" : "fa-solid fa-moon"}></i>
            </button>

            <a href={`tel:${cleanTelNumber}`} className="btn btn-call btn-sm">
              <i className="fa-solid fa-phone"></i>
              <span>{settings.displayPhone || settings.phone}</span>
            </a>
            <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm">
              <i className="fa-brands fa-whatsapp"></i>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      {/* Squarespace-Style Immersive Hero Section with background of AC, Refrigerator, Coolers, Central AC, Split AC, Window AC */}
      <section className="squarespace-hero">
        <div className="squarespace-hero-container">
          <div className="hero-appliance-eyebrow">
            <i className="fa-solid fa-snowflake"></i>
            <span>All Cooling Appliances • {settings.experienceYears} Experienced Master Technician</span>
          </div>

          <div className="squarespace-hero-text-card">
            <h1 className="squarespace-title">
              The <span className="hero-glow-text">Refrigeration & AC Services</span> in Kakinada
            </h1>

            <p className="squarespace-subtitle">
              Expert doorstep repair, genuine spares & precision servicing for <strong>Split AC, Refrigerators, Coolers, Central AC, and Window AC</strong>. Doorstep technician visit in 60-90 minutes across Kakinada.
            </p>

            <div className="squarespace-cta-group">
              <a href={`tel:${cleanTelNumber}`} className="btn btn-call btn-lg">
                <i className="fa-solid fa-phone"></i>
                <span>Call: {settings.displayPhone || settings.phone}</span>
              </a>
              <a 
                href={getWhatsAppLink("Hello Sri Satya Sai Services, I need immediate doorstep service for my AC / Refrigerator / Cooler in Kakinada.")} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-whatsapp btn-lg"
              >
                <i className="fa-brands fa-whatsapp"></i>
                <span>Chat on WhatsApp</span>
              </a>
              <a href="#book-section" className="btn btn-secondary btn-lg">
                <i className="fa-solid fa-calendar-check"></i>
                <span>Request Callback</span>
              </a>
            </div>
          </div>

          {/* Interactive Appliance Showcase Row (Split AC, Fridge, Coolers, Central AC, Window AC) */}
          <div className="appliance-tiles-grid">
            <a href="#services" onClick={() => setActiveTab('ac')} className="appliance-tile-card">
              <div className="appliance-tile-icon">
                <i className="fa-solid fa-wind"></i>
              </div>
              <div className="appliance-tile-name">Split AC</div>
              <div className="appliance-tile-desc">Jet wash, foam & gas refilling</div>
            </a>

            <a href="#services" onClick={() => setActiveTab('refrigeration')} className="appliance-tile-card">
              <div className="appliance-tile-icon">
                <i className="fa-solid fa-cube"></i>
              </div>
              <div className="appliance-tile-name">Refrigerators</div>
              <div className="appliance-tile-desc">Single, double door & inverter</div>
            </a>

            <a href="#services" onClick={() => setActiveTab('refrigeration')} className="appliance-tile-card">
              <div className="appliance-tile-icon">
                <i className="fa-solid fa-fan"></i>
              </div>
              <div className="appliance-tile-name">Air Coolers</div>
              <div className="appliance-tile-desc">Desert & water cooler pump fix</div>
            </a>

            <a href="#services" onClick={() => setActiveTab('ac')} className="appliance-tile-card">
              <div className="appliance-tile-icon">
                <i className="fa-solid fa-building"></i>
              </div>
              <div className="appliance-tile-name">Central & Duct AC</div>
              <div className="appliance-tile-desc">Cassette, VRV & duct units</div>
            </a>

            <a href="#services" onClick={() => setActiveTab('ac')} className="appliance-tile-card">
              <div className="appliance-tile-icon">
                <i className="fa-solid fa-table-cells-large"></i>
              </div>
              <div className="appliance-tile-name">Window AC</div>
              <div className="appliance-tile-desc">Installation & frame coil care</div>
            </a>
          </div>
        </div>
      </section>

      {/* Filterable Services Section */}
      <section className="services-section" id="services">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Complete Appliance Care</span>
            <h2 className="section-title">Our Expert Services</h2>
            <p className="section-subtitle">
              Professional doorstep service with advanced diagnostic equipment, genuine spares, and expert craftsmanship in Kakinada.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="service-tabs-container">
            <div className="service-tabs">
              <button
                className={`service-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                <i className="fa-solid fa-grid-2"></i> All Services ({services.length})
              </button>
              <button
                className={`service-tab-btn ${activeTab === 'ac' ? 'active' : ''}`}
                onClick={() => setActiveTab('ac')}
              >
                <i className="fa-solid fa-snowflake"></i> AC Services ({services.filter(s => s.section === 'ac').length})
              </button>
              <button
                className={`service-tab-btn ${activeTab === 'refrigeration' ? 'active' : ''}`}
                onClick={() => setActiveTab('refrigeration')}
              >
                <i className="fa-solid fa-cube"></i> Refrigerator Services ({services.filter(s => s.section === 'refrigeration').length})
              </button>
            </div>
          </div>

          {/* Services Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--brand-cyan-300)' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
              <p style={{ marginTop: '12px' }}>Loading services...</p>
            </div>
          ) : (
            <div className="services-grid">
              {filteredServices.map((service) => (
                <div key={service.id} className="service-card">
                  {/* Photo without any confusing overlay badges */}
                  <div className="service-card-media">
                    <img
                      src={service.image || (service.section === 'ac' ? '/images/ac-jet-wash.jpg' : '/images/fridge-repair.jpg')}
                      alt={service.name}
                      className="service-card-img"
                      onError={(e) => {
                        e.target.src = service.section === 'ac' ? '/images/ac-jet-wash.jpg' : '/images/fridge-repair.jpg';
                      }}
                    />
                  </div>

                  <div className="service-card-body">
                    {/* Clear, high-contrast category label placed in card body */}
                    <div className="service-card-header-meta">
                      <span className={`service-pill-tag ${service.section}`}>
                        {service.section === 'ac' ? '❄️ AC Service' : '🧊 Refrigerator'}
                      </span>
                      {service.badge && (
                        <span className="service-badge-tag">{service.badge}</span>
                      )}
                    </div>

                    <h3 className="service-card-title">{service.name}</h3>
                    <p className="service-card-desc">{service.description}</p>

                    {service.features && service.features.length > 0 && (
                      <ul className="service-features-list">
                        {service.features.slice(0, 3).map((feat, idx) => (
                          <li key={idx}>
                            <i className="fa-solid fa-check"></i>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="service-card-footer">
                      <div className="service-status-pill">
                        <i className="fa-solid fa-circle-check"></i>
                        <span>Doorstep Inspection</span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <a
                          href={getWhatsAppLink(`Hello Sri Satya Sai Services, I would like to inquire about: ${service.name}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-whatsapp btn-sm"
                          title="Inquire on WhatsApp"
                        >
                          <i className="fa-brands fa-whatsapp"></i>
                        </a>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => openBookingFor(service)}
                        >
                          Book Visit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-us-section" id="why-us">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Why Trust Our Service</span>
            <h2 className="section-title">Why Choose Sri Satya Sai Services</h2>
            <p className="section-subtitle">
              We treat your appliances with the same care and precision as our own.
            </p>
          </div>

          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon-box">
                <i className="fa-solid fa-person-walking-luggage"></i>
              </div>
              <h3 className="why-card-title">Prompt Doorstep Visit</h3>
              <p className="why-card-desc">
                Quick 60 to 90 minute response window for emergency breakdowns so food doesn&apos;t spoil and your home stays cool.
              </p>
            </div>

            <div className="why-card">
              <div className="why-icon-box">
                <i className="fa-solid fa-certificate"></i>
              </div>
              <h3 className="why-card-title">25+ Years Hands-on Experience</h3>
              <p className="why-card-desc">
                Master technician proficient in all types of compressors, inverter PCB circuits, capillary systems, and cooling gases.
              </p>
            </div>

            <div className="why-card">
              <div className="why-icon-box" title="100% Genuine Certified">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L3.5 5.8V11.5C3.5 16.7 7.1 21.5 12 22.8C16.9 21.5 20.5 16.7 20.5 11.5V5.8L12 2Z" fill="rgba(14, 165, 233, 0.22)" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <text x="12" y="14.2" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-0.5px">100%</text>
                </svg>
              </div>
              <h3 className="why-card-title">100% Genuine Spare Parts</h3>
              <p className="why-card-desc">
                We only use brand-authorized capacitors, copper piping, thermostats, relays, and certified sealed refrigerant gases.
              </p>
            </div>

            <div className="why-card">
              <div className="why-icon-box">
                <i className="fa-solid fa-handshake"></i>
              </div>
              <h3 className="why-card-title">Transparent Inspection First</h3>
              <p className="why-card-desc">
                No surprises. We inspect your unit on-site, clearly explain the fault, and provide a clear quotation before any work begins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Book Doorstep Callback Section with Searchable Service Selector */}
      <section className="booking-section" id="book-section">
        <div className="container">
          <div className="booking-card">
            <div className="booking-info">
              <span className="badge badge-cyan" style={{ marginBottom: '12px' }}>Fast Doorstep Support</span>
              <h3>Need An AC or Fridge Repair Today?</h3>
              <p>
                Fill out this quick callback form or call us directly. Our technician will contact you within minutes to confirm your location in Kakinada and visit time.
              </p>

              <div className="booking-contact-pills">
                <div className="contact-pill-item">
                  <div className="contact-pill-icon">
                    <i className="fa-solid fa-phone"></i>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Direct Technician Hotline</div>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>{settings.displayPhone || settings.phone}</strong>
                  </div>
                </div>

                <div className="contact-pill-item">
                  <div className="contact-pill-icon" style={{ background: 'rgba(37, 211, 102, 0.15)', color: '#25d366' }}>
                    <i className="fa-brands fa-whatsapp"></i>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>WhatsApp Chat Booking</div>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>Instant Chat Available</strong>
                  </div>
                </div>

                <div className="contact-pill-item">
                  <div className="contact-pill-icon">
                    <i className="fa-solid fa-clock"></i>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Service Hours</div>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{settings.workingHours}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Booking Form */}
            <form onSubmit={handleBookingSubmit} className="booking-form">
              <h4 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                Request Doorstep Visit
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                We will call you right back to schedule your technician visit.
              </p>

              <div className="form-group">
                <label className="form-label">Your Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rajesh Sharma"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Phone Number *</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 96664 58789"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Appliance</label>
                  <select
                    className="form-select"
                    value={formData.serviceType}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setFormData({
                        ...formData,
                        serviceType: newType,
                        serviceName: '',
                        otherProblem: ''
                      });
                      setSearchQuery('');
                    }}
                  >
                    <option value="ac">Air Conditioner (AC)</option>
                    <option value="refrigeration">Refrigerator (Fridge)</option>
                  </select>
                </div>

                {/* Searchable Service Dropdown */}
                <div className="form-group" style={{ position: 'relative' }}>
                  <label className="form-label">Service Needed (Type to Search)</label>
                  <div className="searchable-select-wrapper" ref={dropdownRef}>
                    <div className="searchable-select-input-box">
                      <input
                        type="text"
                        className="searchable-select-input"
                        placeholder="Search service e.g. foam, jet, gas..."
                        value={searchQuery}
                        onFocus={() => setIsDropdownOpen(true)}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setIsDropdownOpen(true);
                        }}
                      />
                      <i className={`fa-solid fa-chevron-down searchable-select-icon ${isDropdownOpen ? 'open' : ''}`}></i>
                    </div>

                    {isDropdownOpen && (
                      <div className="searchable-dropdown-menu">
                        {filteredDropdownServices.map((svc) => (
                          <div
                            key={svc.id}
                            className={`searchable-dropdown-item ${formData.serviceName === svc.name ? 'active' : ''}`}
                            onMouseDown={() => {
                              setFormData({ ...formData, serviceName: svc.name, otherProblem: '' });
                              setSearchQuery(svc.name);
                              setIsDropdownOpen(false);
                            }}
                          >
                            <span>{svc.name}</span>
                            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                              {svc.section === 'ac' ? 'AC' : 'Fridge'}
                            </span>
                          </div>
                        ))}

                        {/* Always visible "Others / Not Listed" option */}
                        <div
                          className={`searchable-dropdown-item other-item ${formData.serviceName === 'Others / Not Listed' ? 'active' : ''}`}
                          onMouseDown={() => {
                            setFormData({ ...formData, serviceName: 'Others / Not Listed' });
                            setSearchQuery('Others / Not Listed');
                            setIsDropdownOpen(false);
                          }}
                        >
                          <span><i className="fa-solid fa-pen-to-square" style={{ marginRight: '6px' }}></i> Others / Not Listed</span>
                          <span style={{ fontSize: '0.75rem' }}>Describe Problem</span>
                        </div>

                        {filteredDropdownServices.length === 0 && (
                          <div style={{ padding: '10px 14px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            No exact match for &ldquo;{searchQuery}&rdquo;. Click <strong>Others / Not Listed</strong> above.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Dynamic Problem Specification Field when 'Others / Not Listed' is chosen */}
              {formData.serviceName === 'Others / Not Listed' && (
                <div className="other-problem-container">
                  <label className="form-label" style={{ color: '#fcd34d' }}>
                    <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '6px' }}></i>
                    Please specify the problem *
                  </label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    required
                    placeholder="Describe your appliance issue (e.g., strange sound, ice buildup, water leaking, not cooling, brand model)..."
                    value={formData.otherProblem}
                    onChange={(e) => setFormData({ ...formData, otherProblem: e.target.value })}
                    autoFocus
                  ></textarea>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Your Area / Colony / Address in Kakinada</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Seshagiri Rao St, Rama Rao Peta, beside Subbayya Hotel"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Additional Notes (Optional)</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="Any convenient timing or landmark details..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ marginTop: '8px' }}
              >
                {submitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Submitting...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane"></i> Submit Request - Get Call in 10 Mins
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Contact & Workshop Section */}
      <section className="contact-section" id="contact" style={{ padding: '60px 0' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Reach Us</span>
            <h2 className="section-title">Service Coverage & Workshop</h2>
            <p className="section-subtitle">
              Fast technician dispatch directly to your doorstep in Kakinada.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div className="why-card">
              <div className="why-icon-box">
                <i className="fa-solid fa-map-location-dot"></i>
              </div>
              <h3 className="why-card-title">Workshop / Office</h3>
              <p className="why-card-desc" style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                {settings.address}
              </p>
              <p className="why-card-desc" style={{ marginTop: '6px' }}>
                {settings.city}
              </p>
              <div style={{ marginTop: '12px' }}>
                <a
                  href={settings.mapUrl || "https://maps.app.goo.gl/kghuMkcFyQrAzcYv7"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  <i className="fa-solid fa-diamond-turn-right"></i> View on Google Maps
                </a>
              </div>
            </div>

            <div className="why-card">
              <div className="why-icon-box">
                <i className="fa-solid fa-phone-volume"></i>
              </div>
              <h3 className="why-card-title">Phone & WhatsApp</h3>
              <p className="why-card-desc">
                Primary Call: <strong style={{ color: 'var(--text-main)' }}>{settings.displayPhone || settings.phone}</strong>
              </p>
              {settings.secondaryPhone && (
                <p className="why-card-desc">
                  Alternate: <strong style={{ color: 'var(--text-main)' }}>{settings.secondaryPhone}</strong>
                </p>
              )}
              <div style={{ marginTop: '12px' }}>
                <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm">
                  <i className="fa-brands fa-whatsapp"></i> Chat on WhatsApp
                </a>
              </div>
            </div>

            <div className="why-card">
              <div className="why-icon-box">
                <i className="fa-solid fa-screwdriver-wrench"></i>
              </div>
              <h3 className="why-card-title">Working Hours</h3>
              <p className="why-card-desc" style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                {settings.workingHours}
              </p>
              <p className="why-card-desc" style={{ marginTop: '6px' }}>
                {settings.emergencyService}
              </p>
              <div style={{ marginTop: '12px' }}>
                <span className="badge badge-green">Available 7 Days a Week</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="brand-logo" style={{ marginBottom: '14px' }}>
                <div className="brand-icon-box">
                  <i className="fa-solid fa-snowflake"></i>
                </div>
                <div>
                  <div className="brand-title">{settings.businessName}</div>
                  <div className="brand-subtitle">DOORSTEP AC & REFRIGERATION EXPERTS</div>
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', lineHeight: 1.6 }}>
                Dedicated technician service in Kakinada providing quick diagnosis, genuine spare replacements, gas refills, and power jet/foam cleaning for split ACs, window ACs, and all refrigerator models.
              </p>
            </div>

            <div>
              <h4 className="footer-col-title">AC Services</h4>
              <ul className="footer-links">
                <li><a href="#services">AC Installation & Uninstallation</a></li>
                <li><a href="#services">AC General Service</a></li>
                <li><a href="#services">AC Jet or Water Service</a></li>
                <li><a href="#services">AC Foam Service</a></li>
                <li><a href="#services">AC Gas Leakage Detection</a></li>
                <li><a href="#services">AC Gas Refilling</a></li>
                <li><a href="#services">AC Water Leakage Fix</a></li>
                <li><a href="#services">Any AC Breakdown Complaints</a></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-col-title">Refrigerator Care</h4>
              <ul className="footer-links">
                <li><a href="#services">Fridge Not Cooling / Low Cooling</a></li>
                <li><a href="#services">Compressor & Motor Repair</a></li>
                <li><a href="#services">Gas Charging & Leak Fix</a></li>
                <li><a href="#services">Excess Ice / Defrost Problem</a></li>
                <li><a href="#services">Fridge Water Leakage</a></li>
                <li><a href="/admin">Technician Admin Login</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div>
              &copy; 2026 {settings.businessName}. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span>Doorstep Service</span>
              <span>•</span>
              <span>Genuine Spare Parts</span>
              <span>•</span>
              <a href="/admin" style={{ color: 'var(--brand-cyan-300)' }}>
                <i className="fa-solid fa-lock" style={{ marginRight: '4px' }}></i>Admin Dashboard
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Persistent Action Bar (Sticky at bottom on phones) */}
      <div className="mobile-sticky-bar">
        <div className="mobile-sticky-grid">
          <a href={`tel:${cleanTelNumber}`} className="mobile-action-btn mobile-btn-call">
            <i className="fa-solid fa-phone"></i>
            <span>Call Now</span>
          </a>
          <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="mobile-action-btn mobile-btn-whatsapp">
            <i className="fa-brands fa-whatsapp"></i>
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Interactive Booking Modal for specific service */}
      {isModalOpen && selectedService && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="badge badge-cyan" style={{ marginBottom: '6px' }}>
                  {selectedService.section === 'ac' ? 'AC Service' : 'Refrigerator Service'}
                </span>
                <h3 style={{ fontSize: '1.35rem', color: 'var(--text-main)' }}>{selectedService.name}</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ color: 'var(--text-muted)', fontSize: '1.25rem', padding: '4px 8px' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Your Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your name"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="Enter 10-digit mobile number"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Your Colony / Area / Address in Kakinada</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Where should technician visit?"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Specific Issue Details (Optional)</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="Any extra details about appliance model or problem..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={submitting}
                >
                  {submitting ? 'Booking...' : 'Confirm Doorstep Visit'}
                </button>
                <a
                  href={getWhatsAppLink(`Hello Sri Satya Sai Services, I want to book: ${selectedService.name}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                >
                  <i className="fa-brands fa-whatsapp"></i> Chat Instead
                </a>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
