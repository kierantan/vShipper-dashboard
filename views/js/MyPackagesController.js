var PHOTO_PRICE_PER_PACKAGE = 2;
var token = TH_TokenCheckFromQueryAndCookie();

updateQueries();
// Request Photos Tooltip
$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();
});

$("#addMore").click(function () {
    redirect("/packages/new");
});


var app = angular.module('vshipper', []);
app.controller('MyPackagesController', function ($scope, $http) {

    $scope.sendPackages = function() {
        try {
            trySaveSelectedPackagesAndRedirect($scope.packagesInCountry);
        }
        catch (err) {
            alert(err);
        }
    };

    $scope.consolidate = function() {
        try {
            tryShowConsolidateUI($scope.packagesInCountry);
        }
        catch (err) {
            showConsolidateErrorUI(err);
        }
    };

    $scope.requestPhotos = function() {
        try {
            tryShowRequestPhotosUI($scope);
        }
        catch (err) {
            showRequestPhotosErrorUI($scope, err);
        }
    };

    $scope.sendPhotoRequest = function() {
        var packagesInCountry = $scope.packagesInCountry[tryGetCurrentCountry()];
        var selectedPackagesInReadyStatus = getSelectedPackagesInReadyStatus(packagesInCountry);
        promisePostPhotoRequests($http, selectedPackagesInReadyStatus)
            .then((res) => {
                assertPhotoRequestsAllReceived(res);
                getAllPackagesAndUpdateUI($scope, $http);
            })
            .catch((err) => {
                alert(err.message);
            });
    };

    $scope.sendConsolidationRequest = function() {
        var packagesInCountry = $scope.packagesInCountry[tryGetCurrentCountry()];
        var selectedPackagesInReadyStatus = getSelectedPackagesInReadyStatus(packagesInCountry);
        promisePostConsolidationRequest($http, $scope.consolidatedPackageName, selectedPackagesInReadyStatus)
            .then((res) => {
                console.log(res.data);
                getAllPackagesAndUpdateUI($scope, $http);
            })
            .catch((err) => {
                alert(err.message);
            })
    };

    getAllPackagesAndUpdateUI($scope, $http);
});

function getAllPackagesAndUpdateUI(scope, http) {
    return getAllPackagesAPIWithPromise(http)
        .then((res) => {
            var packages = processAllPackagesAPIResponse(res.data);
            scope.countries = getCountriesOfPackages(packages).sort();
            scope.packagesInCountry = getPackagesSortedByCountries(packages, http);
            scope.consolidatedPackageName = "New Package";
        })
        .catch((err) => {
            console.log(err);
            scope.countries = [];
            scope.packagesInCountry = {};
        });
}

function getAllPackagesAPIWithPromise(http) {
    var req = {
        method: "GET",
        url: "http://localhost:3000/packages",
        headers: {
            "Content-Type": "application/json",
            token: token
        }
    };
    return http(req);
}

function processAllPackagesAPIResponse(allPackagesRes) {
    var processedPackages = [];
    allPackagesRes.forEach((package) => {
        var processedPackage = package;
        processedPackage.arrivalDate = getPackageArrivalDate(package);
        processedPackage.id = package._id;
        processedPackage.selected = false;
        processedPackage.orderId = null;
        processedPackages.push(processedPackage);
    });
    return processedPackages;
}

function getPackageArrivalDate(packageDataFromAPI) {
    return (packageDataFromAPI.shipmentReceiveStatus) ? (packageDataFromAPI.shipmentReceiveDate) : "Not Arrived";
}

function getCountriesOfPackages(packages) {
    var countries = [];
    packages.forEach(function (package) {
        if (package.country && !countries.includes(package.country)) {
            countries.push(package.country);
        }
    });
    return countries;
}

function getPackagesSortedByCountries(packages, http) {
    var packagesInCountry = {};
    var uniqueCountries = [];
    packages.forEach(function (package) {
        if (package.country && !uniqueCountries.includes(package.country)) {
            packagesInCountry[package.country] = [];
            uniqueCountries.push(package.country);
        }
        if(package.status === "PENDING_PAYMENT"){
            createPaymentShortCutforPendingPayment(http, package.id)
                .then(order=>{
                    console.log(order);
                    package.orderId = order._id;
            });
        }
        packagesInCountry[package.country].push(package);
    });
    return packagesInCountry;
}

function trySaveSelectedPackagesAndRedirect(packagesInCountry) {
    var country = tryGetCurrentCountry();
    var packagesArrayOfCountry = packagesInCountry[country];

    if (selectedPackagesNotReady(packagesArrayOfCountry)) {
        throw "You can only send packages that are in ready status";
    }
    else if (getNumberOfSelectedPackagesInReadyStatus(packagesArrayOfCountry) < 1) {
        throw "You must select at least 1 package";
    }
    else {
        saveSelectedPackagesToSessionStorage(packagesArrayOfCountry);
        redirect("/packages/review");
    }
}

function selectedPackagesNotReady(packagesArrayOfCountry) {
    return packagesArrayOfCountry.filter((package)=>package.selected && package.status !== "READY").length >= 1;
}

function saveSelectedPackagesToSessionStorage(packagesArrayOfCountry) {
    var selectedPackages = packagesArrayOfCountry.filter(package => package.selected);
    sessionStorage.setItem("selectedPackagesToSend", angular.toJson(selectedPackages));
}

