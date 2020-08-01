const path = require('path')
const koaSwagger = require('koa2-swagger-ui')
const koaStatic = require('koa-static')
const { startServer, getApp } = require('./server')

const serverName = 'Doc'
const port = '3001'
let docPrefixPath = '/docs/'
let swaggerPrefixUrl = `http://localhost:${port}${docPrefixPath}`

const middlewares = [
  koaStatic(path.join(__dirname, './public/'), { defer: true }),
  koaSwagger({
    title: 'Node API',
    swaggerOptions: {
      url: `${swaggerPrefixUrl}node-swagger.json`,
      deepLinking: true,
    },
    routePrefix: `${docPrefixPath}node-docs`,
    hideTopbar: false,
  }),
]

let app = getApp()

for (const middleware of middlewares) {
  app.use(middleware)
}

startServer(app, serverName, port)
