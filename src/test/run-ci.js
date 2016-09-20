let webdriver = require("selenium-webdriver")

function testBrowser(caps) {
	return new Promise((resolve, reject) => {
    let browser = new webdriver.Builder()
		.usingServer('http://'+ process.env.SAUCE_USERNAME+':'+process.env.SAUCE_ACCESS_KEY+'@ondemand.saucelabs.com:80/wd/hub')
		.withCapabilities(Object.assign({}, caps, {
			'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
			build: process.env.TRAVIS_BUILD_NUMBER,
			username: process.env.SAUCE_USERNAME,
			accessKey: process.env.SAUCE_ACCESS_KEY
		})).build()
		browser.get("http://localhost:8080/test")
		function checkIsDone() {
			browser.executeScript('return JSON.stringify(window.done)')
			.then((res) => {
				res = JSON.parse(res)
				if (res === true) {
					browser.executeScript('return JSON.stringify(window.results)')
					.then((results) => {
						results = JSON.parse(results)
						browser.quit()
						if (results.failed < 1) {
							resolve("Ran " + results.passed + " tests on (" + caps.browserName + ', ' + caps.platform + ') all passed')
						} else {
							reject("Ran " + (results.passed + results.failed) + " tests on (" + caps.browserName + ', ' + caps.platform + '), ' + results.failed + ' failed.\n' + results.errors.join('\n'))
						}
					})
				} else {
					setTimeout(function() {
						checkIsDone()
					}, 1000)
				}
			})
		}
		checkIsDone()
	})
}
Promise.all([
testBrowser({
	browserName: 'chrome',
	platform: 'OS X 10.11',
	version: 'beta'
}),
testBrowser({
	browserName: 'chrome',
	platform: 'Windows 10',
	version: 'beta'
}),
testBrowser({
	browserName: 'chrome',
	platform: 'Linux',
	version: '48.0'
}),
testBrowser({
	browserName: 'safari',
	platform: 'OS X 10.11',
	version: '9.0'
}),
testBrowser({
	browserName: 'firefox',
	platform: 'OS X 10.11',
	version: 'beta'
}),
testBrowser({
	browserName: 'MicrosoftEdge',
	platform: 'Windows 10',
	version: '13.10586'
})])
.then(() => process.exit(0), () => process.exit(1));

