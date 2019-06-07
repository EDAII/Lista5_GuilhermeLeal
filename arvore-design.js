var id = 1;

var data = {
  id: id++,
  data: null,
  value: null,
  parent: null,
  children: []
};
var changeRoot = false;
var msg = document.getElementById('msg');

function findHeight(node) {
  if (node.data === null || !node) return 0;
  else {
    var left = node.children[0] ? findHeight(node.children[0]) : 0;
    var right = node.children[1] ? findHeight(node.children[1]) : 0;
    return 1 + (left > right ? left : right);
  }
}

function rotateLeft(node, callback) {
  var parent = node.parent,
    leftChild = node.children[0],
    rightChild = node.children[1];

  if (rightChild.children.length === 0) {
    rightChild.children.push({
      id: id++,
      data: null,
      value: null,
      parent: rightChild,
      children: []
    });
    rightChild.children.push({
      id: id++,
      data: null,
      value: null,
      parent: rightChild,
      children: []
    });
  }

  if (parent === null) {
    rightChild.children[0].parent = node;
    node.children[1] = rightChild.children[0];

    node.parent = rightChild;
    rightChild.children[0] = node;

    rightChild.parent = parent;
    data = rightChild;

    gLinks
      .selectAll('path')
      .filter(function(d) {
        return d.data.id === node.parent.id;
      })
      .datum(d3.hierarchy(node).descendants()[0]);
    changeRoot = true;
  } else if (node === parent.children[0]) {
    rightChild.children[0].parent = node;
    node.children[1] = rightChild.children[0];

    node.parent = rightChild;
    rightChild.children[0] = node;

    rightChild.parent = parent;
    parent.children[0] = rightChild;

    changeRoot = false;
  } else if (node === parent.children[1]) {
    rightChild.children[0].parent = node;
    node.children[1] = rightChild.children[0];

    node.parent = rightChild;
    rightChild.children[0] = node;

    rightChild.parent = parent;
    parent.children[1] = rightChild;

    changeRoot = false;
  }

  if (
    node.children.length !== 0 &&
    node.children[0].data === null &&
    node.children[1].data === null
  )
    node.children = [];

  setTimeout(function() {
    if (callback instanceof Function) {
      callback();
    }
  }, duration);
}

function rotateRight(node, callback) {
  var parent = node.parent,
    leftChild = node.children[0],
    rightChild = node.children[1];

  if (leftChild.children.length === 0) {
    leftChild.children.push({
      id: id++,
      data: null,
      value: null,
      parent: leftChild,
      children: []
    });
    leftChild.children.push({
      id: id++,
      data: null,
      value: null,
      parent: leftChild,
      children: []
    });
  }

  if (parent === null) {
    leftChild.children[1].parent = node;
    node.children[0] = leftChild.children[1];

    node.parent = leftChild;
    leftChild.children[1] = node;

    leftChild.parent = parent;
    data = leftChild;

    gLinks
      .selectAll('path')
      .filter(function(d) {
        return d.data.id === node.parent.id;
      })
      .datum(d3.hierarchy(node).descendants()[0]);
    changeRoot = true;
  } else if (node === parent.children[0]) {

    leftChild.children[1].parent = node;
    node.children[0] = leftChild.children[1];

    node.parent = leftChild;
    leftChild.children[1] = node;

    leftChild.parent = parent;
    parent.children[0] = leftChild;

    changeRoot = false;
  } else if (node === parent.children[1]) {
    leftChild.children[1].parent = node;
    node.children[0] = leftChild.children[1];

    node.parent = leftChild;
    leftChild.children[1] = node;

    leftChild.parent = parent;
    parent.children[1] = leftChild;

    changeRoot = false;
  }

  if (
    node.children.length !== 0 &&
    node.children[0].data === null &&
    node.children[1].data === null
  )
    node.children = [];

  setTimeout(function() {
    if (callback instanceof Function) {
      callback();
    }
  }, duration);
}

function highlight(node) {
  var hlNode = gNodes.selectAll('circle').filter(function(d) {
    return d.data.id === node.id;
  });
  hlNode
    .transition()
    .duration(duration / 3)
    .style('stroke', '#ff0000')
    .style('stroke-width', '3.5px');
}

function removeHighlight(node) {
  var hlNode = gNodes.selectAll('circle').filter(function(d) {
    return d.data.id === node.id;
  });
  hlNode
    .transition()
    .duration(duration / 3)
    .style('stroke', '#000000')
    .style('stroke-width', '2.5px');
}

