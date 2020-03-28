window.zerorpcClient.connect("tcp://127.0.0.1:4242")

window.zerorpcClient.invoke("echo", "server ready", (error, res) => {
  if(error || res !== 'server ready') {
    console.error(error)
  } else {
    console.log("server is ready")
  }
})

let formula = document.querySelector('#formula')
let result = document.querySelector('#result')

formula.addEventListener('input', () => {
  window.zerorpcClient.invoke("calc", formula.value, (error, res) => {
    if(error) {
      console.error(error)
    } else {
      result.textContent = res
    }
  })
})

formula.dispatchEvent(new Event('input'))
