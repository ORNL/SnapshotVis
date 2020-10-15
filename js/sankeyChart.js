var sankeyChart = function () {
  let margin = {top:20, right:20, bottom: 20, left: 20};
  let width = 900 - margin.left - margin.right;
  let height = 400 - margin.top - margin.bottom;
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

        g.append("rect")
          .attr("width", width)
          .attr("height", height)
          .attr("stroke", "darkgray")
          .attr("fill", "white");
        
        const sankey = d3.sankey()
          .nodeWidth(15)
          .nodePadding(10)
          .extent([[1,5], [width - 1, height - 5]]);
        
        const { nodes, links } = sankey(_chartData);
        console.log(nodes);
        console.log(links);

        g.append("g")
          .attr("stroke", "#000")
          .selectAll("rect")
          .data(nodes)
          .join("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("fill", "red")
            .append("title")
              .text(d => `${d.name}\n${d.value}`)

        const link = g.append("g")
          .attr("fill", "none")
          .attr("stroke-opacity", 0.5)
          .selectAll("g")
          .data(links)
            .join("g")
            .style("mix-blend-mode", "multiply");

        link.append("path")
          .attr("d", d3.sankeyLinkHorizontal())
          .attr("stroke", "#aaa")
          .attr("stroke-width", d => Math.max(1, 2 * d.width));

        link.append("title")
          .text(d => `${d.source.name} → ${d.target.name}\n${d.value}`);

        g.append("g")
          .style("font", "11px sans-serif")
          .style("fill", "black")
          .style("font-weight", "bold")
          .selectAll("text")
          .data(nodes)
          .join("text")
            .attr("x", d => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
            .attr("y", d => (d.y1 + d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", d => (d.x0 < width / 2 ? "start" : "end"))
            .text(d => d.name);
        
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

  return chart;
}