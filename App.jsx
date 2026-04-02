// ============================================================
// 🎯 FASHION RECOMMENDATION SYSTEM
// FILE: src/App.jsx
// 
// WHAT CHANGED FROM BEFORE:
//   ✅ Real API call to Flask backend
//   ✅ Sends actual uploaded image to Python
//   ✅ Displays REAL recommended fashion images
//   ✅ Proper error handling
//   ✅ Loading states
// ============================================================

import { useState, useEffect } from "react";

// ============================================================
// 🔧 CONFIG
// Change this URL if your Flask runs on different port
// ============================================================
const API_URL = "http://localhost:5000";

// ============================================================
// 🎨 GLOBAL STYLES
// ============================================================
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
    :root {
      --pink:    #ff4da6;
      --purple:  #c084fc;
      --dark:    #0f0720;
      --card-bg: rgba(255,255,255,0.06);
      --border:  rgba(255,255,255,0.1);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; }

    @keyframes float {
      0%,100% { transform: translateY(0px) scale(1); opacity: 0.3; }
      50%      { transform: translateY(-20px) scale(1.2); opacity: 0.7; }
    }
    @keyframes spin    { to { transform: rotate(360deg); } }
    @keyframes fadeUp  {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes shimmer {
      0%   { background-position: 0% center; }
      100% { background-position: 200% center; }
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes glowPulse {
      0%,100% { box-shadow: 0 0 20px rgba(255,77,166,0.3); }
      50%      { box-shadow: 0 0 40px rgba(255,77,166,0.7); }
    }
    .nav-link:hover     { color: var(--pink) !important; }
    .nav-link           { transition: color 0.2s ease; }
    .product-card:hover { transform: translateY(-8px) scale(1.02) !important; box-shadow: 0 24px 48px rgba(0,0,0,0.5) !important; }
    .product-card       { transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
    .upload-btn:hover   { transform: scale(1.06); filter: brightness(1.1); }
    .upload-btn         { transition: all 0.25s ease; }
    .find-btn:hover     { transform: scale(1.04); box-shadow: 0 0 32px rgba(255,77,166,0.6) !important; }
    .find-btn           { transition: all 0.25s ease; }
    .ham-line           { transition: all 0.3s ease; }
    .mob-link:hover     { background: rgba(255,77,166,0.15) !important; color: var(--pink) !important; }
    .mob-link           { transition: all 0.2s ease; }
  `}</style>
);

// ============================================================
// 🧭 NAVBAR COMPONENT
// ============================================================
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const navLinks = [
    { label: "Home",      emoji: "🏠" },
    { label: "Trending",  emoji: "🔥" },
    { label: "My Styles", emoji: "✨" },
  ];

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      backdropFilter: "blur(16px)",
      background: "rgba(15,7,32,0.85)",
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 20px", maxWidth: 1100, margin: "0 auto",
      }}>
        {/* LOGO */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 44, height: 44,
            background: "linear-gradient(135deg, #ff4da6, #a855f7)",
            borderRadius: 14, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", gap: 1,
            boxShadow: "0 4px 20px rgba(255,77,166,0.5)",
          }}>
            <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "'Playfair Display', serif", letterSpacing: 1 }}>FRS</span>
            <span style={{ fontSize: 7, color: "rgba(255,255,255,0.75)", letterSpacing: 1 }}>✦✦✦</span>
          </div>
          <div>
            <h1 style={{
              fontSize: 16, fontWeight: 700,
              fontFamily: "'Playfair Display', serif",
              background: "linear-gradient(135deg, #ff6eb4, #c084fc)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Fashion Recommendation</h1>
            <p style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: 2 }}>SYSTEM • AI POWERED</p>
          </div>
        </div>

        {/* DESKTOP NAV */}
        {!isMobile && (
          <nav style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {navLinks.map(({ label }) => (
              <span key={label} className="nav-link" style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", cursor: "pointer", fontWeight: 500 }}>{label}</span>
            ))}
            <button style={{
              background: "linear-gradient(135deg, var(--pink), var(--purple))",
              border: "none", color: "#fff", padding: "9px 22px",
              borderRadius: 22, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>Sign In</button>
          </nav>
        )}

        {/* HAMBURGER */}
        {isMobile && (
          <button onClick={() => setMenuOpen(!menuOpen)} style={{
            background: "rgba(255,255,255,0.07)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "9px 11px", cursor: "pointer",
            display: "flex", flexDirection: "column", gap: 5,
          }}>
            <span className="ham-line" style={{ display: "block", width: 22, height: 2, background: menuOpen ? "#ff6eb4" : "#fff", borderRadius: 2, transform: menuOpen ? "rotate(45deg) translate(5px,5px)" : "none" }}/>
            <span className="ham-line" style={{ display: "block", width: 22, height: 2, background: menuOpen ? "transparent" : "#fff", borderRadius: 2 }}/>
            <span className="ham-line" style={{ display: "block", width: 22, height: 2, background: menuOpen ? "#ff6eb4" : "#fff", borderRadius: 2, transform: menuOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }}/>
          </button>
        )}
      </div>

      {/* MOBILE MENU */}
      {isMobile && menuOpen && (
        <div style={{ animation: "slideDown 0.3s ease", borderTop: "1px solid var(--border)", padding: "8px 16px 16px", background: "rgba(15,7,32,0.97)" }}>
          {navLinks.map(({ label, emoji }) => (
            <div key={label} className="mob-link" onClick={() => setMenuOpen(false)} style={{ padding: "13px 16px", color: "rgba(255,255,255,0.8)", cursor: "pointer", fontSize: 15, borderRadius: 10, fontWeight: 500, display: "flex", alignItems: "center", gap: 10 }}>
              <span>{emoji}</span><span>{label}</span>
            </div>
          ))}
          <button style={{ width: "100%", marginTop: 8, background: "linear-gradient(135deg, var(--pink), var(--purple))", border: "none", color: "#fff", padding: 13, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            👤 Sign In
          </button>
        </div>
      )}
    </header>
  );
}

// ============================================================
// 🌟 HERO COMPONENT
// ============================================================
function Hero() {
  return (
    <div style={{ textAlign: "center", padding: "52px 24px 36px", animation: "fadeUp 0.8s ease" }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: "rgba(255,77,166,0.12)", border: "1px solid rgba(255,77,166,0.3)",
        padding: "6px 16px", borderRadius: 20, fontSize: 12, color: "#ff9dd0",
        marginBottom: 20, letterSpacing: 1,
      }}>✦ FASHION RECOMMENDATION SYSTEM</div>

      <h2 style={{ fontSize: "clamp(28px, 6vw, 52px)", fontFamily: "'Playfair Display', serif", fontWeight: 700, lineHeight: 1.15, color: "#fff", marginBottom: 12 }}>
        Discover Fashion
        <span style={{ display: "block", background: "linear-gradient(135deg, #ff6eb4 0%, #c084fc 50%, #60a5fa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "200% auto", animation: "shimmer 3s linear infinite" }}> Made For You ✨</span>
      </h2>

      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, maxWidth: 500, margin: "0 auto" }}>
        Upload any clothing image — our deep learning model instantly recommends visually similar fashion
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: "clamp(16px, 4vw, 40px)", marginTop: 28, flexWrap: "wrap" }}>
        {[{ value: "50K+", label: "Products" }, { value: "98%", label: "Accuracy" }, { value: "< 2s", label: "Results" }].map(({ value, label }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: "#ff6eb4", margin: 0 }}>{value}</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0, letterSpacing: 1 }}>{label.toUpperCase()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 📤 UPLOAD BOX COMPONENT
// NOW: stores the actual File object (not just preview URL)
// so we can send it to the Flask backend
// ============================================================
function UploadBox({ preview, onUpload, onFind, loading }) {
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    // Pass both preview URL and actual File to parent
    const reader = new FileReader();
    reader.onloadend = () => onUpload(reader.result, file); // ← send file too!
    reader.readAsDataURL(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); processFile(e.dataTransfer.files[0]); }}
      style={{
        border: `2px dashed ${isDragging ? "#ff4da6" : "rgba(255,255,255,0.18)"}`,
        borderRadius: 24, padding: "clamp(24px, 5vw, 44px)",
        textAlign: "center",
        background: isDragging ? "rgba(255,77,166,0.08)" : "rgba(255,255,255,0.04)",
        backdropFilter: "blur(12px)", transition: "all 0.3s ease",
        marginBottom: 28,
        animation: isDragging ? "glowPulse 1s infinite" : "none",
      }}
    >
      {!preview ? (
        <div style={{ animation: "fadeUp 0.6s ease" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>📸</div>
          <p style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 6 }}>Drop your clothing image here</p>
          <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: 24, fontSize: 14 }}>Supports JPG, PNG, WEBP • Max 10MB</p>
          <label className="upload-btn" style={{ cursor: "pointer", background: "linear-gradient(135deg, var(--pink), var(--purple))", padding: "13px 32px", borderRadius: 50, fontSize: 15, fontWeight: 600, display: "inline-block", color: "#fff" }}>
            📂 Choose Image
            <input type="file" accept="image/*" onChange={(e) => processFile(e.target.files[0])} style={{ display: "none" }} />
          </label>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(16px, 4vw, 36px)", flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 0.5s ease" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <img src={preview} alt="Uploaded" style={{ width: 150, height: 150, objectFit: "cover", borderRadius: 18, border: "3px solid #ff6eb4", boxShadow: "0 0 32px rgba(255,110,180,0.45)" }} />
            <div style={{ position: "absolute", top: -8, right: -8, background: "#22c55e", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: "bold", boxShadow: "0 2px 8px rgba(34,197,94,0.5)" }}>✓</div>
          </div>
          <div style={{ textAlign: "left" }}>
            <p style={{ color: "#86efac", fontWeight: 600, marginBottom: 6, fontSize: 15 }}>✅ Image Ready!</p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 20, maxWidth: 240 }}>Click below to let AI find matching fashion items</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="find-btn" onClick={onFind} disabled={loading} style={{ background: loading ? "rgba(255,255,255,0.15)" : "linear-gradient(135deg, var(--pink), var(--purple))", border: "none", color: "#fff", padding: "13px 28px", borderRadius: 50, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? "⏳ Analyzing..." : "🔍 Find Similar Items"}
              </button>
              <label style={{ cursor: "pointer", background: "rgba(255,255,255,0.08)", border: "1px solid var(--border)", color: "rgba(255,255,255,0.7)", padding: "13px 20px", borderRadius: 50, fontSize: 13 }}>
                🔄 Change
                <input type="file" accept="image/*" onChange={(e) => processFile(e.target.files[0])} style={{ display: "none" }} />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ⏳ LOADING SPINNER
// ============================================================
function LoadingSpinner() {
  return (
    <div style={{ textAlign: "center", padding: "48px 0", animation: "fadeUp 0.4s ease" }}>
      <div style={{ width: 56, height: 56, border: "4px solid rgba(255,77,166,0.2)", borderTop: "4px solid #ff4da6", borderRadius: "50%", margin: "0 auto 20px", animation: "spin 0.9s linear infinite" }}/>
      <p style={{ color: "#ff9dd0", fontWeight: 600, fontSize: 16, marginBottom: 6 }}>AI is analyzing your image...</p>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Searching 50,000+ products for the best matches ✨</p>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff4da6", animation: `float 1.2s ease-in-out ${i * 0.2}s infinite` }}/>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 🛍️ PRODUCT CARD - NOW SHOWS REAL IMAGES FROM BACKEND
// ============================================================
function ProductCard({ imageUrl, index }) {
  const [isWished, setIsWished]   = useState(false);
  const [isAdded, setIsAdded]     = useState(false);
  const [imgError, setImgError]   = useState(false);

  const handleAddToCart = () => {
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="product-card" style={{
      background: "var(--card-bg)", borderRadius: 20,
      overflow: "hidden", border: "1px solid var(--border)",
      cursor: "pointer",
      animation: `fadeUp 0.5s ease ${index * 0.07}s both`,
    }}>
      {/* REAL PRODUCT IMAGE from Flask backend */}
      <div style={{ height: 200, position: "relative", background: "rgba(255,255,255,0.03)", overflow: "hidden" }}>
        {!imgError ? (
          <img
            src={`${API_URL}${imageUrl}`}  // ← Full URL: http://localhost:5000/images/xxx.jpg
            alt={`Fashion item ${index + 1}`}
            onError={() => setImgError(true)}  // If image fails to load
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }}
          />
        ) : (
          // Fallback if image fails
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>
            👗
          </div>
        )}

        {/* Match badge */}
        <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(34,197,94,0.85)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
          ✓ Match {index + 1}
        </div>

        {/* Wishlist button */}
        <button onClick={(e) => { e.stopPropagation(); setIsWished(!isWished); }} style={{ position: "absolute", top: 10, right: 10, background: isWished ? "rgba(255,77,166,0.9)" : "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, transition: "all 0.2s ease" }}>
          {isWished ? "❤️" : "🤍"}
        </button>
      </div>

      {/* PRODUCT INFO */}
      <div style={{ padding: "14px 14px 16px" }}>
        <p style={{ fontWeight: 600, fontSize: 13, color: "#fff", marginBottom: 10 }}>
          Similar Fashion Item
        </p>
        <button onClick={handleAddToCart} style={{ width: "100%", background: isAdded ? "rgba(34,197,94,0.2)" : "linear-gradient(135deg, var(--pink), var(--purple))", border: isAdded ? "1px solid #22c55e" : "none", color: isAdded ? "#86efac" : "#fff", padding: "9px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease" }}>
          {isAdded ? "✅ Added!" : "🛒 Add to Cart"}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// ❌ ERROR BOX
// Shows when API call fails
// ============================================================
function ErrorBox({ message, onRetry }) {
  return (
    <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 16, padding: 24, textAlign: "center", animation: "fadeUp 0.4s ease" }}>
      <p style={{ fontSize: 32, marginBottom: 12 }}>⚠️</p>
      <p style={{ color: "#fca5a5", fontWeight: 600, marginBottom: 8 }}>Something went wrong</p>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 16 }}>{message}</p>
      <button onClick={onRetry} style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", padding: "10px 24px", borderRadius: 10, cursor: "pointer", fontSize: 14 }}>
        🔄 Try Again
      </button>
    </div>
  );
}

// ============================================================
// 🎯 RESULTS COMPONENT - SHOWS REAL IMAGES
// ============================================================
function Results({ recommendations }) {
  return (
    <div style={{ animation: "fadeUp 0.5s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: 0 }}>✨ Recommended For You</h3>
        <span style={{ background: "rgba(255,77,166,0.15)", border: "1px solid rgba(255,77,166,0.3)", padding: "5px 14px", borderRadius: 20, fontSize: 12, color: "#ff9dd0" }}>
          {recommendations.length} items found
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
        {recommendations.map((item, index) => (
          <ProductCard
            key={index}
            imageUrl={item.image_url}  // ← real image URL from Flask
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 🦶 FOOTER
// ============================================================
function Footer() {
  return (
    <footer style={{ marginTop: 64, borderTop: "1px solid var(--border)", padding: "28px 24px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #ff4da6, #a855f7)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#fff", fontFamily: "'Playfair Display', serif", letterSpacing: 0.5 }}>FRS</div>
        <span style={{ fontFamily: "'Playfair Display', serif", color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: 15 }}>Fashion Recommendation System</span>
      </div>
      <p>Built with React + Flask + TensorFlow • ResNet50 Deep Learning ✨</p>
      <p style={{ marginTop: 4 }}>© 2026 Fashion Recommendation System. All rights reserved.</p>
    </footer>
  );
}

// ============================================================
// 🏠 MAIN APP COMPONENT
// THIS IS WHERE REACT TALKS TO FLASK BACKEND
// ============================================================
export default function App() {
  const [preview, setPreview]               = useState(null);   // image preview URL
  const [imageFile, setImageFile]           = useState(null);   // actual File object
  const [loading, setLoading]               = useState(false);  // API loading state
  const [recommendations, setRecommendations] = useState([]);  // API results
  const [error, setError]                   = useState(null);   // error message
  const [backendStatus, setBackendStatus]   = useState(null);   // is Flask running?

  // Set page title
  useEffect(() => { document.title = "Fashion Recommendation System"; }, []);

  // Check if Flask backend is running when app loads
  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then(res => res.json())
      .then(data => setBackendStatus('online'))
      .catch(() => setBackendStatus('offline'));
  }, []);

  // Called when user selects an image
  // Gets both the preview URL and the actual File object
  const handleUpload = (previewUrl, file) => {
    setPreview(previewUrl);
    setImageFile(file);        // ← save File for API call
    setRecommendations([]);
    setError(null);
  };

  // ============================================================
  // 🔥 MAIN API CALL FUNCTION
  // This sends the image to Flask and gets recommendations back
  // ============================================================
  const handleFind = async () => {
    if (!imageFile) return;

    setLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      // FormData = way to send files over HTTP
      // Like filling out a form with a file attachment
      const formData = new FormData();
      formData.append('image', imageFile);  // 'image' matches Flask's request.files['image']

      // Send POST request to Flask backend
      const response = await fetch(`${API_URL}/recommend`, {
        method: 'POST',
        body: formData,
        // NOTE: Don't set Content-Type header!
        // Browser sets it automatically with correct boundary for FormData
      });

      // Parse JSON response from Flask
      const data = await response.json();

      if (!response.ok) {
        // Flask returned an error (4xx or 5xx status)
        throw new Error(data.error || 'Server error');
      }

      if (data.success) {
        // ✅ Got recommendations! Update state to show results
        setRecommendations(data.recommendations);
      } else {
        throw new Error('No recommendations returned');
      }

    } catch (err) {
      // Handle different error types
      if (err.message.includes('fetch')) {
        setError('Cannot connect to backend. Make sure Flask is running on port 5000!');
      } else {
        setError(err.message);
      }
    } finally {
      // Always runs — whether success or error
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "linear-gradient(160deg, #0f0720 0%, #1e0d3e 50%, #0f0720 100%)", color: "#fff", position: "relative" }}>
      <GlobalStyles />

      {/* Background dots */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", width: (i % 3 + 2) + "px", height: (i % 3 + 2) + "px", background: i % 2 === 0 ? "rgba(255,77,166,0.4)" : "rgba(192,132,252,0.3)", borderRadius: "50%", top: (i * 17 % 100) + "%", left: (i * 23 % 100) + "%", animation: `float ${3 + (i % 3)}s ease-in-out ${i * 0.3}s infinite` }}/>
        ))}
      </div>

      {/* Backend status banner */}
      {backendStatus === 'offline' && (
        <div style={{ background: "rgba(239,68,68,0.15)", borderBottom: "1px solid rgba(239,68,68,0.3)", padding: "10px 20px", textAlign: "center", fontSize: 13, color: "#fca5a5", position: "relative", zIndex: 50 }}>
          ⚠️ Flask backend is offline — Start it with <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 8px", borderRadius: 4 }}>python app.py</code>
        </div>
      )}
      {backendStatus === 'online' && (
        <div style={{ background: "rgba(34,197,94,0.1)", borderBottom: "1px solid rgba(34,197,94,0.2)", padding: "8px 20px", textAlign: "center", fontSize: 13, color: "#86efac", position: "relative", zIndex: 50 }}>
          ✅ AI Backend Connected — Ready to recommend!
        </div>
      )}

      {/* ALL COMPONENTS */}
      <Navbar />

      <main style={{ position: "relative", zIndex: 10, maxWidth: 960, margin: "0 auto", padding: "0 16px 40px" }}>
        <Hero />

        <UploadBox
          preview={preview}
          onUpload={handleUpload}
          onFind={handleFind}
          loading={loading}
        />

        {loading && <LoadingSpinner />}

        {error && (
          <ErrorBox
            message={error}
            onRetry={() => setError(null)}
          />
        )}

        {recommendations.length > 0 && (
          <Results recommendations={recommendations} />
        )}
      </main>

      <Footer />
    </div>
  );
}
