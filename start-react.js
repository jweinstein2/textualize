const net = require('net')
const childProcess = require('child_process')

const port = process.env.PORT ? process.env.PORT - 100 : 3000

process.env.ELECTRON_START_URL = `http://localhost:${port}`

const client = new net.Socket()

let startedElectron = false
const tryConnection = () => {
  client.connect(
    { port },
    () => {
      client.end()
      if (!startedElectron) {
          console.log('Starting Electron');
          startedElectron = true;
          const { spawn } = require('child_process');
          const ls = spawn('npm run electron', [], { shell: true });
          ls.stdout.on('data', (data) => {
              console.log(`${data}`);
          });
          ls.stderr.on('data', (data) => {
              console.error(`err: ${data}`);
          });
          ls.on('close', (code) => {
              console.log(`child process exited with code ${code}`);
          });
      }
    }
  )
}

tryConnection()

client.on('error', () => {
  setTimeout(tryConnection, 1000)
})
