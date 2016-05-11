var createD3Donut = function(){
  var width = 360;
  var height = 360;
  var radius = Math.min(width, height) / 2;
  var donutWidth = 75;
  var legendRectSize = 18;
  var legendSpacing = 4;

  //intitiate d3 color scale
  var color = d3.scale.category10();
  //set domain of scale so colors can be reliably referenced by name
  var domain = ["Comedy", "Sci-fi", "Animated", "Drama", "Horror", "Romance", "Action"];
  domain = domain.sort();
  color.domain(domain);

  var svg = d3.select("#chart")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", "0 0 380 380")
    .attr("preserveAspectRatio", "xMinYMid meet")
    .append("g")
    .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

  var arc = d3.svg.arc()
    .innerRadius(radius - donutWidth)
    .outerRadius(radius);

  var pie = d3.layout.pie()
    .value(function(d) { return d.count; })
    .sort(null);

  var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip2");
  
  tooltip.append("div")
    .attr("class", "genre");

  tooltip.append("div")
    .attr("class", "count");

  tooltip.append("div")
    .attr("class", "percent");

  d3.json("/turbo/l_bluray_library.p_bluray_json?i_action=count.genre", function(error, dataset) {
    dataset.forEach(function(d) {
      d.count = +d.count;
      d.enabled = true;
    });

    var path = svg.selectAll("path")
      .data(pie(dataset))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", function(d, i) { 
        return color(d.data.genre); 
      })
      .each(function(d) { this._current = d; });

    path.on("mouseover", function(d) {
      var total = d3.sum(dataset.map(function(d) {
        return (d.enabled) ? d.count : 0;
      }));
      var percent = Math.round(1000 * d.data.count / total) / 10;

      var xPosition = d3.event.pageX - 70;
      var yPosition = d3.event.pageY - 75;

      tooltip.style("left", xPosition + "px")
      tooltip.style("top", yPosition + "px");
      tooltip.select(".genre").html('<b>Genre:</b> ' + d.data.genre);
      tooltip.select(".count").html('<b>Count:</b> ' + d.data.count); 
      tooltip.select(".percent").html('<b>% of Total:</b> ' + percent);
      tooltip.style("display", "block");
    });
    
    path.on("mouseout", function() {
      tooltip.style("display", "none");
    });


      
    var legend = svg.selectAll(".legend")
      .data(color.domain())
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) {
        var height = legendRectSize + legendSpacing;
        var offset =  height * color.domain().length / 2;
        var horz = -2 * legendRectSize;
        var vert = i * height - offset;
        return "translate(" + horz + "," + vert + ")";
      });

    legend.append("rect")
      .attr("width", legendRectSize)
      .attr("height", legendRectSize)
      .style("fill", color)
      .style("stroke", color)
      .on("click", function(genre) {
        var rect = d3.select(this);
        var enabled = true;
        var totalEnabled = d3.sum(dataset.map(function(d) {
          return (d.enabled) ? 1 : 0;
        }));

        if (rect.attr("class") === "disabled") {
          rect.attr("class", "");
        } else {
          if (totalEnabled < 2) return;
          rect.attr("class", "disabled");
          enabled = false;
        }   

        pie.value(function(d) {
          if (d.genre === genre) d.enabled = enabled;
          return (d.enabled) ? d.count : 0;
        });

        path = path.data(pie(dataset));

        path.transition()
          .duration(750)
          .attrTween("d", function(d) {
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
              return arc(interpolate(t));
            };
          });
      });
      
    legend.append("text")
      .style("fill", "white")
      .attr("x", legendRectSize + legendSpacing)
      .attr("y", legendRectSize - legendSpacing)
      .text(function(d) { return d; });

  });
}