'use strict';
Uoc.controller('clusterController', ['$scope', 'SweetAlert', '$http', function ($scope, SweetAlert, $http) {
    $scope.data_state='刷新';
    var get_cluster = function () {
        $scope.data_state='刷新中...';
        $http.get("/api/cluster").success(function (response) {
            $scope.clusterlist = [];
            for (var cluster of response.objects){
                cluster.size_sum=0;
                cluster.used_sum=0;
                for (var node of cluster.nodes){
                    cluster.size_sum+=node.size;
                    cluster.used_sum+=node.used;
                }
                $scope.clusterlist.push(cluster);

            }
        })
        $scope.data_state='刷新';
    }

    get_cluster()

    $scope.display_node = function(cluster){
        $scope.nodelist=cluster.nodes;
        $scope.the_cluster_name = cluster.name;

    }

    $scope.flush = function(){
        get_cluster()
    }

    $scope.cpzb_chart = function () {
        console.log('2');
        var cpbt_option = {
            title: {
                text: '各产品备份占比',
                subtext: '纯属虚构',
                x: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                x: 'center',
                y: 'bottom',
                data: ['女神联盟', '战龙兵团', '骑士战歌', '少年三国志', '萝莉有妖气', '大将军', '大侠传', '战机传奇']
            },
            toolbox: {
                show: true,
                feature: {
                    mark: {show: true},
                    dataView: {show: true, readOnly: false},
                    magicType: {
                        show: true,
                        type: ['pie', 'funnel']
                    },
                    restore: {show: true},
                    saveAsImage: {show: true}
                }
            },
            calculable: true,
            series: [
                {
                    name: '半径模式',
                    type: 'pie',
                    //radius: [20, 110],
                    //center: ['10%', 200],
                    roseType: 'radius',
                    width: '80%',       // for funnel
                    max: 40,            // for funnel
                    itemStyle: {
                        normal: {
                            label: {
                                show: false
                            },
                            labelLine: {
                                show: false
                            }
                        },
                        emphasis: {
                            label: {
                                show: true
                            },
                            labelLine: {
                                show: true
                            }
                        }
                    },
                    data: [
                        {value: 10, name: '女神联盟'},
                        {value: 5, name: '战龙兵团'},
                        {value: 15, name: '骑士战歌'},
                        {value: 25, name: '少年三国志'},
                        {value: 20, name: '萝莉有妖气'},
                        {value: 35, name: '大将军'},
                        {value: 30, name: '大侠传'},
                        {value: 40, name: '战机传奇'}
                    ]
                }
            ]
        };
        var cpbt = echarts.init(document.getElementById("cpbt"), 'macarons');
        cpbt.setOption(cpbt_option);
        setTimeout(function () {
            cpbt.resize();

        }, 500);

    }


    $scope.add = function () {
        $scope.isadd = 1;

    }

    $scope.update = function (cluster) {
        $scope.isadd = 0;
        $scope.select_cluster_id = cluster.id
        $scope.name = cluster.name;
        $scope.queue_address = cluster.queue_address;
    }

    $scope.addsubmit = function () {

        var cluster = {
            name: $scope.name,
            queue_address: $scope.queue_address
        }


        if ($scope.isadd == 1) {
            $http.post('/api/cluster', cluster).then(
                function successCallback() {
                    SweetAlert.swal("添加成功!", "呼呼...", "success");


                },
                function errorCallback() {
                    SweetAlert.swal("添加失败!", "人品太差...", "error");
                }
            )
        } else {
            $http.patch('/api/cluster/' + $scope.select_cluster_id, cluster).then(
                function successCallback() {
                    SweetAlert.swal("修改成功!", "呼呼...", "success");
                },
                function errorCallback() {
                    SweetAlert.swal("修改失败!", "人品太差...", "error");
                }
            )
        }
        get_cluster()
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
                    $http.delete('/api/cluster/' + node.id).then(function successCallback(response) {
                        SweetAlert.swal("删除成功!", "又失去了一个兄弟...", "success");
                    }, function errorCallback(response) {
                        SweetAlert.swal("删除失败!", "确保节点是否删除...", "error");
                    })
                    //SweetAlert.swal("删除成功!", "又失去了一个兄弟...", "success");
                } else {
                    SweetAlert.swal("取消成功", "想想就后怕...", "error");
                }
                get_cluster();
            });

    }



}]);