var token = TH_TokenCheckFromQueryAndCookie();
updateQueries();

$("#placeOrderError").hide();

var app = angular.module('vshipper', []);
app.controller('DeliveryController', function ($scope, $http) {
    try {
        $scope.orderItems = tryGetOrderItems();
        $scope.promoCodes = getPromoCodes();
        $scope.shippingMethod = "";
        $scope.deliveryAddress = "";
        $scope.deliveryMethod = "";
        $scope.insurance = {
            selected: false
        };
        $scope.quote = {
            photos: 0,
            consolidation: 0,
            shipping: 0,
            delivery: 0,
            tax: 0,
            insurance: 0,
            discount: 0,
            total: 0
        };

        getActualAddressesPromise($http)
            .then((res) => {
                $scope.actualAddresses = res.data;
            })
            .catch(err => {
                console.log(err);
            });
    }
    catch (err) {
        redirect("/packages");
    }

    $scope.updateQuote = function () {
        updateShippingQuote($scope);
        updateDeliveryQuote($scope);
        updateTaxQuote($scope);
        updateServiceQuote($scope);
        updateInsuranceQuote($scope);
        updateDiscount($scope);
        updateTotalQuote($scope);
    };

    $scope.returnToReviewCart = function () {
        redirect("/packages/review");
    };

    $scope.proceedToPayment = function () {
        try {
            validateOptionsThenPlaceOrder($http, {
                packages: $scope.orderItems,
                shippingMethod: $scope.shippingMethod,
                deliveryAddress: $scope.deliveryAddress,
                deliveryMethod: $scope.deliveryMethod,
                insurance: $scope.insurance
            });
        }
        catch (err) {
            showOrderError(err);
        }
    };

    $scope.applyPromoCode = function () {
        $scope.promoCodes.push(getPromoObjFromCode($scope.promoCodeInput));
        $scope.promoCodeInput = "";
        updateDiscount($scope);
        updateTotalQuote($scope);
    };
});

function tryGetOrderItems() {
    var selectedPackagesToOrder = sessionStorage.getItem("orderItem");
    if (selectedPackagesToOrder) {
        return JSON.parse(selectedPackagesToOrder);
    }
    else {
        throw new Error("No selected package in session");
    }
}

function getPromoCodes() {
    var promoCodes = sessionStorage.getItem("promoCodes");
    if (promoCodes) {
        return JSON.parse(promoCodes);
    }
}

function getActualAddressesPromise(http) {
    var req = {
        method: "GET",
        url: "http://localhost:3000/account/addresses/actual",
        headers: {
            token: token
        }
    };
    return http(req);
}

function validateOptionsThenPlaceOrder(http, orderOptions) {
    validateOrderOptions(orderOptions);
    postOrderPromise(http, orderOptions)
        .then((res) => {
            removeArtifactsFromSessionStorage();
            addOrderIdToQueryAndProceedToPayment(res.data);
        })
        .catch(err => {
            console.log(err);
        });
}

function postOrderPromise(http, orderOptions) {
    var req = {
        method: "POST",
        url: "http://localhost:3000/orders",
        headers: {
            "Content-Type": "application/json",
            token: token
        },
        data: {
            packages: orderOptions.packages.map((package)=>package.id),
            shipmentMethod: orderOptions.shippingMethod,
            address: orderOptions.deliveryAddress,
            deliveryMethod: orderOptions.deliveryMethod,
            insurance: orderOptions.insuranceSelected
        }
    };
    return http(req);
}

function validateOrderOptions(orderOptions) {
    if (!Array.isArray(orderOptions.packages) || orderOptions.packages.length <= 0) {
        throw new Error("Package error");
    }
    if (!orderOptions.shippingMethod) {
        throw new Error("Please select a shipping method");
    }
    if (!orderOptions.deliveryAddress) {
        throw new Error("Please select an address");
    }
    if (!orderOptions.deliveryMethod) {
        throw new Error("Please select a delivery method");
    }
}

function showOrderError(err) {
    $("#placeOrderError").text(err.message);
    $("#placeOrderError").show();
}

function removeArtifactsFromSessionStorage() {
    sessionStorage.removeItem("selectedPackagesToSend");
    sessionStorage.removeItem("orderItem");
}

function addOrderIdToQueryAndProceedToPayment(postOrderRes) {
    addQuery({
        orderId: postOrderRes.orderId
    });
    redirect("/packages/pay");
}

function updateShippingQuote(scope) {
    if (scope.shippingMethod === "standard") {
        scope.quote.shipping = aggregateCostForField(scope.orderItems, "standardShipping");
    }
    else if (scope.shippingMethod === "express") {
        scope.quote.shipping = aggregateCostForField(scope.orderItems, "expressShipping");
    }
    else {
        scope.quote.shipping = 0;
    }
}

function updateDeliveryQuote(scope) {
    if (scope.deliveryMethod === "door") {
        scope.quote.delivery = aggregateCostForField(scope.orderItems, "doorDelivery");
    }
    else if (scope.deliveryMethod === "pickup") {
        scope.quote.delivery = aggregateCostForField(scope.orderItems, "selfCollectDelivery");
    }
    else {
        scope.quote.delivery = 0;
    }
}

function updateTaxQuote(scope) {
    scope.quote.insurance = aggregateCostForField(scope.orderItems, "insurance");
}

function updateServiceQuote(scope) {
    scope.quote.photos = aggregateCostForField(scope.orderItems, "photos");
    scope.quote.consolidation = aggregateCostForField(scope.orderItems, "consolidation");
}

function updateInsuranceQuote(scope) {
    if (scope.insurance.selected) {
        scope.quote.insurance = aggregateCostForField(scope.orderItems, "insurance");
    }
    else {
        scope.quote.insurance = 0;
    }
}

function updateDiscount(scope) {
    scope.quote.discount = getDiscount(scope.promoCodes);
}

function updateTotalQuote(scope) {
    scope.quote.total = parseFloat(scope.quote.shipping + scope.quote.delivery + scope.quote.insurance + scope.quote.photos + scope.quote.consolidation - scope.quote.discount).toFixed(2);
}

function aggregateCostForField(orderItems, field) {
    return orderItems.reduce((accumulator, currentOrderItem) =>
        accumulator + (currentOrderItem.cost[field] ? currentOrderItem.cost[field] : 0), 0);
}

function getDiscount(promoCodes) {
    var accumulatedDiscount;
    if (promoCodes.length > 0) {
        accumulatedDiscount = promoCodes.reduce((accumulator, currentPromoCode) => accumulator + currentPromoCode.discountValue, 0);
    }
    else {
        accumulatedDiscount = 0;
    }
    return accumulatedDiscount;
}

function getPromoObjFromCode(promoCode) {
    return {
        code: promoCode,
        discountValue: promoCode.length
    };
}
