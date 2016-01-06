import {defTest} from "../tests"
import {tempEditor, namespace} from "./def"
import {cmpNode, is} from "../cmp"
import {doc, blockquote, pre, h1, h2, p, li, ol, ul, em, strong, code, a, a2, br, hr} from "../build"

import {defineCommand} from "../../src/edit"

const used = Object.create(null)

function test(cmd, before, after) {
  let known = used[cmd] || 0
  defTest("command_" + cmd + (known ? "_" + (known + 1) : ""), () => {
    let pm = tempEditor({doc: before})
    pm.execCommand(cmd)
    cmpNode(pm.doc, after)
  })
  used[cmd] = known + 1
}

test("schema:hard_break:insert",
     doc(p("fo<a>o")),
     doc(p("fo", br, "o")))
test("schema:hard_break:insert",
     doc(pre("fo<a>o")),
     doc(pre("fo\no")))

test("schema:strong:set",
     doc(p("f<a>o<b>o")),
     doc(p("f", strong("o"), "o")))
test("schema:strong:set",
     doc(p("f<a>oo")),
     doc(p("foo")))
test("schema:strong:set",
     doc(p("f<a>oo"), p("ba<b>r")),
     doc(p("f", strong("oo")), p(strong("ba"), "r")))
test("schema:strong:set",
     doc(p(strong("f<a>o<b>o"))),
     doc(p(strong("f<a>o<b>o"))))

test("schema:strong:unset",
     doc(p(strong("f<a>o<b>o"))),
     doc(p(strong("f"), "o", strong("o"))))
test("schema:strong:unset",
     doc(p("f<a>o<b>o")),
     doc(p("foo")))
test("schema:strong:unset",
     doc(p("f<a>oo"), p(strong("ba<b>r"))),
     doc(p("foo"), p("ba", strong("r"))))

test("schema:strong:toggle",
     doc(p("f<a>o<b>o")),
     doc(p("f", strong("o"), "o")))
test("schema:strong:toggle",
     doc(p(strong("f<a>o<b>o"))),
     doc(p(strong("f"), "o", strong("o"))))
test("schema:strong:toggle",
     doc(p("f<a>oo ", strong("ba<b>r"))),
     doc(p("foo ba", strong("r"))))

test("schema:em:set",
     doc(p("f<a>o<b>o")),
     doc(p("f", em("o"), "o")))
test("schema:em:unset",
     doc(p(em("f<a>o<b>o"))),
     doc(p(em("f"), "o", em("o"))))
test("schema:em:toggle",
     doc(p("f<a>o<b>o")),
     doc(p("f", em("o"), "o")))
test("schema:em:toggle",
     doc(p(em("f<a>o<b>o"))),
     doc(p(em("f"), "o", em("o"))))
     
test("schema:code:set",
     doc(p("f<a>o<b>o")),
     doc(p("f", code("o"), "o")))
test("schema:code:unset",
     doc(p(code("f<a>o<b>o"))),
     doc(p(code("f"), "o", code("o"))))
test("schema:code:toggle",
     doc(p("f<a>o<b>o")),
     doc(p("f", code("o"), "o")))
test("schema:code:toggle",
     doc(p(code("f<a>o<b>o"))),
     doc(p(code("f"), "o", code("o"))))

test("joinBackward",
     doc(p("hi"), p("<a>there")),
     doc(p("hithere")))
test("joinBackward",
     doc(p("hi"), blockquote(p("<a>there"))),
     doc(p("hi"), p("there")))
test("joinBackward",
     doc(blockquote(p("hi")), blockquote(p("<a>there"))),
     doc(blockquote(p("hi"), p("there"))))
test("joinBackward",
     doc(blockquote(p("hi")), p("<a>there")),
     doc(blockquote(p("hi"), p("there"))))
test("joinBackward",
     doc(blockquote(p("hi")), p("<a>there"), blockquote(p("x"))),
     doc(blockquote(p("hi"), p("there"), p("x"))))
test("joinBackward",
     doc(ul(li(p("hi"))), p("<a>there")),
     doc(ul(li(p("hi")), li(p("there")))))
test("joinBackward",
     doc(ul(li(p("hi"))), ul(li(p("<a>there")))),
     doc(ul(li(p("hi")), li(p("there")))))
test("joinBackward",
     doc(ul(li(p("hi")), li(p("<a>there")))),
     doc(ul(li(p("hi"), p("there")))))
test("joinBackward",
     doc(ul(li(p("<a>there")))),
     doc(p("<a>there")))
test("joinBackward",
     doc(ul(li(p("hi"))), p("<a>there"), ul(li(p("x")))),
     doc(ul(li(p("hi")), li(p("there")), li(p("x")))))
test("joinBackward",
     doc(hr, p("<a>there")),
     doc(p("there")))
