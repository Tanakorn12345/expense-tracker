const auditMiddleware = (req, res, next) => {
  res.on('finish', () => {
    // Skip OPTIONS and chat websocket polling for less noise
    if (req.method === 'OPTIONS' || req.originalUrl.includes('socket.io') || req.originalUrl.includes('/api/ads/active')) {
      return;
    }

    const status = res.statusCode;
    const method = req.method;
    const url = req.originalUrl;
    
    // Attempt to identify user
    let userStr = 'Guest';
    if (req.user) {
      userStr = `User ${req.user.id} (${req.user.email})`;
    } else if (req.body && req.body.email && url.includes('/login')) {
      userStr = `Login Attempt (${req.body.email})`;
    }

    // Map methods to readable actions
    let action = method;
    switch(method) {
      case 'GET': action = 'VIEWED'; break;
      case 'POST': action = 'CREATED/SUBMITTED'; break;
      case 'PUT': action = 'UPDATED'; break;
      case 'DELETE': action = 'DELETED'; break;
    }

    // Extract relevant payload data, filter out sensitive or huge fields
    let bodyStr = '';
    if (['POST', 'PUT'].includes(method) && req.body && Object.keys(req.body).length > 0) {
      const safeBody = { ...req.body };
      
      // Remove sensitive/large fields
      const hiddenFields = ['password', 'profilePic', 'images', 'customLogoUrl'];
      hiddenFields.forEach(field => {
        if (safeBody[field] !== undefined) {
          safeBody[field] = '[REDACTED]';
        }
      });
      
      bodyStr = ` | Data: ${JSON.stringify(safeBody)}`;
    }

    console.log(`[AUDIT] ${status} | ${action} ${url} | ${userStr}${bodyStr}`);
  });

  next();
};

module.exports = auditMiddleware;
