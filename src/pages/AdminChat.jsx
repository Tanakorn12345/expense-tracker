import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';
import { MessageSquare, ArrowLeft, Send } from 'lucide-react';
import { io } from 'socket.io-client';
import Layout from '../components/Layout';

const AdminChat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [socket, setSocket] = useState(null);
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const admin = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (admin.email !== 'tanakorn.tip@student.mahidol.edu') {
      navigate('/');
      return;
    }

    fetchUsers();

    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5002', {
      withCredentials: true
    });

    newSocket.on('connect', () => {
      newSocket.emit('join', admin.id);
    });

    newSocket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      // Also update the latest message in the user list
      setUsers((prevUsers) => {
        return prevUsers.map(u => {
          if (u.id === msg.senderId || u.id === msg.receiverId) {
            return {
              ...u,
              lastMessage: msg.content,
              lastMessageAt: msg.createdAt,
              unreadCount: msg.senderId === u.id && selectedUser?.id !== u.id ? (u.unreadCount || 0) + 1 : u.unreadCount
            };
          }
          return u;
        }).sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
      });
    });

    newSocket.on('user_status_change', (data) => {
      setUsers((prevUsers) => prevUsers.map(u => {
        if (u.id === data.userId) {
          return { ...u, isOnline: data.isOnline, lastSeen: data.lastSeen };
        }
        return u;
      }));
      if (selectedUser?.id === data.userId) {
        setSelectedUser(prev => ({ ...prev, isOnline: data.isOnline, lastSeen: data.lastSeen }));
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [navigate]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
      // mark as read
      fetchWithAuth('/api/chat/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: selectedUser.id })
      }).then(() => {
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, unreadCount: 0 } : u));
      });
    }
  }, [selectedUser]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchUsers = async () => {
    try {
      const res = await fetchWithAuth('/api/chat/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await fetchWithAuth(`/api/chat/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim() || !socket || !selectedUser) return;

    socket.emit('send_message', {
      senderId: admin.id,
      receiverId: selectedUser.id,
      content: inputValue
    });
    setInputValue('');
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastSeen = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return language === 'th' ? 'เมื่อสักครู่' : 'Just now';
    if (diffMins < 60) return language === 'th' ? `${diffMins} นาทีที่แล้ว` : `${diffMins} mins ago`;
    if (diffHours < 24) return language === 'th' ? `${diffHours} ชั่วโมงที่แล้ว` : `${diffHours} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <Layout>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', paddingBottom: '20px' }}>
        <div className="flex items-center gap-4 mb-6">
          <button className="btn btn-outline" onClick={() => navigate('/admin')}>
            <ArrowLeft size={18} /> {language === 'th' ? 'กลับ' : 'Back'}
          </button>
          <h2>{language === 'th' ? 'แชทกับผู้ใช้' : 'User Chats'}</h2>
        </div>

        <div style={{ display: 'flex', flex: 1, backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          {/* User List Sidebar */}
          <div style={{ width: '300px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>
              {language === 'th' ? 'กล่องข้อความ' : 'Inbox'}
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {users.map(u => (
                <div 
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  style={{ 
                    padding: '16px', 
                    borderBottom: '1px solid var(--border)', 
                    cursor: 'pointer',
                    backgroundColor: selectedUser?.id === u.id ? '#f8fafc' : 'white',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = selectedUser?.id === u.id ? '#f8fafc' : 'white'}
                >
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-main)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {u.profilePic ? <img src={u.profilePic} style={{width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover'}}/> : u.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', borderRadius: '50%', backgroundColor: u.isOnline ? '#10b981' : '#9ca3af', border: '2px solid white' }} />
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: selectedUser?.id === u.id ? 600 : 500 }}>{u.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatTime(u.lastMessageAt)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                        {u.lastMessage || (language === 'th' ? 'ไม่มีข้อความ' : 'No messages')}
                      </span>
                      {u.unreadCount > 0 && (
                        <div style={{ backgroundColor: 'var(--danger)', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px' }}>
                          {u.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  {language === 'th' ? 'ยังไม่มีผู้ใช้' : 'No users found'}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
            {selectedUser ? (
              <>
                <div style={{ padding: '16px 24px', backgroundColor: 'white', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-main)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {selectedUser.profilePic ? <img src={selectedUser.profilePic} style={{width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover'}}/> : selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{selectedUser.name}</div>
                    <div style={{ fontSize: '0.85rem', color: selectedUser.isOnline ? '#10b981' : 'var(--text-muted)' }}>
                      {selectedUser.isOnline ? (language === 'th' ? 'ออนไลน์' : 'Online') : (language === 'th' ? `ใช้งานล่าสุด: ${formatLastSeen(selectedUser.lastSeen)}` : `Last seen: ${formatLastSeen(selectedUser.lastSeen)}`)}
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {messages.map((msg, i) => {
                    const isMe = msg.senderId === admin.id;
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                        <div style={{ 
                          maxWidth: '70%', 
                          padding: '12px 16px', 
                          borderRadius: '16px', 
                          backgroundColor: isMe ? 'var(--primary-main)' : 'white', 
                          color: isMe ? 'white' : 'var(--text-main)', 
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          borderBottomRightRadius: isMe ? '4px' : '16px',
                          borderBottomLeftRadius: !isMe ? '4px' : '16px'
                        }}>
                          {msg.content}
                          <div style={{ fontSize: '0.7rem', opacity: 0.7, textAlign: 'right', marginTop: '4px' }}>
                            {formatTime(msg.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div style={{ padding: '20px', backgroundColor: 'white', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={language === 'th' ? 'พิมพ์ข้อความ...' : 'Type a message...'}
                    style={{ flex: 1, padding: '12px 16px', border: '1px solid var(--border)', borderRadius: '24px', outline: 'none' }}
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    style={{ background: 'var(--primary-main)', color: 'white', border: 'none', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inputValue.trim() ? 'pointer' : 'not-allowed', opacity: inputValue.trim() ? 1 : 0.6 }}
                  >
                    <Send size={20} style={{ marginLeft: '2px' }} />
                  </button>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                <h3>{language === 'th' ? 'เลือกผู้ใช้เพื่อเริ่มแชท' : 'Select a user to start chatting'}</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminChat;
