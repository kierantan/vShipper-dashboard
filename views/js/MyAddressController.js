var app = angular.module('vshipper', []);


var userToken = TH_TokenCheckFromQueryAndCookie();
var form = document.getElementById("add-address-form");
app.controller('MyAddressController', function ($scope, $http) {
    //hardcoded function
    $scope.addAddress = function addAddress() {
        var data = {
            name: $scope.firstname + $scope.lastname,
            street: $scope.address1 +$scope.address2,
            country: $scope.country,
            city: $scope.city,
            zipCode: $scope.pincode,
            phone: $scope.phone,
            email: $scope.email
        };
        $http({
            method: 'POST',
            url: 'http://localhost:3000/account/addresses/actual',
            headers: {
                token:userToken,
                Accept: "application/json",
                "Content-Type":"application/json"

            },
            data:data
        })
            .then(function successCallback(response) {
                /*$scope.addAddress.status = response.status;
                $scope.addAddress.status = 201;
                $scope.addAddress.message = "Your New Address is saved."; */
                console.log(response.status);
                redirect("/settings");
            }, function errorCallback(response) {
                console.log(response);
                alert("New Address was not added successfully");
            })
    }
});


