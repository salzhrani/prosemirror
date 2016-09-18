var tests = require("../src/test/tests")
var Failure = require("../src/test/failure").Failure
require("../src/test/all")
require("../src/test/browser/all")

var gen = 0

window.done = false
window.results = {errors: [], passed: 0, failed:0}

function runTests() {
  window.done = false
  var filters = document.location.hash.slice(1).split(",")
  var myGen = ++gen
  var runnable = []
  for (var name in tests.tests) if (tests.filter(name, filters)) runnable.push(name)

  document.querySelector("#output").textContent = ""

  function run(i) {
    var t0 = Date.now()
    for (;; i++) {
      if (gen != myGen) return
      if (i == runnable.length) return finish()
      var name = runnable[i]
      document.querySelector("#info").textContent = (i + 1) + " of " + runnable.length + " tests"
      document.querySelector("#status").textContent = "Running " + name
      document.querySelector("#measure").style.width = (((i + 1) / runnable.length) * 100) + "%"

      try {
        tests.tests[name]()
        window.results.passed++
      } catch(e) {
        logFailure(name, e)
      }
      if (Date.now() > t0 + 200) {
        setTimeout(() => run(i + 1), 50)
        return
      }
    }
  }

  var failed = 0

  function finish() {
    document.querySelector("#info").textContent = "Ran " + runnable.length + " tests"
    var status = document.querySelector("#status")
    status.textContent = failed ? failed + " failed" : "All passed"
    status.className = failed ? "bad" : "good"
    window.done = true
  }

  function logFailure(name, err) {
    ++failed
    var elt = document.querySelector("#output").appendChild(document.createElement("pre"))
    var nm = elt.appendChild(document.createElement("a"))
    nm.className = "bad"
    nm.href= "#" + name
    nm.textContent = name
    elt.appendChild(document.createTextNode(": " + err))
    window.results.failed = failed
    window.results.errors.puhs(name + ": " + err)
    if (!(err instanceof Failure))
      setTimeout(function() { throw err }, 20)
  }

  setTimeout(() => run(0), 50)
}

runTests()

addEventListener("hashchange", runTests)
