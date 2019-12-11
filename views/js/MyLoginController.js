var app = angular.module('vshipper', []);


function myLogin_withFacebook() {
    window.location.replace("http://localhost:3000/auth/facebook");
    console.log("this is called")
}

function myLogin_withGoogle() {
    window.location.replace("http://localhost:3000/auth/google");
    console.log("this is called")
}


app.controller('MyLoginController', function ($scope, $http) {
    $scope.myLogin_withFacebook = myLogin_withFacebook;
    $scope.myLogin_withGoogle = myLogin_withGoogle;
    $scope.myLogin_withUserNamePassword = function myLogin_withUserNamePassword() {
        var form = document.getElementById("loginForm");
        //userId: form.username.value, password: form.password.value
        $http({
            method: 'GET',
            url: 'http://localhost:3000/auth/login',
            params: {
                userId: form.username.value,
                password: form.password.value
            }
        }).then(function successCallback(response) {
            console.log(response);
            document.cookie = "userToken=" + response.data.token + ";path=/";
            window.location.replace("http://localhost:3050/settings");
        }, function errorCallback(response) {
            console.log(response);
            alert("Wrong Username or Password");
        });
    };



    $scope.createAccount = function(){
        $http({
            method: 'POST',
            url: 'http://localhost:3000/account',
            data:{
                email : $scope.email,
                phone: $scope.Phone,
                firstName:$scope.firstname,
                lastName: $scope.lastname,
                password: $scope.createpassword
            }
        }).then(function successCallback(response) {
            console.log(response);
            document.cookie = "userToken=" + response.data._id + ";path=/";
            window.location.replace("/login");
        }, function errorCallback(response) {
            console.log(response);
        });
    }

})
