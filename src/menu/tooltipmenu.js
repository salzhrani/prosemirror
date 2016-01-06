import {Pos} from "../model"
import {defineOption} from "../edit"
import {elt, insertCSS} from "../dom"
import {Tooltip} from "../ui/tooltip"
import {UpdateScheduler} from "../ui/update"

import {Menu, TooltipDisplay, commandGroups} from "./menu"

const classPrefix = "ProseMirror-tooltipmenu"

defineOption("tooltipMenu", false, function(pm, value) {
  if (pm.mod.tooltipMenu) pm.mod.tooltipMenu.detach()
  pm.mod.tooltipMenu = value ? new TooltipMenu(pm, value) : null
})

class TooltipMenu {
  constructor(pm, config) {
    this.pm = pm
    this.showLinks = config ? config.showLinks !== false : true
    this.selectedBlockMenu = config && config.selectedBlockMenu
    this.update = new UpdateScheduler(pm, "change selectionChange blur commandsChanged", () => this.prepareUpdate())

    this.tooltip = new Tooltip(pm.wrapper, "above")
    this.menu = new Menu(pm, new TooltipDisplay(this.tooltip, () => this.update.force()))
  }

  detach() {
    this.update.detach()
    this.tooltip.detach()
  }

  prepareUpdate() {
    if (this.menu.active) return null

    let {empty, node, from, to} = this.pm.selection, link
    if (!this.pm.hasFocus()) {
      return () => this.tooltip.close()
    } else if (node && node.isBlock) {
      let coords = topOfNodeSelection(this.pm)
      return () => this.menu.show(commandGroups(this.pm, "block"), coords)
    } else if (!empty) {
      let coords = node ? topOfNodeSelection(this.pm) : topCenterOfSelection()
      let showBlock = this.selectedBlockMenu && Pos.samePath(from.path, to.path) &&
          from.offset == 0 && to.offset == this.pm.doc.path(from.path).size
      return () => this.menu.show(showBlock ? commandGroups(this.pm, "inline", "block") : commandGroups(this.pm, "inline"), coords)
    } else if (this.selectedBlockMenu && this.pm.doc.path(from.path).size == 0) {
      let coords = this.pm.coordsAtPos(from)
      return () => this.menu.show(commandGroups(this.pm, "block"), coords)
    } else if (this.showLinks && (link = this.linkUnderCursor())) {
      let coords = this.pm.coordsAtPos(from)
      return () => this.showLink(link, coords)
    } else {
      return () => this.tooltip.close()
    }
  }

  linkUnderCursor() {
    let head = this.pm.selection.head
    if (!head) return null
    let marks = this.pm.doc.marksAt(head)
    return marks.reduce((found, m) => found || (m.type.name == "link" && m), null)
  }

  showLink(link, pos) {
    let node = elt("div", {class: classPrefix + "-linktext"}, elt("a", {href: link.attrs.href, title: link.attrs.title}, link.attrs.href))
    this.tooltip.open(node, pos)
  }
}

// Get the x and y coordinates at the top center of the current DOM selection.
function topCenterOfSelection() {
  let rects = window.getSelection().getRangeAt(0).getClientRects()
  let {left, right, top} = rects[0], i = 1
  while (left == right && rects.length > i) {
    ;({left, right, top} = rects[i++])
  }
  for (; i < rects.length; i++) {
    if (rects[i].top < rects[0].bottom - 1 &&
        // Chrome bug where bogus rectangles are inserted at span boundaries
        (i == rects.length - 1 || Math.abs(rects[i + 1].left - rects[i].left) > 1)) {
      left = Math.min(left, rects[i].left)
      right = Math.max(right, rects[i].right)
      top = Math.min(top, rects[i].top)
    }
  }
  return {top, left: (left + right) / 2}
}

function topOfNodeSelection(pm) {
  let selected = pm.content.querySelector(".ProseMirror-selectednode")
  if (!selected) return {left: 0, top: 0}
  let box = selected.getBoundingClientRect()
  return {left: Math.min((box.left + box.right) / 2, box.left + 20), top: box.top}
}

insertCSS(`

.${classPrefix}-linktext a {
  color: white;
  text-decoration: none;
  padding: 0 5px;
}

.${classPrefix}-linktext a:hover {
  text-decoration: underline;
}

`)
