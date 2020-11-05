var treeChart = function() {
  let margin = {top:20, right:20, bottom: 20, left: 20};
  let width = 900 - margin.left - margin.right;
  let height = 400 - margin.top - margin.bottom;
  let _chartData;
  let _chartDiv;
  let cellSize = 10;

  function chart(selection, data) {
    _chartDiv = selection;
    _chartData = data;

    drawChart();
  }

  function drawChart() {
    if (_chartDiv) {
      _chartDiv.selectAll('*').remove();

      if (_chartData) {
        const pathRoot = d3.hierarchy(_chartData);
        pathRoot.dx = 10;
        pathRoot.dy = width / (pathRoot.height + 1);
        let root = d3.tree().nodeSize([pathRoot.dx, pathRoot.dy])(pathRoot);

        let x0 = Infinity;
        let x1 = -x0;
        root.each(d => {
          if (d.x > x1) { x1 = d.x; }
          if (d.x < x0) { x0 = d.x; }
        });

        const svg = _chartDiv.append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', (x1 - x0 + root.dx * 2) + margin.top + margin.bottom);

        const g = svg.append('g')
          .attr('font-family', 'sans-serif')
          .attr('font-size', 10)
          .attr('transform', `translate(${margin.left + (root.dy / 3)}, ${margin.top + (root.dx - x0)})`);

        const link = g.append("g")
          .attr('fill', 'none')
          .attr('stroke', '#555')
          .attr('stroke-opacity', 0.4)
          .attr('stroke-width', 1.5)
          .selectAll('path')
            .data(root.links())
            .join('path')
              .attr('d', d3.linkHorizontal()
                .x(d => d.y)
                .y(d => d.x))
              .on('click', function(d) {
                d3.select(this).attr('stroke', '#000').attr('stroke-opacity', 1.0);
                console.log(d);
                console.log(`${d.source.data.name} - ${d.target.data.name}`);
              });

        const node = g.append('g')
          .attr('stroke-linejoin', 'round')
          .attr('stroke-width', 3)
          .selectAll('g')
          .data(root.descendants())
          .join('g')
            .attr('transform', d => `translate(${d.y},${d.x})`);

        node.append('circle')
          .attr('fill', d => d.children ? '#555' : '#999')
          .attr('r', 2.5);
        
        node.append('text')
          .attr('dy', '0.31em')
          .attr('x', d => d.children ? -6 : 6)
          .attr('text-anchor', d => d.children ? 'end' : 'start')
          .text(d => d.data.longName)
          // .text(d => nodes.get(d.data.name).name)
        .clone(true).lower()
          .attr('stroke', 'white');
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