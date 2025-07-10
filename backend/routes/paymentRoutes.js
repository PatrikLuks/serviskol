// Základ integrace platební brány (např. Stripe)
const express = require('express');
const router = express.Router();
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const auth = require('../middleware/auth');

// Vytvoření platebního záměru
// router.post('/stripe/create-payment-intent', auth, async (req, res) => {
//   const { amount, currency } = req.body;
//   try {
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount,
//       currency: currency || 'czk',
//       metadata: { userId: req.user.id }
//     });
//     res.json({ clientSecret: paymentIntent.client_secret });
//   } catch (err) {
//     res.status(500).json({ msg: 'Chyba při vytváření platby.' });
//   }
// });

module.exports = router;
