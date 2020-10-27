var matrixChart = function() {
  let margin = {top:20, right:20, bottom: 20, left: 20};
  let width = 900 - margin.left - margin.right;
  let height = 400 - margin.top - margin.bottom;
  let _nodes;
  let _edges;
  let _chartDiv;
  let cellSize = 10;
  let level1Color = d3['schemeBlues'][9][7];
  let level2Color = d3['schemeBlues'][9][4];
  // let level2Color = "steelblue";
  // let level1Color = "dodgerblue";
  let showLinkLines = false;

  let selectedCell = null;
  let highlightedNodes = [];

  let highlightColorScale;
  let normalColorScale;
  let svg;
  let g;
  let detailsSvg;
  let detailsG;

  function chart(selection, data) {
    _chartDiv = selection;

    _nodes = data.nodes;
    _edges = data.edges;

    drawChart();
  }

  function drawChart() {
    if (_chartDiv) {
      _chartDiv.selectAll('*').remove();

      if (_nodes) {
        let colCount = Math.floor(width / cellSize);
        let rowCount = Math.ceil(_nodes.size / colCount);
        console.log(`colCount = ${colCount}, rowCount = ${rowCount}`);

        const nodeValues = [..._nodes.values()];
        let maxNumPaths = 0;
        let maxNumPathNodes = 0;
        nodeValues.map(n => {
          if (n.paths.length > maxNumPaths) {
            maxNumPaths = n.paths.length;
          }
          n.paths.map(path => {
            if (path.nodes.length > maxNumPathNodes) {
              maxNumPathNodes = path.nodes.length;
            }
          })
          // n.paths.forEach((p, k) => {
          //   if (p.nodes.length > maxNumPathNodes) {
          //     maxNumPathNodes = p.nodes.length;
          //   }
          // });
        });
        // console.log(`maxNumPaths: ${maxNumPaths},  maxNumPathNodes: ${maxNumPathNodes}`);

        const detailsHeight = Math.ceil(maxNumPaths / 2) * cellSize;

        height = rowCount * cellSize;

        svg = _chartDiv.append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom);

        // const detailsSvg = _chartDiv.append('svg')
        //   .attr('width', width + margin.left + margin.right)
        //   .attr('height', detailsHeight + margin.top + margin.bottom);
        // const detailsG = detailsSvg.append('g')
        //   .attr('transform', `translate(${margin.left}, ${margin.top})`);

        g = svg.append('g')
          .attr('transform', `translate(${margin.left}, ${margin.top})`);    

        const details_x = d3.scaleLinear()
          .domain([0, maxNumPathNodes])
          .range([4, (width/2) - 8]);

        const x = d3.scaleLinear()
          .domain([0, colCount])
          .range([0, width]);
          
        const y = d3.scaleLinear()
          .domain([0, rowCount])
          .range([0,rowCount * cellSize]); 

        // normalColorScale = d3.scaleSequentialSqrt([0, d3.max(nodeValues, d => d.paths ? d.paths.length : 0)], t => d3.interpolateGreys((t * .5 + 0.15)));
        // highlightColorScale = d3.scaleSequentialSqrt([0, d3.max(nodeValues, d => d.paths ? d.paths.length : 0)], t => d3.interpolateReds((t * .5 + 0.15)));
        normalColorScale = d3.scaleSequentialSqrt([0, maxNumPaths], t => d3.interpolateGreys((t * .5 + 0.15)));
        highlightColorScale = d3.scaleSequentialSqrt([0, maxNumPaths], t => d3.interpolateBlues((t * .5 + 0.15)));

        g.append('g')
          .selectAll('rect')
          .data(nodeValues)
          .join('rect')
            .attr('id', d => `${d.mesh_id}`)
            .attr('fill', d => (highlightedNodes.length === 0 || highlightedNodes.includes(d.mesh_id)) ? highlightColorScale(d.paths.length) : normalColorScale(d.paths.length))
            .attr('y', (d,i) => {
              d.y = y(Math.floor(i / colCount));
              return d.y;
            })
            .attr('x', (d,i) => {
              d.x = x(Math.floor(i % colCount))
              return d.x;
            })
            .attr('width', cellSize - 1)
            .attr("height", cellSize - 1)
            .on("click", d => {
              if (d === selectedCell) {
                selectedCell = null;
                clearCell(d);
              } else {
                if (selectedCell != null) {
                  clearCell(selectedCell);
                }
                selectedCell = d;
                selectCell(d);
              }
            })
            .append("title")
              .text(d => `ID: ${d.mesh_id}\nName: ${d.name}\nPath Count: ${d.paths.length}`);

        function clearCell(d) {
          d3.select('.pathLines').selectAll('*').remove();
          d3.select(`rect#${d.mesh_id}`)
            .attr('fill', d => (highlightedNodes.length === 0 || highlightedNodes.includes(d.mesh_id)) ? highlightColorScale(d.paths.length) : normalColorScale(d.paths.length))
            .attr('stroke', d => highlightedNodes.includes(d.mesh_id) ? 'gray' : 'none')
            .attr("stroke-width", 1);

          d.paths.map(path => {
            path.nodes.map((n,i) => {
              if (i !== 0) {
                d3.select(`rect#${n}`)
                  .attr('stroke', 'none');
              }
            });
          });
          // detailsSVG.selectAll('*').remove();
          detailsSvg.remove();
        };
              
        function selectCell(d) {
          d3.select(`rect#${d.mesh_id}`)
            .attr("stroke", "#000")
            .attr("fill", "#444")
            .attr("stroke-width", 2);
          
          console.log(d);

          let pathHierarchy = {
            name: d.mesh_id,
            children: []
          };
          d.paths.map(path => {
            currentNode = pathHierarchy;
            path.nodes.map((node_id, i) => {
              if (i > 0) {
                childNode = currentNode.children.find(d => d.name === node_id);
                if (!childNode) {
                  childNode = {
                      name: node_id,
                      children: []
                    };
                  currentNode.children.push(childNode);
                }
                currentNode = childNode;
              }
            });
          });

          console.log(pathHierarchy);

          const pathRoot = d3.hierarchy(pathHierarchy);
          pathRoot.dx = 10;
          pathRoot.dy = width / (pathRoot.height + 1);
          let root = d3.tree().nodeSize([pathRoot.dx, pathRoot.dy])(pathRoot);

          let x0 = Infinity;
          let x1 = -x0;
          root.each(d => {
            if (d.x > x1) x1 = d.x;
            if (d.x < x0) x0 = d.x;
          });

          detailsSvg = _chartDiv.append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', (x1- x0 + root.dx * 2) + margin.top + margin.bottom);

          const detailsG = detailsSvg.append('g')
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr('transform', `translate(${margin.left + (root.dy / 3)}, ${margin.top + (root.dx - x0)})`);

          const link = detailsG.append("g")
            .attr("fill", "none")
            .attr("stroke", "#555")
            .attr("stroke-opacity", 0.4)
            .attr("stroke-width", 1.5)
            .selectAll("path")
              .data(root.links())
              .join("path")
                .attr("d", d3.linkHorizontal()
                  .x(d => d.y)
                  .y(d => d.x));

          const node = detailsG.append("g")
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 3)
            .selectAll("g")
            .data(root.descendants())
            .join("g")
              .attr("transform", d =>  `translate(${d.y},${d.x})`);

          node.append("circle")
            .attr("fill", d => d.children ? "#555" : "#999")
            .attr("r", 2.5);

          node.append("text")
            .attr("dy", "0.31em")
            .attr("x", d => d.children ? -6 : 6)
            .attr("text-anchor", d => d.children ? "end" : "start")
            .text(d => nodes.get(d.data.name).name)
          .clone(true).lower()
            .attr("stroke", "white");
          
          let endNodes = new Set();
          d.paths.map((path, pathIdx) => {
            d3.select('.pathLines')
              .append('path')
              .attr('d', function(p) {
                return d3.line()
                  .curve(d3.curveNatural)
                  .x(d => nodes.get(d).x)
                  .y(d => nodes.get(d).y)
                  (path.nodes);
              });
            
            // const xOffset = pathIdx > maxNumPaths / 2 ? width/2 : 0;
            // const detailPath = detailsG.append('g')
            //   .attr('transform', `translate(${xOffset}, ${pathIdx % (maxNumPaths / 2) * cellSize})`)
            
            
            // console.log(`xOffset: ${xOffset}`);
            path.nodes.map((n, i) => {
              if (i !== 0) {
                d3.select(`rect#${n}`)
                  .attr("stroke", (i === path.nodes.length - 1 && !endNodes.has(n)) ? '#000' : '#777')
                  .attr("stroke-width", 1.5)
                  .raise();
                // detailPath.append('line')
                //   .attr('x1', details_x(i-1))
                //   .attr('x2', details_x(i))
                //   .attr('y1', 0)
                //   .attr('y2', 0)
                //   .attr('stroke', '#000')
                //   .attr('stroke-width', 2);
                // detailPath.append('circle')
                //   .attr('cx', details_x(i))
                //   .attr('cy', 0)
                //   .attr('r', 2)
                //   // .attr('height', 4)
                //   .attr('fill', 'black');
              }
            });

            /*
            // console.log(_nodes);
            // console.log(path.nodes);
            let endNode = _nodes.get(path.nodes[path.nodes.length-1]);
            // console.log(endNode);
            detailPath.append('text')
              .attr('text-anchor', 'start')
              .attr('x', 0)
              .attr('y', 0)
              .attr('fill', 'black')
              .text(`${d.name} → (${path.nodes.length - 2}) → ${endNode.name}`);
            endNodes.add(path.nodes[path.nodes.length - 1]);
            */
          });
          // for (let path of d.paths.values()){
          //   console.log(path);
          //   d3.select('.pathLines').append('path')
          //     .attr("d", function(p) {
          //       return d3.line()
          //         .curve(d3.curveLinear)
          //         .x(d => nodes.get(d).x)
          //         .y(d => nodes.get(d).y)
          //         (path.nodes);
          //     });

          //   const detailPath = detailsG.append('g')
          //     .attr('tranform', `translate(0, )`)
          //   path.nodes.map((n,i) => {
          //     if (i !== 0) {
          //       d3.select(`rect#${n}`)
          //         .attr("stroke", (i === path.nodes.length - 1 && !endNodes.has(n)) ? "#000" : "#777")
          //         .attr("stroke-width", 1.5)
          //         .raise();
          //       detailPath.append('line')
          //         .attr('x1', 0)
          //         .attr('x2', width / 2)
          //         .attr('y1', cellSize / 2)
          //         .attr('y2', cellSize / 2)
          //         .attr('stroke', '#000')
          //         .attr('stroke-width', 2);
          //     }
          //   });
          //   endNodes.add(path.nodes[path.nodes.length - 1]);
          // }
        };

        g.append("g")
          .attr('class', 'pathLines')
          .attr('display', 'none')
          .attr('transform', `translate(${cellSize/2}, ${cellSize/2})`)
          .attr('stroke', "#222")
          .attr('stroke-dasharray', "2,2")
          .attr('fill', 'none')
          .attr('stroke-width', 1)
          .attr("stroke-opacity", 0.6);
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

  chart.highlightedNodes = function(value) {
    if (!arguments.length) {
      return highlightedNodes;
    }
    highlightedNodes = value;
    console.log(value);
    g.selectAll('rect')
      .attr('fill', d => (highlightedNodes.length === 0 || highlightedNodes.includes(d.mesh_id)) ? highlightColorScale(d.paths.length) : normalColorScale(d.paths.length))
      .attr('stroke', d => highlightedNodes.includes(d.mesh_id) ? 'gray' : 'none');
      // .attr('fill', d => highlightedNodes.includes(d.id) ? highlightColorScale(d.links.length) : normalColorScale(d.links.length))
      // .attr('stroke', d => highlightedNodes.includes(d.id) ? 'gray' : 'none');

    return chart;
  }

  chart.showLinkLines = function(value) {
    if (!arguments.length) {
      return showLinkLines;
    }
    showLinkLines = value;
    g.select('.pathLines').attr('display', showLinkLines ? null : 'none');
  }

  return chart;
}