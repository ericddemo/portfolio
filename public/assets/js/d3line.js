var createD3Line = function(){
  // Set the dimensions of the canvas / graph
  var margin = {top: 40, right: 20, bottom: 30, left: 50},
      width = 675 - margin.left - margin.right,
      height = 325 - margin.top - margin.bottom;

  // Parse the date / time
  var parseDate = d3.time.format("%y").parse,
      formatDate = d3.time.format("%Y"),
      bisectDate = d3.bisector(function(d) { return d.date; }).left;

  // Set the ranges
  var x = d3.time.scale().range([0, width]);
  var y = d3.scale.linear().range([height, 0]);

  // Define the axes
  var xAxis = d3.svg.axis().scale(x)
    .orient("bottom")
    .ticks(10)
    .tickFormat(d3.time.format("%Y"));

  var yAxis = d3.svg.axis().scale(y)
    .orient("left")
    .ticks(10);

  // Define the line
  var valueline = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.count); });
      
  // Adds the svg canvas
  var svg = d3.select("#chart2")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", "0 0 770 500")
    .attr("preserveAspectRatio", "xMinYMid meet")
    .style("overflow","visible")
    .append("g")
    .attr("transform", "translate(" + (margin.left+10) + "," + margin.top + ")");

  var lineSvg = svg.append("g"); 

  var focus = svg.append("g") 
      .style("display", "none");

  // Get the data
  d3.json("/turbo/l_bluray_library.p_bluray_json?i_action=count.year", function(error, data) {
      data.forEach(function(d) {
          d.date = parseDate(d.date);
          d.count = +d.count;
      });

    data.sort(function(a, b){ return d3.ascending(a.date, b.date); });
    var sum = d3.sum(data, function(d) { return d.count; });

      // Scale the range of the data
      x.domain(d3.extent(data, function(d) { return d.date; }));
      y.domain([0, d3.max(data, function(d) { return d.count; })]);

      // add the line with data/values
      lineSvg.append("path")
          .attr("class", "line")
          .attr("d", valueline(data));

      // create x axis
      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
          .style("fill", "white");

      // create y axis
      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
          .style("fill", "white");

      svg.append("text")
        .attr("text-anchor", "middle") 
        .attr("transform", "translate(-40,100)rotate(-90)")
        .style("fill","white")
        .style("font-size", "15px")
        .text("# of Blurays");

      svg.append("text")
        .attr("text-anchor", "middle") 
        .attr("transform", "translate(300,300)")
        .style("fill","white")
        .style("font-size", "15px")
        .text("Year Acquired");
      
      //add header to chart
      /*svg.append("text")
        .attr("x", (width / 2.5))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight","bold")
        .text("Blurays collected by year");*/
      
     // append the x line
      focus.append("line")
          .attr("class", "x")
          .style("stroke", "#2CA02C")
          .style("stroke-dasharray", "10,5")
          .style("opacity", 0.9)
          .attr("y1", 0)
          .attr("y2", height);

      // append the y line
      focus.append("line")
          .attr("class", "y")
          .style("stroke", "#2CA02C")
          .style("stroke-dasharray", "10,5")
          .style("opacity", 0.9)
          .attr("x1", width)
          .attr("x2", width);

      // append the circle at the intersection
      focus.append("circle")
          .attr("class", "y")
          .style("fill", "red")
          .style("stroke", "red")
          .style("stroke-width",2)
          .attr("r", 4);

      // place the value at the intersection
      focus.append("text")
          .attr("class", "y1")
          //.style("stroke", "white")
          .style("fill","white")
          //.style("stroke-width", "2.5px")
          .style("opacity", 0.9)
          .attr("dx", 8)
          .attr("dy", "-.3em");
      focus.append("text")
          .attr("class", "y2")
          .style("fill","white")
          .attr("dx", 8)
          .attr("dy", "-.3em");

      // place the date at the intersection
      focus.append("text")
          .attr("class", "y3")
          .style("fill","white")
          .style("opacity", 0.9)
          .attr("dx", 8)
          .attr("dy", "1em");
      focus.append("text")
          .attr("class", "y4")
          .style("fill","white")
          .attr("dx", 8)
          .attr("dy", "1em");
      
      // append the rectangle to capture mouse
      svg.append("rect")
          .attr("width", width+50)
          .attr("height", height)
          .style("fill", "none")
          .style("pointer-events", "all")
          .on("mouseover", function() { focus.style("display", null); })
          .on("mouseout", function() { focus.style("display", "none"); })
          .on("mousemove", mousemove);
      
      svg.selectAll(".tick")
        .each(function (d, i) {
            if ( d == 0 ) {
                this.remove();
            }
        });

    function mousemove() {
      var x0 = x.invert(d3.mouse(this)[0]),
          i = bisectDate(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i],
          d = x0 - d0.date > d1.date - x0 ? d1 : d0;

      focus.select("circle.y")
          .attr("transform",
                "translate(" + x(d.date) + "," +
                               y(d.count) + ")");

      focus.select("text.y1")
          .attr("transform",
                "translate(" + x(d.date) + "," +
                               y(d.count) + ")")
          .text('Count: ' + d.count + " (" + Math.round((d.count / sum)*100) + "%)");

      focus.select("text.y2")
          .attr("transform",
                "translate(" + x(d.date) + "," +
                               y(d.count) + ")")
          .text('Count: ' + d.count + " (" + Math.round((d.count / sum)*100) + "%)");
        
      focus.select("text.y3")
          .attr("transform",
                "translate(" + x(d.date) + "," +
                               y(d.count) + ")")
          .text('Year: ' + formatDate(d.date));

      focus.select("text.y4")
          .attr("transform",
                "translate(" + x(d.date) + "," +
                               y(d.count) + ")")
          .text('Year: ' + formatDate(d.date));

      focus.select(".x")
          .attr("transform",
                "translate(" + x(d.date) + "," +
                               y(d.count) + ")")
                     .attr("y2", height - y(d.count));

      focus.select(".y")
          .attr("transform",
                "translate(" + width * -1 + "," +
                               y(d.count) + ")")
                     .attr("x2", width + width);
    }

  });
}