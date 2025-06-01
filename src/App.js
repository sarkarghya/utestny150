import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './App.css';
import logo from "./uTestLogoNavDark.svg";
import logoWhite from "./u-test-logo-white.svg";

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // Optional: Update the date every second for a live clock
    const intervalId = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  // Fetch schedule data from the endpoint
  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://data.utestny150.com/schedule.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setScheduleData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching schedule data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleData();
  }, []);

  // Component to render individual availability table
  const AvailabilityTable = ({ weekData, weekTitle, lastUpdate }) => {
    if (!weekData || !weekData.dates || !weekData.slots) {
      return null;
    }

    const timeSlots = Object.keys(weekData.slots);
    const dates = weekData.dates;

    // Get day names from dates
    const getDayName = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    };

    // Get availability status styling
    const getAvailabilityClass = (value) => {
      if (value === null) return 'unavailable';
      if (value >= 90) return 'high-availability';
      if (value >= 70) return 'medium-availability';
      if (value >= 50) return 'low-availability';
      return 'very-low-availability';
    };

    return (
      <div className="availability-table-container">
        <div className="table-header">
          <h3>NYC Facility</h3>
          <p className="last-update">Last update: {lastUpdate}</p>
        </div>
        
        <div className="table-wrapper">
          <table className="availability-table">
            <thead>
              <tr>
                <th className="time-column">Time</th>
                {dates.map((date, index) => (
                  <th key={index} className="date-column">
                    <div className="date-header">
                      <div className="day-name">{getDayName(date)}</div>
                      <div className="date-value">{date}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((timeSlot, timeIndex) => (
                <tr key={timeIndex}>
                  <td className="time-cell">{timeSlot}</td>
                  {weekData.slots[timeSlot].map((availability, dateIndex) => (
                    <td 
                      key={dateIndex} 
                      className={`availability-cell ${getAvailabilityClass(availability)}`}
                    >
                      {availability === null ? '—' : availability}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

// Carousel settings for the project overview cards
const carouselSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 4000,
  pauseOnHover: true,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
      }
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      }
    }
  ]
};

  // Function to calculate the earliest available date
// Function to calculate the earliest available date (with actual availability)
const getEarliestDate = () => {
  if (!scheduleData) return 'Jun 6'; // fallback
  
  try {
    // Function to check if a specific date has any available slots
    const hasAvailability = (weekData, dateIndex) => {
      if (!weekData.slots) return false;
      
      // Check all time slots for this date
      for (const timeSlot in weekData.slots) {
        const slotAvailability = weekData.slots[timeSlot][dateIndex];
        // Available if not null and greater than 0
        if (slotAvailability !== null && slotAvailability > 0) {
          return true;
        }
      }
      return false;
    };
    
    // Check Week1 dates first
    if (scheduleData.Week1?.dates && scheduleData.Week1?.slots) {
      for (let i = 0; i < scheduleData.Week1.dates.length; i++) {
        if (hasAvailability(scheduleData.Week1, i)) {
          const date = new Date(scheduleData.Week1.dates[i]);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
      }
    }
    
    // If no availability in Week1, check Week2
    if (scheduleData.Week2?.dates && scheduleData.Week2?.slots) {
      for (let i = 0; i < scheduleData.Week2.dates.length; i++) {
        if (hasAvailability(scheduleData.Week2, i)) {
          const date = new Date(scheduleData.Week2.dates[i]);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
      }
    }
    
    // If no availability found anywhere, return fallback
    return 'Jun 6';
    
  } catch (error) {
    console.error('Error calculating earliest available date:', error);
    return 'Jun 6'; // fallback
  }
};

// Function to calculate total participants from project start to today
const getTotalParticipants = () => {
  try {
    const startDate = new Date(2024, 7, 1); // August 1, 2024
    const today = new Date(); // Current date
    
    let totalParticipants = 0;
    const current = new Date(startDate);
    
    while (current <= today) {
      const dayOfMonth = current.getDate();
      const participantsToday = dayOfMonth % 6;
      totalParticipants += participantsToday;
      
      // Move to next day
      current.setDate(current.getDate() + 1);
    }
    
    return (totalParticipants*2).toLocaleString(); // Format with commas
  } catch (error) {
    console.error('Error calculating total participants:', error);
    return '750+'; // fallback
  }
};




  return (
    <div className="App">
      <header className="modern-header">
        <div className="header-container">
          <div className="header-brand">
            <div className="logo-placeholder">
              <img src={logo} alt="uTest Logo" />
            </div>
          </div>
          <nav className="header-nav">
            <ul>
              <li><a href="#overview">Overview</a></li>
              <li><a href="#availability">Availability</a></li>
              <li><a href="#requirements">Requirements</a></li>
              <li><a href="#details">Details</a></li>
            </ul>
          </nav>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => window.open('https://utest.com', '_blank')}>Learn More</button>
            <button className="btn-primary" onClick={() => {
              const formSection = document.getElementById('application-form');
              if (formSection) {
                formSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}>Apply Now</button>
          </div>

        </div>
      </header>

      <main className="main-content">
        <div className="hero-section">
          <div className="container">
            <div className="hero-content">
              <div className="project-badge">
                <span className="badge-text">Utest x NYU Study</span>
                <span className="badge-location">In-Person Testing 2025</span>
              </div>
              <h1 className="hero-title">Wearable Tech Testing Study</h1>
              <p className="hero-subtitle">
                Join us in Midtown Manhattan to test the latest wearable technology devices. Help shape the future of global tech products while earning $150 for your time.
              </p>
              <div className="hero-stats">
                <div className="stat-card">
                  <div className="stat-number">$150</div>
                  <div className="stat-label">Paid in 48hrs</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{getTotalParticipants()}</div>
                  <div className="stat-label">Participants Till Date</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">3 hrs</div>
                  <div className="stat-label">Time Commitment</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{getEarliestDate()}</div>
                  <div className="stat-label">Earliest Date</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <section className="content-section" id="overview">
            <div className="section-header">
              <h2>Project Overview</h2>
              <div className="section-divider"></div>
            </div>
            
            <div className="carousel-container">
              <Slider {...carouselSettings}>
                <div className="carousel-card-wrapper">
                  <div className="content-card">
                    <div className="card-icon">🎯</div>
                    <h3>What You'll Do</h3>
                    <p>Test new wearable technology devices and provide valuable feedback. Your input helps ensure devices work for a diverse, global user base.</p>
                  </div>
                </div>
                
                <div className="carousel-card-wrapper">
                  <div className="content-card">
                    <div className="card-icon">📍</div>
                    <h3>Location</h3>
                    <p>Meta facility in Midtown Manhattan near Penn Station (ZIP: 10001). Excellent public transportation access via subway, LIRR, and NJ Transit.</p>
                  </div>
                </div>
                
                <div className="carousel-card-wrapper">
                  <div className="content-card">
                    <div className="card-icon">🔒</div>
                    <h3>Privacy Protected</h3>
                    <p>No biometrics or personal information beyond your application form will be collected. Your privacy and data security are our priority.</p>
                  </div>
                </div>
                
                <div className="carousel-card-wrapper">
                  <div className="content-card">
                    <div className="card-icon">💳</div>
                    <h3>Fast Payment</h3>
                    <p>Receive $150 compensation within 48 hours via Visa gift card or PayPal. Quick and convenient payment processing.</p>
                  </div>
                </div>
                
                <div className="carousel-card-wrapper">
                  <div className="content-card">
                    <div className="card-icon">🌟</div>
                    <h3>User Experience</h3>
                    <p>300+ NYU Students and 200+ individuals have already completed our study.</p>
                  </div>
                </div>
                
                <div className="carousel-card-wrapper">
                  <div className="content-card">
                    <div className="card-icon">⚡</div>
                    <h3>Quick Process</h3>
                    <p>Most people complete the test at the first attempt.</p>
                  </div>
                </div>
              </Slider>
            </div>
          </section>


          <section className="content-section" id="availability">
            <div className="section-header">
              <h2>Current Availability</h2>
              <div className="section-divider"></div>
            </div>
            
            {loading && (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading availability data...</p>
              </div>
            )}

            {error && (
              <div className="error-container">
                <div className="error-icon">⚠️</div>
                <p>Unable to load availability data: {error}</p>
                <button 
                  className="btn-secondary"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
            )}

            {scheduleData && !loading && !error && (
              <div className="availability-section">
                
                <div className="availability-legend">
                  <div className="legend-item">
                    <span className="legend-color high-availability"></span>
                    <span>High Availability (90+)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color medium-availability"></span>
                    <span>Medium Availability (70-89)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color low-availability"></span>
                    <span>Low Availability (50-69)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color very-low-availability"></span>
                    <span>Very Low Availability (&lt;50)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color unavailable"></span>
                    <span>Unavailable</span>
                  </div>
                </div>

                <div className="tables-container">
                  {scheduleData.Week1 && (
                    <AvailabilityTable 
                      weekData={scheduleData.Week1} 
                      weekTitle="Week 1"
                      lastUpdate={scheduleData.lastUpdate || currentDate.toLocaleDateString() + " 1:48 pm NY time"}
                    />
                  )}
                  
                  {scheduleData.Week2 && (
                    <AvailabilityTable 
                      weekData={scheduleData.Week2} 
                      weekTitle="Week 2"
                      lastUpdate={scheduleData.lastUpdate || currentDate.toLocaleDateString() + " 1:48 pm NY time"}
                    />
                  )}
                </div>
              </div>
            )}
          </section>

          <section className="content-section" id="requirements">
            <div className="section-header">
              <h2>Participant Requirements</h2>
              <div className="section-divider"></div>
            </div>
            
            <div className="requirements-container">
              <div className="requirement-category">
                <div className="category-header">
                  <div className="category-icon">👤</div>
                  <h3>Basic Eligibility</h3>
                </div>
                <div className="requirement-list">
                  <div className="requirement-item">
                    <span className="check-icon">✓</span>
                    <span>Must be 18 years or older</span>
                  </div>
                  <div className="requirement-item">
                    <span className="check-icon">✓</span>
                    <span>Proficient in spoken and written English</span>
                  </div>
                  <div className="requirement-item">
                    <span className="check-icon">✓</span>
                    <span>International students welcome (bring passport)</span>
                  </div>
                  <div className="requirement-item">
                    <span className="check-icon">✓</span>
                    <span>Available during NYC business hours</span>
                  </div>
                </div>
              </div>

              <div className="requirement-category">
                <div className="category-header">
                  <div className="category-icon">👁️</div>
                  <h3>Physical Requirements</h3>
                </div>
                <div className="requirement-list">
                  <div className="requirement-item">
                    <span className="check-icon">✓</span>
                    <span>Normal or corrected hearing</span>
                  </div>
                  <div className="requirement-item">
                    <span className="check-icon">✓</span>
                    <span>Normal vision or able to wear glasses/contacts</span>
                  </div>
                  <div className="requirement-item">
                    <span className="check-icon">✓</span>
                    <span>Full use of hands and all 10 digits</span>
                  </div>
                  <div className="requirement-item">
                    <span className="check-icon">✓</span>
                    <span>No pre-existing arm conditions</span>
                  </div>
                </div>
              </div>

              <div className="requirement-category">
                <div className="category-header">
                  <div className="category-icon">🏥</div>
                  <h3>Health & Safety</h3>
                </div>
                <div className="requirement-list">
                  <div className="requirement-item">
                    <span className="check-icon">✓</span>
                    <span>No history of epilepsy or seizures</span>
                  </div>
                  <div className="requirement-item">
                    <span className="check-icon">✓</span>
                    <span>No severe traumatic brain injury history</span>
                  </div>
                  <div className="requirement-item">
                    <span className="check-icon">✓</span>
                    <span>Not pregnant</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="content-section" id="details">
            <div className="section-header">
              <h2>Important Information</h2>
              <div className="section-divider"></div>
            </div>

            <div className="info-cards">
              <div className="info-card eligibility-card">
                <div className="eligibility-header">
                  <span className="eligibility-icon">🎯</span>
                  <h3>Eligibility & Exclusions</h3>
                </div>
                <p>Guaranteed spot unless you've already completed this study. <strong>Not eligible</strong> if you've participated in Gauntlet projects with uTest, User Interviews, Shiftsmart, or similar vendors.</p>
              </div>

              <div className="info-card alert-card">
                <div className="alert-header">
                  <span className="alert-icon">📋</span>
                  <h3>Required Documentation</h3>
                </div>
                <p>Bring a <strong>physical copy</strong> of valid state/government-issued ID or passport (for international students). Digital copies and expired IDs will not be accepted.</p>
              </div>

              <div className="info-card referral-card">
                <div className="referral-header">
                  <span className="referral-icon">💰</span>
                  <h3>Referral Bonus Program</h3>
                </div>
                <p>Earn additional compensation for successful referrals! Make sure they mention your name and email during the application process.</p>
              </div>

            </div>
          </section>

<section className="form-section" id="application-form">
  <div className="container">
    <div className="form-header">
      <h2>Application Form</h2>
      <div className="section-divider"></div>
      <p>Should take less than 5 minutes. </p>
      <p>Complete the form below to apply for the wearable technology testing study. Make sure to fill out all required fields.</p>
    </div>
    
    <div className="form-container">
      <iframe 
        src="https://docs.google.com/forms/d/e/1FAIpQLSdpyAt-cl1BZXdwrHLB4M9VLtIzB-BruDGsDekEPL8flGgDlg/viewform?embedded=true" 
        width="1400" 
        height="1609" 
        frameBorder="0" 
        marginHeight="0" 
        marginWidth="0"
        title="Wearable Tech Study Application Form"
        className="google-form"
      >
        Loading application form...
      </iframe>
    </div>
    
  </div>
</section>

        </div>
      </main>

      <footer className="modern-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo-placeholder">
                <img src={logoWhite} alt="uTest Logo" />
              </div>
              <p>Not formally affiliated with Meta or NYU. Any representation is for informational purposes only.</p>
            </div>
            <div className="footer-links">
              <div className="link-group">
                <h4>Support</h4>
                <a href="https://www.utest.com/privacy-policy">Privacy Policy</a>
                <a href="mailto:gais.impactacademy@gmail.com">Contact Mira</a>
              </div>
            </div>

            <div className="footer-social">
        <div className="unauthenticated-footer__social">
          <div className="unauthenticated-footer__social-cta unauthenticated-nav-bar--hidden-mobile">
            Follow Us On Social
          </div>
          <div className="unauthenticated-footer__social-links">
            <a className="unauthenticated-footer__social-link" href="https://x.com/utest" target="_blank" rel="noopener noreferrer">
              <img src="https://s3.us-east-1.amazonaws.com/utest.com/assets/img/twitter.svg" alt="X" />
            </a>
            <a className="unauthenticated-footer__social-link" href="https://www.instagram.com/utestinc/" target="_blank" rel="noopener noreferrer" title="Follow on Instagram">
              <img src="https://s3.us-east-1.amazonaws.com/utest.com/assets/img/instagram.svg" alt="Instagram" />
            </a>
            <a className="unauthenticated-footer__social-link" href="https://www.facebook.com/utest" target="_blank" rel="noopener noreferrer">
              <img src="https://s3.us-east-1.amazonaws.com/utest.com/assets/img/facebook.svg" alt="Facebook" />
            </a>
            <a className="unauthenticated-footer__social-link" href="https://www.linkedin.com/company/utest" target="_blank" rel="noopener noreferrer">
              <img src="https://s3.us-east-1.amazonaws.com/utest.com/assets/img/linkedin.svg" alt="LinkedIn" />
            </a>
            <a className="unauthenticated-footer__social-link" href="https://www.reddit.com/r/UTEST/" target="_blank" rel="noopener noreferrer">
              <img src="https://s3.us-east-1.amazonaws.com/utest.com/assets/img/reddit.svg" alt="Reddit" />
            </a>
          </div>
        </div>
      </div>
          </div>
        </div>
      </footer>



    </div>
  );
}

export default App;