//Tree balancing
function balance(node, callback) {
  highlight(node);
  var hLeft = node.children[0] ? findHeight(node.children[0]) : 0;
  var hRight = node.children[1] ? findHeight(node.children[1]) : 0;
  var hl,
    hr,
    defer = 0.5;
  if (hLeft - hRight >= 2) {
    
    var leftChild = node.children[0];
    hl = leftChild.children[0] ? findHeight(leftChild.children[0]) : 0;
    hr = leftChild.children[1] ? findHeight(leftChild.children[1]) : 0;
    if (hl >= hr) {
    
      rotateRight(node, updateTree);
      defer = 1;
    } else {
    
      defer = 3;
      rotateLeft(leftChild, function() {
        updateTree();
        setTimeout(function() {
          rotateRight(node, updateTree);
        }, duration);
      });
    }
  } else if (hRight - hLeft >= 2) {
    
    rotated = false;
    isChanged = true;
    var rightChild = node.children[1];
    hl = rightChild.children[0] ? findHeight(rightChild.children[0]) : 0;
    hr = rightChild.children[1] ? findHeight(rightChild.children[1]) : 0;
    if (hr >= hl) {
  
      rotateLeft(node, updateTree);
      defer = 1;
    } else {
      
      defer = 3;
      rotateRight(rightChild, function() {
        updateTree();
        setTimeout(function() {
          rotateLeft(node, updateTree);
        }, duration);
      });
    }
  }
  setTimeout(function() {
    removeHighlight(node);
    if (!node.parent) {
      if (callback instanceof Function) callback();
    } else balance(node.parent, callback);
  }, duration * defer);
}

// Tree insertion
function insert(n, n2, callback) {
  t0 = performance.now();
  console.log('Insert', n);
  if (!n || !Number.isInteger(n)) return;
  if (!data.data) {
    data.data = n;
    data.value = n2;
    updateTree();
    callback();
    return;
  }

  var walker = data,
    newNode;

  while (!newNode) {
    if (n <= walker.data) {
      if (walker.children.length === 0) {
        walker.children.push({
          id: id++,
          data: n,
          value: n2,
          parent: walker,
          children: []
        });
        walker.children.push({
          id: id++,
          data: null,
          value: null,
          parent: walker,
          children: []
        });
        newNode = walker.children[0];
      } else if (walker.children[0].data === null) {
        walker.children[0].data = n;
        newNode = walker.children[0];
      } else {
        walker = walker.children[0];
      }
    } else {
      if (walker.children.length === 0) {
        walker.children.push({
          id: id++,
          data: null,
          value: null,
          parent: walker,
          children: []
        }); 
        walker.children.push({
          id: id++,
          data: n,
          value: n2,
          parent: walker,
          children: []
        }); 
        newNode = walker.children[1];
      } else if (walker.children[1].data === null) {
        walker.children[1].data = n;
        walker.children[1].value = n2;
        newNode = walker.children[1];
      } else {
        walker = walker.children[1];
      }
    }
  }
  updateTree();
  setTimeout(function() {
    balance(newNode, callback);
  }, duration);
}

