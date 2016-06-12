'use strict';
Uoc.controller('backupInstanceController', ['$scope', '$http', 'SweetAlert', function ($scope, $http, SweetAlert) {
    $scope.page = {
        num_per_page: 10
    }

    $scope.backup_list = [];
    $scope.get_backup_list = function (server_id, instance, backup_type) {
        console.log(server_id,instance,backup_type);
        $scope.backup_server_id = server_id;
        $scope.backup_instance = instance;
        $scope.backup_backup_type = backup_type;

        $scope.backup_list = [];
        //var query_string = JSON.stringify({
        //    query: {
        //        bool: {
        //            must: [
        //                {
        //                    term: {server_id: server_id}
        //                },
        //                {
        //                    term: {instance: instance}
        //                },
        //                {
        //                    term: {type: backup_type}
        //                }
        //            ]
        //        }
        //    },
        //    sort: [
        //        {create_time: {order: 'desc'}},
        //    ],
        //    size: 24
        //})
        //console.log(query_string);
        var req = {
            method: 'GET',
            url: '/api/get_backup_list',
            params:{server_id:server_id,instance:instance,type:backup_type}
        }
        $http(req).then(function (resp) {
            $scope.backup_list=resp.data;
        });
    }

    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
        }

        return s4() + '' + s4() + '' + s4();
    }

    //$scope.search_server_id = '';
    //$scope.search_name = '';
    //$scope.search_instance = '';
    //$scope.search_backup_type = '';
    $scope.pre_batch_add = function () {
        $scope.illegal_lines = [];
        $scope.legal_instances = [];
        $scope.fail_instance = [];
        $scope.success_instance = [];

    }


    $scope.check_all = function () {
        console.log($scope.master);
        if ($scope.master) {
            for (var i in $scope.instances) {
                $scope.instances[i].check = true;
            }
        } else {

            for (var i in $scope.instances) {
                $scope.instances[i].check = false;
            }
        }
    }

    $scope.check = function (instance_id) {
        $scope.instances[instance_id].check = !$scope.instances[instance_id].check;
    }

    $scope.batch_del = function () {
        var delete_instances = [];
        var delete_instances_text = '';
        for (var instance of $scope.instances) {
            if (instance.check) {
                delete_instances.push(instance);
                delete_instances_text += instance.name + ' ' + instance.server_id + ' ' + instance.backup_type.name + ' ' + instance.instance + ' ' + instance.business.name + '\n';
            }
        }


        SweetAlert.swal({
                title: "确定删除这些实例?",
                text: delete_instances.length + ' 个实例将被删除!!!',
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55", confirmButtonText: "确定",
                cancelButtonText: "我再考虑下",
                closeOnConfirm: false,
                closeOnCancel: false
            },
            function (isConfirm) {
                if (isConfirm) {
                    var del_error_instance = [];
                    $scope.del_error_instance_text = '';
                    var del_ok_instance = [];
                    $scope.del_ok_instance_text = '';
                    var del_num_count = 1;

                    angular.forEach(delete_instances, function (instance) {
                        $http.delete('/api/backup_instance/' + instance.id).then(
                            function successCallback() {
                                del_ok_instance.unshift(instance);
                                $scope.del_ok_instance_text += instance.name + ' ' + instance.server_id + ' ' + instance.backup_type.name + ' ' + instance.instance + ' ' + instance.business.name + '\n';
                                del_num_count = +1;
                            },
                            function errorCallback(res) {
                                del_error_instance.unshift(instance);
                                $scope.del_error_instance_text += instance.name + ' ' + instance.server_id + ' ' + instance.backup_type.name + ' ' + instance.instance + ' ' + instance.business.name + '\n';
                                del_num_count = +1;
                            }
                        )
                    });

                    $scope.get_instances(1);
                    $scope.master = false;

                    SweetAlert.swal("删除完毕!", "搜索下是否已被删除...", "success");
                } else {
                    SweetAlert.swal("取消成功", "想想就后怕...", "error");
                }
            });

        //console.log($scope.instances);
        //var selected_instance=[];
        //angular.forEach($scope.instances, function (instance) {
        //    if (!!instance.selected) {selected_instance.push(instance.id)};
        //})
        //console.log(selected_instance);
        //for (var i of $scope.checkAll){
        //    console.log(i);
        //}
    }
    $scope.batch_add = function () {
        console.log($scope.batch_add_str);

        $scope.illegal_lines = [];
        $scope.legal_instances = [];
        $scope.fail_instance = [];
        $scope.success_instance = [];

        var index = 0;

        for (var line of $scope.batch_add_str.split('\n')) {
            var line_sp = line.trim().split(/(?: |\t)+/)
            if (line_sp.length != 5) {
                $scope.illegal_lines.push({item: line, reason: '格式不正确'});
                continue;
            }
            var name = line_sp[0];
            var server_id = line_sp[1];
            if (line_sp[2] in $scope.backup_type) {
                var backup_type_id = line_sp[2];
            } else {
                $scope.illegal_lines.push({item: line, reason: '备份类型ID不存在'});
                continue;
            }
            var instance = line_sp[3];

            if (line_sp[4] in $scope.business) {
                var business_id = $scope.business[line_sp[4]];
            } else {
                $scope.illegal_lines.push({item: line, reason: '业务ID不存在'});
                continue;
            }

            $scope.legal_instances.push({
                index: index,
                line: line,
                post_data: {
                    name: name,
                    server_id: server_id,
                    backup_type_id: backup_type_id,
                    business_id: business_id,
                    instance: instance
                }
            })
            index += 1;

        }

        angular.forEach($scope.legal_instances, function (instance) {
            $http.post('/api/backup_instance', instance.post_data).then(
                function successCallback() {
                    $scope.success_instance.unshift(instance);
                },
                function errorCallback(res) {
                    if (res.data.message == 'IntegrityError') {
                        instance.reason = '系统已存在';
                    } else {
                        instance.reason = res.data.message;
                    }

                    $scope.fail_instance.unshift(instance);
                }
            )
        });


    }


    $scope.get_instances = function (page) {
        //search_business.split(/(?:,| )+/)

        var filters = [{
            and: []
        }];

        if ($scope.search_server_id) {
            filters[0].and.push(
                {
                    name: 'server_id',
                    op: 'in',
                    val: $scope.search_server_id.split(/(?:,| )+/)
                }
            )
        }

        if ($scope.search_name) {
            filters[0].and.push(
                {
                    name: 'name',
                    op: 'in',
                    val: $scope.search_name.split(/(?:,| )+/)
                }
            )
        }

        if ($scope.search_instance) {
            filters[0].and.push(
                {
                    name: 'instance',
                    op: 'in',
                    val: $scope.search_instance.split(/(?:,| )+/)
                }
            )
        }

        if ($scope.search_backup_type) {
            filters[0].and.push(
                {
                    name: 'backup_type',
                    op: 'has',
                    val: {
                        name: 'name',
                        op: 'in',
                        val: $scope.search_backup_type.split(/(?:,| )+/)
                    }


                }
            )
        }

        if ($scope.search_business) {
            filters[0].and.push(
                {
                    name: 'business',
                    op: 'has',
                    val: {
                        name: 'name',
                        op: 'in',
                        val: $scope.search_business.split(/(?:,| )+/)
                    }


                }
            )
        }


        var req = {
            method: 'GET',
            url: '/api/backup_instance',
            headers: {'Content-Type': 'application/json', 'Accept': "application/json"},
            params: {q: JSON.stringify({filters: filters,order_by:[{"field": "id", "direction": "desc"}]}), page: page, results_per_page: $scope.page.num_per_page}
        }

        $http(req).success(
            function (response) {
                $scope.instances = response.objects;
                for (var i in $scope.instances) {
                    $scope.instances[i].check = false;
                }
                $scope.page.num_results = response.num_results;
                $scope.page.page = response.page;
                $scope.page.total_pages = response.total_pages;
            }
        )


        //$http.get("/api/backup_instance").success(function (response) {
        //    $scope.instances = response.objects;
        //    $scope.page.num_results = response.num_results;
        //    $scope.page.page = response.page;
        //    $scope.page.total_pages = response.total_pages;
        //
        //
        //})

        $http.get("/api/backup_type").success(function (response) {
            $scope.backup_type_list = response.objects;
            $scope.backup_type = {}
            for (var t of response.objects) {
                $scope.backup_type[t.id] = t.name;
            }
        })

        $http.get("/api/business?results_per_page=999999").success(function (response) {
            $scope.business_list = response.objects;
            $scope.business = {};
            for (var b of response.objects) {
                $scope.business[b.business_id] = b.id;
            }
        })


        //$scope.instances=[
        //    {id:1,name:'百度S1',key:'111222',type:'mysql',port:3306,classify:'女神联盟'},
        //    {id:1,name:'IOS集群NO.1主库',key:'111223',type:'mysql',port:3306,classify:'女神手游'},
        //    {id:1,name:'游族S2',key:'111224',type:'ssdb',port:6381,classify:'少年三国志'},
        //    {id:1,name:'游族S3',key:'111225',type:'redis',port:6379,classify:'女神联盟'},
        //    {id:1,name:'游族S4',key:'111226',type:'mysql',port:3306,classify:'女神联盟'},
        //]
    }
    $scope.get_instances(1);

    $scope.add = function () {
        $scope.isadd = 1;
        $scope.server_id = guid();
    }

    $scope.update = function (instance) {

        $scope.isadd = 0;
        $scope.name = instance.name;
        $scope.server_id = instance.server_id;
        $scope.backup_type_id = instance.backup_type_id;
        $scope.business_id = instance.business_id;
        $scope.instance = instance.instance;
        $scope.select_instance = instance;
        $scope.select_backup_type = instance.backup_type;
        $scope.select_business = instance.business;


    }

    $scope.addsubmit = function () {

        var instance = {
            name: $scope.name,
            server_id: $scope.server_id,
            business_id: $scope.select_business.id,
            backup_type_id: $scope.select_backup_type.id,
            instance: $scope.instance
        }

        console.log(instance);


        if ($scope.isadd == 1) {
            $http.post('/api/backup_instance', instance).then(
                function successCallback() {
                    SweetAlert.swal("添加成功!", "呼呼...", "success");

                },
                function errorCallback() {
                    SweetAlert.swal("添加失败!", "人品太差...", "error");
                }
            )
        } else {
            $http.patch('/api/backup_instance/' + $scope.select_instance.id, instance).then(
                function successCallback() {
                    SweetAlert.swal("修改成功!", "呼呼...", "success");
                },
                function errorCallback() {
                    SweetAlert.swal("修改失败!", "人品太差...", "error");
                }
            )
        }
        $scope.get_instances();


        //$scope.nodelist.push({
        //    id: $scope.nodelist.length + 1,
        //    name: $scope.name,
        //    update_time: $scope.update_time,
        //    key: $scope.key,
        //    api_address: $scope.api_address
        //
        //})
    }

    $scope.data_state='刷新';
    $scope.flush = function(){
        $scope.data_state='刷新中...';
        $scope.get_instances();
        $scope.data_state='刷新';
    }

    $scope.delete = function (instance) {
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
                    $http.delete('/api/backup_instance/' + instance.id).then(function successCallback(response) {
                        SweetAlert.swal("删除成功!", "又失去了一个兄弟...", "success");
                        $scope.get_instances();
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