let MochaSauce = require("mocha-sauce")

const browsers = [
  {
    browserName: 'chrome',
    platform: 'OS X 10.11',
    version: 'beta'
  },
  {
    browserName: 'chrome',
    platform: 'Windows 10',
    version: 'beta'
  },
  {
    browserName: 'chrome',
    platform: 'Linux',
    version: '48.0'
  },
  {
    browserName: 'safari',
    platform: 'OS X 10.11',
    version: '9.0'
  },
  {
    browserName: 'firefox',
    platform: 'OS X 10.11',
    version: 'beta'
  },
  {
    browserName: 'internet explorer',
    platform: 'Windows 10',
    version: '11.103'
  }
]

let sauce = new MochaSauce({
	build: process.env.TRAVIS_BUILD_NUMBER,
	name: 'ProseMirror',
	url: "http://localhost:8080"
})

browsers.map(browser => sauce.browser(browser))

sauce.on('start', function(browser) {
  console.log('\tstart\t: %s %s', browser.browserName, browser.platform);
});

sauce.on('end', function(browser, res) {
  console.log('\tend\t: %s %s: %d failures', browser.browserName, browser.platform, res.failures);
});

module.exports = function(cb) {
	sauce.start(function(err, results) {
		if(err) {
			console.log(err);
			cb(1);
		}
		let pass = true;
		results.forEach((result) => {
			if (pass && result.failed.length > 0) {
				pass = false;
			}
			console.log(result.xUnitReport);
		})
		cb(pass ? 0 : 1);
	});
};
