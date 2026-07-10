import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Trash2, Edit, Plus, Eye, Check, X } from 'lucide-react';
import Layout from '../components/Layout';
import Swal from 'sweetalert2';
import '../index.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.email !== 'tanakorn.tip@student.mahidol.edu') {
      navigate('/');
    } else {
      loadUsers();
    }
  }, [navigate]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth('/api/admin/users');
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users', error);
      Swal.fire('Error', 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    const result = await Swal.fire({
      title: language === 'th' ? `ลบผู้ใช้ ${name}?` : `Delete ${name}?`,
      text: language === 'th' ? 'ข้อมูลธุรกรรมทั้งหมดของผู้ใช้นี้จะถูกลบด้วย (ไม่สามารถกู้คืนได้)' : 'All transactions for this user will also be deleted (irreversible)',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: language === 'th' ? 'ยืนยันการลบ' : 'Yes, delete',
      cancelButtonText: language === 'th' ? 'ยกเลิก' : 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await fetchWithAuth(`/api/admin/users/${id}`, { method: 'DELETE' });
        Swal.fire('Deleted!', 'User deleted successfully.', 'success');
        loadUsers();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete user', 'error');
      }
    }
  };

  const handleEditUser = async (user) => {
    const { value: formValues } = await Swal.fire({
      title: language === 'th' ? 'แก้ไขผู้ใช้' : 'Edit User',
      html: `
        <div style="text-align: left;">
          <label style="display:block; margin-bottom: 5px;">Name:</label>
          <input id="swal-input1" class="swal2-input" value="${user.name || ''}" placeholder="Name">
          
          <label style="display:block; margin-top: 15px; margin-bottom: 5px;">Email:</label>
          <input id="swal-input2" class="swal2-input" value="${user.email}" placeholder="Email">
          
          <label style="display:flex; align-items:center; margin-top: 15px; cursor: pointer;">
            <input type="checkbox" id="swal-input3" style="margin-right: 10px; width: 20px; height: 20px;" ${user.isPro ? 'checked' : ''}>
            Is Pro User
          </label>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const name = document.getElementById('swal-input1').value;
        const email = document.getElementById('swal-input2').value;
        const isPro = document.getElementById('swal-input3').checked;
        if (!email) {
          Swal.showValidationMessage('Email is required');
        }
        return { name, email, isPro };
      }
    });

    if (formValues) {
      try {
        await fetchWithAuth(`/api/admin/users/${user.id}`, {
          method: 'PUT',
          body: JSON.stringify(formValues)
        });
        Swal.fire('Saved!', 'User updated successfully.', 'success');
        loadUsers();
      } catch (error) {
        Swal.fire('Error', error.message || 'Failed to update user', 'error');
      }
    }
  };

  const handleCreateUser = async () => {
    const { value: formValues } = await Swal.fire({
      title: language === 'th' ? 'สร้างผู้ใช้ใหม่' : 'Create User',
      html: `
        <div style="text-align: left;">
          <input id="swal-create1" class="swal2-input" placeholder="Name">
          <input id="swal-create2" class="swal2-input" placeholder="Email (required)">
          <input type="password" id="swal-create3" class="swal2-input" placeholder="Password (required)">
          <label style="display:flex; align-items:center; margin-top: 15px; margin-left: 5px; cursor: pointer;">
            <input type="checkbox" id="swal-create4" style="margin-right: 10px; width: 20px; height: 20px;">
            Is Pro User
          </label>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const name = document.getElementById('swal-create1').value;
        const email = document.getElementById('swal-create2').value;
        const password = document.getElementById('swal-create3').value;
        const isPro = document.getElementById('swal-create4').checked;
        
        if (!email || !password) {
          Swal.showValidationMessage('Email and Password are required');
        }
        return { name, email, password, isPro };
      }
    });

    if (formValues) {
      try {
        await fetchWithAuth(`/api/admin/users`, {
          method: 'POST',
          body: JSON.stringify(formValues)
        });
        Swal.fire('Created!', 'User created successfully.', 'success');
        loadUsers();
      } catch (error) {
        Swal.fire('Error', error.message || 'Failed to create user', 'error');
      }
    }
  };

  return (
    <Layout>
      <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
        <div className="header-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1>{language === 'th' ? 'แอดมิน แดชบอร์ด' : 'Admin Dashboard'}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{language === 'th' ? 'จัดการผู้ใช้และดูภาพรวมของระบบ' : 'Manage users and system overview'}</p>
        </div>
        <button onClick={handleCreateUser} className="upgrade-btn" style={{ background: 'var(--primary-main)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} />
          {language === 'th' ? 'เพิ่มผู้ใช้' : 'Add User'}
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading users...</div>
        ) : (
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 500 }}>ID</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 500 }}>Name</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 500 }}>Email</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 500 }}>Pro</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 500 }}>Balance (฿)</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }} className="table-row-hover">
                    <td style={{ padding: '16px' }}>{u.id}</td>
                    <td style={{ padding: '16px', fontWeight: 500 }}>{u.name || '-'}</td>
                    <td style={{ padding: '16px' }}>{u.email}</td>
                    <td style={{ padding: '16px' }}>
                      {u.isPro ? <Check size={18} color="var(--success)" /> : <X size={18} color="var(--text-muted)" />}
                    </td>
                    <td style={{ padding: '16px', color: u.balance >= 0 ? 'var(--income)' : 'var(--expense)', fontWeight: 'bold' }}>
                      ฿{u.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => navigate(`/admin/users/${u.id}`)}
                          style={{ background: 'var(--bg-hover)', color: 'var(--primary-main)', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                          title="View Transactions"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleEditUser(u)}
                          style={{ background: 'var(--bg-hover)', color: 'var(--text-main)', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                          title="Edit User"
                        >
                          <Edit size={18} />
                        </button>
                        {u.email !== 'tanakorn.tip@student.mahidol.edu' && (
                          <button 
                            onClick={() => handleDeleteUser(u.id, u.name || u.email)}
                            style={{ background: 'var(--bg-hover-danger)', color: 'var(--danger)', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Delete User"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .table-row-hover:hover {
          background-color: var(--bg-hover);
        }
      `}} />
    </div>
    </Layout>
  );
};

export default AdminDashboard;
