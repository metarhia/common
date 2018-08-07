'use strict';

const DEFAULT_DEGREE = 6; // min degree of b-tree.
// All vertices except the root have [degree - 1 ... 2 * degree + 1] child nodes

function BTree(degree = DEFAULT_DEGREE) {
  this.root = new BTreeNode();
  this.minDegree = degree;
}

function BTreeNode(leaf = true) {
  this.elements = [];
  this.leaf = leaf;
  this.lastChild = null;
}

function Element(value, typle) {
  this.value = value;
  this.typle = typle;
  this.child = null;
}

BTree.prototype.getEqual = function(value) {
  let curNode = this.root;
  while (true) {
    let needChangedNodeFlag = true;
    for (const curElement of curNode.elements) {
      if (value <= curElement.value) {
        if (curElement.value === value) return curElement.typle;
        if (curNode.leaf) return null;
        curNode = curElement.child;
        needChangedNodeFlag = false;
        break;
      }
    }
    if (curNode.leaf) return null;
    if (needChangedNodeFlag) {
      curNode = curNode.lastChild;
    }
  }
};

BTree.prototype.getLarger = function(value) {
  const result = [];
  const addAll = function(curNode) {
    if (curNode.leaf) {
      for (const curElement of curNode.elements) {
        result.push(curElement.typle);
      }
    } else {
      for (const curElement of curNode.elements) {
        result.push(curElement.typle);
        addAll(curElement.child);
      }
      addAll(curNode.lastChild);
    }
  };

  const addLarger = function(curNode) {
    let curElementIndex = 0;
    for (; curElementIndex < curNode.elements.length; curElementIndex++) {
      const curElement = curNode.elements[curElementIndex];
      if (curElement.value <= value) {
        continue;
      } else {
        if (!curNode.leaf) {
          addLarger(curElement.child);
        }
        result.push(curElement.typle);
        for (const curElement of curNode.elements.slice(curElementIndex + 1)) {
          if (!curNode.leaf) {
            addAll(curElement.child);
          }
          result.push(curElement.typle);
        }
        if (!curNode.leaf) {
          addAll(curNode.lastChild);
        }
        return result;
      }
    }
    if (!curNode.leaf) {
      addLarger(curNode.lastChild);
    }
    return result;
  };
  return addLarger(this.root);
};


BTree.prototype.getLess = function(value) {
  const result = [];
  const addAll = function(curNode) {
    if (curNode.leaf) {
      for (const curElement of curNode.elements) {
        result.push(curElement.typle);
      }
    } else {
      for (const curElement of curNode.elements) {
        addAll(curElement.child);
        result.push(curElement.typle);
      }
      addAll(curNode.lastChild);
    }
  };

  const addLess = function(curNode) {
    for (const curElement of curNode.elements) {
      if (curElement.value <= value) {
        if (!curNode.leaf) {
          addAll(curElement.child);
        }
        if (curElement.value < value) result.push(curElement.typle);
      } else if (!curNode.leaf) {
        addLess(curElement.child);
        break;
      }
    }
    const length = curNode.elements.length;
    if (curNode.elements[length - 1].value < value && (!curNode.leaf)) {
      addLess(curNode.lastChild);
    }
  };
  addLess(this.root);
  return result;
};


BTree.prototype.getBetween = function(
  startValue,
  finishValue
) {

  const result = [];

  const addAll = function(curNode) {
    if (curNode.leaf) {
      for (const curElement of curNode.elements) {
        result.push(curElement.typle);
      }
    } else {
      for (const curElement of curNode.elements) {
        result.push(curElement.typle);
        addAll(curElement.child);
      }
      addAll(curNode.lastChild);
    }
  };

  const addLess = function(curNode) {
    for (const curElement of curNode.elements) {
      if (curElement.value <= finishValue) {
        if (!curNode.leaf) {
          addAll(curElement.child);
        }
        if (curElement.value < finishValue) result.push(curElement.typle);
      } else if (!curNode.leaf) {
        addLess(curElement.child);
        break;
      }
    }
    const length = curNode.elements.length;
    if (curNode.elements[length - 1].value < finishValue && (!curNode.leaf)) {
      addLess(curNode.lastChild);
    }
  };

  const addLarger = function(curNode) {
    let curElementIndex = 0;
    for (; curElementIndex < curNode.elements.length; curElementIndex++) {
      const curElement = curNode.elements[curElementIndex];
      if (curElement.value <= startValue) {
        continue;
      } else {
        if (!curNode.leaf) {
          addLarger(curElement.child);
        }
        result.push(curElement.typle);
        for (const curElement of curNode.elements.slice(curElementIndex + 1)) {
          if (!curNode.leaf) {
            addAll(curElement.child);
          }
          result.push(curElement.typle);
        }
        if (!curNode.leaf) {
          addAll(curNode.lastChild);
        }
        break;
      }
    }
    if (!curNode.leaf) {
      addLarger(curNode.lastChild);
    }
  };

  const addMix = function(curNode) {
    let curElementIndex = 0;
    for (; curElementIndex < curNode.elements.length; curElementIndex++) {
      const curElement = curNode.elements[curElementIndex];
      if (curElement.value < startValue) continue;
      if (finishValue < curElement.value) {
        if (!curNode.leaf) {
          addMix(curNode.child);
        }
        break;
      }
      if (!curNode.leaf) {
        addLarger(curElement.child);
      }
      result.push(curElement.typle);

      for (const curElement of curNode.elements.slice(curElementIndex + 1)) {
        if (curElement.value <= finishValue) {
          if (!curNode.leaf) {
            addAll(curElement.child);
          }
          if (curElement.value < finishValue) result.push(curElement.typle);
        } else {
          if (!curNode.leaf) {
            addLess(curElement.child);
          }
          break;
        }
      }
      break;
    }
    const length = curNode.elements.length;
    const lastValue = curNode.elements[length - 1].value;
    if (lastValue < finishValue && (!curNode.leaf)) {
      addMix(curNode.lastChild);
    }
  };

  addMix(this.root);
  return result;
};
