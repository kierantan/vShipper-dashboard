var token = TH_TokenCheckFromQueryAndCookie();

updateQueries();

var app = angular.module('vshipper', []);
app.controller('ViewPackageController', function ($scope, $http) {
    callGetPackageAPIPromise($http)
        .then((res) => {
            $scope.package = processGetPackageResponse(res.data);
        })
        .catch((err) => {
            console.log(err);
        });
});

function callGetPackageAPIPromise(http) {
    var packageId = getPackageIdFromPath();
    var req = {
        method: "GET",
        url: `http://localhost:3000/packages/${packageId}`,
        headers: {
            token: token
        }
    };
    return http(req);
}

function getPackageIdFromPath() {
    var pathArray = location.pathname.split("/");
    return pathArray[pathArray.length - 1];
}

function processGetPackageResponse(package) {
    return {
        id: package._id,
        logisticsProvider: package.logisticProvider,
        itemName: package.itemName,
        arrivalDate: getPackageArrivalDate(package),
        receivingCountry: package.country,
        trackingURL: package.trackingURL,
        eCommerceProvider: package.eCommerceProvider,
        logisticProvider: package.logisticProvider,
        courierTrackingId: package.courierTrackingId,
        declaredValue: package.declaredValue,
        remark: package.remark
    };
}

function getPackageArrivalDate(packageDataFromAPI) {
    return (packageDataFromAPI.shipmentReceiveStatus) ? (packageDataFromAPI.shipmentReceiveDate) : "Not Arrived";
}