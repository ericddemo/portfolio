/*******************************************************************************
* Copyright 2015, The IKANOW Open Source Project.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
******************************************************************************/

/**
 * @ngdoc directive
 * @name app.tables.directive:ikDataTable
 * @description
 * ikDataTable is a jQuery dataTables looking table, but all written in Angular.
 * @attribute {array} ikDataTable, directive attribute should pass your data array for the table.
 * @attribute {array} tableColumns. Array of Objects
 * @attribute {object} tableFilters. Object with properties matching tableColumn Objects.model. Use to set the column filter if you have coulmn filters enabled.
 * @attribute {object} tableOptions. Object that currently can have tableFilter {bool} columnFilters {bool} properties. tableFilter controls having the top level table filter. columnFilters controls having filters on the columns.
 * @attribute {object} tableFilterStates. Object for your controller to view current active filters and sorting information. 
*/

/**
 * tableColumns Object definition
 * @property {string} model, as in $scope model name.
 * @property {string|function} dataProperty. String represents property name on data object. Fn defines getter for nested data object property.
 * @property {function} sortProperty. Fn defines getter for nested object property. Use if sorting on select/options or radio buttons.
 * @property {bool} Enabled. If false, the column filtering will ignore that filter column.
 * @property {string | bool | number} defaultState. If using column filtering and you want a default value, provide one.
 * @property {string} colHeader. Required. Column header pretty text.
 * @property {string} colHeaderInfoPopover. Optional. If this property (expecting string) is provided, a bootstrap questionmark with a popover will display. Mouseover action to get string in popover.
 * @property {string} template. Custom angular aware HTML template string for data cells for that column.
 * @property {string} filterTemplate. Custom angular aware HTML template string for column header filter table cell. Replaces default text input, if you would like and are using columnFilters.
 * @property {string} displayType. Accepts types of special cell contents without providing a custom template. Only accepts 'list' at this point. If list, expects an array for dataProperty. If list is longer than 3, will hide the rest of the list and add show more button.
*/
'use strict';