test("joinBackward",
     doc(hr, blockquote(p("<a>there"))),
     doc(blockquote(p("there"))))
test("joinBackward",
     doc(p("<a>foo")),
     doc(p("foo")))

test("deleteSelection",
     doc(p("f<a>o<b>o")),
     doc(p("fo")))
test("deleteSelection",
     doc(p("f<a>oo"), p("ba<b>r")),
     doc(p("fr")))

test("deleteCharBefore",
     doc(p("ba<a>r")),
     doc(p("br")))
test("deleteCharBefore",
     doc(p("fç̀<a>o")), // The c has two combining characters, which must be deleted along with it
     doc(p("fo")))
test("deleteCharBefore",
     doc(p("çç<a>ç")), // The combining characters in nearby characters must be left alone
     doc(p("çç")))
test("deleteCharBefore",
     doc(p("😅😆<a>😇😈")), // Must delete astral plane characters as one unit
     doc(p("😅😇😈")))

test("deleteWordBefore",
     doc(p("foo bar <a>baz")),
     doc(p("foo baz")))
test("deleteWordBefore",
     doc(p("foo bar<a> baz")),
     doc(p("foo  baz")))
test("deleteWordBefore",
     doc(p("foo ...<a>baz")),
     doc(p("foo baz")))
test("deleteWordBefore",
     doc(p("<a>foo")),
     doc(p("foo")))
test("deleteWordBefore",
     doc(p("foo   <a>bar")),
     doc(p("foobar")))

test("joinForward",
     doc(p("foo<a>"), p("bar")),
     doc(p("foobar")))
test("joinForward",
     doc(p("foo<a>")),
     doc(p("foo")))
test("joinForward",
     doc(p("foo<a>"), hr, p("bar")),
     doc(p("foo"), p("bar")))
test("joinForward",
     doc(ul(li(p("a<a>")), li(p("b")))),
     doc(ul(li(p("a"), p("b")))))
test("joinForward",
     doc(ul(li(p("a<a>"), p("b")))),
     doc(ul(li(p("ab")))))
test("joinForward",
     doc(blockquote(p("foo<a>")), p("bar")),
     doc(blockquote(p("foo<a>"), p("bar"))))
test("joinForward",
     doc(blockquote(p("hi<a>")), blockquote(p("there"))),
     doc(blockquote(p("hi"), p("there"))))
test("joinForward",
     doc(p("foo<a>"), blockquote(p("bar"))),
     doc(p("foo"), p("bar")))
test("joinForward",
     doc(ul(li(p("hi<a>"))), ul(li(p("there")))),
     doc(ul(li(p("hi")), li(p("there")))))
test("joinForward",
     doc(ul(li(p("there<a>")))),
     doc(ul(li(p("there")))))
test("joinForward",
     doc(blockquote(p("there<a>")), hr),
     doc(blockquote(p("there"))))

test("deleteCharAfter",
     doc(p("b<a>ar")),
     doc(p("br")))
test("deleteCharAfter",
     doc(p("f<a>ç̀o")), // The c has two combining characters, which must be deleted along with it
     doc(p("fo")))
test("deleteCharAfter",
     doc(p("ç<a>çç")), // The combining characters in nearby characters must be left alone
     doc(p("çç")))
test("deleteCharAfter",
     doc(p("😅😆<a>😇😈")), // Must delete astral plane characters as one unit
     doc(p("😅😆😈")))

test("deleteWordAfter",
     doc(p("foo<a> bar baz")),
     doc(p("foo baz")))
test("deleteWordAfter",
     doc(p("foo <a>bar baz")),
     doc(p("foo  baz")))
test("deleteWordAfter",
     doc(p("foo<a>... baz")),
     doc(p("foo baz")))
test("deleteWordAfter",
     doc(p("foo<a>")),
     doc(p("foo")))
test("deleteWordAfter",
     doc(p("fo<a>o")),
     doc(p("fo")))
test("deleteWordAfter",
     doc(p("foo<a>   bar")),
     doc(p("foobar")))

test("joinUp",
     doc(blockquote(p("foo")), blockquote(p("<a>bar"))),
     doc(blockquote(p("foo"), p("<a>bar"))))
test("joinUp",
     doc(blockquote(p("<a>foo")), blockquote(p("bar"))),
     doc(blockquote(p("foo")), blockquote(p("bar"))))
test("joinUp",
     doc(ul(li(p("foo"))), ul(li(p("<a>bar")))),
     doc(ul(li(p("foo")), li(p("bar")))))
test("joinUp",
     doc(ul(li(p("foo")), li(p("<a>bar")))),
     doc(ul(li(p("foo"), p("bar")))))
test("joinUp",
     doc(ul(li(p("foo")), li("<a>", p("bar")))),
     doc(ul(li(p("foo")), li(p("bar")))))
