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