// Tree deletion
function deleteTree(n, callback) {
  t0 = performance.now();
  if (!data.data) return false;
  var walker = data,
    nodeDelete = null, 
    nodeReplace = null, 
    nodeBalance = null, 
    parent;

  // Find node
  if (n === walker.data) {
    nodeDelete = walker;
    if (nodeDelete.children.length === 0) nodeDelete.data = null;
    else {
      if (nodeDelete.children[0].data === null) {
        data = data.children[1]; 
        data.parent = null;

        gLinks
          .selectAll('path')
          .filter(function(d) {
            return d.data.id === data.id;
          })
          .remove();
      } else {
        nodeReplace = nodeDelete.children[0];
        while (nodeReplace) {
          if (!nodeReplace.children[1] || !nodeReplace.children[1].data) break;
          nodeReplace = nodeReplace.children[1];
        }

        parent = nodeReplace.parent;
        nodeBalance = parent; 

        if (parent.children[0] === nodeReplace) {
          if (nodeReplace.children[0]) {
            nodeReplace.children[0].parent = parent;
            parent.children[0] = nodeReplace.children[0];
          } else {
            parent.children[0] = {
              id: id++,
              data: null,
              value: null,
              parent: parent,
              children: []
            };
          }
        } else if (parent.children[1] === nodeReplace) {
          if (nodeReplace.children[0]) {
            nodeReplace.children[0].parent = parent;
            parent.children[1] = nodeReplace.children[0];
          } else {
            parent.children[1] = {
              id: id++,
              data: null,
              value: null,
              parent: parent,
              children: []
            };
          }
        }

        if (
          parent.children.length !== 0 &&
          parent.children[0].data === null &&
          parent.children[1].data === null
        )
          parent.children = [];

        if (nodeDelete.children[0]) {
          nodeDelete.children[0].parent = nodeReplace;
          nodeReplace.children[0] = nodeDelete.children[0];
        }
        if (nodeDelete.children[1]) {
          nodeDelete.children[1].parent = nodeReplace;
          nodeReplace.children[1] = nodeDelete.children[1];
        }

        nodeReplace.parent = null;
        data = nodeReplace;
        gLinks
          .selectAll('path')
          .filter(function(d) {
            return d.data.id === nodeReplace.id;
          })
          .remove();
      }
    }

    updateTree();
    setTimeout(function() {
      if (nodeBalance) balance(nodeBalance, callback);
      else if (callback instanceof Function) callback();
    }, duration);
    return true;
  }

  // Finding node
  while (walker.data) {
    if (n < walker.data) walker = walker.children[0];
    else if (n > walker.data) walker = walker.children[1];
    else if (n === walker.data) {
      nodeDelete = walker;
      break;
    }
  }

  if (!nodeDelete) return false;

  // Delete
  if (nodeDelete.children.length === 0) {
    parent = nodeDelete.parent;
    nodeBalance = parent; 

    if (parent.children[0] === nodeDelete) {
      parent.children[0] = {
        id: id++,
        data: null,
        value: null,
        parent: parent,
        children: []
      }; 
    } else if (parent.children[1] === nodeDelete) {
      parent.children[1] = {
        id: id++,
        data: null,
        value: null,
        parent: parent,
        children: []
      };
    }

    if (
      parent.children.length !== 0 &&
      parent.children[0].data === null &&
      parent.children[1].data === null
    )
      parent.children = [];
  } else {
    
    nodeReplace = nodeDelete.children[0].data ? nodeDelete.children[0] : null;
    while (nodeReplace) {
      if (!nodeReplace.children[1] || !nodeReplace.children[1].data) break;
      nodeReplace = nodeReplace.children[1];
    }

    if (!nodeReplace) {
      parent = nodeDelete.parent;
      nodeBalance = parent; 

      nodeDelete.children[1].parent = parent;
      if (parent.children[0] === nodeDelete)
        parent.children[0] = nodeDelete.children[1];
      
      else if (parent.children[1] === nodeDelete)
        parent.children[1] = nodeDelete.children[1]; 
    } else {
      parent = nodeReplace.parent;
      nodeBalance = parent; 

      if (parent.children[0] === nodeReplace) {
        if (nodeReplace.children[0]) {
          nodeReplace.children[0].parent = parent;
          parent.children[0] = nodeReplace.children[0];
        } else {
          parent.children[0] = {
            id: id++,
            data: null,
            value: null,
            parent: parent,
            children: []
          };
        }
      } else if (parent.children[1] === nodeReplace) {
        if (nodeReplace.children[0]) {
          nodeReplace.children[0].parent = parent;
          parent.children[1] = nodeReplace.children[0];
        } else {
          parent.children[1] = {
            id: id++,
            data: null,
            value: null,
            parent: parent,
            children: []
          };
        }
      }
      if (
        parent.children.length !== 0 &&
        parent.children[0].data === null &&
        parent.children[1].data === null
      )
        parent.children = [];

      
      parent = nodeDelete.parent;
      nodeReplace.parent = parent;
      if (parent.children[0] === nodeDelete) parent.children[0] = nodeReplace;
      else if (parent.children[1] === nodeDelete)
        parent.children[1] = nodeReplace;
      if (nodeDelete.children[0]) {
        nodeDelete.children[0].parent = nodeReplace;
        nodeReplace.children[0] = nodeDelete.children[0];
      }
      if (nodeDelete.children[1]) {
        nodeDelete.children[1].parent = nodeReplace;
        nodeReplace.children[1] = nodeDelete.children[1];
      }
    }
  }

  updateTree();
  setTimeout(function() {
    if (nodeBalance) balance(nodeBalance, callback);
    else if (callback instanceof Function) callback();
  }, duration);
  return true;
}

async function findNode(n, callback) {
  var t0 = performance.now();
  console.log('Find', n);
  if (!n || !Number.isInteger(n)) return;
  if (!data.data) {
    data.data = n;
    updateTree();
    callback();
    return;
  }

  var walker = data;
  console.log(walker);
  var count = 1;
  var height = findHeight(walker);

  msg.innerHTML = 'Value: NOT FOUND';
  console.log('height: ' + height);

  while (count < height + 1) {
    console.log('Count: ' + count);
    highlight(walker);
    await sleep(duration);
    removeHighlight(walker);

    if (n < walker.data) walker = walker.children[0];
    else if (n > walker.data) walker = walker.children[1];
    else if (n === walker.data) {
      msg.innerHTML = 'Value: ' + walker.value;
      console.log('Count: ' + count);
      break;
    }
    count++;
  }

  setTimeout(function() {
    callback();
  }, duration);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
