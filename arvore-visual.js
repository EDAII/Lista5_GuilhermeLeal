var duration = 400;
var tree = d3.tree().separation(function() {
  return 40;
});
var svg = d3.select('svg'),
  g = svg.append('g').attr('transform', 'translate(40,40)');
var gLinks = g.append('g'),
  gNodes = g.append('g');

svg.attr('width', '1280').attr('height', '720');

var oldPos = {};
var updateTree = function() {
  console.log(data);
  var root = d3.hierarchy(data);
  var newTreeSize = [
    root.descendants().length * 40,
    ((root.height + 1) * 2 - 1) * 30
  ];

  if (tree.size()[0] !== newTreeSize[0] || tree.size()[1] !== newTreeSize[1]) {
    tree.size(newTreeSize);
    center = pos = svg.attr('width') / 2 - tree.size()[0] / 2;
  }
  tree(root);

  var nodes = root.descendants().filter(function(d) {
    return d.data.data === null ? false : true;
  });
  var link = gLinks.selectAll('path').data(nodes, function(d) {
    return d.data.id;
  });

  console.log(link);

  link.exit().remove();

  link
    .transition() 
    .duration(duration)
    .attrTween('d', function(d) {
      var oldDraw = d3.select(this).attr('d');
      if (oldDraw) {
        oldDraw = oldDraw.match(/(M.*)(L.*)/);
        var oldMoveto = (oldMoveto = oldDraw[1]
            .slice(1)
            .split(',')
            .map(Number)),
          oldLineto = oldDraw[2]
            .slice(1)
            .split(',')
            .map(Number);
        
        if (changeRoot && oldMoveto[1] === 0) {
          oldMoveto = oldDraw[2]
            .slice(1)
            .split(',')
            .map(Number);
          oldLineto = oldDraw[1]
            .slice(1)
            .split(',')
            .map(Number);
          changeRoot = false;
        }

        if (
          oldLineto !== [d.x, d.y] &&
          oldMoveto !== [d.parent.x, d.parent.y]
        ) {
          var interpolatorMX = d3.interpolateNumber(oldMoveto[0], d.parent.x);
          var interpolatorMY = d3.interpolateNumber(oldMoveto[1], d.parent.y);
          var interpolatorLX = d3.interpolateNumber(oldLineto[0], d.x);
          var interpolatorLY = d3.interpolateNumber(oldLineto[1], d.y);

          return function(t) {
            return (
              'M' +
              interpolatorMX(t) +
              ',' +
              interpolatorMY(t) +
              'L' +
              interpolatorLX(t) +
              ',' +
              interpolatorLY(t)
            );
          };
        }
      }
    });

  link
    .enter()
    .append('path') 
    .attr('class', 'link')
    .transition()
    .duration(duration)
    .attrTween('d', function(d) {
      if (d.parent) {
        var parentOldPos = oldPos[d.parent.data.id.toString()];
        var interpolatorMX = d3.interpolateNumber(parentOldPos[0], d.parent.x);
        var interpolatorMY = d3.interpolateNumber(parentOldPos[1], d.parent.y);
        var interpolatorLX = d3.interpolateNumber(parentOldPos[0], d.x);
        var interpolatorLY = d3.interpolateNumber(parentOldPos[1], d.y);

        return function(t) {
          return (
            'M' +
            interpolatorMX(t) +
            ',' +
            interpolatorMY(t) +
            'L' +
            interpolatorLX(t) +
            ',' +
            interpolatorLY(t)
          );
        };
      } else {
        d3.select(this).remove();
      }
    });

  var node = gNodes.selectAll('g').data(nodes, function(d) {
    return d.data.id;
  });

  node.exit().remove();

  node
    .transition()
    .duration(duration)
    .attr('transform', function(d) {
      setTimeout(function() {
        oldPos[d.data.id.toString()] = [d.x, d.y];
      }, duration);
      return 'translate(' + d.x + ',' + d.y + ')';
    });

  var newNode = node
    .enter()
    .append('g')
    .attr('transform', function(d) {
      if (!d.parent) return 'translate(' + d.x + ',' + (d.y - 30) + ')';
      else
        return (
          'translate(' +
          oldPos[d.parent.data.id.toString()][0] +
          ',' +
          (oldPos[d.parent.data.id.toString()][1] - 30) +
          ')'
        );
    })
    .attr('class', 'node');

  newNode
    .transition()
    .duration(duration)
    .attr('transform', function(d) {
      oldPos[d.data.id.toString()] = [d.x, d.y];
      return 'translate(' + d.x + ',' + d.y + ')';
    });

  newNode.append('circle').attr('r', 25);
  newNode
    .append('text')
    .attr('class', 'text')
    .attr('text-anchor', 'middle')
    .attr('dy', 5)
    .text(function(d) {
      return d.data.data;
    });
};

var handleInsert = function(event) {
  var num = document.getElementById('insertInput').value;
  console.log(value);
  if (num) {
    document.getElementById('insertInput').value = ''; 
    d3.selectAll('#insertTree input').each(function() {
      d3.select(this).attr('disabled', '');
    });
    insert(parseInt(num), parseInt(value), function() {
      d3.selectAll('#insertTree input').each(function() {
        d3.select(this).attr('disabled', null);
      });
    });
  }
  return false;
};

var handleDelete = function(event) {
  var num = document.getElementById('deleteInput').value;
  if (num && data.data !== null) {
    document.getElementById('deleteInput').value = '';
    d3.selectAll('#deleteTree input').each(function() {
      
      d3.select(this).attr('disabled', '');
    });
    deleteTree(parseInt(num), function() {
      d3.selectAll('#deleteTree input').each(function() {
        d3.select(this).attr('disabled', null);
      });
    });
  }
  return false;
};

var handleFind = function(event) {
  var num = document.getElementById('findInput').value;
  if (num) {
    document.getElementById('findInput').value = '';
    d3.selectAll('#findTree input').each(function() {
      d3.select(this).attr('disabled', '');
    });
    findNode(parseInt(num), function() {
      d3.selectAll('#findTree input').each(function() {
        d3.select(this).attr('disabled', null);
      });
    });
  }
  return false;
};