function tryShowConsolidateUI(packagesInCountry) {
    var country = tryGetCurrentCountry();
    assertSelectedPackagesAllInReadyStatus(packagesInCountry[country]);
    trySelectedEnoughPackagesForConsolidation(packagesInCountry[country]);
    $("#consolidationMessage").text(getConsolidateUISuccessMessage());
    $("#consolidationInputs").show();
    enableButtonWithId("sendConsolidationRequest");
}

function showConsolidateErrorUI(err) {
    $("#consolidationMessage").text(err);
    $("#consolidationInputs").hide();
    disableButtonWithId("sendConsolidationRequest");
}

function tryShowRequestPhotosUI(scope) {
    var country = tryGetCurrentCountry();
    var packagesArrayOfCountry = scope.packagesInCountry[country];
    assertSelectedPackagesAllInReadyStatus(packagesArrayOfCountry);
    trySelectedEnoughPackagesForPhotos(packagesArrayOfCountry);
    scope.photosQuote = PHOTO_PRICE_PER_PACKAGE * getNumberOfSelectedPackagesInReadyStatus(packagesArrayOfCountry);
    $("#requestPhotoBody").text(getRequestPhotosSuccessMessage());
    enableButtonWithId("confirmRequestPhotos");
}

function showRequestPhotosErrorUI(scope, err) {
    scope.photosQuote = 0;
    $("#requestPhotoBody").text(err);
    disableButtonWithId("confirmRequestPhotos");
}

function tryGetCurrentCountry() {
    var selectedTabText = $("#countriesTabs .active").html();
    return tryExtractCountryName(selectedTabText);
}

function tryExtractCountryName(selectedTabText) {
    var matched = selectedTabText.match(/\s*([\w\s]+)\s\(\d+\)/);
    if (matched.length !== 2) {
        throw "Country name is invalid!";
    }
    return matched[1].replace(/\n/g, "").replace(/^\s+|\s+$/g, '');
}

function trySelectedEnoughPackagesForConsolidation(packages) {
    if (getNumberOfSelectedPackagesInReadyStatus(packages) <= 1) {
        throw "You must select at least 2 packages to consolidate";
    }
}

function trySelectedEnoughPackagesForPhotos(packages) {
    if (getNumberOfSelectedPackagesInReadyStatus(packages) <= 0) {
        throw "You must select at least 1 package to request photos";
    }
}

function getSelectedPackagesInReadyStatus(packagesArrayOfCountry) {
    return packagesArrayOfCountry.filter(package => package.selected && package.status === "READY");
}

function getNumberOfSelectedPackagesInReadyStatus(packagesArrayOfCountry) {
    return getSelectedPackagesInReadyStatus(packagesArrayOfCountry).length;
}

function assertSelectedPackagesAllInReadyStatus(packagesArrayOfCountry) {
    var firstSelectedPackageNotInReadyStatus = packagesArrayOfCountry.find(package => package.selected && package.status !== "READY");
    if (firstSelectedPackageNotInReadyStatus) {
        throw "Please select packages in READY status"
    }
}

function getConsolidateUISuccessMessage() {
    return "Once submitted, your request will show as “Consolidation Requested” under the “My Packages”. Once we finish consolidating your package, you will have a button “Pay Consolidation Charges”. After successful payment you will be able see your new consolidated package information, and ship your package.";
}

function getRequestPhotosSuccessMessage() {
    return "Photos are completed within 24 business hours after you make your request.";
}

function promisePostPhotoRequests(http, packages) {
    var promises = [];
    packages.forEach((package) => {
        var req = {
            method: "POST",
            url: `http://localhost:3000/packages/${package.id}/photos`,
            headers: {
                token: token
            }
        };
        promises.push(http(req));
    });
    return Promise.all(promises);
}

function promisePostConsolidationRequest(http, packageName, packages) {
    var packagesToBeConsolidated = [];
    packages.forEach(function(package) {
        packagesToBeConsolidated.push(package.id);
    });
    var req = {
        method: "POST",
        url: `http://localhost:3000/packages/packageId/consolidate`,
        headers: {
            "Content-Type": "application/json",
            token: token
        },
        data: {
            packagesToBeConsolidated: packagesToBeConsolidated,
            consolidatedPackageName: packageName
        }
    };

    return http(req);
}

function assertPhotoRequestsAllReceived(postPhotoRequestsRes) {
    console.dir(postPhotoRequestsRes);
}

function createPaymentShortCutforPendingPayment(http, packageId){
    return getOrdersWithPackageId(http, packageId)
        .then((res) => {
            return res.data[0];
        })
        .catch((err) => {
            console.log(err);
        });
}
function getOrdersWithPackageId(http, packageId){
    var req = {
        method: "GET",
        url: `http://localhost:3000/orders?packageId=`+ packageId,
        headers: {
            "Content-Type": "application/json",
            token: token
        },
    };

    return http(req);
}

function disableButtonWithId(buttonId) {
    var button = $(`#${buttonId}`);
    button.addClass("disabled");
    button.prop("disabled", true);
}

function enableButtonWithId(buttonId) {
    var button = $(`#${buttonId}`);
    button.removeClass("disabled");
    button.prop("disabled", false);
}
