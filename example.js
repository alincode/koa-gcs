const Koa = require('koa')
const cors = require('@koa/cors')
const Router = require('@koa/router')
const KoaGCS = require('./src')

const app = new Koa()
const router = new Router()

const config = {
  gcs: {
    bucket: 'your-bucket-name',
  },
  maxFileSizeLimit: 5 * 1024 * 1024, // 5mb
  storageOption: {
    projectId: 'your-gcp-project-id',
  },
  image: {
    thumbnail: true,
  },
}
const koaGCS = new KoaGCS(config)

router.post('/v5/medias', koaGCS.multer.single('file'), async ctx => {
  const file = await koaGCS.sendUploadToGCS(ctx.req.file, 'users')
  const {
    cloudStoragePublicUrl,
    mimetype,
    fieldname,
    originalname,
    encoding,
    size,
    cloudStorageObject,
    thumbnailUrl,
  } = file
  const { width, height } = ctx.req.body

  ctx.body = {
    thumbnail: thumbnailUrl,
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
