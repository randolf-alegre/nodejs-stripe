const { StripeValidator } = require('./stripeValidation');

exports.Stripe = class {
    constructor(args){
        try {
            StripeValidator.validate(args);
        } catch (error) {
            throw error;
        }

        this.publishableKey = args.publishableKey,
        this.keySecret = args.secretKey,
        this.stripe = require("stripe")(this.keySecret, {
            timeout: 10000,
            maxNetworkRetries: 2
        });
    }

    async addCustomer(paymentMethodId, userDetails) {
        try {
            const customer = await this.stripe.customers.create(
                {
                    email: userDetails.email,
                    payment_method: paymentMethodId,
                    invoice_settings: {
                        default_payment_method: paymentMethodId
                    },
                    address: {
                        line1:          userDetails.shippingDetails.address_line1,
                        city:           userDetails.shippingDetails.city,
                        country:        userDetails.shippingDetails.country,
                        postal_code:    userDetails.shippingDetails.postal_code,
                        state:          userDetails.shippingDetails.state,
                    }
                }
            );

            return customer;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async fetchCustomerIfExist(email){
        try {
            const customer = await this.stripe.customers.list({
                limit: 1,
                email: email
            });

            if(customer.data.length){
                return customer.data[0];
            }else{
                return null;
            }
            
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async addCardToCustomer(customerId, paymentMethodId) {
        try {
            const pm = await this.stripe.paymentMethods.attach(
                paymentMethodId,
                {
                    customer: customerId
                });
            
            const customerInfo = {
                invoice_settings: {
                    default_payment_method: pm.id
                }
            }
            const customerCard = await this.updateCustomerInformation(customerId, customerInfo);
            
            if(customerCard){
                return pm;
            }

        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async updateCustomerInformation(customerId, customerInfo){
        try {
            const customer = await this.stripe.customers.update(customerId, customerInfo);
            return customer;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async attachPaymentToCustomersCard(customerId, paymentIntent) {
        try {
            const attachPayment = await this.stripe.paymentMethods.attach(
                    paymentIntent.payment_method,
                    {
                        customer: customerId
                    }
                );
            return attachPayment;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async settleCustomerPayment(customerId, paymentMethodId, subscription){
        try {
            const attachPayment = await this.stripe.paymentMethods.attach(
                paymentMethodId, {
                    customer: customerId
                }
            ); 
            
            const invoiceSettings = {
                invoice_settings: {
                    default_payment_method: attachPayment.id
                }
            }

            const customerUpdatedCardSource = await this.updateCustomerInformation(customerId, invoiceSettings);

            if(customerUpdatedCardSource){
                return await this.stripe.invoices.pay(subscription.latest_invoice.id, {
                    expand: ['payment_intent']
                });
            }else{
                throw new Error('Not able to process updated payment.');
            }

        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async createNewSubscriptionToCustomer(customer, planQuantity){
        const COMPANY_PLAN = process.env.SUBSCRIPTION_PLAN;
        try {
            const subscription = await this.stripe.create({
                customer: customer.id,
                items: [{
                    plan: COMPANY_PLAN,
                    quantity: planQuantity
                }],
                expand: ["latest_invoice.payment_intent"]
            });
            return subscription;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async listOfPaymentMethods(customerId){
        try {
            return await this.stripe.paymentMethods.list(
                {
                    customer: customerId,
                    type: 'card'
                }
            );
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}

