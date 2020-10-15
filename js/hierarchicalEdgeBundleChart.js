var hierarchicalEdgeBundleChart = function() {
  let margin = {top:20, right:20, bottom: 20, left: 20};
  let width = 900 - margin.left - margin.right;
  let height = 400 - margin.top - margin.bottom;
  let _chartData;
  let _chartDiv;
  let _nodeInfo;
  let colornone = "#ccc";
  let colorout = "#f00";
  let colorin = "#00f";

  function chart(selection, data) {
    // _chartData = data;
    const {nodes, links} = data;
    const groupById = new Map;
    const nodeById = new Map(nodes.map(node => [node.id, node]));

    for (const node of nodes) {
      let group = groupById.get(node.group);
      if (!group) {
        groupById.set(node.group, group = {id: node.group, children: []});
      }
      group.children.push(node);
      node.targets = [];
    }

    for (const {source: sourceId, target: targetId} of links) {
      // console.log(sourceId + " " + targetId);
      nodeById.get(sourceId).targets.push(targetId);
    }

    _chartData = {children: [...groupById.values()]};
    _nodeInfo = data.nodeInfo;
    console.log(_chartData);

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

        svg.append("rect")
          .attr("x", margin.left)
          .attr("y", margin.top)
          .attr("width", width)
          .attr("height", height)
          .attr("stroke", "darkgray")
          .attr("fill", "white");

        const g = svg.append('g')
          .attr('transform', `translate(${margin.left + (width / 2)}, ${margin.top + (height / 2)})`);    

        const radius = width / 2;

        const tree = d3.cluster()
          .size([2 * Math.PI, radius - 100]);

        const root = tree(bilink(d3.hierarchy(_chartData)
          .sort((a,b) => d3.ascending(a.height, b.height) || d3.ascending(a.data.id, b.data.id))));
        console.log(root);
        console.log(root.leaves());

      const node = g.append("g")
          .attr("font-family", "sans-serif")
          .attr("font-size", 10)
        .selectAll("g")
        .data(root.leaves())
        .join("g")
          .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
        .append("text")
          .attr("dy", "0.31em")
          .attr("x", d => d.x < Math.PI ? 6 : -6)
          .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
          .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
          .text(d => d.data.id)
          .each(function(d) { d.text = this; })
          .on("mouseover", overed)
          .on("mouseout", outed)
          .call(text => text.append("title").text(d => `${d.data.id}
    ${d.outgoing.length} outgoing
    ${d.incoming.length} incoming`));
        // const node = g.append("g")
        //     .attr("font-family", 'sans-serif')
        //     .attr("font-size", 10)
        //   .selectAll("g")
        //   .data(root.leaves())
        //   .join("g")
        //     .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y}, 0)`)
        //   .append("text")
        //     .attr("dy", "0.31em")
        //     .attr("x", d => d.x < Math.PI ? 6 : -6)
        //     .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
        //     .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
        //     .text(d => d.data.id)
        //     .each(function(d) { d.text = this; })
        //     .on("mouseover", overed)
        //     .on("mouseout", outed)
        //     .call(text => text.append("title").text(d => `${d.data.id} ${d.outgoing.length} outgoing ${d.incoming.length} incoming`));

        const line = d3.lineRadial()
          .curve(d3.curveBundle.beta(0.85))
          .radius(d => d.y)
          .angle(d => d.x);

        const link = g.append("g")
            .attr("stroke", colornone)
            .attr("fill", "none")
          .selectAll("path")
          .data(root.leaves().flatMap(leaf => leaf.outgoing))
          .join("path")
            .style("mix-blend-mode", "multiply")
            .attr("d", ([i,o]) => line(i.path(o)))
            .each(function(d) {
              d.path = this;
            });

        g.append("text")
          .attr("class", "textbox")
          .style("text-anchor", "middle")
          .style("text-weight", "bold")
          .style("font-size", 14)
          .style('text-shadow', '0 2px 0 #eee, 2px 0 0 #fff, 0 -2px 0 #eee, -2px 0 0 #eee')
          .html("Hover over a node to display information");
        
        function overed(d, event) {
          // console.log(event);
          console.log(_nodeInfo.get(d.data.id));
          link.style("mix-blend-mode", null);
          d3.select(this).attr("font-weight", "bold");
          // console.log(d);
          d3.selectAll(d.incoming.map(d => d.path)).attr("stroke", colorin).raise();
          d3.selectAll(d.incoming.map(([d]) => d.text)).attr("fill", colorin).attr("font-weight", "bold");
          // d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", colorout).raise();
          // d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", colorout).attr("font-weight", "bold");
          let info = _nodeInfo.get(d.data.id);
          d3.select('.textbox').html(`name: ${info.name}, type: ${info.type}`);
        }

        function outed(d, event) {
          link.style("mix-blend-mode", "multiply");
          d3.select(this).attr("font-weight", null);
          d3.selectAll(d.incoming.map(d => d.path)).attr("stroke", null);
          d3.selectAll(d.incoming.map(([d]) => d.text)).attr("fill", null).attr("font-weight", null);
          d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", null);
          d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", null).attr("font-weight", null);
          d3.select('.textbox').html('Hover over a node to display information');
        }
      }
    }
  }

  function bilink(root) {
    const map = new Map(root.leaves().map(d => [d.data.id, d]));
    for (const d of root.leaves()) {
      d.incoming = [],
      d.outgoing = d.data.targets.map(i => [d, map.get(i)]);
    }
    for (const d of root.leaves()) {
      for (const o of d.outgoing) {
        o[1].incoming.push(o);
      }
    }
    return root;
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