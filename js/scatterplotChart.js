var scatterplotChart = function () {
  let margin = {top:20, right:20, bottom: 20, left: 20};
  let width = 900 - margin.left - margin.right;
  let height = 400 - margin.top - margin.bottom;
  let pointColor = "steelblue";
  let pointOpacity = 0.4;
  let xValue;
  let yValue;
  let colorValue;
  let sizeValue;
  let xAxisTitle = "";
  let yAxisTitle = "";
  
  let _chartData;
  let _chartDiv;

  function chart(selection, data) {
    _chartData = data;
    _chartDiv = selection;
    drawChart();
  }

  function drawChart() {
    if (_chartDiv) {
      _chartDiv.selectAll('*').remove();
      
      if (_chartData) {
        const svg = _chartDiv.append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom);
        
        const g = svg.append('g')
          .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const x = d3.scaleLinear()
          .range([0, width])
          .domain(d3.extent(_chartData, xValue)).nice();

        const y = d3.scaleLinear()
          .range([height, 0])
          .domain(d3.extent(_chartData, yValue)).nice();

        const radius = sizeValue ? 
          d3.scaleLinear()
            .range([3, 12])
            .domain(d3.extent(_chartData, sizeValue)) :
            null;
        
        const xAxis = g => g
          .attr("class", "axis axis--x")
          .attr("transform", `translate(0, ${height})`)
          .call(d3.axisBottom(x).ticks(width / 80))
          .call(g => g.select(".domain").remove())
          .call(g => g.append("text")
            .attr("x", width + margin.right)
            .attr("y", 30)
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("font-size", 12)
            .attr("text-anchor", "end")
            .text(xAxisTitle + ' →'));
        
        g.append("g")
          .attr("transform", `translate(0,${height})`)
          .call(xAxis);
        
        const yAxis = g => g
          .attr("class", "axis axis--y")
          .call(d3.axisLeft(y))
          .call(g => g.select(".domain").remove())
          .call(g => g.append("text")
            .attr("x", -margin.left)
            .attr("y", -10)
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("font-size", 12)
            .attr("text-anchor", "start")
            .text('↑ ' + yAxisTitle));

        g.append("g")
          .call(yAxis);

        const grid = g => g
          .attr("stroke", "#000")
          .attr('stroke-opacity', 0.1)
          .call(g => g.append('g')
            .selectAll("line")
            .data(x.ticks())
            .join("line")
              .attr("x1", d => 0.5 + x(d))
              .attr("x2", d => 0.5 + x(d))
              .attr("y1", 0)
              .attr("y2", height))
          .call(g => g.append('g')
            .selectAll("line")
            .data(y.ticks())
            .join("line")
              .attr("x1", 0)
              .attr("x2", width)
              .attr("y1", d => 0.5 + y(d))
              .attr("y2", d => 0.5 + y(d)));
        
        g.append("rect")
          .attr("width", width)
          .attr("height", height)
          .attr("fill", "white")
          .attr("stroke", "none");
          
        g.append("g")
          .call(grid);

        const hoverText = (datum) => {
          var text = '';
          // console.log(d3.entries(datum));
          let entries = d3.entries(datum);
          for (let i = 0; i < entries.length; i++) {
            text += `${entries[i].key}: ${entries[i].value}`;
            if (i + 1 < entries.length) {
              text += '\n';
            }
          }
          // d3.entries(datum).map(d => {
          //   text += 
          // })
          return text;
        };

        const dot = g.append("g")
          .attr("fill", pointColor)
          .attr("fill-opacity", pointOpacity)
          .attr("stroke", "none")
          // .attr("fill", "none")
          // .attr("stroke", fillColor)
          // .attr("stroke-width", 1.5)
          .selectAll("g")
          .data(_chartData)
          .join("circle")
            .attr("transform", d => `translate(${x(xValue(d))}, ${y(yValue(d))})`)
            .attr("r", d => radius ? radius(sizeValue(d)) : 3)
            .on("mouseenter touchenter", function(d) {
              d3.select(this).attr("stroke", "black");
            })
            .on("mouseout touchout", function(d) {
              d3.select(this).attr("stroke", "none");
            })
            .append('title')
              .text(d => hoverText(d));
      }
    }
  }

  chart.margin = function(value) {
    if (!arguments.length) {
      return margin;
    }
    oldChartWidth = width + margin.left + margin.right;
    oldChartHeight = height + margin.top + margin.bottom;
    margin = value;
    width = oldChartWidth - margin.left - margin.right;
    height = oldChartHeight - margin.top - margin.bottom;
    return chart;
  };

  chart.width = function(value) {
    if (!arguments.length) {
      return width;
    }
    width = value - margin.left - margin.right;
    drawChart();
    return chart;
  };

  chart.height = function(value) {
    if (!arguments.length) {
      return height;
    }
    height = value - margin.top - margin.bottom;
    drawChart();
    return chart;
  };

  chart.xValue = function(value) {
    if (!arguments.length) {
      return xValue;
    }
    xValue = value;
    drawChart();
    return chart;
  };

  chart.yValue = function(value) {
    if (!arguments.length) {
      return yValue;
    }
    yValue = value;
    drawChart();
    return chart;
  };

  chart.sizeValue = function(value) {
    if (!arguments.length) {
      return sizeValue;
    }
    sizeValue = value;
    drawChart();
    return chart;
  }

  chart.colorValue = function(value) {
    if (!arguments.length) {
      return colorValue;
    }
    colorValue = value;
    drawChart();
    return chart;
  }

  chart.yAxisTitle = function(value) {
    if (!arguments.length) {
      return yAxisTitle;
    }
    yAxisTitle = value;
    return chart;
  };

  chart.xAxisTitle = function(value) {
    if (!arguments.length) {
      return xAxisTitle;
    }
    xAxisTitle = value;
    return chart;
  };

  chart.pointOpacity = function(value) {
    if (!arguments.length) {
      return pointOpacity;
    }
    pointOpacity = value;
    drawChart();
    return chart;
  }

  chart.pointColor = function(value) {
    if (!arguments.length) {
      return pointColor;
    }
    pointColor = value;
    drawChart();
    return chart;
  }

  return chart;
}