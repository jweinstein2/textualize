// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const zerorpc = require('zerorpc')

window.zerorpcClient = new zerorpc.Client({ timeout: 60, heartbeatInterval: 60000 })
window.zerorpcClient.connect("tcp://127.0.0.1:4242")
