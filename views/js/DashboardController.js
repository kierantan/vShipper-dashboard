var userToken = TH_TokenCheckFromQueryAndCookie();


var app = angular.module("vshipper", []);


app.controller("DashboardController", function ($scope, $http) {
    $scope.myPackageLink = "my_packages.html";
    $scope.addPackageLink = "add_package.html";

    getVirtualAddresses($http,userToken)
        .then(virtualAddresses=>{
            $scope.virtualAddresses = virtualAddresses;
        })
        .catch(err=>{
            $scope.virtualAddresses = [];
        });

    getAccountInfo($http,userToken)
        .then(account =>{
            $scope.accInfo = account.data;

        })
        .catch(err=>{
            $scope.accInfo ={};
        })

    getPackages($http,userToken)
        .then(response=>{
            var packagesArray = response.data;
            $scope.classifiedPackages  = classifyPackagesByStatus(packagesArray);
        })
        .catch(err=>{
            $scope.classifiedPackages ={};
        })

    getOrders($http,userToken)
        .then(response=>{
            $scope.orders = response.data;
        })
        .catch(err=>{
            $scope.orders =[];
        });

    $scope.direct2PackageView = function(id){
        window.location.replace("/packages/view/" + id);
    }






    // $http is an service provided by angular, which can be used for http request call

    function getVirtualAddresses($http, Token) {
        console.log("### token is " + Token);
       return $http({
            method: "GET",
            url: 'http://localhost:3000/account',
            headers: {
                token: Token
            }
        })
            .then(function (response) {
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

            }, function (err) {
                console.log("here should not come");
                throw(err);
            })
    }
    function getAccountInfo($http, Token){
        return $http({
            method: "GET",
            url: 'http://localhost:3000/account',
            headers: {
                token: Token
            }
        })
    }
    function getPackages($http, Token){
        return $http({
            method: "GET",
            url: 'http://localhost:3000/packages',
            headers: {
                token: Token
            }
        })
    }
    function classifyPackagesByStatus(packagesArray){
        function extractDaysAfterArrival(package){
            package.dateArrive = "Waiting for arrival";
            package.DaysAfterArrival = "N.A";

            if(package.shipmentReceiveStatus ){ //true or false
                let arriveTIme = new Date(package.shipmentReceiveDate);
                let timeGap = Date.now() - arriveTIme;
                package.dateArrive = package.shipmentReceiveDate
                package.DaysAfterArrival = Math.floor(timeGap / 86400000);
            }

            return package;
        }

        var response = {
            newPackagesArray :[],
            shippingPackagesArray :[],
            deliveredPackagesArray: []
        }
        for (let i = 0; i < packagesArray.length; i++ ){
            let package = packagesArray[i];
            if(package.status === "NOT_READY" ||
                package.status === "NOT_ARRIVED" ||
                package.status === "READY"
             ){
                package = extractDaysAfterArrival(package);
                response.newPackagesArray.push(package);
            }
            else if(package.status === "paid" || package.status== "Shipped_Out"){
                response.shippingPackagesArray.push(package);
            }
            else if(package.status === "Delivered"){
                response.deliveredPackagesArray.push(package);
            }
        }
        return response;

    }
    function getOrders($http,Token){
        return $http({
            method: "GET",
            url: 'http://localhost:3000/orders',
            headers: {
                token: Token
            }
        })
    }



});

