const { Router } = require('express');
const {
  addOffer,
  getAllOffers,
  getOfferById,
  updateOfferById,
  deleteOfferById,
} = require('../controllers/offer');
const auth = require('../middleware/authentication');

const offerRouter = Router();

offerRouter.post('/:taskId', auth, addOffer);
offerRouter.get('', getAllOffers);
offerRouter.get('/:id', getOfferById);
offerRouter.put('/:id', updateOfferById);
offerRouter.delete('/:id', deleteOfferById);

module.exports = offerRouter;
