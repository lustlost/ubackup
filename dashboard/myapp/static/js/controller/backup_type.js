'use strict';
Uoc.controller('backupTypeController', ['$scope','$http','SweetAlert', function ($scope,$http,SweetAlert) {
    var get_backup_type = function () {
        $http.get("/api/backup_type").success(function (response) {
            $scope.backuptypelist = response.objects
        })
        //$scope.backuptypelist=[
        //    {id:1,name:'Mysql'},
        //    {id:2,name:'Redis'},
        //    {id:3,name:'SSDB'},
        //    {id:4,name:'Etcd'},
        //    {id:4,name:'MSSQL'}
        //]
    }

    get_backup_type();

    $scope.add = function () {
        $scope.isadd = 1;
    }

    $scope.update = function (backup_type) {

        $scope.isadd = 0;
        $scope.name = backup_type.name;
        $scope.select_backuptype = backup_type;
    }

    $scope.addsubmit = function () {

        var backup_type = {
            name: $scope.name
        }


        if ($scope.isadd == 1) {
            $http.post('/api/backup_type', backup_type).then(
                function successCallback() {
                    SweetAlert.swal("添加成功!", "呼呼...", "success");

                },
                function errorCallback() {
                    SweetAlert.swal("添加失败!", "人品太差...", "error");
                }
            )
        } else {
            $http.patch('/api/backup_type/' + $scope.select_backuptype.id, backup_type).then(
                function successCallback() {
                    SweetAlert.swal("修改成功!", "呼呼...", "success");
                },
                function errorCallback() {
                    SweetAlert.swal("修改失败!", "人品太差...", "error");
                }
            )
        }
        get_backup_type();


        //$scope.nodelist.push({
        //    id: $scope.nodelist.length + 1,
        //    name: $scope.name,
        //    update_time: $scope.update_time,
        //    key: $scope.key,
        //    api_address: $scope.api_address
        //
        //})
    }

    $scope.delete = function (classify) {
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
                    $http.delete('/api/backup_type/' + classify.id).then(function successCallback(response) {
                        SweetAlert.swal("删除成功!", "又失去了一个兄弟...", "success");
                        get_backup_type();
                    }, function errorCallback(response) {
                        console.log(response)
                        SweetAlert.swal("删除失败!", "检查下此分类下是否还有App", "error");
                    })
                    //SweetAlert.swal("删除成功!", "又失去了一个兄弟...", "success");
                } else {
                    SweetAlert.swal("取消成功", "想想就后怕...", "error");
                }
            });
    }




}])