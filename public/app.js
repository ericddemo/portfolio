'use strict';

var demoApp = angular.module('demoApp', [
  'ngRoute',
  'ngResource',
  'cgBusy'
])
.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/dashboard', {
            templateUrl: 'templates/home.html',
            controller: 'demoController',
        })
        .when('/newsmap', {
            templateUrl: 'templates/newsmap.html',
            controller: 'newsmapController',
        })
        .otherwise({
            redirectTo: '/dashboard'
        });
        
}])
.run(function($rootScope, $location) {

});