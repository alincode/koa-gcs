# Koa GCS

Koa GCS middleware

![npm downloads](https://img.shields.io/npm/dt/koa-gcs.svg)
[![Dependency Status](https://img.shields.io/david/alincode/koa-gcs.svg?style=flat)](https://david-dm.org/alincode/koa-gcs)
[![NPM version][npm-image]][npm-url] 

## Installation and Usage

```
npm install koa-gcs --save
```

```js
const Koa = require('koa')
const cors = require('@koa/cors')
const Router = require('@koa/router')
const KoaGCS = require('koa-gcs')

const app = new Koa()
const router = new Router()

const config = {
  gcs: {
    bucket: 'your-backet-name',
  },
  maxFileSizeLimit: 5 * 1024 * 1024, // 5mb
  storageOption: {
    projectId: 'your-gcp-project-id',
  },
}
const koaGCS = new KoaGCS(config)

router.post('/upload', koaGCS.multer.single('file'), async ctx => {
  const file = await koaGCS.sendUploadToGCS(ctx.req.file)
  // const file = await koaGCS.sendUploadToGCS(ctx.req.file, 'users/')
  const { cloudStoragePublicUrl, mimetype } = file
  const { width, height } = ctx.req.body

  ctx.body = {
    url: cloudStoragePublicUrl,
    width,
    height,
    mimeType: mimetype,
  }
})
app.use(cors())
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(3000)
```

### example

```
npm run demo
```

### default config

```js
const defaultConfig = {
  gcs: {
    bucket: 'your-bucket-name',
  },
  maxFileSizeLimit: 10 * 1024 * 1024, // 10mb
  storageOption: {
    keyFilename: path.join(__dirname, './firebase-serviceAccountKey.json'),
    projectId: 'your-gcp-project-id',
  },
}
```

### Maintainers
- [alincode](https://github.com/alincode) - **AILIN LIOU** (author)

### License
MIT © [alincode](https://github.com/alincode)

[npm-url]: https://npmjs.org/package/koa-gcs
[npm-image]: http://img.shields.io/npm/v/koa-gcs.svg