test("joinUp",
     doc(ul(li(p("foo")), "<a>", li(p("bar")))),
     doc(ul(li(p("foo"), p("bar")))))

test("joinDown",
     doc(blockquote(p("foo<a>")), blockquote(p("bar"))),
     doc(blockquote(p("foo"), p("<a>bar"))))
test("joinDown",
     doc(blockquote(p("foo")), blockquote(p("<a>bar"))),
     doc(blockquote(p("foo")), blockquote(p("bar"))))
test("joinDown",
     doc(ul(li(p("foo<a>"))), ul(li(p("bar")))),
     doc(ul(li(p("foo")), li(p("bar")))))
test("joinDown",
     doc(ul(li(p("<a>foo")), li(p("bar")))),
     doc(ul(li(p("foo"), p("bar")))))
test("joinDown",
     doc(ul(li("<a>", p("foo")), li(p("bar")))),
     doc(ul(li(p("foo")), li(p("bar")))))
test("joinDown",
     doc(ul("<a>", li(p("foo")), li(p("bar")))),
     doc(ul(li(p("foo"), p("bar")))))

test("lift",
     doc(blockquote(p("<a>foo"))),
     doc(p("foo")))
test("lift",
     doc(blockquote(p("foo"), p("<a>bar"), p("baz"))),
     doc(blockquote(p("foo")), p("bar"), blockquote(p("baz"))))
test("lift",
     doc(ul(li(p("<a>foo")))),
     doc(p("foo")))
test("lift",
     doc(p("<a>foo")),
     doc(p("foo")))
test("lift",
     doc(blockquote(ul(li(p("foo<a>"))))),
     doc(blockquote(p("foo<a>"))))
test("lift",
     doc(blockquote("<a>", ul(li(p("foo"))))),
     doc(ul(li(p("foo")))))
test("lift",
     doc(ul(li(p("one"), ul(li(p("<a>sub1")), li(p("sub2")))), li(p("two")))),
     doc(ul(li(p("one"), p("<a>sub1"), ul(li(p("sub2")))), li(p("two")))))

test("schema:bullet_list:wrap",
     doc(p("<a>foo")),
     doc(ul(li(p("foo")))))
test("schema:bullet_list:wrap",
     doc(blockquote(p("<a>foo"))),
     doc(blockquote(ul(li(p("foo"))))))
test("schema:bullet_list:wrap",
     doc(p("foo"), p("ba<a>r"), p("ba<b>z")),
     doc(p("foo"), ul(li(p("bar")), li(p("baz"))))) 
test("schema:bullet_list:wrap",
     doc(ul(li(p("<a>foo")))),
     doc(ul(li(p("foo")))))
test("schema:bullet_list:wrap",
     doc(ol(li(p("<a>foo")))),
     doc(ol(li(p("foo")))))
test("schema:bullet_list:wrap",
     doc(ul(li(p("foo"), p("<a>bar")))),
     doc(ul(li(p("foo"), ul(li(p("bar")))))))
test("schema:bullet_list:wrap",
     doc(ul(li(p("foo")), li(p("<a>bar")), li(p("baz")))),
     doc(ul(li(p("foo"), ul(li(p("bar")))), li(p("baz")))))

test("schema:ordered_list:wrap",
     doc(p("<a>foo")),
     doc(ol(li(p("foo")))))
test("schema:ordered_list:wrap",
     doc(blockquote(p("<a>foo"))),
     doc(blockquote(ol(li(p("foo"))))))
test("schema:ordered_list:wrap",
     doc(p("foo"), p("ba<a>r"), p("ba<b>z")),
     doc(p("foo"), ol(li(p("bar")), li(p("baz")))))
test("schema:blockquote:wrap",
     doc(p("fo<a>o")),
     doc(blockquote(p("foo"))))
test("schema:blockquote:wrap",
     doc(p("fo<a>o"), p("bar"), p("ba<b>z"), p("quux")),
     doc(blockquote(p("foo"), p("bar"), p("baz")), p("quux")))
test("schema:blockquote:wrap",
     doc(blockquote(p("fo<a>o"))),
     doc(blockquote(blockquote(p("foo")))))
test("schema:blockquote:wrap",
     doc("<a>", ul(li(p("foo")))),
     doc(blockquote(ul(li(p("foo"))))))

test("splitBlock",
     doc(p("foo<a>")),
     doc(p("foo"), p()))
test("splitBlock",
     doc(p("foo<a>bar")),
     doc(p("foo"), p("bar")))
test("splitBlock",
     doc(h1("foo<a>")),
     doc(h1("foo"), p()))
test("splitBlock",
     doc(h1("foo<a>bar")),
     doc(h1("foo"), h1("bar")))
