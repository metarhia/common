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


BTree.prototype.add = function(
  value, // number or string
  typle // related data (record)
) {
  if (this.root.elements.length === 0) {
    this.root.elements.push(new Element(value, typle));
    return this;
  }
  let curNode =  this.root;
  if (curNode.elements.length === this.minDegree * 2 - 1) {
    const newRoot = new BTreeNode(false);
    const leftChild = new BTreeNode(curNode.leaf);
    const rightChild = new BTreeNode(curNode.leaf);
    rightChild.elements = curNode.elements.slice(this.minDegree);
    rightChild.lastChild = curNode.lastChild;
    leftChild.elements = curNode.elements.slice(0, this.minDegree - 1);
    leftChild.lastChild = curNode.elements[this.minDegree - 1].child;
    newRoot.elements.push(curNode.elements[this.minDegree - 1]);
    newRoot.elements[0].child = leftChild;
    newRoot.lastChild = rightChild;
    this.root = newRoot;
    curNode = value < this.root.elements[0].value ? leftChild : rightChild;
  }
  while (!curNode.leaf) {
    let needChangedNodeFlag = true;
    for (const curElement of curNode.elements) {
      if (value < curElement.value) {
        if (curElement.child.elements.length === this.minDegree * 2 - 1) {
          const child = curElement.child;
          const newLeftChild = new BTreeNode(child.leaf);
          const newRightChild = new BTreeNode(child.leaf);
          newRightChild.elements = child.elements.slice(this.minDegree);
          newRightChild.lastChild = child.lastChild;
          newLeftChild.elements = child.elements.slice(0, this.minDegree - 1);
          newLeftChild.lastChild = child.elements[this.minDegree - 1].child;
          curElement.child = newRightChild;
          const median = child.elements[this.minDegree - 1];
          median.child = newLeftChild;
          curNode.elements.splice(
            curNode.elements.indexOf(curElement), 0, median
          );
          curNode = value < median.value ? newLeftChild : newRightChild;
          needChangedNodeFlag = false;
          break;
        }
        curNode = curElement.child;
        needChangedNodeFlag = false;
        break;
      }
    }
    // Must to add in lastChild
    if (needChangedNodeFlag) {
      if (curNode.lastChild.elements.length === this.minDegree * 2 - 1) {
        const child = curNode.lastChild;
        const newLeftChild = new BTreeNode(child.leaf);
        const newLastChild = new BTreeNode(child.leaf);
        newLastChild.elements = child.elements.slice(this.minDegree);
        newLastChild.lastChild = child.lastChild;
        newLeftChild.elements = child.elements.slice(0, this.minDegree - 1);
        newLeftChild.lastChild = child.elements[this.minDegree - 1].child;
        const median = child.elements[this.minDegree - 1];
        median.child = newLeftChild;
        curNode.elements.push(median);
        curNode.lastChild = newLastChild;
        curNode = value < median.value ? newLastChild : newLastChild;
        break;
      }
      curNode = curNode.lastChild;
    }
  }
  // Now in curNode is node (leaf), in which we need to insert an element
  let curElementIndex = 0;
  for (; curElementIndex < curNode.elements.length; curElementIndex++) {
    if (value < curNode.elements[curElementIndex].value) {
      curNode.elements.splice(curElementIndex, 0, new Element(value, typle));
      return this;
    }
  }
  curNode.elements.push(new Element(value, typle));
  return this;
};
