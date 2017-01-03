﻿var mainApp = angular.module('mainApp', ['ui.bootstrap']);

mainApp.controller('ModalInstanceCtrl', ['$uibModalInstance', 'items', function ($uibModalInstance, items) {
    var $ctrl = this;
    $ctrl.items = items;
    $ctrl.name = "New Thing 1";
    $ctrl.thingType = 0;

    $ctrl.ok = function () {
        var newThing = { "name": $ctrl.name, "thingType": $ctrl.thingType };
        $uibModalInstance.close(newThing);
    };

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);

mainApp.controller('MainCtrl', ['$scope', '$http', '$window', '$q', '$location', '$uibModal',
function ($scope, $http, $window, $q, $location, $uibModal) {
    var $ctrl = this;
    $ctrl.items = ['item1', 'item2', 'item3'];

    $ctrl.open = function () {
        var modalInstance = $uibModal.open({
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'addThing.html',
            controller: 'ModalInstanceCtrl',
            controllerAs: '$ctrl',
            size: "sm",
            resolve: {
                items: function () {
                    console.log("resolving items");
                    console.log($ctrl.items);
                    return $ctrl.items;
                }
            }
        });

        modalInstance.result.then(function (newThing) {
            console.log("new thing (" + newThing.thingType + ") " + newThing.name);

            $scope.addThing(newThing);

        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    };

    $scope.hubs = undefined;
    $scope.hubDetail = undefined;
    $scope.modalShown = false;

    $scope.initSignalR = function () {
        // Reference the auto-generated proxy for the hub.
        var chat = $.connection.notificationHub;
        // Create a function that the hub can call
        chat.client.refresh = function () {
            $scope.loadHubs();
        };

        // Start the connection.
        $.connection.hub.start().done(function () { });
    }

    // calls the web api to load the hubs
    $scope.loadHubs = function () {
        var url = "/api/HubsApi";
        $http.get(url).success(function (hubs) {
            $scope.hubs = hubs;
            if ($scope.hubs.length > 0) {
                $scope.selectHub($scope.hubs[0]);
            }
        });
    };

    $scope.addThingShowDialog = function (hub) {
        $ctrl.open();
    }

    $scope.addThing = function (newThing) {
        console.log($scope.hubDetail);
        var postData = {
            hubId: $scope.hubDetail.Id,
            name: newThing.name,
            thingType : newThing.thingType
        };

        var postObj = {
            url: '/api/addThing',
            method: 'POST',
            data: postData
        }

        console.log(postData);
        console.log(postObj);

        $http(postObj).success(function (data, status) {
            console.log(data);
            console.log(status);
            thing.Dim = data.Dim;
        }).error(function (data, status) {
            console.log(data);
            console.log(status);
        });
    }

    $scope.selectHub = function (hub) {
        $scope.hubDetail = hub;
    }

    $scope.switchOff = function (hubId, thing) {
        console.log("Switch off " + thing.Name);

        $scope.setThingProperty(hubId, thing, "Switch", false);
    }

    $scope.switchOn = function (hubId, thing) {
        console.log("Switch on " + thing.Name);

        $scope.setThingProperty(hubId, thing, "Switch", true);
    }

    $scope.dim = function (hubId, thing) {
        console.log("Set " + thing.Name + " to " + thing.Dim);

        $scope.setThingProperty(hubId, thing, "Dim", parseInt(thing.Dim));
    }

    $scope.setThingProperty = function(hubId, thing, propertyName, value) {
        var postData = {
            id: hubId,
            deviceId: thing.Id,
            propertyName: propertyName,
            value: value
        };

        var postObj = {
            url: '/api/HubsApi',
            method: 'POST',
            data: postData
        }

        console.log(postData);
        console.log(postObj);

        $http(postObj).success(function (data, status) {
            console.log(data);
            console.log(status);
            thing.Dim = data.Dim;
        }).error(function (data, status) {
            console.log(data);
            console.log(status);
        });
    }

    $scope.range = function (min, max, step) {
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) {
            input.push(i);
        }
        return input;
    };

    $scope.initSignalR();
    $scope.loadHubs();
}]);