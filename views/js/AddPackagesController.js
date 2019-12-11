updateQueries();
var token = TH_TokenCheckFromQueryAndCookie();
var app = angular.module('vshipper', []);
app.controller('AddPackagesController', function ($scope, $http) {
    $scope.shippingDestinations = [
        {
            countryName: "India",
        }
    ];
    $scope.selectedDestination = "";

    $scope.packageData = {
        trackingId: "",
        trackingURL: "",
        ecommerceProvider: "",
        logisticsProvider: "",
        courierTrackingId: "",
        itemName: "",
        declaredValue: "",
        remark: ""
    };

    $scope.shippingDestinationsValid = function () {
        return $scope.selectedDestination !== "";
    };

    $scope.trackingURLValid = function () {
        return notEmptyString($scope.packageData.trackingURL);
    };

    $scope.ecommerceProviderValid = function () {
        return notEmptyString($scope.packageData.ecommerceProvider);
    };

    $scope.logisticsProviderValid = function () {
        return notEmptyString($scope.packageData.logisticsProvider);
    };

    $scope.courierTrackingIdValid = function () {
        return notEmptyString($scope.packageData.courierTrackingId);
    };

    $scope.itemNameValid = function () {
        return notEmptyString($scope.packageData.itemName);
    };

    $scope.declaredValueValid = function() {
        return ($scope.packageData.declaredValue > 0);
    };

    $scope.remarkValid = function () {
        return true;
    };

    $("#formSubmit").click(function () {
        showInvalidFields();
        if (allFieldsValid()) {
            var req = generatePostPackageReq($scope.packageData, $scope.selectedDestination);
            $http(req)
                .then((res) => {
                    redirect("/packages");
                })
                .catch((err) => {
                    console.log(err);
                });
        }
        else
        {
            showSubmitFailLog();
        }
    });

    $("#formCancel").click(function () {
        console.log("Cancelling");
        redirect("/packages");
    });
});

function notEmptyString(str) {
    return str !== "" && str !== null && str !== undefined;
}

function generatePostPackageReq(packageData, selectedDestination) {
    return {
        method: "POST",
        url: "http://localhost:3000/packages",
        headers: {
            "Content-Type": "application/json",
            token: token
        },
        data: {
            trackingURL: packageData.trackingURL,
            eCommerceProvider: packageData.ecommerceProvider,
            logisticProvider: packageData.logisticsProvider,
            courierTrackingId: packageData.courierTrackingId,
            itemName: packageData.itemName,
            country: selectedDestination,
            declaredValue: packageData.declaredValue,
            remark: packageData.remark
        }
    };
}

function showInvalidFields() {
    $("#addPackagesContainer").addClass("show-invalid");
}

function allFieldsValid() {
    return $(".show-invalid .invalid").length === 0;
}

function showSubmitFailLog() {
    var nInvalidInputs = $(".show-invalid .invalid").length;
    console.log(`${nInvalidInputs} input fields are failing.`);
}