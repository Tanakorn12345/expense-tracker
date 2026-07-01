import Swal from 'sweetalert2';

export const notifyUser = (user, text, type = 'info') => {
  if (!user) return;
  const key = `notifications_${user.id}`;
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  const newNotif = {
    id: Date.now(),
    text,
    type,
    time: new Date().toISOString(),
    read: false
  };
  localStorage.setItem(key, JSON.stringify([newNotif, ...existing]));
  window.dispatchEvent(new Event('notifications_updated'));

  // Show a toast notification
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: type === 'transaction' ? 'success' : 'info',
    title: text,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
};
