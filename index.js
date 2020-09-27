const { Stripe } = require('./stripe');
// You should provide Publishable Key and Secret key
// Check your stripe account for these details.

console.log(new Stripe({publishableKey: '123', keySecret: '123'}));