const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get active ads (for non-PRO users)
exports.getActiveAds = async (req, res, next) => {
  try {
    const now = new Date();
    const activeAds = await prisma.advertisement.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now }
      }
    });
    res.json(activeAds);
  } catch (error) {
    next(error);
  }
};

// Admin: Get all ads
exports.getAllAds = async (req, res, next) => {
  try {
    const ads = await prisma.advertisement.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(ads);
  } catch (error) {
    next(error);
  }
};

// Admin: Create an ad
exports.createAd = async (req, res, next) => {
  try {
    const { description, images, ownerEmail, startDate, endDate, isActive } = req.body;
    
    if (!description || !images || !ownerEmail || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newAd = await prisma.advertisement.create({
      data: {
        description,
        images,
        ownerEmail,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? isActive : true
      }
    });

    res.status(201).json(newAd);
  } catch (error) {
    next(error);
  }
};

// Admin: Update an ad
exports.updateAd = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { description, images, ownerEmail, startDate, endDate, isActive } = req.body;

    const updatedAd = await prisma.advertisement.update({
      where: { id: parseInt(id) },
      data: {
        ...(description && { description }),
        ...(images && { images }),
        ...(ownerEmail && { ownerEmail }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json(updatedAd);
  } catch (error) {
    next(error);
  }
};

// Admin: Delete an ad
exports.deleteAd = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.advertisement.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Ad deleted successfully' });
  } catch (error) {
    next(error);
  }
};
