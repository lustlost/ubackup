(function (angular) {
    'use strict';

    angular.module('ngTreeView', [])
        .directive('treeNode', treeNode)
        .directive('treeView', treeView)
        .directive('indeterminate', indeterminateCheckbox);

    treeNode.$inject = ['$compile'];
    function treeNode($compile) {
        var template =
            '<ul class="list-unstyled" style="list-style:none !important;">' +
            '<li ng-repeat="node in node.Children" ng-class="getClass(node.ID)">' +
            '<span class="node-label">' +
            '<i class="node-icon fa fa-chevron-right with-children" ng-show="node.HasChildren" ng-click="toggleExpand(node.ID)"></i>' +
            '<i class="node-icon {{ itemClass }}" ng-show="!node.HasChildren" ng-click="toggleSelect(node.ID)"></i>' +
            '<input indeterminate="isIndeterminate(node.ID)" type="checkbox" ng-checked="isSelected(node.ID)" ng-click="toggleSelect(node.ID)" />' +
            '<span class="node-text" ng-class="{ \'selected\': isSelected(node.ID) }" ng-click="toggleSelect(node.ID)"> {{ ::node.Title }} {{ ::node.key }}</span>' +
            '</span>' +
            '<div class="tree-node" ng-show="isExpanded(node.ID)"></div>' +
            '</li>' +
            '<li ng-if="isLoading(node.ID)" class="expanded">' +
            '<span class="node-label">' +
            '<i class="node-icon fa fa-refresh fa-spin"></i>' +
            '<span class="node-text">loading...</span>' +
            '</span>' +
            '</li>' +
            '</ul>';

        return {
            restrict: 'C',
            link: function (scope, element) {
                element.html('').append($compile(template)(scope));
            }
        };
    }

    treeView.$inject = ['$http'];
    function treeView($http) {
        return {
            restrict: 'E',
            replace: true,
            template: '<div class="tree-view"><div class="tree-node"></div><div>',
            require: 'ngModel',
            scope: {
                selectedNodes: '=ngModel',
                url: '@',
                itemClass: '@',
                pathSet: '=',
                multiselect: '='
            },
            link: function (scope) {
                var nodes = {};
                init();

                function getNode(id) {
                    return nodes[id];
                }

                function addModel(model) {
                    var node = nodes[model.ID];
                    return node || (nodes[model.ID] = {
                            model: model
                        });
                }

                function expandAllParents(id) {
                    var node = getNode(id);
                    node.expanded = true;

                    if (node.model.Parent) {
                        expandAllParents(node.model.Parent.ID);
                    }
                }

                function setParents(model) {
                    var node = addModel(model);

                    if (model.Children && model.Children.length) {
                        node.isLoaded = true;

                        for (var i = 0; i < model.Children.length; i++) {
                            var children = model.Children[i];

                            children.Parent = model;
                            setParents(children);
                        }
                    }
                }

                function convert(data) {
                    var d = []
                    for (var i in data) {
                        d.push({
                            ID: data[i].id,
                            Title: data[i].name,
                            HasChildren: parseInt(data[i].isdir) && true || false,
                            Children: null,
                            key:parseInt(data[i].isdir) && ' ' || data[i].key
                        })
                    }
                    return d
                }

                function init() {
                    scope.selectedNodes = scope.selectedNodes || [];
                    scope.allParents = scope.allParents || [];

                    if (!scope.multiselect && scope.selectedNodes.length) {
                        scope.selectedNodes = [scope.selectedNodes[0]];
                    }

                    var params;
                    var ids = [];
                    for (var l = 0; l < scope.selectedNodes.length; l++) {
                        ids.push(scope.selectedNodes[l].ID);
                    }

                    if (ids.length) {

                        params = {
                            nodeIDs: ids.join(),
                            parents: true
                        };
                    }

                    //$http.get(scope.url, { params: params }).success(function (data) {
                    //    for (var i = 0; i < data.length; i++) {
                    //        setParents(data[i]);
                    //    }
                    //
                    //    scope.node = {
                    //        Children: data
                    //    }
                    //
                    //    selectExpand();
                    //});
                    var filters = [{name: 'parent_id', op: 'eq', val: 0}];
                    var req = {
                        method: 'GET',
                        url: '/api/business',
                        headers: {'Content-Type': 'application/json', 'Accept': "application/json"},
                        params: {q: JSON.stringify({"filters": filters})}
                    }

                    $http(req).success(function (response) {
                        var data = convert(response.objects);
                        for (var i in data) {
                            setParents(data[i]);
                        }

                        scope.node = {
                            Children: data
                        }

                        selectExpand();
                    });


                }

                scope.getClass = function (id) {
                    var node = getNode(id);
                    return node && node.expanded ? 'expanded' : 'collapsed';
                }

                scope.toggleExpand = function (id) {
                    var node = getNode(id);
                    node.expanded = !node.expanded;

                    if (node.model.HasChildren && !node.isLoaded) {
                        loadChildren(node);
                    }
                };

                function loadChildren(node) {
                    var model = node.model;
                    node.isLoaded = true;
                    node.isLoading = true;
                    //$http.get(scope.url, { params: { nodeID: model.ID } }).success(function (data) {
                    //    model.Children = data;
                    //    for (var i = 0; i < model.Children.length; i++) {
                    //        model.Children[i].Parent = model;
                    //        addModel(model.Children[i]);
                    //    }
                    //    node.isLoading = false;
                    //});
                    var filters = [{name: 'parent_id', op: 'eq', val: model.ID}];
                    var req = {
                        method: 'GET',
                        url: '/api/business',
                        headers: {'Content-Type': 'application/json', 'Accept': "application/json"},
                        params: {q: JSON.stringify({"filters": filters})}
                    }

                    $http(req).success(
                        function (response) {
                            console.log(response);
                            var data=convert(response.objects);
                            console.log(data);
                            model.Children = data;
                            for (var i = 0; i < model.Children.length; i++) {
                                model.Children[i].Parent = model;
                                addModel(model.Children[i]);
                            }
                            node.isLoading = false;
                        }
                    )

                }

                scope.isExpanded = function (id) {
                    return getNode(id).expanded;
                }

                scope.isLoading = function (id) {
                    var node = getNode(id);
                    return (node && node.isLoading) || false;
                }

                scope.isSelected = function (id) {
                    return getNode(id).isSelected;
                }

                scope.isIndeterminate = function (id) {
                    return getNode(id).isIndeterminate;
                }

                scope.toggleSelect = function (id) {
                    var node = getNode(id);

                    if (!scope.multiselect && scope.selectedNodes.length) {
                        var selectedParents = getAllParents(scope.selectedNodes[0]);

                        for (var j = 0; j < selectedParents.length; j++) {
                            selectedParents[j].isIndeterminate = false;
                        }

                        getNode(scope.selectedNodes[0].ID).isSelected = false;
                        scope.selectedNodes.length = 0;
                    }

                    if (!node.isSelected) {
                        node.isSelected = true;
                        scope.selectedNodes.push(node.model);
                    } else {
                        node.isSelected = false;
                        var index = scope.selectedNodes.indexOf(node.model);
                        if (index > -1) {
                            scope.selectedNodes.splice(index, 1);
                        }
                    }

                    if (scope.pathSet) {
                        scope.pathSet.length = 0;
                        for (var k = 0; k < scope.selectedNodes.length; k++) {
                            scope.pathSet.push(getModelPath(scope.selectedNodes[k]));
                        }
                    }

                    var parents = getAllParents(node.model);
                    if (node.isSelected) {
                        for (var i = 0; i < parents.length; i++) {
                            parents[i].isIndeterminate = true;
                        }
                    } else {
                        for (var j = 0; j < parents.length; j++) {
                            if (!hasSelectedOrIndeterminateChildren(parents[j])) {
                                parents[j].isIndeterminate = false;
                            }
                        }
                    }
                };

                function hasSelectedOrIndeterminateChildren(node) {
                    for (var i = 0; i < node.model.Children.length; i++) {
                        var child = getNode(node.model.Children[i].ID);
                        if (child.isSelected || child.isIndeterminate) {
                            return true;
                        }
                    }
                    return false;
                }

                function getModelPath(model) {
                    return getAllParentsModel(model, [model]).reverse();
                }

                function getAllParentsModel(model, parents) {
                    parents = parents || [];
                    if (model.Parent) {
                        parents.push(model.Parent);

                        return getAllParentsModel(model.Parent, parents);
                    }

                    return parents;
                }

                function getAllParents(model, parents) {
                    parents = parents || [];
                    if (model.Parent) {
                        parents.push(getNode(model.Parent.ID));
                        return getAllParents(model.Parent, parents);
                    }

                    return parents;
                }

                function selectExpand() {
                    var ids = [];
                    if (scope.selectedNodes.length) {
                        for (var j = 0; j < scope.selectedNodes.length; j++) {
                            ids.push(scope.selectedNodes[j].ID);
                        }
                    } else if (scope.selectedNodes.ID) {
                        ids.push(scope.selectedNodes.ID);
                    }

                    scope.selectedNodes.length = 0;

                    for (var k = 0; k < ids.length; k++) {
                        var nodeID = ids[k];

                        var selectedNode = getNode(nodeID);
                        if (selectedNode) {
                            for (var i = 0; i < scope.selectedNodes.length; i++) {
                                if (scope.selectedNodes[i].ID === selectedNode.model.ID) {
                                    scope.selectedNodes[i] = selectedNode.model;
                                    break;
                                }
                            }

                            if (!selectedNode.isSelected) {
                                scope.toggleSelect(selectedNode.model.ID);
                            }

                            expandAllParents(selectedNode.model.Parent.ID);
                        }
                    }
                }
            }
        };
    }

    function indeterminateCheckbox() {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                scope.$watch(attrs.indeterminate, function (indeterminate) {
                    var checked = scope.$eval(attrs.ngChecked);
                    if (!checked) {
                        element.prop("indeterminate", indeterminate);
                    }
                });

                scope.$watch(attrs.ngChecked, function (checked) {
                    var indeterminate = scope.$eval(attrs.indeterminate);
                    if (checked) {
                        element.prop("indeterminate", false);
                    } else {
                        element.prop("indeterminate", indeterminate);
                    }
                });
            }
        };
    }
})(angular);