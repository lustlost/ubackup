'use strict';
Uoc.controller('nodeController', ['$scope', 'SweetAlert', '$http', function ($scope, SweetAlert, $http) {
    $scope.data_state='刷新';
    var get_nodes = function () {
        $scope.data_state='刷新中...';
        $http.get("/api/node").success(function (response) {
            $scope.nodelist = response.objects;
        })

        $http.get("/api/cluster").success(function (response) {
            $scope.clusterlist = response.objects;
        })
        $scope.data_state='刷新';
    }
    get_nodes();

    $scope.flush = function(){
        get_nodes();
    }
    //$scope.nodelist = [
    //    {
    //        id: 1,
    //        cluster: '金华老七楼',
    //        size:100,
    //        ip:'1.1.1.2',
    //        used:10,
    //    },
    //    {
    //        id: 2,
    //        cluster: '多湖',
    //        size:100,
    //        ip:'1.1.1.3',
    //        used:10,
    //    },
    //    {
    //        id: 3,
    //        cluster: '阿里云',
    //        size:100,
    //        ip:'1.1.1.4',
    //        used:10,
    //    },
    //    {
    //        id: 4,
    //        cluster: '阿里云',
    //        size:100,
    //        ip:'1.1.1.5',
    //        used:10,
    //    },
    //
    //];

    $scope.add = function () {
        $scope.isadd = 1;
    }

    $scope.update = function (node) {
        $scope.isadd = 0;
        $scope.select_node = node;
        $scope.ip = node.ip;
        $scope.size = node.size;
        $scope.select_cluster = node.cluster;
    }

    $scope.addsubmit = function () {

        var node = {
            ip: $scope.ip,
            size: $scope.size,
            cluster_id: $scope.select_cluster.id
        }


        if ($scope.isadd == 1) {
            $http.post('/api/node', node).then(
                function successCallback() {
                    SweetAlert.swal("添加成功!", "呼呼...", "success");
                    get_nodes();
                },
                function errorCallback() {
                    SweetAlert.swal("添加失败!", "人品太差...", "error");
                }
            )
        } else {
            $http.patch('/api/node/' + $scope.select_node.id, node).then(
                function successCallback() {
                    SweetAlert.swal("修改成功!", "呼呼...", "success");
                    get_nodes();
                },
                function errorCallback() {
                    SweetAlert.swal("修改失败!", "人品太差...", "error");
                }
            )
        }
    }

    $scope.delete = function (node) {
        SweetAlert.swal({
                title: "确定删除此节点?",
                text: "小心点哥哥",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55", confirmButtonText: "确定",
                cancelButtonText: "我再考虑下",
                closeOnConfirm: false,
                closeOnCancel: false
            },
            function (isConfirm) {
                if (isConfirm) {
                    $http.delete('/api/node/' + node.id).then(function successCallback(response) {
                        SweetAlert.swal("删除成功!", "又失去了一个兄弟...", "success");
                        get_nodes();
                    }, function errorCallback(response) {
                        SweetAlert.swal("删除失败!", "又失去了一个兄弟...", "error");
                    })
                    //SweetAlert.swal("删除成功!", "又失去了一个兄弟...", "success");
                } else {
                    SweetAlert.swal("取消成功", "想想就后怕...", "error");
                }
            });
    }




}]);