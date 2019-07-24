const { Storage } = require('@google-cloud/storage')
const path = require('path')
const Multer = require('koa-multer')
const _ = require('lodash')

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

class KoaGCS {
  constructor(config) {
    this.config = _.merge(defaultConfig, config)
    const storage = new Storage(this.config.storageOption)
    this.bucket = storage.bucket(this.config.gcs.bucket)

    // ========= multer ========
    const multerOptions = {
      storage: Multer.memoryStorage(),
      limits: {
        fileSize: this.config.maxFileSizeLimit,
      },
    }
    this.multer = Multer(multerOptions)
  }

  getPublicUrl(filename) {
    return `https://storage.googleapis.com/${
      this.config.gcs.bucket
    }/${filename}`
  }

  sendUploadToGCS(file, filePath = '') {
    console.log(`[uploading] ${file.originalname} file`)
    const gcsFileName = filePath + Date.now() + path.extname(file.originalname)
    const gcsfile = this.bucket.file(gcsFileName)

    const createWriteStreamOptions = {
      metadata: {
        contentType: file.mimetype,
      },
      resumable: false,
    }
    const writeStream = gcsfile.createWriteStream(createWriteStreamOptions)

    return new Promise((resolve, reject) => {
      writeStream.on('error', async err => {
        file.cloudStorageError = err
        reject(err)
      })

      writeStream.on('finish', async () => {
        file.cloudStorageObject = gcsFileName
        await gcsfile.makePublic()
        file.cloudStoragePublicUrl = this.getPublicUrl(gcsFileName)
        console.log(`[completed] ${file.cloudStoragePublicUrl} file`)
        resolve(file)
      })

      writeStream.end(file.buffer)
    })
  }

  get amortization() {}
}

module.exports = KoaGCS
