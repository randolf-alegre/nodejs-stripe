# nodejs-stripe
Stripe payment integration with NodeJS

Available methods for integrate Stripe with NodeJS.

Methods:
* addCustomer
  params: paymentMethodId, userDetails (shipping address included).

* fetchCustomerIfExist
  params: email (customer email)

* addCardToCustomer
  params: customerId, paymentMethodId
  
* updateCustomerInformation
  params: customerId, customerInfo
  
* attachPaymentToCustomersCard
  params: customerId, paymentIntent (payment intent Object)
  
* settleCustomerPayment
  params: customerId, paymentMethodId, subscription
  
* createNewSubscriptionToCustomer
  params: customer (customer Object), planQuantity
  
* listOfPaymentMethods
  params: customerId
