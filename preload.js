// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const zerorpc = require('zerorpc')

console.log('Initializing Zerorpc');

function init() {
  // add global variables to your web page
  // window.isElectron = true
  window.zerorpcClient = new zerorpc.Client()
  window.zerorpcClient.connect("tcp://127.0.0.1:4242")
}

init();
