const express = require('express');
const router = express.Router({ mergeParams: true });
const authenticateFirebaseToken = require('../../middleware/authMiddleware');
const handleValidationErrors = require('../../middleware/validationMiddleware');
const { handle } = require('../plan-shared/planHttp');
const v = require('./planBookingsValidators');
const service = require('./planBookingsService');

/**
 * POST create a booking (optionally from a decided poll)
 * @route POST /api/memories/:memoryId/plan/bookings
 * @returns 201 { item } | 400 BOOKING_TZ_REQUIRED, BOOKING_END_BEFORE_START,
 *          BOOKING_PAYER_NOT_IN_CREW, BOOKING_SOURCE_INVALID | 404
 */
router.post('/', authenticateFirebaseToken, v.validateCreateBooking, handleValidationErrors,
  handle('POST /plan/bookings', async (req, res) => {
    const item = await service.createBooking(req.user.uid, Number(req.params.memoryId), req.body);
    res.status(201).json({ item });
  }));

/**
 * PATCH booking details (any crew member). Delete via DELETE /plan/items/:itemId.
 * @route PATCH /api/memories/:memoryId/plan/bookings/:itemId
 * @returns 200 { item } | 400 | 404 BOOKING_NOT_FOUND
 */
router.patch('/:itemId', authenticateFirebaseToken, v.validateUpdateBooking, handleValidationErrors,
  handle('PATCH /plan/bookings/:itemId', async (req, res) => {
    const item = await service.updateBooking(
      req.user.uid, Number(req.params.memoryId), Number(req.params.itemId), req.body);
    res.json({ item });
  }));

module.exports = router;
