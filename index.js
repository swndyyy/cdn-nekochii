import express from 'express'
import fs from 'fs'
import path from 'path'
import os from 'os'
import morgan from 'morgan'
import multer from 'multer'
import favicon from 'serve-favicon'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
const tmpDir = os.tmpdir()
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 hari
const FILE_LIMIT = 1024 * 1024 * 1024 // 200 MB

// Setup multer storage
const storage = multer.diskStorage({
  destination: tmpDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = Math.random().toString(36).substring(2, 10) + ext
    cb(null, name)
  }
})

const upload = multer({ 
  storage
})

app.set('json spaces', 2)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(favicon(path.join(__dirname, 'favicon.ico')))
app.use(morgan('dev'))
app.use('/file', express.static(tmpDir))

// Middleware: Delete files older than 30 days
app.use((req, res, next) => {
  fs.readdir(tmpDir, (err, files) => {
    if (err) return next()
    files.forEach(file => {
      const filePath = path.join(tmpDir, file)
      fs.stat(filePath, (err, stats) => {
        if (!err && stats.isFile()) {
          const age = Date.now() - stats.mtimeMs
          if (age > MAX_AGE_MS) {
            fs.unlink(filePath, () => {
              console.log(`[CLEAN] Deleted expired file: ${file}`)
            })
          }
        }
      })
    })
  })
  next()
})

// POST /upload
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      success: false, 
      message: 'No file uploaded. Please use form-data with field "file".' 
    })
  }

  const fileUrl = `https://${req.hostname}/file/${req.file.filename}`
  res.json({
    success: true,
    message: 'File uploaded successfully.',
    filename: req.file.filename,
    originalname: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
    url: fileUrl,
    expires: 'File will expire in 30 days (auto-deleted).'
  })
})

// GET /
app.get('/', (req, res) => {
  res.json({
    message: 'Nekosekai Uploader API',
    usage: {
      endpoint: '/upload',
      method: 'POST',
      type: 'multipart/form-data',
      field: 'file',
      note: 'File max size: 200MB, auto-deletes after 30 days'
    }
  })
})

const PORT = process.env.PORT || 7860
app.listen(PORT, () => console.log(`🚀 File uploader running at port ${PORT}`))