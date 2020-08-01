function getApp(customOptions = {}) {
  const Koa = require('koa')
  const app = new Koa()
  return app
}

function startServer(app, serverName, port) {
  return app.listen(port, async () => {
    console.log(`${serverName} Server listening on port ${port}`)
  })
}

module.exports = {
  getApp,
  startServer,
}
