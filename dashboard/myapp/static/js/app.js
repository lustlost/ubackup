'use strict';
// Declare app level module which depends on filters, and services

var Uoc = angular.module('myApp', ['ngRoute', 'ngTreeView', 'ngResource', 'oitozero.ngSweetAlert', 'ui.select', 'ngSanitize', 'ui.ace', 'angular-jqcloud'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/index', {templateUrl: '/html/statistic', controller: 'statisticController'})
            .when('/cluster', {templateUrl: '/html/cluster', controller: 'clusterController'})
            .when('/node', {templateUrl: '/html/node', controller: 'nodeController'})
            .when('/business', {templateUrl: '/html/business', controller: 'businessController'})
            .when('/backup_type', {templateUrl: '/html/backup_type', controller: 'backupTypeController'})
            .when('/backup_instance', {templateUrl: '/html/backup_instance', controller: 'backupInstanceController'})
            .when('/alert', {templateUrl: '/html/alert', controller: 'alertController'})
            .when('/statistic', {templateUrl: '/html/statistic', controller: 'statisticController'})

            .when('/uslist', {templateUrl: '/html/uslist', controller: 'usController'})
            .when('/appmarket', {templateUrl: '/html/appmarket', controller: 'appMarketController'})
            .when('/agentlist', {templateUrl: '/html/agentlist', controller: 'agentController'})
            .when('/agentalert', {templateUrl: '/html/agentalert', controller: 'agentalertController'})
            .when('/business_tree', {templateUrl: '/html/business_tree', controller: 'businesstreeController'})
            .when('/depapp', {redirectTo: '/depapp/0'})
            .when('/depapp/:id', {templateUrl: '/html/depapp', controller: 'depAppController'})
            .when('/tasklog', {templateUrl: '/html/log_list', controller: 'tasklistController'})
            .when('/task_detail/:task_id', {templateUrl: '/html/log_detail', controller: 'taskdetailController'})
            .when('/agentversion', {templateUrl: '/html/agentversion', controller: 'agentversionController'})
            .when('/test', {templateUrl: '/html/test', controller: 'testController'})
            .otherwise({redirectTo: '/index'});
    }])
.filter('bytes', function() {
	return function(bytes, precision) {
		if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
		if (typeof precision === 'undefined') precision = 1;
		var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
			number = Math.floor(Math.log(bytes) / Math.log(1024));
		return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
	}
});

