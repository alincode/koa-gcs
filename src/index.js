const { Storage } = require('@google-cloud/storage')
const path = require('path')
const stream = require('stream')
const Multer = require('koa-multer')
const im = require('imagemagick-stream')
const _ = require('lodash')

const defaultConfig = {
  gcs: {
    bucket: 'your-bucket-name',
  },
  maxFileSizeLimit: 5 * 1024 * 1024, // 5mb
  storageOption: {
    keyFilename: path.join(__dirname, '../firebase-serviceAccountKey.json'),
    projectId: 'your-gcp-project-id',
  },
  image: {
    resize: '800x',
    quality: 90,
    thumbnail: false,
  },
}

class KoaGCS {
  constructor(config) {
    this.config = _.merge(defaultConfig, config)
    const storage = new Storage(this.config.storageOption)
    this._bucket = storage.bucket(this.config.gcs.bucket)
    const multerOptions = this._getMulterOptions()
    this.multer = Multer(multerOptions)
  }

  _getMulterOptions() {
    return {
      storage: Multer.memoryStorage(),
      limits: {
        fileSize: this.config.maxFileSizeLimit,
      },
    }
  }

  _getPublicUrl(filename) {
    return `https://storage.googleapis.com/${
      this.config.gcs.bucket
    }/${filename}`
  }

  _getGcsFileName(isThumbnail, fileName, prefixName) {
    const subPath = isThumbnail ? this.config.image.resize : 'origin'
    return `${prefixName}/${subPath}/${fileName}`
  }

  _uploadThumbnail(readstream, file, gcsFileName) {
    const resize = im()
      .resize(this.config.image.resize)
      .quality(this.config.image.quality)
    const gcsfile = this._bucket.file(gcsFileName)
    const option = this._getWriteStreamOptions(file)
    const writeStream = gcsfile.createWriteStream(option)
    readstream.pipe(resize).pipe(writeStream)
    return new Promise((resolve, reject) => {
      writeStream.on('error', async err => {
        console.error(err)
        reject(err)
      })

      writeStream.on('finish', async () => {
        file.cloudStorageObject = gcsFileName
        await gcsfile.makePublic()
        file.thumbnailUrl = this._getPublicUrl(gcsFileName)
        console.log(`[file completed] ${file.thumbnailUrl}`)
        resolve(file)
      })
    })
  }

  _uploadOriginFile(readstream, file, gcsFileName) {
    const gcsfile = this._bucket.file(gcsFileName)
    const option = this._getWriteStreamOptions(file)
    const writeStream = gcsfile.createWriteStream(option)
    readstream.pipe(writeStream)

    return new Promise((resolve, reject) => {
      writeStream.on('error', async err => {
        console.error(err)
        reject(err)
      })

      writeStream.on('finish', async () => {
        file.cloudStorageObject = gcsFileName
        await gcsfile.makePublic()
        file.cloudStoragePublicUrl = this._getPublicUrl(gcsFileName)
        console.log(`[file completed] ${file.cloudStoragePublicUrl}`)
        resolve(file)
      })
    })
  }

  _getWriteStreamOptions(file) {
    return {
      metadata: {
        contentType: file.mimetype,
      },
      resumable: false,
    }
  }

  async sendUploadToGCS(file, prefixName = '') {
    console.log(`[uploading] ${file.originalname} file`)
    let info
    const fileName = Date.now() + path.extname(file.originalname)

    if (this.config.image.thumbnail) {
      const readstream = new stream.PassThrough().end(file.buffer)
      const gcsFileName = this._getGcsFileName(true, fileName, prefixName)
      info = await this._uploadThumbnail(readstream, file, gcsFileName)
    }
    const readstream2 = new stream.PassThrough().end(file.buffer)
    const gcsFileName = this._getGcsFileName(false, fileName, prefixName)
    info = await this._uploadOriginFile(readstream2, file, gcsFileName)
    return info
  }
}

module.exports = KoaGCS
