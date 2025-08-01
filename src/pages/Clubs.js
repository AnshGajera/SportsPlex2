import React, { useState } from 'react';
import { Search, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Clubs = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAuth();
  const [clubForm, setClubForm] = useState({
    name: '',
    description: '',
    category: '',
    image: null,
    imagePreview: null,
  });

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files && files[0]) {
      setClubForm((prev) => ({
        ...prev,
        image: files[0],
        imagePreview: URL.createObjectURL(files[0]),
      }));
    } else {
      setClubForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveImage = () => {
    setClubForm((prev) => ({ ...prev, image: null, imagePreview: null }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Here you would handle the form submission to backend
    alert('Club created! (UI only, no backend logic)');
  };

  const clubs = [
    // Add sample clubs here if needed
  ];

  const myClubs = [
    // Add user's clubs here if needed
  ];

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title">Sports Clubs</h1>
        <p className="page-subtitle">
          {activeTab === 'browse' ? 'Discover and join sports clubs' : (currentUser && currentUser.role === 'admin' ? 'Create a new club for the system' : 'Manage clubs and memberships')}
        </p>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          Browse Clubs
        </button>
        <button 
          className={`tab ${activeTab === 'my-clubs' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-clubs')}
        >
          {currentUser && currentUser.role === 'admin' ? 'Create Club' : 'My Clubs'}
        </button>
      </div>

      {activeTab === 'browse' && (
        <div>
          <div style={{ marginBottom: '32px' }}>
<<<<<<< HEAD
            <div className="search-bar">
              <Search size={20} className="search-icon" />
=======
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f7fafc',
              borderRadius: '8px',
              border: 'none',
              padding: '8px 16px',
              width: '100%',
              maxWidth: '340px',
              boxShadow: 'none',
              position: 'relative'
            }}>
              <Search size={28} color="#9ca3af" style={{ marginRight: '8px', flexShrink: 0 }} />
>>>>>>> f0e00accaa838fe3d084eb54df2a35fc129ac6e7
              <input
                type="text"
                placeholder="Search clubs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
<<<<<<< HEAD
=======
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: '#9ca3af',
                  fontSize: '1.25rem',
                  width: '100%',
                  fontWeight: 500,
                  paddingLeft: 0
                }}
>>>>>>> f0e00accaa838fe3d084eb54df2a35fc129ac6e7
              />
            </div>
          </div>

          <div className="empty-state">
            <Users size={64} className="empty-state-icon" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
              No clubs available
            </h3>
            <p style={{ marginBottom: '24px' }}>
              No sports clubs are currently available. Check back later or contact administrator.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'my-clubs' && (
        <div>
          {currentUser && currentUser.role === 'admin' ? (
            <div className="card" style={{ maxWidth: 600, margin: '0 auto', padding: 0, background: '#f6f8fa', borderRadius: 16, boxShadow: '0 2px 12px #0001', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#e0e7ff', color: '#3730a3', padding: '16px 20px 10px 20px', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                <Users size={26} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, letterSpacing: 0.2 }}>Create a New Club</h3>
              </div>
              <div style={{ borderBottom: '1px solid #e5e7eb', margin: '0 20px' }} />
              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'row', gap: 24, padding: 20, alignItems: 'flex-start', justifyContent: 'center' }}>
                {/* Text fields section */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 5, fontWeight: 500, color: '#475569', fontSize: 14 }}>Club Name</label>
                    <input type="text" className="input" name="name" value={clubForm.name} onChange={handleFormChange} placeholder="Enter club name" required style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid #e0e7ef', fontSize: 15, outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 5, fontWeight: 500, color: '#475569', fontSize: 14 }}>Description</label>
                    <textarea className="input" name="description" value={clubForm.description} onChange={handleFormChange} placeholder="Enter club description" required style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid #e0e7ef', fontSize: 15, minHeight: 50, outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 5, fontWeight: 500, color: '#475569', fontSize: 14 }}>Category</label>
                    <input type="text" className="input" name="category" value={clubForm.category} onChange={handleFormChange} placeholder="e.g. Football, Cricket, Chess" required style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid #e0e7ef', fontSize: 15, outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }} />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{
                    background: '#10b981',
                    color: 'white',
                    fontWeight: 500,
                    fontSize: 14,
                    borderRadius: 999,
                    padding: '7px 22px',
                    marginTop: 14,
                    boxShadow: '0 1px 4px #10b98122',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    display: 'inline-block',
                  }}
                    onMouseOver={e => e.currentTarget.style.background = '#059669'}
                    onMouseOut={e => e.currentTarget.style.background = '#10b981'}
                  >Create Club</button>
                </div>
                {/* Image upload/preview section */}
                <div style={{ flex: '0 0 140px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <label style={{ fontWeight: 500, color: '#475569', fontSize: 14, marginBottom: 5 }}>Club Image</label>
                  {/* Custom file input */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <label htmlFor="club-image-upload" style={{
                      background: '#e0e7ff',
                      color: '#3730a3',
                      padding: '7px 18px',
                      borderRadius: 7,
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: 'pointer',
                      boxShadow: '0 1px 4px #e0e7ff55',
                      border: 'none',
                      marginBottom: 6,
                      display: 'inline-block',
                      transition: 'background 0.2s',
                    }}
                      onMouseOver={e => e.currentTarget.style.background = '#c7d2fe'}
                      onMouseOut={e => e.currentTarget.style.background = '#e0e7ff'}
                    >Choose Image</label>
                    <input
                      id="club-image-upload"
                      type="file"
                      className="input"
                      name="image"
                      accept="image/*"
                      onChange={handleFormChange}
                      style={{ display: 'none' }}
                    />
                    {clubForm.image && (
                      <span style={{ fontSize: 12, color: '#64748b', marginTop: 2, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', textAlign: 'center' }}>{clubForm.image.name}</span>
                    )}
                  </div>
                  {clubForm.imagePreview && (
                    <div style={{ marginTop: 4, display: 'flex', justifyContent: 'center', position: 'relative', width: 110, height: 110 }}>
                      <img src={clubForm.imagePreview} alt="Preview" style={{ maxWidth: 110, maxHeight: 110, borderRadius: 10, boxShadow: '0 1px 6px #e0e7ff55', border: '1.5px solid #3b82f6', background: '#fff', width: 110, height: 110, objectFit: 'cover' }} />
                      <button type="button" onClick={handleRemoveImage} aria-label="Remove image" style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        background: '#fff',
                        color: '#3b82f6',
                        border: 'none',
                        borderRadius: '50%',
                        width: 22,
                        height: 22,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16,
                        fontWeight: 700,
                        boxShadow: '0 1px 4px #e0e7ff55',
                        cursor: 'pointer',
                        zIndex: 2,
                        transition: 'background 0.2s',
                      }}
                        onMouseOver={e => e.currentTarget.style.background = '#e0e7ff'}
                        onMouseOut={e => e.currentTarget.style.background = '#fff'}
                      >×</button>
                    </div>
                  )}
                </div>
              </form>
            </div>
          ) : (
            myClubs.length === 0 ? (
            <div className="empty-state">
              <Users size={64} className="empty-state-icon" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                No clubs joined
              </h3>
              <p style={{ marginBottom: '24px' }}>
                You haven't joined any clubs yet. Browse available clubs to get started.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => setActiveTab('browse')}
              >
                Browse Clubs
              </button>
            </div>
          ) : (
            <div className="grid grid-3">
              {myClubs.map((club, index) => (
                <div key={index} className="card">
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    backgroundColor: '#f1f5f9',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                  }}>
                    <Users size={24} color="#64748b" />
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '8px' }}>
                    {club.name}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
                    {club.description}
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    fontSize: '14px',
                    color: '#64748b'
                  }}>
                    <span>{club.members} members</span>
                    <span>Joined {club.joinedDate}</span>
                  </div>
                </div>
              ))}
            </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Clubs;