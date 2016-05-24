'use strict';

angular.module('demoApp')
  .controller('newsmapController', ['$scope','$interval', '$compile', function ($scope, $interval, $compile) {

    $scope.category = "all";

    var div, treemap, color, domain;
    var margin = {top: 40, right: 10, bottom: 10, left: 10};

    $scope.changeCat = function(event){
      if($(event.target).attr("data-cat") == $scope.category) return;
      zoomData($(event.target).attr("data-cat"));
    }

    function zoomData(category){
      $scope.$evalAsync(function() { $scope.category = category; });
      
      d3.select("#newsmap").remove();

      treemap = d3.layout.treemap()
        .size([getWidth(), getHeight()])
        .sticky(true)
        .value(function(d) { return d.size; });

      div = d3.select("#pdata").append("div")
        .attr("id","newsmap")
        .style("opacity","0")
        .style("position", "relative")
        .style("width", getWidth(true))
        .style("height", getHeight(true))
        .style("left", "0px")
        .style("top", margin.top-15 + "px")
        .style("margin-top","-20px");

        drawNewsmap(category);
    }

    function drawNewsmap(category){
      //dummy news.json data file,  pull from the news API in a production environment
      d3.json("news.json", function(error, root) {

        var newsData;
        
        //handle zooming based on selected category
        if(category){
          root.children.forEach(function(d){ 
            if(category == d.title) {
              newsData = d;
            } 
          });
          if(!newsData){ newsData = root }  
        } else {
          newsData = root;
        }
        var node = div.datum(newsData).selectAll(".node")
          .data(treemap.nodes)
          .enter().append("div")
          .attr("class", "node")
          .call(position)
          .on("click", function(d) { 
            window.open(d.link); 
          })
          .style("background", function(d) { return d.children ? color(d.title) : null; }) //apply background color from d3 color scale
          .style("font-size", function(d) {
            // compute font size based on area
            return Math.min(30, 0.16*Math.sqrt(d.area))+'px'; })
          .on("mousemove", mousemove) //call tooltip functions
          .on("mouseout", mouseout) 
          .text(function(d) {
            var title = d.title;
            if(title.length > 55) {
              title = title.substr(0,55) + '...';
            }
            return d.children ? null : title;
          });
      });

      d3.select("#newsmap")
        .transition().duration(750)
        .style("opacity","1");
    }

    //call tooltip on mouse move/hover
    var mousemove = function(d) {
      
      var xPosition = d3.event.pageX + 5;
      var yPosition = d3.event.pageY + 5;

      //move tooltip to the left of the mouse pointer if they are too far to the right
      if((d3.event.pageX /$(window).width()) > 0.40) { xPosition = xPosition - 318 }
      
      d3.select("#tooltip")
        .style("left", xPosition + "px")
        .style("top", yPosition + "px");

      d3.select("#tooltip #tooltipHeading")
        .text(d.title);
      d3.select("#tooltip #snippet")
        .text(d.contentSnippet);

      d3.select("#tooltip").classed("hidden", false);
      
      if((d3.event.pageY /$(window).height()) > 0.35) { 
      yPosition = yPosition - $("#tooltip").height() - 15;
      d3.select("#tooltip")
        .style("top", yPosition + "px");
      }
      
    };

    var mouseout = function() {
      d3.select("#tooltip").classed("hidden", true);
    };

    function position() {
      this
        .style("left", function(d) { return d.x + "px"; })
        .style("top", function(d) { return d.y + "px"; })
        .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
        .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
    }
    //create D3 treemap
    var createNewsmap = function(){

      //intitiate d3 color scale
      color = d3.scale.category10();
      //set domain of scale so colors can be reliably referenced by name
      domain = ["phil", "world", "business", "usa", "sport","tech"];
      color.domain(domain);

      $(".newsSelect").each(function(d,e){
        $(e).css("background", color($(e).data("cat")));
        $(e).hover(
        function () {
            $(this).css("background", "#ccc");
        },
        function () {
            $(this).css("background", color($(e).data("cat")));
        });
        
      });
        
      treemap = d3.layout.treemap()
        .size([getWidth(), getHeight()])
        .sticky(true)
        .value(function(d) { return d.size; });

      div = d3.select("#pdata").append("div")
        .attr("id","newsmap")
        .style("opacity","0")
        .style("position", "relative")
        .style("width", getWidth(true))
        .style("height", getHeight(true))
        .style("left", "0px")
        .style("top", margin.top-15 + "px")
        .style("margin-top","-20px");

      drawNewsmap();
    } //end createNewsmap()

    function getWidth(returnPixels){
      var width = $(window).width();
      width = Math.min(950,width-100);
      return returnPixels ? width + 'px' : width;
    }

    function getHeight(returnPixels){
      var height = $(window).height();
      height = Math.min(550,height-120);
      return returnPixels ? height + 'px' : height;
    }

    $(window).bind("resize", function(){
      zoomData($scope.category);
    });

    createNewsmap();
}]);