import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDown, Search, RefreshCw, ExternalLink } from 'lucide-react';
import API_BASE_URL from '../../api';

/* ======================================
   Floating Navigation
   ====================================== */
function NavBar() {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      zIndex: 50, padding: '24px 40px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    }}>
      <div className="mono-label" style={{ fontWeight: 'bold' }}>
        KINETIC ARMOR
      </div>
      
      <div className="pill-nav">
        <a href="#work" className="pill-link">WORK</a>
        <a href="#services" className="pill-link">SERVICES</a>
        <a href="#contact" className="pill-link">CONTACT</a>
      </div>

      <div className="mono-label">
        <a href="https://twitter.com">TW/X</a>
      </div>
    </nav>
  );
}

/* ======================================
   Rotating SVG Component
   ====================================== */
function RotatingScrollIndicator() {
  return (
    <div style={{ position: 'relative', width: 144, height: 144 }}>
      {/* Central static arrow */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center'
      }}>
        <ArrowDown size={32} />
      </div>

      {/* Rotating Text */}
      <svg className="animate-spin-slow" width="144" height="144" viewBox="0 0 144 144">
        <path
          id="textPath"
          d="M 72, 72 m -60, 0 a 60,60 0 1,1 120,0 a 60,60 0 1,1 -120,0"
          fill="transparent"
        />
        <text style={{
          fontFamily: 'Space Mono',
          fontSize: '9px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          fill: '#000000'
        }}>
          <textPath href="#textPath" startOffset="0%" spacing="auto">
            SCROLL DOWN • SCROLL DOWN • SCROLL DOWN • SCROLL DOWN • 
          </textPath>
        </text>
      </svg>
    </div>
  );
}

/* ======================================
   Hero Section
   ====================================== */
function Hero() {
  return (
    <section style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '16vw', textAlign: 'center' }}>
          KINETIC<br/>ARMOR
        </h1>
      </div>
      
      <div className="border-t-2-black" style={{ display: 'flex', padding: '0 40px', alignItems: 'center', height: '160px' }}>
        <div style={{ flex: 1 }} className="mono-label">
          BASED IN <br/> NEW YORK
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <RotatingScrollIndicator />
        </div>
        <div style={{ flex: 1, textAlign: 'right' }} className="mono-label">
          ASSET PROTECTION <br/> ENGINE V.1.0
        </div>
      </div>
    </section>
  );
}

/* ======================================
   Free Search Component
   ====================================== */
