let webdriver = require("selenium-webdriver")

function testBrowser(caps) {
  return new webdriver.Builder()
  .usingServer('http://'+ process.env.SAUCE_USERNAME+':'+process.env.SAUCE_ACCESS_KEY+'@ondemand.saucelabs.com:80/wd/hub')
  .withCapabilities(Object.assign({}, caps, {
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    build: process.env.TRAVIS_BUILD_NUMBER,
    username: process.env.SAUCE_USERNAME,
    accessKey: process.env.SAUCE_ACCESS_KEY
  })).buildAsync()
  .then(browser => {
    console.log('getting');
    return browser.get("http://localhost:8080/test")
    .then(() => browser)
  })
  .then((browser) => {
    console.log('got browser', !!browser);
    return new Promise((resolve, reject) => {
      function checkIsDone() {
        console.log('executeScript');
        browser.executeScript('return JSON.stringify(window.done)')
        .then((res) => {
          console.log('res', res);
          res = JSON.parse(res)
          if (res === true) {
            browser.executeScript('return JSON.stringify(window.results)')
            .then((results) => {
              console.log('results', results);
              results = JSON.parse(results)
              browser.quit()
              if (results.failed < 1) {
                resolve({error: false, message: "Ran " + results.passed + " tests on (" + caps.browserName + ', ' + caps.platform + ') all passed'})
              } else {
                resolve({error: true, message: "Ran " + (results.passed + results.failed) + " tests on (" + caps.browserName + ', ' + caps.platform + '), ' + results.failed + ' failed.\n' + results.errors.join('\n')})
              }
            }, reject)
          } else {
            setTimeout(function() {
              checkIsDone()
            }, 1000)
          }
        })
      }
      checkIsDone()
    })
  })
}
Promise.all([
  testBrowser({
    browserName: 'chrome',
    platform: 'OS X 10.11',
    version: 'beta'
  }),
  // testBrowser({
  //   browserName: 'chrome',
  //   platform: 'Windows 10',
  //   version: 'beta'
  // }),
  // testBrowser({
  //   browserName: 'chrome',
  //   platform: 'Linux',
  //   version: '48.0'
  // }),
  // testBrowser({
  //   browserName: 'safari',
  //   platform: 'OS X 10.11',
  //   version: '9.0'
  // }),
  // testBrowser({
  //   browserName: 'firefox',
  //   platform: 'OS X 10.11',
  //   version: 'beta'
  // }),
  // testBrowser({
  //   browserName: 'MicrosoftEdge',
  //   platform: 'Windows 10',
  //   version: '13.10586'
  // })
])
.then((results) => {
  console.log('Results:\n');
  if (results.filter(result => !result.error).length) {
    process.exit(1)
  } else {
    process.exit(0)
  }
})
.catch((e) => {
  console.log('Error:\n', e)
  process.exit(1)
})
