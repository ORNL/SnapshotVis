var matrixChart = function() {
  let margin = {top:20, right:20, bottom: 20, left: 20};
  let width = 900 - margin.left - margin.right;
  let height = 400 - margin.top - margin.bottom;
  let _chartData;
  let _nodes;
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

  function chart(selection, data) {
    // console.log(d3['schemeBlues']);
    _chartDiv = selection;

    _chartData = data;
    _nodes = [...data.values()];

    // let groupedLinks = d3.group(data.links, d => d.source);
    // // console.log(groupedLinks);
    // groupedLinks.forEach((value, key) => {
    //   _chartData[key].links = value;
    // });
    // // _chartData.sort((a,b) => d3.descending(a.links ? a.links.length : 0, b.links ? b.links.length : 0));
    console.log(_chartData);
    console.log(_nodes);

    drawChart();
  }

  function drawChart() {
    if (_chartDiv) {
      _chartDiv.selectAll('*').remove();

      if (_chartData) {
        let colCount = Math.floor(width / cellSize);
        let rowCount = Math.ceil(_nodes.length / colCount);
        console.log(`colCount = ${colCount}, rowCount = ${rowCount}`);

        height = rowCount * cellSize;

        svg = _chartDiv.append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom);

        g = svg.append('g')
          .attr('transform', `translate(${margin.left}, ${margin.top})`);    

        // g.append("rect")
        //   .attr("x", -1)
        //   .attr("y", -1)
        //   .attr("width", width + 2)
        //   .attr("height", height + 2)
        //   .attr("stroke", "darkgray")
        //   .attr("fill", "white");

        const x = d3.scaleLinear()
          .domain([0, colCount])
          .range([0, width]);
        const y = d3.scaleLinear()
          .domain([0, rowCount])
          .range([0,rowCount * cellSize]); 

        // let maxLinksLength = d3.max(_chartData, d => d.links ? d.links.length : 0);
        // console.log(`maxLinksLength: ${maxLinksLength}`);
        normalColorScale = d3.scaleSequentialSqrt([0, d3.max(_nodes, d => d.links ? d.links.length : 0)], t => d3.interpolateGreys((t * .5 + 0.15)));
        highlightColorScale = d3.scaleSequentialSqrt([0, d3.max(_nodes, d => d.links ? d.links.length : 0)], t => d3.interpolateReds((t * .5 + 0.15)));

        g.append('g')
          .selectAll('rect')
          .data(_nodes)
          .join('rect')
            .attr('id', d => `${d.id}`)
            // .attr('fill', d => d.links ? color(d.links.length) : "whitesmoke")
            .attr('fill', d => highlightedNodes.includes(d.id) ? highlightColorScale(d.links.length) : normalColorScale(d.links.length))
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
            // .on("mouseenter", (d) => {
            //   selectCell(d);
              // d3.select(`rect#${d.id}`)
              //   .attr("stroke", "#444");
              // if (d.links) {
              //   d.links.map(l => {
              //     const L1Node = _chartData[l.target];
              //     d3.select(`rect#${L1Node.id}`)
              //       .transition().duration(200)
              //       .attr("fill", level1Color);
              //     if (showLinkLines) {
              //       d3.select('.level1Links').append('line')
              //         .attr("x1", d.x + cellSize / 2)
              //         .attr("y1", d.y + cellSize / 2)
              //         .attr("x2", L1Node.x + cellSize / 2)
              //         .attr("y2", L1Node.y + cellSize / 2)
              //         .attr("pointer-events", "none");
              //     }
              //     if (L1Node.links) {
              //       L1Node.links.map(l2 => {
              //         const L2Node = _chartData[l2.target];
              //         d3.select(`rect#${L2Node.id}`)
              //           .transition().duration(200)
              //           .attr("fill", level2Color);
              //         if (showLinkLines) {
              //           d3.select('.level2Links').append('line')
              //             .attr("x1", L1Node.x + cellSize / 2)
              //             .attr("y1", L1Node.y + cellSize / 2)
              //             .attr("x2", L2Node.x + cellSize / 2)
              //             .attr("y2", L2Node.y + cellSize / 2)
              //             .attr("pointer-events", "none");
              //         }
              //       });
              //     }
              //   });
              // }
            // })
            // .on("mouseout", d => {
            //   clearCell(d);
              // d3.select('.level1Links').selectAll('line').remove();
              // d3.select('.level2Links').selectAll('line').remove();
              // d3.select(`rect#${d.id}`)
              //   .attr("stroke", null);
              // if (d.links) {
              //   d.links.map(l => {
              //     const L1Node = _chartData[l.target];
              //     d3.select(`rect#${L1Node.id}`)
              //       .transition().duration(200)
              //       .attr("fill", L1Node.links ? color(L1Node.links.length) : "whitesmoke");
              //     if (L1Node.links) {
              //       L1Node.links.map(l2 => {
              //         const L2Node = _chartData[l2.target];
              //         d3.select(`rect#${L2Node.id}`)
              //           .transition().duration(200)
              //           .attr("fill", L2Node.links ? color(L2Node.links.length) : "whitesmoke");
              //       })
              //     }
              //   });
              // }
            // })
            .append("title")
              .text(d => `ID: ${d.id}\nName: ${d.name}\nType: ${d.type}\nLink Count: ${d.links.length}`);

        function clearCell(d) {
          d3.select('.level1Links').selectAll('line').remove();
          d3.select('.level2Links').selectAll('line').remove();
          d3.select(`rect#${d.id}`)
            .attr('fill', d => highlightedNodes.includes(d.id) ? highlightColorScale(d.links.length) : normalColorScale(d.links.length))
            .attr('stroke', d => highlightedNodes.includes(d.id) ? 'gray' : 'none')
            .attr("stroke-width", 1);
            // .attr("stroke", null);
          if (d.links) {
            d.links.map(l => {
              // const L1Node = _chartData[l.target];
              // const L1Node = _chartData[nodeIDIndexMap.get(l.target)];
              const L1Node = _chartData.get(l.target_id);
              d3.select(`rect#${L1Node.id}`)
                .transition().duration(200)
                .attr('fill', d => highlightedNodes.includes(d.id) ? highlightColorScale(d.links.length) : normalColorScale(d.links.length))
                .attr('stroke', d => highlightedNodes.includes(d.id) ? 'gray' : 'none')
                .attr('stroke-width', 1);
                // .attr("fill", L1Node.links ? color(L1Node.links.length) : "whitesmoke");
              
              if (L1Node.links) {
                L1Node.links.map(l2 => {
                  // const L2Node = _chartData[l2.target];
                  // const L2Node = _chartData[nodeIDIndexMap.get(l2.target)];
                  const L2Node = _chartData.get(l2.target_id);
                  d3.select(`rect#${L2Node.id}`)
                    .transition().duration(200)
                    .attr('fill', d => highlightedNodes.includes(d.id) ? highlightColorScale(d.links.length) : normalColorScale(d.links.length))
                    .attr('stroke', d => highlightedNodes.includes(d.id) ? 'gray' : 'none')
                    // .attr("fill", L2Node.links ? color(L2Node.links.length) : "whitesmoke");
                    .attr("stroke-width", 1);
                });
              }
              
            });
          }
        };
              
        function selectCell(d) {
          // console.log(d);
          // d.links.map(l => {
          //   console.log(_chartData[l.target].id);
          // })
          d3.select(`rect#${d.id}`)
            .attr("stroke", "#000")
            .attr("stroke-width", 2);
          if (d.links) {
            d.links.map(l => {
              // const L1Node = _chartData[l.target];
              const L1Node = _chartData.get(l.target_id);
              // if (!L1Node) console.log(l);
              
              // file level 2 nodes first (so level 1 connections can overwrite these)
              if (L1Node.links) {
                L1Node.links.map(l2 => {
                  if (d.links.findIndex(x => x.target_id === l2.target_id) === -1) {
                    // const L2Node = _chartData[l2.target];
                    const L2Node = _chartData.get(l2.target_id);
                    // if (!L2Node) console.log(l2);
                    if (L2Node !== d) {
                      d3.select(`rect#${L2Node.id}`)
                        .transition().duration(200)
                        .attr("fill", level2Color);
                      if (showLinkLines) {
                        d3.select('.level2Links').append('line')
                          .attr("x1", L1Node.x + cellSize / 2)
                          .attr("y1", L1Node.y + cellSize / 2)
                          .attr("x2", L2Node.x + cellSize / 2)
                          .attr("y2", L2Node.y + cellSize / 2)
                          .attr("pointer-events", "none");
                      }
                    }
                  }
                });
              }

              // fill first level connected nodes last (so first levels aren't shown as level 2)
              d3.select(`rect#${L1Node.id}`)
                .transition().duration(200)
                .attr("fill", level1Color);
              if (showLinkLines) {
                d3.select('.level1Links').append('line')
                  .attr("x1", d.x + cellSize / 2)
                  .attr("y1", d.y + cellSize / 2)
                  .attr("x2", L1Node.x + cellSize / 2)
                  .attr("y2", L1Node.y + cellSize / 2)
                  .attr("pointer-events", "none");
              }
            });
          }
        };

        g.append("g")
          .attr('class', 'level2Links')
          .attr('stroke', level2Color)
          .attr('stroke-width', 0.7)
          .attr("stroke-opacity", 0.5);
        g.append("g")
          .attr('class', 'level1Links')
          .attr('stroke', level1Color)
          .attr('stroke-width', 0.8)
          .attr("stroke-opacity", 0.7);
        

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
    g.selectAll('rect')
      .attr('fill', d => highlightedNodes.includes(d.id) ? highlightColorScale(d.links.length) : normalColorScale(d.links.length))
      .attr('stroke', d => highlightedNodes.includes(d.id) ? 'gray' : 'none');

    return chart;
  }

  return chart;
}