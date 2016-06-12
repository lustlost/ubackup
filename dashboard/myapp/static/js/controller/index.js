'use strict';
Uoc.controller('indexController', ['$scope', function ($scope) {

    $scope.agentlist = [
        {
            id: 1,
            uuid: '111111111111',
            version: '2.2',
            us: '[国内]女神工作室'
        },
        {
            id: 2,
            uuid: '222222222222',
            version: '2.2',
            us: '[腾讯]战神工作室'
        },
        {
            id: 3,
            uuid: '333333333333',
            version: '2.2',
            us: '[国内]女神工作室'
        },
        {
            id: 4,
            uuid: '4444444444444',
            version: '2.2',
            us: '[腾讯]战神工作室'
        }

    ];

}])
