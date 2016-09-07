const hasNavigator = typeof navigator !== 'undefined';
const ie_upto10 = hasNavigator && /MSIE \d/.test(navigator.userAgent)
const ie_11up = hasNavigator && /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent)
module.exports = {
  mac: hasNavigator && /Mac/.test(navigator.platform),
  ie: ie_upto10 || !!ie_11up,
  ie_version: ie_upto10 ? document.documentMode || 6 : ie_11up && +ie_11up[1],
  gecko: hasNavigator && /gecko\/\d/i.test(navigator.userAgent),
  ios: hasNavigator && /AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent)
}
