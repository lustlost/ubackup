'use strict';
Uoc.controller('businessController', ['$scope','$http','SweetAlert', function ($scope,$http,SweetAlert) {
    var get_classify = function () {
        $http.get("/api/business").success(function (response) {
            $scope.business_list = response.objects
        })
    }
    get_classify()

    $scope.add = function () {
        $scope.isadd = 1;
    }

    $scope.update = function (business) {

        $scope.isadd = 0;
        $scope.name = business.name;
        $scope.business_id = business.business_id;
        $scope.select_business = business;
    }

    $scope.addsubmit = function () {

        var business = {
            name: $scope.name,
            business_id: $scope.business_id
        }


        if ($scope.isadd == 1) {
            $http.post('/api/business', business).then(
                function successCallback() {
                    SweetAlert.swal("添加成功!", "呼呼...", "success");

                },
                function errorCallback() {
                    SweetAlert.swal("添加失败!", "人品太差...", "error");
                }
            )
        } else {
            console.log($scope.select_business)
            $http.patch('/api/business/' + $scope.select_business.id, business).then(
                function successCallback() {
                    SweetAlert.swal("修改成功!", "呼呼...", "success");
                },
                function errorCallback() {
                    SweetAlert.swal("修改失败!", "人品太差...", "error");
                }
            )
        }
        get_classify()

    }

    $scope.delete = function (business) {
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
                    $http.delete('/api/business/' + business.id).then(function successCallback(response) {
                        SweetAlert.swal("删除成功!", "又失去了一个兄弟...", "success");
                        get_classify()
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
