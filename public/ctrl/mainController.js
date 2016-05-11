angular.module('demoApp').controller('mainController', ['$scope', '$location', function ($scope, $location) {

  $scope.isActive = function (viewLocation) {
    return viewLocation === $location.path();
  };

}]);