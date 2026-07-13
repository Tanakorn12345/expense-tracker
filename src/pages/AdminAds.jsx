import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Trash2, Plus, Megaphone, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Layout from '../components/Layout';
import Swal from 'sweetalert2';

export default function AdminAds() {
  const [ads, setAds] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const navigate = useNavigate();

  // New Ad Form State
  const [showForm, setShowForm] = useState(false);
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchAds();
    fetchUsers();
  }, []);

  const fetchAds = async () => {
    try {
      const res = await fetchWithAuth('/api/ads');
      if (res.ok) {
        const data = await res.json();
        setAds(data);
      }
    } catch (error) {
      console.error('Failed to fetch ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetchWithAuth('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      return Swal.fire('Error', 'Please upload at least one image', 'error');
    }

    try {
      const res = await fetchWithAuth('/api/ads', {
        method: 'POST',
        body: JSON.stringify({
          description,
          images,
          ownerEmail,
          startDate,
          endDate
        })
      });

      if (res.ok) {
        Swal.fire('Success', 'Ad created successfully', 'success');
        setShowForm(false);
        setImages([]);
        setDescription('');
        setOwnerEmail('');
        setStartDate('');
        setEndDate('');
        fetchAds();
      } else {
        const data = await res.json();
        Swal.fire('Error', data.error || 'Failed to create ad', 'error');
      }
    } catch (error) {
      console.error('Create ad error:', error);
      Swal.fire('Error', 'Server error', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetchWithAuth(`/api/ads/${id}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          Swal.fire('Deleted!', 'Ad has been deleted.', 'success');
          fetchAds();
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to delete', 'error');
      }
    }
  };

  const toggleStatus = async (ad) => {
    try {
      const res = await fetchWithAuth(`/api/ads/${ad.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !ad.isActive })
      });
      if (res.ok) fetchAds();
    } catch (error) {
      console.error('Toggle status error', error);
    }
  };

  return (
    <Layout>
      <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => navigate('/admin')} className="btn btn-outline" style={{ padding: '0.5rem' }}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1>{language === 'th' ? 'จัดการโฆษณา' : 'Ad Management'}</h1>
              <p style={{ color: 'var(--text-muted)' }}>Create and manage popup advertisements</p>
            </div>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {showForm ? <ArrowLeft size={18} /> : <Plus size={18} />}
            {showForm ? (language === 'th' ? 'กลับ' : 'Back') : (language === 'th' ? 'เพิ่มโฆษณา' : 'Add Ad')}
          </button>
        </div>

        {showForm ? (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h2>{language === 'th' ? 'สร้างโฆษณาใหม่' : 'Create New Ad'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Images (Upload multiple)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleImageUpload}
                  className="form-control"
                />
                {images.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                    {images.map((img, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={img} alt={`upload-${i}`} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                        <button 
                          type="button" 
                          onClick={() => removeImage(i)}
                          style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', borderRadius: '50%', width: '20px', height: '20px', border: 'none', cursor: 'pointer' }}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                <textarea 
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-control"
                  rows="3"
                ></textarea>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Owner (Select User)</label>
                <select 
                  required
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  className="form-control"
                >
                  <option value="">-- Select Owner --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.email}>{u.email} ({u.name || 'No Name'})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Start Date</label>
                  <input type="datetime-local" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-control" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>End Date</label>
                  <input type="datetime-local" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-control" />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Save Advertisement
              </button>
            </form>
          </div>
        ) : (
          <div className="card">
            {loading ? <p>Loading...</p> : ads.length === 0 ? <p>No ads found.</p> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      <th style={{ padding: '1rem' }}>Image</th>
                      <th style={{ padding: '1rem' }}>Description</th>
                      <th style={{ padding: '1rem' }}>Owner</th>
                      <th style={{ padding: '1rem' }}>Duration</th>
                      <th style={{ padding: '1rem' }}>Status</th>
                      <th style={{ padding: '1rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ads.map(ad => (
                      <tr key={ad.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem' }}>
                          {ad.images && ad.images.length > 0 ? (
                            <img src={ad.images[0]} alt="ad" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                          ) : <ImageIcon size={24} />}
                        </td>
                        <td style={{ padding: '1rem', maxWidth: '200px' }}>
                          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ad.description}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>{ad.ownerEmail}</td>
                        <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                          {new Date(ad.startDate).toLocaleDateString()} - <br/>
                          {new Date(ad.endDate).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <button 
                            onClick={() => toggleStatus(ad)}
                            className="btn" 
                            style={{ 
                              padding: '0.25rem 0.5rem', 
                              fontSize: '0.8rem',
                              backgroundColor: ad.isActive ? 'var(--success)' : 'var(--text-muted)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            {ad.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <button 
                            onClick={() => handleDelete(ad.id)}
                            className="btn" 
                            style={{ color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
