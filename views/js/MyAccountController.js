var app = angular.module('vshipper', []);
var userToken = TH_TokenCheckFromQueryAndCookie();
var globalScope;
var globalHttp;

const pageSize = 3;

app.controller('MyAccountController', function ($scope, $http) {
    globalScope = $scope;
    globalHttp = $http;

    globalScope.actualAddresses = [];
    globalScope.actualAddressesInEachPage = [];
    globalScope.virtualAddresses = [];
    globalScope.pageNumber = 0;
    globalScope.account = {};

    setAccount();
    setActualAddresses();
    setVirtualAddresses();

    $scope.clickAddressPage = function (pageNumber) {
        $scope.pageNumber = pageNumber;
    };

    $scope.nextAddressPage = function () {
        $scope.pageNumber += 1;
    };

    $scope.prevAddressPage = function () {
        $scope.pageNumber -= 1;
    };
});

function setAccount() {
    globalHttp({
        method: 'GET',
        url: 'http://localhost:3000/account',
        headers: {token: userToken}
    })
        .then((account) => {
            globalScope.account = account.data;
        })
        .catch((err) => {
            console.log(err);
        });
}

function setActualAddresses() {
    globalHttp({
        method: 'GET',
        url: 'http://localhost:3000/account/addresses/actual',
        headers: {token: userToken}
    })
        .then((actualAddresses) => {
            globalScope.actualAddresses = actualAddresses.data;
            var nPages = Math.ceil(globalScope.actualAddresses.length / pageSize);
            for (var i = 0; i < nPages; i++) {
                var startingIndex = i * pageSize;
                var endIndex = Math.min(i * pageSize + pageSize, globalScope.actualAddresses.length);
                var addressesInCurrentPage = globalScope.actualAddresses.slice(startingIndex, endIndex);
                globalScope.actualAddressesInEachPage.push(addressesInCurrentPage);
            }
        })
        .catch((err) => {
            console.log(err);
        })
}

function setVirtualAddresses() {
    globalHttp({
        method: "GET",
        url: 'http://localhost:3000/account',
        headers: {
            token: userToken
        }
    })
        .then(function (response) {
            globalScope.virtualAddresses = getVirtualAddressesMockup();
        })
        .catch((err) => {
            console.log(err);
        });
}

function getVirtualAddressesMockup() {
    return [
        {
            country: "India",
            Name: "John Doe",
            Address: "Oberoi Mall General AK Vidya Marg 3rd Floor, Goregaon East",
            city: "Mumbai",
            State: "Maharashtra",
            zipCode: "400063",
            Phone: "90744580484"
        },
        {
            country: "USA",
            Name: "John Doe",
            Address: "1656 Union Street Eureka Riverside Drive Redding",
            city: "Sacramento",
            State: "CA",
            zipCode: "96001",
            Phone: "2025550133"
        },
        {
            country: "Dubai",
            Name: "John Doe",
            Address: "87 Jumerah, Sheikh Zayed Rd Sheikh Khalifa Bin Saeed Street",
            city: " Dubai",
            zipCode: "3625",
            Phone: "90744580484"
        }
    ];
}