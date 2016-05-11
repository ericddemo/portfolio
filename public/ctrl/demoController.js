'use strict';

angular.module('demoApp')
  .controller('demoController', ['$scope', '$http', '$interval', '$compile', 'demoService', '$window',
                        function ($scope, $http, $interval, $compile, demoService, $window) {

    $scope.blurayList = [];

    $scope.loadingMessage = 'Loading Table...';
    $scope.loadingPromise = demoService.getBlurayList();

    $scope.loadingPromise.then(function(data){
      $scope.blurayList = data;
    });

    $scope.tableOptions = {
      columnFilters: false,
      tableFilter: true,
      userDisplayLengthOptions: [15,25,50,100],
      predicate: 'titleFilter',
      sortingReverse: true,
      resetPageOnDataReload: false
    };

    if($window.innerHeight < 700) { $scope.tableOptions.userDisplayLengthOptions = [10,25,50,100]; }

    $scope.filters = [
      {
        model: "titleFilter",
        colHeader: "Title",
        dataProperty: "title",
        sortProperty: function(d){
          return _.trim(d.title.toLowerCase());
        },
        enabled: true
      },
      {
        model: "genreFilter",
        colHeader: "Genre",
        dataProperty: "genre",
        sortProperty: function(d){
          return _.trim(d.genre.toLowerCase());
        },
        enabled: true,
        template: '<td>'
                    +'<span><i class="fa fa-square" genre-color="{{item.genre}}"></i>&nbsp;{{item.genre}}</span>'
                  +'</td>'
      },
      {
        model: "ratingFilter",
        colHeader: "IMDB Rating",
        dataProperty: "rating",
        enabled: true,
        template: '<td>'
                    +'<span>{{item.rating}}&nbsp;&nbsp;<i class="fa fa-lg" rating-icon="{{item.rating}}"></i></span>'
                  +'</td>'
      }
    ];

    var config = {
      settings: {
        showCloseIcon: false,
        showPopoutIcon: false
      },
      content: [{
          type: 'row',
          content:[{
              type: 'component',
              title: "Custom AngularJS datatable directive",
              componentName: 'blurayGrid',
              componentState: { label: 'A' },
              width: 60
          },{
              type: 'column',
              content:[{
                  type: 'component',
                  title: 'D3.js line - blurays added by year',
                  componentName: 'd3LineComponent',
                  componentState: { label: 'B' }
              },{
                  type: 'component',
                  title: "D3.js donut - count by genre",
                  componentName: 'd3DonutComponent',
                  componentState: { label: 'C' }
              }]
          }]
      }]
    };

    var myLayout = new GoldenLayout(config, $("#glcontainer"));

    var BlurayGridComponent = function( container, state ) {

      $http.get("templates/bluray-table.html", {cache:true}).success(function(html) {
        html = $compile(html)($scope);
        container.getElement().html(html);
      });

    };
   
    myLayout.registerComponent( 'template', function( container, state ){
        var html = $compile('<div>{{test}}</div>')($scope);
        container.getElement().html(html);
    });

    myLayout.registerComponent( 'testComponent', function( container, componentState ){
        container.getElement().html( '<h2>' + $scope.test + '</h2>' );
    });

    myLayout.registerComponent( 'blurayGrid', BlurayGridComponent );

    myLayout.registerComponent( 'd3DonutComponent', function( container, componentState ){
        container.getElement().html( '<div id="chart"></div>' );

        var interval = setInterval(function(){
          
          var checkSvg = d3.select("#chart")
          
          if(checkSvg[0][0] == null) { return; }

          clearInterval( interval );
          createD3Donut();

          container.getElement().css("overflow","hidden");
          
        }.bind(this), 100 );
    });

    myLayout.registerComponent( 'd3LineComponent', function( container, componentState ){
        container.getElement().html( '<div id="chart2"></div>' );

        var interval = setInterval(function(){
          
          var checkSvg = d3.select("#chart2")
          
          if(checkSvg[0][0] == null) { return; }

          clearInterval( interval );
          createD3Line();

          container.getElement().css("overflow","hidden");
          
        }.bind(this), 100 );
    });

    myLayout.init();
}]);