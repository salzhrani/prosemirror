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
	browser.get("http://localhost:8080/test")
	function checkIsDone() {
		browser.eval('JSON.stringify(window.done)', (err, res) => {
			if (err) {
				throw err
			}
			res = JSON.parse(res);
			if (res === true) {
				browser.eval('JSON.stringify(window.results)', (err, results) => {
					results = JSON.parse(results);
					if (results.failed < 1) {
						console.log("Ran " + results.passed + " tests on " + browserName + ' all passed');
						process.exit(0);
					} else {
						console.log("Ran " + (results.passed + results.failed) + " tests on " + browserName + ', ' + results.failed + ' failed.\n');
						console.log(results.errors.join('\n'))
						process.exit(1);
					}
				})
			} else {
				setTimeout(function() {
					checkIsDone();
				}, 1000);
			}
		})
	}
}

testBrowser('chrome');
