import {defaultSchema} from "../model"

import {defaultKeymap} from "./commands"

class Option {
  constructor(defaultValue, update, updateOnInit) {
    this.defaultValue = defaultValue
    this.update = update
    this.updateOnInit = updateOnInit !== false
  }
}

const options = {
  __proto__: null,

  // :: Schema #path=schema #kind=option
  // The [schema](#Schema) that the editor's document should use.
  schema: new Option(defaultSchema, false, false),

  // :: any #path=doc #kind=option
  // The starting document. Usually a `Node`, but can be in another
  // format when the `docFormat` option is also specified.
  doc: new Option(null, function(pm, value) {
    pm.setDoc(value)
  }, false),

  // :: ?string #path=docFormat #kind=option
  // The format in which the `doc` option is given. Defaults to `null`
  // (a raw `Node`).
  docFormat: new Option(null),

  // :: ?union<DOMNode, (DOMNode)> #path=place #kind=option
  // Determines the placement of the editor in the page. When `null`,
  // the editor is not placed. When a DOM node is given, the editor is
  // appended to that node. When a function is given, it is called
  // with the editor's wrapping DOM node, and is expected to place it
  // into the document.
  place: new Option(null),

  // :: Keymap #path=keymap #kind=option
  // The base [keymap](#Keymap). When not given, a default keymap is
  // synthesized from the default key bindings provided by the
  // [commands](#Command) that are in scope for the editor.
  keymap: new Option(null, (pm, value) => {
    if (!value) pm.options.keymap = defaultKeymap(pm)
  }),

  // :: number #path=historyDepth #kind=option
  // The amount of history events that are collected before the oldest
  // events are discarded. Defaults to 100.
  historyDepth: new Option(100),

  // :: number #path=historyEventDelay #kind=option
  // The amount of milliseconds that must pass between changes to
  // start a new history event. Defaults to 500.
  historyEventDelay: new Option(500),

  // :: string #path=commandParamHandler #kind=option
  // The name of the handler used to prompt the user for [command
  // parameters](#CommandParam). Only relevant when multiple such
  // handlers are loaded, and you want to choose between them.
  commandParamHandler: new Option("default"),

  // :: ?string #path=label #kind=option
  // The label of the editor. When set, the editable DOM node gets an
  // `aria-label` attribute with this value.
  label: new Option(null)
}

// :: (string, any, (pm: ProseMirror, newValue: any, oldValue: any, init: bool), bool)
// Define a new option. The `update` handler will be called with the
// option's old and new value every time the option is
// [changed](#ProseMirror.setOption). When `updateOnInit` is true, it
// is also called on editor init, with null as the old value, and a fourth
// argument of true.
export function defineOption(name, defaultValue, update, updateOnInit) {
  options[name] = new Option(defaultValue, update, updateOnInit)
}

export function parseOptions(obj) {
  let result = Object.create(null)
  let given = obj ? [obj].concat(obj.use || []) : []
  outer: for (let opt in options) {
    for (let i = 0; i < given.length; i++) {
      if (opt in given[i]) {
        result[opt] = given[i][opt]
        continue outer
      }
    }
    result[opt] = options[opt].defaultValue
  }
  return result
}

export function initOptions(pm) {
  for (var opt in options) {
    let desc = options[opt]
    if (desc.update && desc.updateOnInit)
      desc.update(pm, pm.options[opt], null, true)
  }
}

export function setOption(pm, name, value) {
  let desc = options[name]
  if (desc.update === false) throw new Error("Option '" + name + "' can not be changed")
  let old = pm.options[name]
  pm.options[name] = value
  if (desc.update) desc.update(pm, value, old, false)
}
