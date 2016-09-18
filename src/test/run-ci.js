let webdriver = require("selenium-webdriver")

function testBrowser(browserName) {
	let browser = new webdriver.Builder()
	.usingServer('http://'+ process.env.SAUCE_USERNAME+':'+process.env.SAUCE_ACCESS_KEY+'@ondemand.saucelabs.com:80/wd/hub')
      .withCapabilities({
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
        build: process.env.TRAVIS_BUILD_NUMBER,
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY,
        browserName: browserName
      }).build();
	console.log('built browser, getting page')
	browser.get("http://localhost:8080/test")
	console.log('got page')
	function checkIsDone() {
		console.log('checking');
		try {
			var res = browser.executeScript('return JSON.stringify(window.done)')
			console.log('res', res)
			res = JSON.parse(res)
			if (res === true) {
				var results = browser.executeScript('return JSON.stringify(window.results)')
				console.log('results', results)
				results = JSON.parse(results)
				browser.quit()
				if (results.failed < 1) {
					console.log("Ran " + results.passed + " tests on " + browserName + ' all passed');
					process.exit(0)
				} else {
					console.log("Ran " + (results.passed + results.failed) + " tests on " + browserName + ', ' + results.failed + ' failed.\n');
					console.log(results.errors.join('\n'))
					process.exit(1);
				}
			} else {
				setTimeout(function() {
					checkIsDone();
				}, 1000);
			}
		} catch(e) {
			console.log('Error: ' + e);
			process.exit(1);
		}
	}
	checkIsDone()
}

testBrowser('chrome');
