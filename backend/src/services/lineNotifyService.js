const axios = require('axios');

const lineNotifyService = {
  sendNotification: async (token, message) => {
    if (!token) return false;
    try {
      const params = new URLSearchParams();
      params.append('message', message);
      
      await axios.post('https://notify-api.line.me/api/notify', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${token}`
        }
      });
      return true;
    } catch (error) {
      console.error('LINE Notify Error:', error.response?.data || error.message);
      return false;
    }
  }
};

module.exports = lineNotifyService;