angular.module('demoApp')
  .directive('ikDataTable', function ($compile,$rootScope) {
    return {
        restrict: 'A',
        scope: {
            tableOptions: '=?',
            ikDataTable: '=',
            tableFilters: '=?',
            tableColumns: '=',
            rowDirective: '=?',
            tableFilterStates: '=?',
            noDataMessage: '='
        },
        templateUrl: 'templates/ikanow-datatables.html',
        controller: 'ikDataTableCtrl',
        replace: true,
        link:{
            pre: function(scope, element, attrs, ikDataTableCtrl){
              //ikDataTableCtrl.element = element;
            },
            post: function ( scope, element, attrs, ikDataTableCtrl) {

            }
          }
        };
}).directive('ikDataTableDataTruncate', function ($compile,$rootScope, $log) {
    return {
        restrict: 'A',
        scope: {
            ikDataTableDataTruncate: '='
        },
        link:{
            post: function ( scope, element, attrs, ikDataTableCtrl) {

              scope.stringLimit = 70;

              function getFilterProperty(item,filterType){
                if(typeof filterType.dataProperty == 'string'){
                  return item[filterType.dataProperty];
                }else{
                  return filterType.dataProperty(item,scope);
                }
              }

              scope.showMore = function(){
                //Angular 1.5 < bug, limitTo equal to undefined should limit nothing, but instead our version limits undefined to 0 results
                scope.longNumberLimit = 1000;
                setDisplayText();
              };
              scope.showLess = function(){
                scope.longNumberLimit = scope.stringLimit;
                setDisplayText();
              };

              scope.displayText = '';

              scope.displayShowMore = function(){
                return getFilterProperty(scope.ikDataTableDataTruncate.data,scope.ikDataTableDataTruncate.column).length >= scope.stringLimit && scope.longNumberLimit === scope.stringLimit;
              }

              function setDisplayText(){
                if(typeof getFilterProperty(scope.ikDataTableDataTruncate.data,scope.ikDataTableDataTruncate.column) !== 'string'){
                  scope.displayText = getFilterProperty(scope.ikDataTableDataTruncate.data,scope.ikDataTableDataTruncate.column).toString().slice(0,scope.longNumberLimit);
                }else{
                  scope.displayText = getFilterProperty(scope.ikDataTableDataTruncate.data,scope.ikDataTableDataTruncate.column).slice(0,scope.longNumberLimit);
                }
              }

              function generateTruncateTemplate(){

                var spanTemplate = angular.element('<span></span>');
                setDisplayText();
                
                spanTemplate.append('{{displayText}}<span ng-if="displayShowMore()">...</span>');
                spanTemplate.append('<br><br><a ng-click="showMore()" ng-if="displayShowMore()">Show More</a> <a ng-click="showLess()" ng-if="longNumberLimit != stringLimit">Show Less</a>');

                element.html($compile(spanTemplate)(scope));
              }

              function generateNormalTemplate(){

                var spanTemplate = angular.element('<span></span>');
                
                spanTemplate.append('{{displayText}}');

                element.html($compile(spanTemplate)(scope));
              }

              scope.showLess();
              generateTruncateTemplate();

              scope.$watch('ikDataTableDataTruncate',function(){
                setDisplayText();
              });
              
            }
          }
        };
}).directive('ikDataTableColumn', function ($compile,$rootScope, $log) {
    return {
        restrict: 'A',
        scope: {
            ikDataTableColumn: '='
        },
        link:{
            post: function ( scope, element, attrs, ikDataTableCtrl) {
              
              function getFilterProperty(item,filterType){
                if(typeof filterType.dataProperty == 'string'){
                  return item[filterType.dataProperty];
                }else{
                  return filterType.dataProperty(item,scope);
                }
              }

              scope.longNumberLimit = 3;

              scope.showMore = function(){
                //Angular 1.5 < bug, limitTo equal to undefined should limit nothing, but instead our version limits undefined to 0 results
                scope.longNumberLimit = 100;
              };
              scope.showLess = function(){
                scope.longNumberLimit = 3;
              };

              scope.displayShowMore = function(){
                return scope.ikDataTableColumn.data[scope.ikDataTableColumn.column.dataProperty].length > 3 && scope.longNumberLimit === 3;
              }

              function generateTemplate(){
                  scope.showLess();

                  if(angular.isArray(scope.ikDataTableColumn.data[scope.ikDataTableColumn.column.dataProperty]) === false){
                    $log.error('expected [Array] when using ikDataTable:displayType: "list"');
                  }

                  var itemArray = getFilterProperty(scope.ikDataTableColumn.data,scope.ikDataTableColumn.column);
                  var showMore = scope.ikDataTableColumn.data[scope.ikDataTableColumn.column.dataProperty].length - 3;
                  var arrayTemplate = angular.element('<td></td>');

                  arrayTemplate.append('<div ng-repeat="item in ikDataTableColumn.data[ikDataTableColumn.column.dataProperty] | limitTo:longNumberLimit">{{item}}</div>');
                  arrayTemplate.append('<a ng-click="showMore()" ng-if="displayShowMore()">Show {{ikDataTableColumn.data[ikDataTableColumn.column.dataProperty].length - 3}} More...</a> <a ng-click="showLess()" ng-if="longNumberLimit != 3">Show Less...</a>');

                  element.replaceWith($compile(arrayTemplate)(scope));
                }

              if(scope.ikDataTableColumn.column.template){
                element.replaceWith($compile(scope.ikDataTableColumn.column.template)(scope.$parent))
              }
              else if(scope.ikDataTableColumn.column.displayType && scope.ikDataTableColumn.column.displayType === 'list'){

                generateTemplate();                    

                scope.$watch(function(){
                  return scope.ikDataTableColumn.data[scope.ikDataTableColumn.column.dataProperty];
                },function(){
                  generateTemplate();
                });
              }
            }
          }
        };
}).directive('ikDataTableFilter', function ($compile,$rootScope) {
    return {
        restrict: 'A',
        scope: {
            ikDataTableFilter: '='
        },
        link:{
            post: function ( scope, element, attrs, ikDataTableCtrl) {
              if(scope.ikDataTableFilter.column.filterTemplate){
                element.replaceWith($compile(scope.ikDataTableFilter.column.filterTemplate)(scope.$parent))
              }
            }
          }
        };
}).directive('ikDataTableMessage', function ($compile,$rootScope) {
    return {
        restrict: 'A',
        link:{
            post: function ( scope, element, attrs, ikDataTableCtrl) {
              if(angular.isDefined(scope.options.tableMessageTemplate)){
                element.replaceWith($compile(scope.options.tableMessageTemplate)(scope.$parent))
              }
            }
          }
        };
}).controller('ikDataTableCtrl', function ($scope, $log, $timeout) {

  $scope.appScope = $scope.$parent;
  
  if(angular.isDefined($scope.ikDataTable) === false || angular.isArray($scope.ikDataTable) === false){
    $log.error("ikDataTable requires parameter and oftype array for tables data object");
  }

  $scope.options = {
    tableFilter: true,
    columnFilters: false,
    predicate: '',
    sortingReverse: false,
    userDisplayLengthOptions: [25,50,75,100],
    tableFilterValue: '',
    resetPageOnDataReload: true,
    tableMessageTemplate: null
  }
  
  $scope.reverse = true,
  $scope.predicate = '',
  $scope.textPredicateName = '',
  $scope.userDisplayLength = $scope.options.userDisplayLengthOptions[0],
  $scope.sliceStart = 0,
  $scope.sliceEnd = $scope.sliceStart + $scope.userDisplayLength,
  $scope.currentPage = 1,
  $scope.lastPage = 1,
  $scope.pages = [1],
  $scope.displayPages = [1],
  $scope.dynamicModel = {}
  ;

  var activeUserFilterInput = false;
  var fastDataWatch = false;
  var currentFastDataWatchValue = null;

  var filters;
  var masterItemList = angular.copy($scope.ikDataTable);//masterItemList {array} contains all data elements for table

  //Extend options object
  angular.extend($scope.options,$scope.tableOptions);

  if($scope.tableOptions && $scope.tableOptions.hasOwnProperty('fastDataWatch')){
    fastDataWatch = true;
  }

  //Init tableFilters if not used/passed in ikanowDataTable directive
  if(angular.isDefined($scope.tableFilters) === false){
    $scope.tableFilters = {};
  }

  setupTableFilterStates();

  // **********************************
  // Parent controller variable watches
  // **********************************

  // watch tableFilters, change table column filters
  $scope.$watchCollection(function(){
    return $scope.tableFilters;
  },function(newValue, oldValue){
    updateTableColumns();
    updateTableFilters();
    changeOptions();
    $scope.filterData();
  });

  // watch tableOptions, options object
  $scope.$watchCollection(function(){
    return $scope.tableOptions;
  },function(newValue, oldValue){
    changeOptions();
  });


  function dataWatchFunction (newValue, oldValue){
    
    var enabledFilters = _.filter(filters, function(d){
      return d.enabled;
    });

    masterItemList = angular.copy(newValue);

    masterItemList.forEach(function(d){
      d.entireRow = '';

      enabledFilters.forEach(function(filterType){
        d.entireRow = d.entireRow + ' ' + getFilterProperty(d, filterType);
      });

    });

    if($scope.ikDataTable.length === 0){
      masterItemList = [];
    }

    $scope.filterData();

    if (newValue !== oldValue) {
      $scope.noData = $scope.ikDataTable.length == 0;
    }
  }

  // watch ikDataTable, Data object if fastDataWatch not enabled
  if($scope.tableOptions && $scope.tableOptions.hasOwnProperty('fastDataWatch')){
    fastDataWatch = true;
  }else{
    $scope.$watchCollection('ikDataTable',dataWatchFunction);
  }

  function changeOptions(){
    angular.extend($scope.options,$scope.tableOptions);
    

    if($scope.options.columnFilters === false){
      $scope.resetFilters();
    }

    //If tableFilter option changes, clear filter
    if($scope.options.tableFilter === false){
      $scope.tableFilter = '';
    }

    //If sortingReverse option is opposite of $scope.reverse, flip reverse flag for sorting asc/desc
    if($scope.options.sortingReverse !== $scope.reverse){
      $scope.reverse = !$scope.reverse;
    }

    if($scope.options.tableFilterValue.length > 0){
      $scope.tableFilter = $scope.options.tableFilterValue;
    }
    
    if(fastDataWatch){
      masterItemList = angular.copy($scope.ikDataTable);

      var enabledFilters = _.filter(filters, function(d){
        return d.enabled;
      });

      masterItemList.forEach(function(d){
      d.entireRow = '';

      enabledFilters.forEach(function(filterType){
        d.entireRow = d.entireRow + ' ' + getFilterProperty(d, filterType);
      });

    });
    }

    $scope.userDisplayLength = $scope.options.userDisplayLengthOptions[0];

    setPredicate();
    $scope.filterData();
  }

  // **********************************
  // Guts of ikanow dataTable
  // **********************************

  function setupTableFilterStates(){
    $scope.tableFilterStates = {
      predicate: $scope.predicate,
      textPredicateName: $scope.textPredicateName,
      reverse: $scope.reverse,
      filters: {}
    };
  }

  function setPredicate(){
    var predicate = '';
    if($scope.options.predicate.length > 0){
      predicate = $scope.options.predicate;
    }
    $scope.predicate = predicate,
      $scope.textPredicateName = predicate;
  }

  //Define table columns on scope, filter for enabled, set default filter state on dynamicModel
  function updateTableColumns(){
    //filters = $scope.tableColumns; //master filter list from client 
    $scope.columns = _.filter($scope.tableColumns,function(d){
      return d.enabled;
    });

    filters = $scope.columns; //master filter list from client 

    $scope.columns.forEach(function(d){
      if(angular.isDefined(d.defaultState)){
        $scope.dynamicModel[d.model] = d.defaultState;
      }if(angular.isDefined(d.displayType) === false){
        d.displayType = null;
      }
    });
  }

  //When Parent controller changes tableFilters obj, take in changes, so long as columns definition has model type that matches filter property
  function updateTableFilters(){
    if(angular.isDefined($scope.tableFilters)){
      $scope.columns.forEach(function(d){
        if($scope.tableFilters.hasOwnProperty(d.model)){
          $scope.dynamicModel[d.model] = $scope.tableFilters[d.model];
          $scope[d.model] = $scope.tableFilters[d.model];
          $scope.tableFilterStates.filters[d.model] = $scope.dynamicModel[d.model];
        }else{
          $scope.dynamicModel[d.model] = d.defaultState;
          $scope[d.model] = d.defaultState;
          $scope.tableFilterStates.filters[d.model] = $scope.dynamicModel[d.model];
        }
      });
    }
  }

  $scope.truncateTestTrue = function(column){
    return column.displayType === 'truncate';
  };

  $scope.isDefined = function (testedItem){
    return angular.isDefined(testedItem);
  };

  //ngClass ascending test
  $scope.ascTest = function(title){
    return title === $scope.textPredicateName && $scope.reverse;
  };

  //ngClass descending test
  $scope.descTest = function(title){
    return title === $scope.textPredicateName && !$scope.reverse;
  };

  function getOrderPredicate(predicate){
    if(predicate === ''){
      return '';
    }
    var columnObj = _.find(filters, function(filter){
     return filter.model === predicate;
    });
    return columnObj.sortProperty ? columnObj.sortProperty : columnObj.dataProperty;
  }

  function getFilterProperty(item,filterType, isTopTableFilter){
    if(isTopTableFilter && filterType.tableFilter){
      if(typeof filterType.tableFilter == 'string'){
        return item[filterType.tableFilter];
      }else{
        return filterType.tableFilter(item,$scope);
      }
    }else if(typeof filterType.dataProperty == 'string'){
      return item[filterType.dataProperty];
    }else{
      return filterType.dataProperty(item,$scope);
    }
  }

  $scope.getFilterProperty = getFilterProperty;

  //Click listener to order on a column
  $scope.order = function(predicate) {
    $scope.reverse = ($scope.textPredicateName === predicate) ? !$scope.reverse : $scope.options.sortingReverse;

    $scope.textPredicateName = predicate;
    
    $scope.predicate = getOrderPredicate(predicate);

    
    $scope.tableFilterStates.predicate = $scope.predicate,
      $scope.tableFilterStates.textPredicateName = $scope.textPredicateName,
      $scope.tableFilterStates.reverse = $scope.reverse;

    $scope.filterData();
  };

  var activeUITimeout;

  //Change listener to filter based off UI filter input changes
  $scope.onChangeFilterData = function(){
    //$scope.saveVulnerabilityFilters();

    activeUserFilterInput = true;

    $timeout.cancel(activeUITimeout);

    activeUITimeout = $timeout(function(){
      activeUserFilterInput = false;
      $scope.filterData();
    },300);
    //$scope.filterData();

    $scope.columns.forEach(function(d){
      $scope[d.model] = $scope.dynamicModel[d.model];
      $scope.tableFilterStates.filters[d.model] = $scope.dynamicModel[d.model];
    });

    $scope.changePage(1);
  };

  var queuedFilterDataAlready = false;

  //The all-knowing pimp filter table data, take master list, filter, filter, sort, paginate
  $scope.filterData = function(){

    $scope.itemListLength = masterItemList.length;

    var increment = 0;

    var enabledFilters = _.filter(filters, function(d){
      return d.enabled && angular.isDefined($scope.dynamicModel[d.model]) && $scope.dynamicModel[d.model].length > 0;
    });
    
    $scope.itemListFiltered = _.chain(masterItemList)
    .filter(function(item){
      
      var filter = true, globalFilter = [];

      if(activeUserFilterInput){
        console.log('active user input');
        return;
      }//entireRow

      if($scope.tableFilter && $scope.tableFilter.length > 0) {
        var regex = new RegExp($scope.tableFilter.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&"),'gi'); //escape special characters
        //if a match is found, push item to array so we know to return true
        if( regex.test(item.entireRow) ) { globalFilter.push(1); }
      } else {
        globalFilter.push(1); //filter empty, always push an item to array to return true
      }
      
      enabledFilters.forEach(function(filterType){

        if(activeUserFilterInput){
          console.log('active user input');
          return;
        }
        
        if($scope.options.columnFilters === false){ //Is column filtering enabled
          return;
        }
        if(filter === false){ //Did I already fail filter regex
          return;
        }
        if(filterType.enabled === false){ //Is this column filter enabled
          return;
        }
        increment++;

        if(angular.isDefined(getFilterProperty(item,filterType))){
          var regString = "(" + $scope.dynamicModel[filterType.model] + ")";
          var regex = new RegExp(regString,'gi');
          filter = regex.test(getFilterProperty(item,filterType));
        }
      });

      return (filter && globalFilter.length > 0);

    }).orderBy([getOrderPredicate($scope.textPredicateName)],[$scope.reverse ? 'asc': 'desc']).value();

    //Pagination start, end
    $scope.itemList = $scope.itemListFiltered.slice($scope.sliceStart,$scope.sliceStart + $scope.userDisplayLength);
    calculatePageTotal();
  };

  $scope.changeDisplayLength = function(){
    $scope.userDisplayLength = parseInt($scope.userDisplayLength);
    $scope.filterData();
    $scope.changePage(1);
  };

  $scope.changePage = function(pageNumber){
    $scope.sliceStart = (pageNumber - 1) * $scope.userDisplayLength;
    $scope.sliceEnd = $scope.sliceStart + $scope.userDisplayLength;
    $scope.currentPage = pageNumber;
    var pageCount = Math.ceil($scope.itemListFiltered.length / $scope.userDisplayLength);

    $scope.displayPages = [];

    var pageIndex = $scope.pages.indexOf(pageNumber);

    var fromEnd = $scope.pages.length - 1 - pageIndex;
    var fromStart = pageIndex;

    if($scope.pages.length > 7){
      if(pageIndex < 5){
        for(var i = 1; i <= pageCount; i++){
          if(i > 7){
            break;
          }
          $scope.displayPages.push(i);
        }
      }else if(pageIndex >= 5 && fromEnd > 5 ){
        for(var i = pageNumber - 3; i <= pageNumber + 3; i++){
          $scope.displayPages.push(i);
        }
      }else{

        for(var i = $scope.pages[$scope.pages.length - 1] - 7; i <= $scope.pages[$scope.pages.length - 1]; i++){
          $scope.displayPages.push(i);
        }
      }
    }else{
      for(var i = 1; i <= $scope.pages.length; i++){
          $scope.displayPages.push(i);
      }
    }

    $scope.itemList = $scope.itemListFiltered.slice($scope.sliceStart,$scope.sliceStart + $scope.userDisplayLength);

  };

  function calculatePageTotal(){
    var pageCount = Math.ceil($scope.itemListFiltered.length / $scope.userDisplayLength);
    $scope.pages = [];
    $scope.displayPages = [];

    for(var i = 1; i <= pageCount; i++){
      if(i > 7){
        break;
      }
      $scope.displayPages.push(i);
    }

    for(var i = 1; i <= pageCount; i++){
        $scope.pages.push(i);
    }

    if ($scope.options.resetPageOnDataReload){
      $scope.changePage(1);
    }
    
    if($scope.pages.length > 0){
      $scope.lastPage = $scope.pages[$scope.pages.length - 1];
    }
  }

  $scope.resetFilters = function(){
    $scope.columns.forEach(function(column){
      if(angular.isDefined(column.defaultState)){
        $scope[column.model] = column.defaultState;
        $scope.dynamicModel[column.model] = column.defaultState;
      }
    });
    $scope.tableFilter = '';
    $scope.filterData();
  };

  $scope.resetFilter = function () {
    $scope.tableFilter = '';
    $scope.filterData();
  }

  updateTableColumns();
  $scope.resetFilters();
  $scope.filterData();

});
