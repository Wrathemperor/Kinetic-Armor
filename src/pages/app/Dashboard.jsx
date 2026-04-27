import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, Fingerprint, UploadCloud, RefreshCw, BarChart3, Settings, ExternalLink, Copy, Check, Info, Search, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import API_BASE_URL from '../../api';

const COLORS = ['#FF4D00', '#000000', '#888888', '#CCCCCC'];

export default function Dashboard() {
  const [violations, setViolations] = useState([]);
  const [assets, setAssets] = useState([]);
  const [stats, setStats] = useState(null);
  const [config, setConfig] = useState({ scan_threshold: 35, webhook_url: '' });
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [sendingNotice, setSendingNotice] = useState(false);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'strikes');

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);
  const [selectedStrike, setSelectedStrike] = useState(null);
  const [copied, setCopied] = useState(false);
  const [tickerLogs, setTickerLogs] = useState([
    { id: 1, text: 'INITIALIZING GLOBAL CRAWLER SCAN...', time: '23:41:02' },
    { id: 2, text: 'SCANNING REDDIT.COM/R/DESIGN... DONE.', time: '23:41:05' }
  ]);
  const [liveAlert, setLiveAlert] = useState(null);
  const prevViolationsRef = useRef([]);

  const fetchData = async () => {
    try {
      const [vRes, aRes, sRes, cRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/violations`),
        fetch(`${API_BASE_URL}/api/assets`),
        fetch(`${API_BASE_URL}/api/stats`),
        fetch(`${API_BASE_URL}/api/config`)
      ]);
      const newViolations = await vRes.json();
      const newAssets = await aRes.json();
      const newStats = await sRes.json();
      const newConfig = await cRes.json();

      // Live Detection Logic
      if (prevViolationsRef.current.length > 0 && newViolations.length > prevViolationsRef.current.length) {
        const added = newViolations.find(v => !prevViolationsRef.current.some(pv => pv.id === v.id));
        if (added) {
          const time = new Date().toLocaleTimeString([], { hour12: false });
          const newLog = { id: Date.now(), text: `STRIKE DETECTED: ${added.found_url.substring(0, 30)}...`, time, alert: true };
          setTickerLogs(prev => [newLog, ...prev].slice(0, 50));
          setLiveAlert(`LIVE STRIKE: ${added.found_url.split('/')[2]}`);
          setTimeout(() => setLiveAlert(null), 5000);
        }
      }

      setViolations(newViolations);
      setAssets(newAssets);
      setStats(newStats);
      setConfig(newConfig);
      prevViolationsRef.current = newViolations;
    } catch (e) { console.error('Sync Error:', e); }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 5000);
    
    // Background Ticker Simulation
    const tickerId = setInterval(() => {
      const sites = ['ARTSTATION.COM', 'TIKTOK.COM', 'TWITTER.COM', 'PINTEREST.COM', 'OPENSEA.IO', 'REDDIT.COM'];
      const site = sites[Math.floor(Math.random() * sites.length)];
      const time = new Date().toLocaleTimeString([], { hour12: false });
      const newLog = { id: Date.now(), text: `CRAWLING ${site}... SCANNING ASSETS...`, time };
      setTickerLogs(prev => [newLog, ...prev].slice(0, 50));
    }, 4000);

    return () => {
      clearInterval(id);
      clearInterval(tickerId);
    };
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setUploadStatus('FINGERPRINTING...');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API_BASE_URL}/api/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      setLoading(false);
      if (res.ok) setUploadStatus(`SECURED: ${data.phash.substring(0, 8)}...`);
      else setUploadStatus('ERROR: ' + data.error);
      setTimeout(() => setUploadStatus(null), 4000);
    } catch (e) {
      setLoading(false);
      setUploadStatus('NETWORK OFFLINE');
    }
  };

  const handleReverseSearch = async (e) => {
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
        if (res.ok) setSearchResults(data);
        else setSearchError(data.error || 'Search failed');
    } catch (e) {
        setSearchLoading(false);
        setSearchError('NETWORK OFFLINE OR SERVER ERROR');
    }
  };


  const updateConfig = async (newConf) => {
    try {
      await fetch(`${API_BASE_URL}/api/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConf)
      });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const deleteAsset = async (id) => {
    if (!window.confirm('PERMANENTLY REMOVE THIS ASSET AND ALL ASSOCIATED VIOLATIONS?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/assets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAssets(prev => prev.filter(a => a.id !== id));
        fetchData(); // Refresh violations too
      }
    } catch (e) { console.error('Delete Error:', e); }
  };

  const copyDMCA = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendNotice = async (id) => {
    setSendingNotice(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/violations/${id}/send`, { method: 'POST' });
      if (res.ok) {
        setSelectedStrike(prev => ({ ...prev, status: 'sent' }));
        fetchData();
      }
    } catch (e) { console.error(e); }
    setSendingNotice(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#F0F0F0', color: '#000', position: 'relative' }}>
      {/* Live Alert Toast */}
      <AnimatePresence>
        {liveAlert && (
          <motion.div
            initial={{ y: -100, x: '-50%', opacity: 0 }}
            animate={{ y: 20, x: '-50%', opacity: 1 }}
            exit={{ y: -100, x: '-50%', opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
              zIndex: 1000, backgroundColor: '#FF4D00', color: '#000',
              padding: '20px 40px', border: '4px solid black', fontWeight: 'bold',
              boxShadow: '10px 10px 0px rgba(0,0,0,1)',
              fontFamily: 'Space Mono', letterSpacing: '-0.02em',
              display: 'flex', alignItems: 'center', gap: 16
            }}
          >
            <ShieldAlert size={24} />
            <div style={{ fontSize: 18 }}>{liveAlert}</div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Sidebar */}
      <aside className="bg-orange" style={{ width: 300, padding: 40, borderRight: '3px solid black', display: 'flex', flexDirection: 'column' }}>
        <motion.h1 
          initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          style={{ fontSize: '2.5vw', letterSpacing: '-0.06em', marginBottom: 60, lineHeight: 0.9 }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>KINETIC<br/>ARMOR</Link>
        </motion.h1>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
          {[
            { id: 'strikes', label: 'ACTIVE STRIKES', icon: ShieldAlert },
            { id: 'search', label: 'REVERSE SEARCH', icon: Search },
            { id: 'analytics', label: 'ANALYTICS', icon: BarChart3 },
            { id: 'vault', label: 'FINGERPRINT VAULT', icon: Fingerprint },
            { id: 'settings', label: 'CONFIG', icon: Settings }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="mono-label"
              style={{ 
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
                fontWeight: 'bold', background: 'none', border: 'none', textAlign: 'left', 
                cursor: 'pointer', opacity: activeTab === item.id ? 1 : 0.4,
                borderBottom: activeTab === item.id ? '2px solid black' : 'none',
                transition: 'all 0.2s'
              }}>
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mono-label" style={{ fontSize: 10, opacity: 0.5 }}>
          SYSTEM NODE: 127.0.0.1 <br/>
          UPTIME: 104:12:08
        </div>
      </aside>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '60px 80px', overflowY: 'auto', position: 'relative' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 60 }}>
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <div className="mono-label" style={{ opacity: 0.5, letterSpacing: 2 }}>NODE STATUS</div>
            <h2 style={{ fontSize: '5vw', lineHeight: 0.9, letterSpacing: '-0.04em' }}>
              {activeTab === 'strikes' ? 'RADAR ACTIVE' : activeTab.toUpperCase()}
            </h2>
          </motion.div>
          
          <div style={{ textAlign: 'right' }}>
            <label style={{ cursor: 'pointer' }} className="pill-nav">
              <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mono-label text-white" style={{ display: 'flex', alignItems: 'center', gap: 10, backgroundColor: '#000', padding: '12px 24px', borderRadius: 999 }}>
                {loading ? <RefreshCw size={18} className="animate-spin-slow" /> : <UploadCloud size={18} />}
                {loading ? "FINGERPRINTING..." : "REGISTER ASSET"}
              </motion.span>
            </label>
            {uploadStatus && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mono-label" style={{ marginTop: 12, color: '#FF4D00', fontSize: 12 }}>
                {uploadStatus}
              </motion.div>
            )}
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'strikes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {violations.map((v, i) => (
                  <motion.div 
                    key={v.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-2-black hover-effect"
                    style={{ 
                      padding: 40, display: 'flex', gap: 40, border: '3px solid black', 
                      backgroundColor: '#FFF', position: 'relative', overflow: 'hidden' 
                    }}
                  >
                    {v.severity >= 8 && <div style={{ position: 'absolute', top: 0, left: 0, width: 8, height: '100%', backgroundColor: '#FF4D00' }} />}
                    
                    <div style={{ flexShrink: 0, width: 120 }}>
                      <div className="mono-label" style={{ opacity: 0.5, marginBottom: 8 }}>SEVERITY</div>
                      <div style={{ fontSize: '3.5vw', fontWeight: 900, color: v.severity >= 8 ? '#FF4D00' : '#000' }}>{v.severity}</div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div className="mono-label" style={{ opacity: 0.4, marginBottom: 8 }}>LEAK SOURCE</div>
                      <div style={{ fontSize: '1.5vw', fontWeight: 'bold', marginBottom: 16, wordBreak: 'break-all' }}>{v.found_url}</div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <span className="mono-label" style={{ backgroundColor: '#000', color: '#FFF', padding: '4px 12px', fontSize: 10 }}>{v.context}</span>
                        <span className="mono-label" style={{ border: '1px solid #000', padding: '4px 12px', fontSize: 10, color: v.status === 'sent' ? '#00A86B' : '#000', borderColor: v.status === 'sent' ? '#00A86B' : '#000' }}>
                          {v.status === 'sent' ? 'NOTICE SENT' : 'OPEN CASE'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
                      <button 
                        onClick={() => setSelectedStrike(v)}
                        className="mono-label hover-invert"
                        style={{ padding: '12px 24px', border: '2px solid black', cursor: 'pointer', backgroundColor: 'transparent' }}
                      >
                        VIEW STRIKE DATA
                      </button>
                    </div>
                  </motion.div>
                ))}
                {violations.length === 0 && (
                  <div style={{ padding: 100, textAlign: 'center', border: '3px dashed black', opacity: 0.3 }}>
                    <ShieldAlert size={48} style={{ marginBottom: 20 }} />
                    <div className="mono-label">RADAR CLEAR. NO UNAUTHORIZED ASSETS DETECTED.</div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'search' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                <div style={{ border: '3px dashed black', padding: 60, textAlign: 'center', backgroundColor: '#FFF' }}>
                  <label style={{ cursor: 'pointer', display: 'inline-block' }}>
                    <input type="file" style={{ display: 'none' }} onChange={handleReverseSearch} />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                      {searchLoading ? <RefreshCw size={48} className="animate-spin-slow" /> : <Search size={48} />}
                      <div className="mono-label" style={{ fontSize: 24, fontWeight: 'bold' }}>
                        {searchLoading ? "ENGAGING LENS PROTOCOL... (EST. 10-30s)" : "SELECT IMAGE FOR REVERSE SEARCH"}
                      </div>
                      <div className="mono-label" style={{ opacity: 0.5 }}>
                        Scans global indices and validates matches locally via cryptographic hashing.
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
                            <div style={{ display: 'flex', gap: 10 }}>
                              <button className="mono-label hover-invert" style={{ flex: 1, padding: '10px', border: '2px solid black', backgroundColor: 'transparent', cursor: 'pointer' }}>
                                ISSUE STRIKE
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && stats && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                {/* KPI Bento Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                  {[
                    { label: 'TOTAL ARMORED', value: stats.total_assets, trend: '+12%', icon: Fingerprint },
                    { label: 'ACTIVE STRIKES', value: stats.total_violations, trend: 'CRITICAL', icon: ShieldAlert },
                    { label: 'AVG SEVERITY', value: '7.2', trend: 'HIGH', icon: BarChart3 },
                    { label: 'ARMOR HEALTH', value: '98.4%', trend: 'OPTIMAL', icon: ShieldAlert }
                  ].map((kpi, idx) => (
                    <div key={idx} style={{ border: '3px solid black', padding: 30, backgroundColor: '#FFF' }}>
                      <div className="mono-label" style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.5, fontSize: 10, marginBottom: 15 }}>
                        {kpi.label} <kpi.icon size={12} />
                      </div>
                      <div style={{ fontSize: '2.5vw', fontWeight: 900, lineHeight: 1 }}>{kpi.value}</div>
                      <div className="mono-label" style={{ fontSize: 9, marginTop: 10, color: kpi.trend === 'CRITICAL' ? '#FF4D00' : '#000', fontWeight: 'bold' }}>
                        {kpi.trend} {kpi.trend !== 'CRITICAL' && '↑'}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40 }}>
                  {/* Primary Threat Chart */}
                  <div style={{ border: '3px solid black', padding: 40, backgroundColor: '#FFF' }}>
                    <div className="mono-label" style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between' }}>
                      HISTORICAL THREAT INTELLIGENCE
                      <span style={{ opacity: 0.5 }}>ANNUAL AGGREGATE</span>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={stats.trend_data || [
                        {date: 'Jan', count: 40}, {date: 'Feb', count: 35}, {date: 'Mar', count: 55},
                        {date: 'Apr', count: 45}, {date: 'May', count: 70}, {date: 'Jun', count: 65},
                        {date: 'Jul', count: 85}, {date: 'Aug', count: 80}, {date: 'Sep', count: 110},
                        {date: 'Oct', count: 100}, {date: 'Nov', count: 140}, {date: 'Dec', count: 130}
                      ]}>
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF4D00" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#FF4D00" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DDD" />
                        <XAxis dataKey="date" axisLine={{stroke: '#000', strokeWidth: 2}} tickLine={false} style={{ fontSize: 10, fontFamily: 'Space Mono' }} />
                        <YAxis axisLine={{stroke: '#000', strokeWidth: 2}} tickLine={false} style={{ fontSize: 10, fontFamily: 'Space Mono' }} />
                        <Tooltip contentStyle={{border: '3px solid black', borderRadius: 0, fontFamily: 'Space Mono'}} />
                        <Area type="monotone" dataKey="count" stroke="#FF4D00" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" animationDuration={1000} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Platform Radar */}
                  <div style={{ border: '3px solid black', padding: 40, backgroundColor: '#FFF' }}>
                    <div className="mono-label" style={{ marginBottom: 40 }}>VULNERABILITY VECTORS</div>
                    <ResponsiveContainer width="100%" height={350}>
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.platform_dist}>
                        <PolarGrid stroke="#DDD" />
                        <PolarAngleAxis dataKey="name" tick={{ fontSize: 10, fontFamily: 'Space Mono' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} axisLine={false} tick={false} />
                        <Radar name="Exposure" dataKey="value" stroke="#000" fill="#000" fillOpacity={0.1} strokeWidth={2} />
                        <Tooltip contentStyle={{border: '3px solid black', borderRadius: 0}} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 40 }}>
                  {/* Distribution */}
                  <div style={{ border: '3px solid black', padding: 40, backgroundColor: '#FFF' }}>
                    <div className="mono-label" style={{ marginBottom: 40 }}>PLATFORM EXPOSURE</div>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={stats.platform_dist} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {stats.platform_dist.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{border: '3px solid black', borderRadius: 0}} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* System Logs Ticker */}
                  <div style={{ gridColumn: 'span 2', border: '3px solid black', padding: 40, backgroundColor: '#000', color: '#0F0' }}>
                    <div className="mono-label" style={{ marginBottom: 20, color: '#FFF' }}>LIVE SYSTEM PROTOCOL</div>
                    <div style={{ fontFamily: 'Space Mono', fontSize: 11, display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
                      {tickerLogs.map((log, idx) => (
                        <div 
                          key={log.id} 
                          style={{ 
                            opacity: idx === 0 ? 1 : 0.8 / (idx + 0.1), 
                            color: log.alert ? '#FF4D00' : '#0F0',
                            fontWeight: log.alert ? 'bold' : 'normal'
                          }}
                        >
                          [{log.time}] {log.text}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'vault' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {assets.map(a => (
                  <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '100px 180px 1fr 1fr 60px', gap: '30px', padding: 30, border: '3px solid black', backgroundColor: '#FFF', alignItems: 'center' }}>
                    <div style={{ width: 80, height: 80, border: '1px solid black', backgroundColor: '#eee', overflow: 'hidden' }}>
                      <img 
                        src={a.file_path.startsWith('http') ? a.file_path : `${API_BASE_URL}/uploads/${a.file_path}`} 
                        alt="Vault Asset" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div className="mono-label" style={{ opacity: 0.3 }}>ID</div>
                      <div style={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>#{a.id}</div>
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div className="mono-label" style={{ opacity: 0.3 }}>PROTECTED ASSET</div>
                      <div style={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.file_path.split(/[\\/]/).pop()}</div>
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div className="mono-label" style={{ opacity: 0.3 }}>FINGERPRINT (pHash)</div>
                      <div className="mono-label" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.phash}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button 
                        onClick={() => deleteAsset(a.id)}
                        className="mono-label hover-invert"
                        style={{ padding: '8px', border: '2px solid black', backgroundColor: 'transparent', cursor: 'pointer', color: '#FF4D00' }}
                        title="Delete Asset"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'settings' && (
              <div style={{ maxWidth: 600 }}>
                <div style={{ border: '3px solid black', padding: 40, backgroundColor: '#FFF' }}>
                  <h3 className="mono-label" style={{ marginBottom: 30, fontWeight: 'bold' }}>ENGINE CONFIGURATION</h3>
                  
                  <div style={{ marginBottom: 24 }}>
                    <label className="mono-label" style={{ display: 'block', marginBottom: 8, opacity: 0.5 }}>SCAN SENSITIVITY (pHash Threshold)</label>
                    <input 
                      type="range" min="1" max="64" value={config.scan_threshold}
                      onChange={(e) => updateConfig({ ...config, scan_threshold: e.target.value })}
                      style={{ width: '100%', accentColor: '#FF4D00' }}
                    />
                    <div className="mono-label" style={{ textAlign: 'right', marginTop: 4 }}>{config.scan_threshold} BITS DISTANCE</div>
                  </div>



                  <div>
                    <label className="mono-label" style={{ display: 'block', marginBottom: 8, opacity: 0.5 }}>WEBHOOK ALERT URL (SLACK/DISCORD)</label>
                    <input 
                      type="text" value={config.webhook_url || ''} 
                      onChange={(e) => setConfig({ ...config, webhook_url: e.target.value })}
                      onBlur={() => updateConfig(config)}
                      placeholder="HTTPS://HOOKS..."
                      style={{ width: '100%', padding: 12, border: '2px solid black', fontFamily: 'Space Mono' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Modal / Sidebar for details */}
        <AnimatePresence>
          {selectedStrike && (
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              style={{ 
                position: 'fixed', top: 0, right: 0, width: 500, height: '100vh', 
                backgroundColor: '#FFF', borderLeft: '4px solid black', padding: 60,
                zIndex: 100, boxShadow: '-20px 0 60px rgba(0,0,0,0.1)' 
              }}>
              <button onClick={() => setSelectedStrike(null)} className="mono-label hover-invert" style={{ border: '2px solid black', padding: '8px 16px', marginBottom: 40, cursor: 'pointer' }}>CLOSE [ESC]</button>
              
              <div className="mono-label" style={{ opacity: 0.4, marginBottom: 8 }}>CASE FILE #{selectedStrike.id}</div>
              <h3 style={{ fontSize: '2vw', marginBottom: 40 }}>STRIKE DETAILS</h3>

              <div style={{ marginBottom: 30 }}>
                <div className="mono-label" style={{ opacity: 0.5, marginBottom: 16 }}>VISUAL EVIDENCE</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div style={{ border: '2px solid black', padding: 10, backgroundColor: '#F9F9F9', position: 'relative' }}>
                      <div className="mono-label" style={{ fontSize: 10, opacity: 0.5, marginBottom: 10 }}>PROTECTED ASSET</div>
                      <img 
                        src={selectedStrike.original_image.startsWith('http') ? selectedStrike.original_image : `${API_BASE_URL}/uploads/${selectedStrike.original_image}`} 
                        alt="Original" 
                        style={{ width: '100%', height: 120, objectFit: 'contain', backgroundColor: '#eee', border: '1px solid #CCC' }} 
                      />
                      <div style={{ position: 'absolute', bottom: 15, right: 15, backgroundColor: '#000', color: '#FFF', padding: '2px 8px', fontSize: 8 }} className="mono-label">VAULT ORIGINAL</div>
                    </div>
                    <div style={{ border: '2px solid black', padding: 10, backgroundColor: '#F9F9F9', position: 'relative' }}>
                      <div className="mono-label" style={{ fontSize: 10, color: '#FF4D00', fontWeight: 'bold', marginBottom: 10 }}>INFRINGEMENT FOUND</div>
                      <img 
                        src={selectedStrike.found_image.startsWith('http') ? selectedStrike.found_image : `${API_BASE_URL}/uploads/${selectedStrike.found_image}`} 
                        alt="Infringement" 
                        style={{ width: '100%', height: 120, objectFit: 'contain', backgroundColor: '#eee', border: '1px solid #FF4D00' }} 
                      />
                      <div style={{ position: 'absolute', bottom: 15, right: 15, backgroundColor: '#FF4D00', color: '#000', padding: '2px 8px', fontSize: 8 }} className="mono-label">LIVE MATCH</div>
                    </div>
                </div>
              </div>

              <div style={{ marginBottom: 30 }}>
                <div className="mono-label" style={{ opacity: 0.5, marginBottom: 8 }}>TARGET URL</div>
                <a href={selectedStrike.found_url} target="_blank" className="mono-label" style={{ color: '#FF4D00', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {selectedStrike.found_url} <ExternalLink size={12} />
                </a>
              </div>

              <div style={{ border: '2px solid black', padding: 30, backgroundColor: '#F9F9F9', position: 'relative' }}>
                <div className="mono-label" style={{ opacity: 0.5, marginBottom: 16 }}>AI DRAFTED DMCA NOTICE</div>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'Space Mono', fontSize: 11, lineHeight: 1.6, opacity: 0.8 }}>
                  {selectedStrike.draft_dmca}
                </pre>
                <button 
                  onClick={() => copyDMCA(selectedStrike.draft_dmca)}
                  style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {copied ? <Check size={16} color="#FF4D00" /> : <Copy size={16} />}
                </button>
              </div>

              <div style={{ marginTop: 40 }}>
                <button 
                  onClick={() => handleSendNotice(selectedStrike.id)}
                  disabled={sendingNotice || selectedStrike.status === 'sent'}
                  className="bg-black text-white" 
                  style={{ 
                    width: '100%', padding: 20, fontFamily: 'Space Mono', fontWeight: 'bold', 
                    border: 'none', cursor: (sendingNotice || selectedStrike.status === 'sent') ? 'not-allowed' : 'pointer',
                    backgroundColor: selectedStrike.status === 'sent' ? '#00A86B' : '#000'
                  }}
                >
                  {sendingNotice ? 'DISPATCHING...' : selectedStrike.status === 'sent' ? 'NOTICE DISPATCHED' : 'ISSUE TAKEDOWN STRIKE'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
