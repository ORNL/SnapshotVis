var forceDirectedGraphChart = function() {
  let margin = {top:20, right:20, bottom: 20, left: 20};
  let width = 900 - margin.left - margin.right;
  let height = 400 - margin.top - margin.bottom;
  let _chartData;
  let _chartDiv;
  let nodeHoverHandler = null;
  let showNodeLabels = false;
  let clickedNode = null;
  let conceptFill = "#fff";
  let paperFill = "#000";
  let rootFill = "blue";
  let selectedFill = "deepskyblue";
  let linkFill = "#999";
  let unselectedPathOpacity = 0.2;
  
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

        // console.log(links);

        let linkedNodes = {};

        function getLinkedNodes(parentNode) {
          parentNode.children.map(childNode => {
            if (childNode.children.length === 0) {
              return;
            } else {
              if (childNode.type === "link") {
                let connections = [parentNode.name, childNode.name];
                childNode.children.map(grandchildNode => {
                  connections.push(grandchildNode.name);
                });
                connections.map(c1 => {
                  connections.map(c2 => {
                    linkedNodes[`${c1},${c2}`] = true;
                  })
                });
              }

              getLinkedNodes(childNode);
            }
          });
        }
        getLinkedNodes(_chartData);
        // console.log(linkedNodes);

        const isConnected = (a, b) => linkedNodes[`${a.data.name},${b.data.name}`] || linkedNodes[`${b.data.name},${a.data.name}`] || a === b;

        const simulation = d3.forceSimulation(nodes)
          .force("link", d3.forceLink(links).id(d => d.id).distance(10).strength(1))
          .force("charge", d3.forceManyBody().strength(-50))
          .force("x", d3.forceX())
          .force("y", d3.forceY())
          .force("center_force", d3.forceCenter(width/2, height/2));

        const svg = _chartDiv.append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom);
        
        // const g = svg.append("g")
        //   .attr('transform', `translate(${margin.left + (width / 2)}, ${margin.top + (height / 2)})`);
        const topG = svg.append("g")
          .attr("transform", `translate(${margin.left}, ${margin.top})`);
        
        const g = topG.append("g");

        const zoom = d3.zoom()
          .on("zoom", () => {
            g.attr("transform", d3.event.transform);
          });
          
        svg.call(zoom).call(zoom.transform, d3.zoomIdentity);

        const link = g.append("g")
          .attr("stroke", "#777")
          .attr("stroke-opacity", 0.3)
          .selectAll("line")
          .data(links)
          .join("line");

        const nodeFill = (node) => {
          return node.data.type === "concept" ? node.parent ? conceptFill : rootFill : node.data.type === "paper" ? paperFill : linkFill;
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
          .join("g")
          .call(drag(simulation));
        
        const circle = node.append("circle")
          .attr("fill", d => nodeFill(d))
          .attr("stroke", d => nodeStroke(d))
          .attr("r", d => nodeRadius(d));
          // .call(drag(simulation));
          // .join("circle")
          //   .attr("fill", d => nodeFill(d))
          //   .attr("stroke", d => nodeStroke(d))
          //   .attr("r", d => nodeRadius(d))
          //   .call(drag(simulation));
        
        circle.on("click", function(d) {
          if (nodeHoverHandler) {
            nodeHoverHandler(d.data);
          }

          circle.transition(500)
            .attr("opacity", c => isConnected(c, d) ? 1.0 : 0.1)
            .attr("fill", c => c === d ? selectedFill : nodeFill(c));
          // circle.attr("opacity", c => {
          //   const isConnectedValue = isConnected(c, d);
          //   if (isConnectedValue) {
          //     return 1.0;
          //   }
          //   return 0.1;
          // });
          link.transition(500)
            .attr("opacity", l => isConnected(l.target, d) ? null : 0.2);
        });

        if (showNodeLabels) {
          const label = node.append("text")
            .text(d => d.data.name)
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("text-anchor", "middle")
            .attr("dy", -8)
            // .attr("dx", -15)
            .attr("fill", "#555")
            .attr("stroke", "none")
            .attr("pointer-events", "none");
        }

        node.append("title")
          .text(d => d.data.display_name);

        simulation.on("tick", () => {
          link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
          
          node.attr("transform", function(d) {
            return `translate(${d.x},${d.y})`;
          });
          // node.attr("cx", d => d.x)
          //   .attr("cy", d => d.y);
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