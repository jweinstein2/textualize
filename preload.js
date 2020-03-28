// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const zerorpc = require('zerorpc')

function init() {
  // add global variables to your web page
  // window.isElectron = true
  window.zerorpcClient = new zerorpc.Client()
}

init();

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  } 
  
  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }

})
