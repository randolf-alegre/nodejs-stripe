const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');
const Joi  = JoiBase.extend(JoiDate);

const schema = Joi
.object()
.required()
.keys({
    publishableKey: Joi.string()
                    .required(),

    keySecret:      Joi.string()
                    .required()
})

class StripeValidator {
    
    static validate(args){
        return Joi.attempt(
            args,
            schema,
            'Failed parameter validation for Stripe constructor'
        );
    }
}

module.exports = { StripeValidator }