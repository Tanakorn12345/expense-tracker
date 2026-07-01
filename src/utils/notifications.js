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
};
