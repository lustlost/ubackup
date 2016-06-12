'use strict';
Uoc.controller('alertController', ['$scope', '$http', 'SweetAlert', function ($scope, $http, SweetAlert) {
    $scope.flush_state = '刷新';

    $scope.save_focus_business = function () {
        console.log($scope.selected);
        var post_data = {force_business: $scope.selected}
        $http.post('/api/set_force_business', post_data).then(
            function successCallback() {
                SweetAlert.swal("设置成功!", "呼呼...", "success");
                get_classify();

            },
            function errorCallback() {
                SweetAlert.swal("设置失败!", "人品太差...", "error");
                get_classify();
            }
        )
    }
    $scope.selected = [];
    $scope.isSelected = function (id) {
        return $scope.selected.indexOf(id) >= 0;
    }

    var updateSelected = function (action, id, name) {
        if (action == 'add' && $scope.selected.indexOf(id) == -1) {
            $scope.selected.push(id);

        }
        if (action == 'remove' && $scope.selected.indexOf(id) != -1) {
            var idx = $scope.selected.indexOf(id);
            $scope.selected.splice(idx, 1);

        }
    }
    $scope.updateSelection = function ($event, id) {
        var checkbox = $event.target;
        var action = (checkbox.checked ? 'add' : 'remove');
        updateSelected(action, id, checkbox.name);

    }

    $scope.select_all = function () {
        for (var b of $scope.business_list) {
            updateSelected('add', b.business_id, 's');
        }
    }

    $scope.select_none = function () {
        for (var b of $scope.business_list) {
            updateSelected('remove', b.business_id, 's');
        }
    }

    $scope.get_backup_list = function (server_id, instance, backup_type) {
        console.log(server_id,instance,backup_type);
        $scope.backup_server_id = server_id;
        $scope.backup_instance = instance;
        $scope.backup_backup_type = backup_type;

        $scope.backup_list = [];
        var req = {
            method: 'GET',
            url: '/api/get_backup_list',
            params:{server_id:server_id,instance:instance,type:backup_type}
        }
        $http(req).then(function (resp) {
            $scope.backup_list=resp.data;
        });
    }

    var get_classify = function () {

        $scope.flush_state = '数据加载中';
        $http.get("/api/get_force_business").success(function (response) {
            $scope.selected = response;
        })

        $http.get("/api/business?results_per_page=999999").success(function (response) {
            $scope.business_list = response.objects;
            $scope.business = {};
            for (var b of response.objects) {
                $scope.business[b.business_id] = b.name;
            }

            $http.get("/api/alert").success(function (response) {
                $scope.alerts = [];
                $scope.other_alerts = [];
                for (var alert of response) {

                    if ($scope.selected.indexOf(alert.game_id) != -1) {
                        $scope.alerts.push(alert);
                    }
                    else {
                        $scope.other_alerts.push(alert);
                    }
                }
                //$scope.alerts = response;
                //
                //var server_ids = [];
                //for (var alert of $scope.alerts) {
                //    server_ids.push(alert.server_id);
                //}
                //
                //console.log(server_ids);
                //var filters = [{
                //    name: 'server_id',
                //    op: 'in',
                //    val: server_ids
                //}];
                //
                //var req = {
                //    method: 'GET',
                //    url: '/api/backup_instance',
                //    headers: {'Content-Type': 'application/json', 'Accept': "application/json"},
                //    params: {q: JSON.stringify({"filters": filters}), results_per_page: 999999999}
                //}

                $scope.server_id_of_name = {}
                $scope.flush_state = '刷新';

                //$http(req).success(
                //    function (response) {
                //        for (var backup_instance of response.objects){
                //            $scope.server_id_of_name[backup_instance.server_id] = backup_instance;
                //        }
                //    }
                //)

            })
        })


        //$scope.alerts=[
        //    {id:1,name:'百度S1',key:'111221',ip:'1.1.1.1',type:'mysql',port:3306,classify:'女神联盟',time:'2016-12-31 12:34:21',log:'未备份'},
        //    {id:2,name:'百度S2',key:'111222',ip:'1.1.1.2',type:'redis',port:6379,classify:'少年三国志',time:'2016-12-31 12:34:21',log:'数据库连接不上'},
        //    {id:3,name:'百度S3',key:'111223',ip:'1.1.1.3',type:'mysql',port:3306,classify:'少年三国志',time:'2016-12-31 12:34:21',log:'磁盘空间不足'},
        //    {id:4,name:'百度S4',key:'111224',ip:'1.1.1.4',type:'redis',port:3306,classify:'女神联盟',time:'2016-12-31 12:34:21',log:'IO错误'},
        //    {id:5,name:'百度S5',key:'111225',ip:'1.1.1.5',type:'mysql',port:3306,classify:'少年三国志',time:'2016-12-31 12:34:21',log:'未备份'},
        //    {id:6,name:'百度S6',key:'111226',ip:'1.1.1.6',type:'redis',port:6379,classify:'女神联盟',time:'2016-12-31 12:34:21',log:'rsync失败'},
        //    {id:7,name:'百度S7',key:'111227',ip:'1.1.1.7',type:'mysql',port:3306,classify:'女神联盟',time:'2016-12-31 12:34:21',log:'未备份'},
        //    {id:8,name:'百度S8',key:'111228',ip:'1.1.1.8',type:'ssdb',port:6379,classify:'少年三国志',time:'2016-12-31 12:34:21',log:'rsync失败'},
        //    {id:9,name:'百度S9',key:'111229',ip:'1.1.1.9',type:'ssdb',port:6379,classify:'女神联盟',time:'2016-12-31 12:34:21',log:'未备份'},
        //]
    }

    get_classify()

    $scope.flush = function () {

        get_classify()
    }

    $scope.add = function () {
        $scope.isadd = 1;
    }

    $scope.update = function (classify) {
        $scope.isadd = 0;
        $scope.name = classify.name;
        $scope.select_classify = classify;
    }

    $scope.addsubmit = function () {

        var classify = {
            name: $scope.name,
        }


        if ($scope.isadd == 1) {
            $http.post('/api/app_classify', classify).then(
                function successCallback() {
                    SweetAlert.swal("添加成功!", "呼呼...", "success");

                },
                function errorCallback() {
                    SweetAlert.swal("添加失败!", "人品太差...", "error");
                }
            )
        } else {
            $http.patch('/api/app_classify/' + $scope.select_classify.id, classify).then(
                function successCallback() {
                    SweetAlert.swal("修改成功!", "呼呼...", "success");
                },
                function errorCallback() {
                    SweetAlert.swal("修改失败!", "人品太差...", "error");
                }
            )
        }
        get_classify()


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
                    $http.delete('/api/app_classify/' + classify.id).then(function successCallback(response) {
                        SweetAlert.swal("删除成功!", "又失去了一个兄弟...", "success");
                        get_classify()
                    }, function errorCallback(response) {
                        SweetAlert.swal("删除失败!", "检查下此分类下是否还有App", "error");
                    })
                    //SweetAlert.swal("删除成功!", "又失去了一个兄弟...", "success");
                } else {
                    SweetAlert.swal("取消成功", "想想就后怕...", "error");
                }
            });
    }


}])