test("splitBlock",
     doc(p("fo<a>ob<b>ar")),
     doc(p("fo"), p("ar")))
test("splitBlock",
     doc(ol(li(p("a")), "<a>", li(p("b")), li(p("c")))),
     doc(ol(li(p("a"))), ol(li(p("b")), li(p("c")))))
test("splitBlock",
     doc(ol("<a>", li(p("a")), li(p("b")), li(p("c")))),
     doc(ol(li(p("a")), li(p("b")), li(p("c")))))

test("schema:list_item:split",
     doc(p("foo<a>bar")),
     doc(p("foobar")))
test("schema:list_item:split",
     doc("<a>", p("foobar")),
     doc(p("foobar")))
test("schema:list_item:split",
     doc(ul(li(p("foo<a>bar")))),
     doc(ul(li(p("foo")), li(p("bar")))))
test("schema:list_item:split",
     doc(ul(li(p("foo<a>ba<b>r")))),
     doc(ul(li(p("foo")), li(p("r")))))

test("newlineInCode",
     doc(pre("foo<a>bar")),
     doc(pre("foo\nbar")))

test("liftEmptyBlock",
     doc(blockquote(p("foo"), p("<a>"), p("bar"))),
     doc(blockquote(p("foo")), blockquote(p(), p("bar"))))
test("liftEmptyBlock",
     doc(blockquote(p("foo"), p("<a>"))),
     doc(blockquote(p("foo")), p()))
test("liftEmptyBlock",
     doc(blockquote(p("foo")), blockquote(p("<a>"))),
     doc(blockquote(p("foo")), p("<a>")))
test("liftEmptyBlock",
     doc(ul(li(p("hi")), li(p("<a>")))),
     doc(ul(li(p("hi"))), p()))

test("createParagraphNear",
     doc("<a>", hr),
     doc(p(), hr))
test("createParagraphNear",
     doc(p(), "<a>", hr),
     doc(p(), hr, p()))

test("schema:heading:make1",
     doc(p("fo<a>o")),
     doc(h1("foo")))
test("schema:heading:make2",
     doc(pre("fo<a>o")),
     doc(h2("foo")))

test("schema:paragraph:make",
     doc(h1("fo<a>o")),
     doc(p("foo")))
test("schema:paragraph:make",
     doc(h1("fo<a>o", em("bar"))),
     doc(p("foo", em("bar"))))
test("schema:paragraph:make",
     doc("<a>", h1("foo")),
     doc(p("foo")))

test("schema:code_block:make",
     doc(h1("fo<a>o")),
     doc(pre("foo")))
test("schema:code_block:make",
     doc(p("fo<a>o", em("bar"))),
     doc(pre("foobar")))

test("schema:horizontal_rule:insert",
     doc(p("<a>foo")),
     doc(hr, p("foo")))
test("schema:horizontal_rule:insert",
     doc(p("foo"), p("<a>bar")),
     doc(p("foo"), hr, p("bar")))
test("schema:horizontal_rule:insert",
     doc(p("foo"), p("b<a>ar")),
     doc(p("foo"), p("b"), hr, p("ar")))
test("schema:horizontal_rule:insert",
     doc(p("fo<a>o"), p("b<b>ar")),
     doc(p("fo"), hr, p("ar")))
test("schema:horizontal_rule:insert",
     doc("<a>", p("foo"), p("bar")),
     doc(hr, p("bar")))
test("schema:horizontal_rule:insert",
     doc("<a>", p("bar")),
     doc(hr))

const test_ = namespace("command")

defineCommand({
  name: "foo:doIt",
  label: "DO IT",
  run(pm) { pm.setContent("hi", "text") }
})

test_("exclude_namespaced", pm => {
  is(!pm.commands["foo:doIt"], "command not present")
})

test_("include_namespaced", pm => {
  is(pm.commands["foo:doIt"], "command present")
}, {include: ["default", "schema", "foo"]})

test_("delete_specific", pm => {
  is(!pm.commands["lift"], "command disabled")
  is(!pm.input.baseKeymap.bindings["Alt-Left"], "no key bound")
}, {commands: {lift: null}})

test_("override_specific", pm => {
  pm.execCommand("lift")
  cmpNode(pm.doc, doc(p("Lift?")))
  is(!pm.commands.lift.spec.label, "completely replaced")
}, {commands: {lift: {run: pm => pm.setContent("Lift?", "text")}}})

test_("extend_specific", pm => {
  pm.execCommand("lift")
  cmpNode(pm.doc, doc(p("hi")))
  is(!pm.input.baseKeymap.bindings["Alt-Left"], "disabled old key")
  is(pm.input.baseKeymap.bindings["Alt-L"], "enabled new key")
}, {commands: {lift: {keys: ["Alt-L"]}},
    doc: doc(blockquote(p("hi")))})
