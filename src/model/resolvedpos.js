// ;; The usual way to represent positions in a document is with a
// plain integer. Since those tell you very little about the context
// of that position, you'll often have to 'resolve' a position to get
// the context you need. Objects of this class represent such a
// resolved position, providing various pieces of context information
// and helper methods.
export class ResolvedPos {
  constructor(pos, nodes, indices, offsets, parentOffset) {
    // :: number The position that was resolved.
    this.pos = pos
    this.nodes = nodes
    this.indices = indices
    this.offsets = offsets
    // :: number The offset this position has into its parent node.
    this.parentOffset = parentOffset
  }

  // :: Node
  // The parent node that the position points into. Note that even if
  // a position points into a text node, that node is not considered
  // the parent—text nodes are 'flat' in this model.
  get parent() { return this.node(this.depth) }

  // :: number
  // The number of levels the parent node is from the root. If this
  // position points directly into the root, it is 0. If it points
  // into a top-level paragraph, 1, and so on.
  get depth() { return this.nodes.length - 1 }

  // :: (number) → Node
  // The ancestor node at the given level. `p.node(p.depth)` is the
  // same as `p.parent`.
  node(depth) { return this.nodes[depth] }

  // :: (number) → number
  // The index into the ancestor at the given level. If this points at
  // the 3rd node in the 2nd paragraph on the top level, for example,
  // `p.index(0)` is 2 and `p.index(1)` is 3.
  index(depth) { return this.indices[depth] }

  // :: (number) → number
  // The offset into the ancestor at the given level. Note that, if
  // this position points into the middle of a text node, the offset
  // at `p.depth` will point _before_ that text node (whereas
  // `p.parentOffset` will point inside of it).
  offset(depth) { return this.offsets[depth] }

  // :: (number) → number
  // The (absolute) position at the start of the node at the given
  // level.
  start(depth) {
    let pos = 0
    for (let i = 0; i < depth; i++) pos += this.offset(i) + 1
    return pos
  }

  // :: (number) → number
  // The (absolute) position at the end of the node at the given
  // level.
  end(depth) {
    return this.start(depth) + this.node(depth).content.size
  }

  // :: (number) → number
  // The (absolute) position directly before the node at the given
  // level, or, when `level` is `this.level + 1`, the original
  // position.
  before(depth) { return depth == this.nodes.length ? this.pos : this.start(depth) - 1 }

  // :: (number) → number
  // The (absolute) position directly after the node at the given
  // level, or, when `level` is `this.level + 1`, the original
  // position.
  after(depth) { return depth == this.nodes.length ? this.pos : this.end(depth) + 1 }

  // :: ?Node
  // Get the node directly after the position, if any. If the position
  // points into a text node, only the part of that node after the
  // position is returned.
  get nodeAfter() {
    let parent = this.parent, index = this.index(this.depth)
    if (index == parent.childCount) return null
    let dOff = this.parentOffset - this.offset(this.depth), child = parent.child(index)
    return dOff ? parent.child(index).cut(dOff) : child
  }

  // :: ?Node
  // Get the node directly before the position, if any. If the
  // position points into a text node, only the part of that node
  // before the position is returned.
  get nodeBefore() {
    let index = this.index(this.depth)
    let dOff = this.parentOffset - this.offset(this.depth)
    if (dOff) return this.parent.child(index).cut(0, dOff)
    return index == 0 ? null : this.parent.child(index - 1)
  }

  // :: (ResolvedPos) → number
  // The depth up to which this position and the other share the same
  // parent nodes.
  sameDepth(other) {
    let depth = 0, max = Math.min(this.depth, other.depth)
    while (depth < max && this.index(depth) == other.index(depth)) ++depth
    return depth
  }

  // :: (ResolvedPos) → bool
  // Query whether the given position shares the same parent node.
  sameParent(other) {
    return this.pos - this.parentOffset == other.pos - other.parentOffset
  }

  toString() {
    let str = ""
    for (let i = 1; i < this.nodes.length; i++)
      str += (str ? "/" : "") + this.node(i).type.name + "_" + this.index(i - 1)
    return str + ":" + this.parentOffset
  }
}
