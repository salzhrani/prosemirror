import {defaultSchema} from "../model"

class Option {
  constructor(defaultValue, update, updateOnInit) {
    this.defaultValue = defaultValue
    this.update = update
    this.updateOnInit = updateOnInit !== false
  }
}

const options = Object.create(null)

// :: (string, any, (pm: ProseMirror, newValue: any, oldValue: any, init: bool), bool)
// Define a new option. The `update` handler will be called with the
// option's old and new value every time the option is
// [changed](#ProseMirror.setOption). When `updateOnInit` is true, it
// is also called on editor init, with null as the old value, and a fourth
// argument of true.
export function defineOption(name, defaultValue, update, updateOnInit) {
  options[name] = new Option(defaultValue, update, updateOnInit)
}

// :: Schema #path=schema #kind=option
// The [schema](#Schema) that the editor's document should use.
defineOption("schema", defaultSchema, false)

// :: any #path=doc #kind=option
// The starting document. Usually a `Node`, but can be in another
// format when the `docFormat` option is also specified.
defineOption("doc", null, (pm, value) => pm.setDoc(value), false)

// :: ?string #path=docFormat #kind=option
// The format in which the `doc` option is given. Defaults to `null`
// (a raw `Node`).
defineOption("docFormat", null)

// :: ?union<DOMNode, (DOMNode)> #path=place #kind=option
// Determines the placement of the editor in the page. When `null`,
// the editor is not placed. When a DOM node is given, the editor is
// appended to that node. When a function is given, it is called
// with the editor's wrapping DOM node, and is expected to place it
// into the document.
defineOption("place", null)

// :: number #path=historyDepth #kind=option
// The amount of history events that are collected before the oldest
// events are discarded. Defaults to 100.
defineOption("historyDepth", 100)

// :: number #path=historyEventDelay #kind=option
// The amount of milliseconds that must pass between changes to
// start a new history event. Defaults to 500.
defineOption("historyEventDelay", 500)

// :: Object<?CommandSpec> #path=commands #kind=option
// Delete, add, or modify [commands](#ProseMirror.commands) associated
// with this editor. The property names of the given object should
// correspond to command [names](#CommandSpec.name), and their values
// can be `null`, to disable a command, an object contain a `run`
// property, to add a command, and an object without `run`, to extend
// or reconfigure the existing command with that name. The latter can
// be used to change, for example, the [key
// bindings](#CommandSpec.keys) for a command or its appearance in the
// menu.
defineOption("commands", {}, pm => pm.updateCommands(), false)

// :: [string] #path=include #kind=option
// An array of included names or namespaces that are enabled for this
// editor. These are used to filter [commands](#defineCommand) and
// [input rules](#defineInputRule) so that you can define these
// without having them show up in every editor.
//
// An item named `"space:name"` would only be included in the editor
// if either the namespace `"space"` is included, or the full name
// `"space:name"` is. Item names without a colon are considered part
// of the `"default"` namespace. Commands and input rules associated
// with schema [nodes](#NodeType) or [marks](#MarkType) will be
// namespaced under `"schema:"` and then the name of the element they
// are associated with, for example `"schema:horizontal_rule:insert"`.
//
// This option's default value is `["default", "schema"]`, including
// all the ‘top level’ items and those associated with schema
// elements, but nothing else.
//
// See also `ProseMirror.isInNamespace`.
defineOption("include", ["default", "schema"], pm => pm.updateCommands(), false)

// :: string #path=commandParamHandler #kind=option
// The name of the handler used to prompt the user for [command
// parameters](#CommandParam). Only relevant when multiple such
// handlers are loaded, and you want to choose between them.
defineOption("commandParamHandler", "default")

// :: ?string #path=label #kind=option
// The label of the editor. When set, the editable DOM node gets an
// `aria-label` attribute with this value.
defineOption("label", null)

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
