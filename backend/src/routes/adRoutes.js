const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public or Authenticated (non-admin) route to get active ads
router.get('/active', authMiddleware, adController.getActiveAds);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, adController.getAllAds);
router.get('/:id', authMiddleware, adminMiddleware, adController.getAdById);
router.post('/', authMiddleware, adminMiddleware, adController.createAd);
router.put('/:id', authMiddleware, adminMiddleware, adController.updateAd);
router.delete('/:id', authMiddleware, adminMiddleware, adController.deleteAd);

module.exports = router;