function FreeSearch() {
  const [searchCount, setSearchCount] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searchError, setSearchError] = useState(null);

  useEffect(() => {
    const count = parseInt(localStorage.getItem('kinetic_free_search_count') || '0', 10);
    setSearchCount(count);
  }, []);

  const handleSearch = async (e) => {
    if (searchCount >= 2) return;
    const file = e.target.files[0];
    if (!file) return;

    setSearchLoading(true);
    setSearchResults(null);
    setSearchError(null);

    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API_BASE_URL}/api/search`, { method: 'POST', body: formData });
      const data = await res.json();
      setSearchLoading(false);
      if (res.ok) {
        setSearchResults(data);
        const newCount = searchCount + 1;
        setSearchCount(newCount);
        localStorage.setItem('kinetic_free_search_count', newCount.toString());
      } else {
        setSearchError(data.error || 'Search failed');
      }
    } catch (err) {
      setSearchLoading(false);
      setSearchError('NETWORK OFFLINE OR SERVER ERROR');
    }
  };

  return (
    <section style={{ padding: '80px 40px', backgroundColor: '#F0F0F0' }} id="free-search">
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h2 style={{ fontSize: '4vw', marginBottom: 40, textAlign: 'center', letterSpacing: '-0.04em' }}>
          LIVE DEMO: REVERSE SEARCH
        </h2>

        {searchCount >= 2 ? (
          <div style={{ border: '3px solid black', padding: 60, textAlign: 'center', backgroundColor: '#FFF' }}>
            <div className="mono-label" style={{ fontSize: 24, fontWeight: 'bold', color: '#FF4D00', marginBottom: 20 }}>
              FREE TRIAL LIMIT REACHED
            </div>
            <div className="mono-label" style={{ marginBottom: 40 }}>
              You've used your 2 free searches. Sign in to access the full Radar and Vault.
            </div>
            <Link to="/app" style={{ textDecoration: 'none' }}>
              <button className="bg-black text-white" style={{
                fontFamily: 'Space Mono', fontSize: '16px', fontWeight: 'bold',
                padding: '24px 64px', border: '2px solid black', cursor: 'pointer', borderRadius: '999px',
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                SIGN IN / ACCESS DASHBOARD
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            <div style={{ border: '3px dashed black', padding: 60, textAlign: 'center', backgroundColor: '#FFF' }}>
              <label style={{ cursor: 'pointer', display: 'inline-block' }}>
                <input type="file" style={{ display: 'none' }} onChange={handleSearch} disabled={searchLoading} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                  {searchLoading ? <RefreshCw size={48} className="animate-spin-slow" /> : <Search size={48} />}
                  <div className="mono-label" style={{ fontSize: 24, fontWeight: 'bold' }}>
                    {searchLoading ? "ENGAGING LENS PROTOCOL... (EST. 10-30s)" : "SELECT IMAGE FOR REVERSE SEARCH"}
                  </div>
                  <div className="mono-label" style={{ opacity: 0.5 }}>
                    Free searches remaining: {2 - searchCount} / 2
                  </div>
                </div>
              </label>
            </div>

            {searchError && (
              <div style={{ padding: 20, backgroundColor: '#FF4D00', color: '#FFF', fontWeight: 'bold' }} className="mono-label">
                ERROR: {searchError}
              </div>
            )}

            {searchResults && (
              <div>
                <div className="mono-label" style={{ marginBottom: 20, fontSize: 18, fontWeight: 'bold' }}>
                  VERIFIED MATCHES: {searchResults.results.length}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
                  {searchResults.results.map((res, i) => (
                    <div key={i} style={{ border: '3px solid black', backgroundColor: '#FFF', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ padding: 20, display: 'flex', gap: 10, borderBottom: '2px solid black' }}>
                        <div style={{ flex: 1 }}>
                          <div className="mono-label" style={{ fontSize: 10, opacity: 0.5, marginBottom: 5 }}>ORIGINAL</div>
                          <img src={`${API_BASE_URL}/uploads/${searchResults.original_image}`} alt="Original" style={{ width: '100%', height: 120, objectFit: 'cover', border: '1px solid #CCC' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="mono-label" style={{ fontSize: 10, color: '#FF4D00', fontWeight: 'bold', marginBottom: 5 }}>MATCH (DIST: {res.distance})</div>
                          <img src={`${API_BASE_URL}/uploads/${res.found_image}`} alt="Match" style={{ width: '100%', height: 120, objectFit: 'cover', border: '1px solid #FF4D00' }} />
                        </div>
                      </div>
                      <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div className="mono-label" style={{ opacity: 0.5, marginBottom: 5 }}>SOURCE URL</div>
                          <a href={res.found_url} target="_blank" rel="noreferrer" className="mono-label" style={{ color: '#000', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                            {res.found_url.substring(0, 40)}{res.found_url.length > 40 ? '...' : ''} <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ======================================
   Skewed Marquee
   ====================================== */
function SkewedMarquee() {
  return (
    <section className="bg-black" style={{
      transform: 'skewY(-2deg)', padding: '60px 0', margin: '80px 0', overflow: 'hidden'
    }}>
      <div style={{ transform: 'skewY(2deg)' }}>
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
          <div className="animate-marquee" style={{ display: 'inline-block' }}>
            {Array(5).fill('PROTECT YOUR INTELLECTUAL PROPERTY — ').map((t, i) => (
              <span key={i} style={{
                fontFamily: 'Archivo Black', color: '#FF4D00', fontSize: '10vw', paddingRight: '40px'
              }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', marginTop: '-2vw' }}>
          <div className="animate-marquee-reverse" style={{ display: 'inline-block' }}>
            {Array(5).fill('FAST & SCALABLE & BRUTALIST & ').map((t, i) => (
              <span key={i} style={{
                fontFamily: 'Archivo Black', color: '#FFFFFF', opacity: 0.8, fontSize: '10vw', paddingRight: '40px'
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ======================================
   Vertical Service List
   ====================================== */
const SERVICES = [
  { id: '01', title: 'PERCEPTUAL HASHING', tags: ['VISUAL FINGERPRINT', 'pHash', 'PYTHON'], link: '/app', state: { tab: 'vault' } },
  { id: '02', title: 'AUTOMATED DMCA', tags: ['AI DRAFTING', 'GEMINI 1.5', 'LEGAL'], link: '/app', state: { tab: 'strikes' } },
  { id: '03', title: 'GLOBAL WEB SCAN', tags: ['CRAWLER', 'SCANNER', 'MATCHING'], link: '#free-search' },
  { id: '04', title: 'ANALYTICS ENGINE', tags: ['RECHARTS', 'RISK SCORE', 'SQLITE'], link: '/app', state: { tab: 'analytics' } },
];

function ServiceList() {
  return (
    <section className="bg-black" style={{ padding: '80px 0' }} id="services">
      {SERVICES.map((s) => {
        const content = (
          <div className="service-item">
            <div className="mono-label text-orange" style={{ width: '80px', paddingTop: '16px', fontSize: '24px' }}>
              {s.id}
            </div>
            <div>
              <div className="service-title">{s.title}</div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                {s.tags.map(t => (
                  <span key={t} className="mono-label text-white border-2-black" style={{
                    padding: '6px 16px', borderRadius: '999px', borderColor: 'rgba(255,255,255,0.2)', fontSize: '12px'
                  }}>{t}</span>
                ))}
              </div>
            </div>
            <ArrowUpRight className="service-arrow" size={48} strokeWidth={3} />
          </div>
        );

        return s.link.startsWith('#') ? (
          <a href={s.link} key={s.id} style={{ textDecoration: 'none' }}>
            {content}
          </a>
        ) : (
          <Link to={s.link} state={s.state} key={s.id} style={{ textDecoration: 'none' }}>
            {content}
          </Link>
        );
      })}
      <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }} />
    </section>
  );
}

/* ======================================
   Giant CTA & Footer
   ====================================== */
function CTAAndFooter() {
  return (
    <>
      <section style={{ padding: '160px 40px', textAlign: 'center', overflow: 'hidden' }}>
        <h2 style={{ fontSize: '14vw', marginBottom: '60px' }}>SECURE NOW</h2>
        <Link to="/app" style={{ textDecoration: 'none' }}>
          <button className="bg-black text-white" style={{
            fontFamily: 'Space Mono', fontSize: '16px', fontWeight: 'bold',
            padding: '24px 64px', borderRadius: '999px', border: 'none', cursor: 'pointer',
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
            ACCESS THE RADAR
          </button>
        </Link>
      </section>

      <footer className="border-t-2-black" style={{ padding: '40px', display: 'flex', justifyContent: 'space-between' }}>
        <div className="mono-label">© 2026 KINETIC ARMOR</div>
        <div style={{ display: 'flex', gap: '32px' }} className="mono-label">
          <a href="#">INSTAGRAM</a>
          <a href="#">TWITTER</a>
          <a href="#">GITHUB</a>
        </div>
      </footer>
    </>
  );
}

/* ======================================
   Main Page
   ====================================== */
export default function Landing() {
  return (
    <>
      <NavBar />
      <main>
        <Hero />
        <FreeSearch />
        <SkewedMarquee />
        <ServiceList />
        <CTAAndFooter />
      </main>
    </>
  );
}
