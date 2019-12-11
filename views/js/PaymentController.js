var token = TH_TokenCheckFromQueryAndCookie();

updateQueries();

var app = angular.module('vshipper', []);
app.controller('PaymentController', function ($scope, $http) {
    $scope.quote = {
        deliveryCharges: 0,
        shippingCharges: 0,
        consolidation: 0,
        photos: 0,
        insurance: 0,
        tax: 0,
        discount: 0,
        total: 0
    };

    promiseGetOrders($http)
        .then((res) => {
            findOrderAndUpdateQuote($scope, res.data);
            generatePaypalButtonAndAddToPage($http, $scope.quote.total);
        })
        .catch((err) => {
            alert(err.message);
            removeQuery("orderId");
            redirect("/packages");
        });
});

function generatePaypalButtonAndAddToPage(http, amount) {
    paypal.Buttons({
            createOrder: function (data, actions) {
                // Set up the transaction
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: amount
                        }
                    }]
                });
            },
            onApprove: function (data, actions) {
                return actions.order.capture().then(function(details) {
                    //alert('Transaction completed by ' + details.payer.name.given_name);
                    // Call your server to save the transaction
                    var orderId = getOrderIdFromQuery();
                    return promisePayForOrder(http, orderId, data.orderID)
                        .then((res) => {
                            assertPaymentReceived(res.data);
                            removeQuery("orderId");
                            redirect("/packages/send/success");
                        })
                        .catch((err) => {
                            alert(err.message);
                        });
                });
            },
            onCancel: function (data, actions) {
                console.dir(data);
                console.dir(actions);
            },
            onError: function (data, actions) {
                console.dir(data);
                console.dir(actions);
            }
        }
    ).render('#paypal-button-container');
}

function findOrderAndUpdateQuote(scope, orderResponse) {
    var orderId = getOrderIdFromQuery();
    var unpaidOrder = tryFindSpecificUnpaidOrder(orderResponse, orderId);
    generateQuote(scope, unpaidOrder.cost);
}

function promiseGetOrders(http) {
    var req = {
        method: "GET",
        url: "http://localhost:3000/orders",
        headers: {
            token: token
        }
    };
    return http(req);
}

function getOrderIdFromQuery() {
    return getQuery("orderId");
}

function tryFindSpecificUnpaidOrder(orders, orderId) {
    if (!orderId) {
        throw new Error("No orderId is given");
    }
    var specificUnpaidOrder = orders.find((order) => (order._id === orderId) && (!order.paymentStatus));
    if (!specificUnpaidOrder) {
        throw new Error("No unpaid order that matches orderId is found");
    }
    return specificUnpaidOrder;
}

function promisePayForOrder(http, orderId, paypalId) {
    // TODO: Save PaypalID
    var req = {
        method: "POST",
        url: `http://localhost:3000/orders/${orderId}/payment`,
        headers: {
            token: token,
            "Content-Type": "application/json"
        },
        data: {
            paypalId: paypalId
        }
    };
    return http(req);
}

function assertPaymentReceived(postPaymentRes) {
    if (postPaymentRes.message !== "Order is completed. Delivery has been scheduled.") {
        throw new Error("Payment not completed for order");
    }
}

function generateQuote(scope, cost) {
    scope.quote = cost;
    scope.quote.discount = 0;
    scope.quote.total = scope.quote.shippingCharges + scope.quote.deliveryCharges + scope.quote.insurance + scope.quote.photos + scope.quote.consolidation - scope.quote.discount;
}