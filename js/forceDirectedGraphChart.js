var forceDirectedGraphChart = function() {
  let margin = {top:20, right:20, bottom: 20, left: 20};
  let width = 900 - margin.left - margin.right;
  let height = 400 - margin.top - margin.bottom;
  let _chartData;
  let _chartDiv;
  let nodeHoverHandler = null;
  let showNodeLabels = true;
  
  function chart(selection, data) {
    _chartData = data;
    _chartDiv = selection;

    drawChart();
  }

  drag = simulation => {
    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }
    
    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
  };

  // const drag = simulation => {
  //   function dragstarted(event, d) {
  //     if (!event.active) simulation.alphaTarget(0.3).restart();
  //     d.fx = d.x;
  //     d.fy = d.y;
  //   }
    
  //   function dragged(event, d) {
  //     d.fx = event.x;
  //     d.fy = event.y;
  //   }
    
  //   function dragended(event, d) {
  //     if (!event.active) simulation.alphaTarget(0);
  //     d.fx = null;
  //     d.fy = null;
  //   }
    
  //   return d3.drag()
  //       .on("start", dragstarted)
  //       .on("drag", dragged)
  //       .on("end", dragended);
  // };

  function drawChart() {
    if (_chartDiv) {
      _chartDiv.selectAll('*').remove();

      if (_chartData) {
        const root = d3.hierarchy(_chartData);
        const links = root.links();
        const nodes = root.descendants();

        const simulation = d3.forceSimulation(nodes)
          .force("link", d3.forceLink(links).id(d => d.id).distance(10).strength(1))
          .force("charge", d3.forceManyBody().strength(-50))
          .force("x", d3.forceX())
          .force("y", d3.forceY());

        const svg = _chartDiv.append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom);
        
        const g = svg.append("g")
          .attr('transform', `translate(${margin.left + (width / 2)}, ${margin.top + (height / 2)})`);
        
        const link = g.append("g")
          .attr("stroke", "#777")
          .attr("stroke-opacity", 0.6)
          .selectAll("line")
          .data(links)
          .join("line");

        const nodeFill = (node) => {
          return node.data.type === "concept" ? "#fff" : node.data.type === "paper" ? "#000" : "#777";
          // if (type === 'link') { return '#aaa'; }
          // if (type === 'concept') { return '#fff'; }
          // if (type === 'paper') { return "#000"; }
        };
        const nodeStroke = (node) => {
          return node.data.type === "concept" ? null : "#fff";
        };
        const nodeRadius = (node) => {
          return node.data.type === "link" || node.data.type === "paper" ? 4 : node.parent ? 6 : 8;
        };

        const node = g.append("g")
          .attr("fill", "#fff")
          .attr("stroke", "#000")
          .attr("stroke-width", 1.5)
          .selectAll("circle")
          .data(nodes)
          .join("circle")
            .attr("fill", d => nodeFill(d))
            .attr("stroke", d => nodeStroke(d))
            .attr("r", d => nodeRadius(d))
            .call(drag(simulation));
        
        node.on("mouseover", d => {
          if (nodeHoverHandler) {
            nodeHoverHandler(d.data);
          }
        });

        // node.append("text")
        //   .text(d => d.data.name);

        node.append("title")
          .text(d => d.data.name);

        simulation.on("tick", () => {
          link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
          
          node.attr("cx", d => d.x)
            .attr("cy", d => d.y);
        });
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

  chart.nodeHoverHandler = function(value) {
    if (!arguments.length) {
      return nodeHoverHandler;
    }
    nodeHoverHandler = value;
    return chart;
  }

  return chart;
}