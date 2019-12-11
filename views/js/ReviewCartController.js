updateQueries();

var app = angular.module('vshipper', []);
app.controller('ReviewCartController', function ($scope, $http) {
    $scope.updateTotalQuote = function() {
        var quote = {};
        $scope.quote.consolidate = getTotalQuoteForSelectedField($scope.cart, "consolidation");
        $scope.quote.photo = getTotalQuoteForSelectedField($scope.cart, "photos");
        $scope.quote.discount = getDiscount($scope.promoCodes);
        $scope.quote.total = $scope.quote.consolidate + $scope.quote.photo - $scope.quote.discount;
    };

    $scope.applyPromoCode = function() {
        $scope.promoCodes.push(getPromoObjFromCode($scope.promoCodeInput));
        $scope.promoCodeInput = "";
        $scope.updateTotalQuote();
    };

    $scope.proceedToSelectDelivery = function() {
        if (getNumberOfSelectedCartItems($scope.cart) <= 0) {
            console.log("You must select at least 1 item to proceed.");
        }
        else
        {
            saveSelectedCartItems($scope.cart);
            savePromoCodes($scope.promoCodes);
            redirect("/packages/delivery");
        }
    };

    try {
        $scope.cart = tryGetCartItems();
        $scope.promoCodes = [];
        $scope.quote = {};
        $scope.promoCodeInput = "";
        $scope.updateTotalQuote();
    }
    catch (err) {
        redirect("/packages");
    }
});

function tryGetCartItems() {
    var selectedPackagesToSend = sessionStorage.getItem("selectedPackagesToSend");
    if (selectedPackagesToSend)
    {
        return JSON.parse(selectedPackagesToSend);
    }
    else
    {
        throw "No selected package in session";
    }
}

function saveSelectedCartItems(cart) {
    var selectedCartItems = cart.filter((item)=>item.selected);
    sessionStorage.setItem("orderItem", angular.toJson(selectedCartItems));
}

function savePromoCodes(codes) {
    sessionStorage.setItem("promoCodes", angular.toJson(codes));
}

function getNumberOfSelectedCartItems(cart) {
    return cart.filter((item)=>item.selected).length;
}

function getTotalQuoteForSelectedField(cart, fieldName) {
    return cart.filter(item => item.selected).reduce((accumulator, currentItem) => accumulator + currentItem.cost[fieldName], 0);
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

