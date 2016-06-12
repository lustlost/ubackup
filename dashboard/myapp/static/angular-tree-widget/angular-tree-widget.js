/*
	@license Angular TreeWidget version 1.0.1
	ⓒ 2016 Alex Suleap https://github.com/AlexSuleap/agular-tree-widget
	License: MIT
*/

(function (angular) {
    'use strict';

    angular.module('TreeWidget', ['ngAnimate', 'RecursionHelper'])
        .directive('tree', function () {
            return {
                restrict: "E",
                scope: { nodes: '=', options: '=?' },
                template: "<treenode nodes='nodes' tree='nodelist' options='options'></treenode>",
                compile: function compile(tElement, tAttrs, transclude) {
                    return {
                        pre: function (scope) {
                            scope.nodelist = [];
                            scope.options = scope.options || (scope.options = { showIcon: true, expandOnClick: false, multipleSelect: false });
                            scope.count = 0;
                            function generateNodeList(nodes, parent) {
                                if (nodes != undefined) {
                                    if (nodes.length > 0) {
                                        for (var i = 0; i < nodes.length ; i++) {
                                            var node = nodes[i];

                                            //Generate node ids if no ids are defined
                                            if (node.nodeId === undefined) {
                                                node.nodeId = "tree-node-" + scope.count;
                                                scope.count++;
                                            }

                                            //expanded all the nodes
                                            if (node.expanded === undefined && node.children != undefined) {
                                                node.expanded = true;
                                            }
                                            if (parent != undefined) {
                                                node.parentId = parent.nodeId;
                                            }
                                            if (scope.nodelist.indexOf(node) == -1) {
                                                scope.nodelist.push(node);
                                            }
                                            generateNodeList(node.children, node);
                                        }
                                    }
                                }
                            }

                            scope.$watch(function () {
                                generateNodeList(scope.nodes);
                            });
                        }
                    }
                }
            }
        })
        .directive('treenode', ['RecursionHelper', function (RecursionHelper) {
            return {
                restrict: "E",
                scope: { nodes: '=', tree: '=', options: '=?' },
                template: '<ul>'
                            + '<li ng-repeat="node in nodes" class="node">'
                                + '<i class="tree-node-ico pointer" ng-class="{\'tree-node-expanded\': node.expanded,\'tree-node-collapsed\':!node.expanded && node.children}" ng-click="toggleNode(node)"></i>'
                                + '<span class="node-title pointer"ng-click="selectNode(node)" ng-class="{\'disabled\':node.disabled}">'
                                    + '<span><i class="tree-node-ico" ng-if="options.showIcon" ng-class="{\'tree-node-image\':node.children, \'tree-node-leaf\':!node.children}" ng-style="node.image && {\'background-image\':\'url(\'+node.image+\')\'}"></i>'
                                    + '<span class="node-name" ng-class="{selected: node.selected&& !node.disabled}">{{node.name}}</span></span>'
                                + '</span>'
                                + '<treenode ng-if="node.children" nodes=\'node.children\' tree="tree" options="options" ng-show="node.expanded" id="{{node.nodeId}}"></treenode>'
                            + '</li>'
                        + '</ul>',
                compile: function (element) {
                    return RecursionHelper.compile(element, function (scope, iElement, iAttrs, controller, transcludeFn) {
                        //Select node
                        scope.selectNode = function (node) {
                            if (node.disabled) { return; }
                            if (scope.options.multipleSelect) {
                                node.selected = !node.selected;
                                scope.$emit('selection-changed', scope.tree.filter(function (item) { return item.selected; }));
                            }
                            else {
                                node.selected = true;
                                angular.forEach(scope.tree, function (item) {
                                    if (node != item)
                                        item.selected = false;
                                });
                                scope.$emit('selection-changed', node);
                            }

                            if (scope.options.expandOnClick) {
                                if (node.children != undefined) {
                                    node.expanded = !node.expanded;
                                    scope.$emit('expanded-state-changed', node);
                                }
                            }
                        }

                        //Expand collapse node
                        scope.toggleNode = function (node) {
                            if (node.children != undefined) {
                                node.expanded = !node.expanded;
                                scope.$emit('expanded-state-changed', node);
                            }
                        }
                    });
                }
            }
        }]);

})(angular);
