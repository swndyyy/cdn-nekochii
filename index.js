import express from 'express'
import fs from 'fs'
import path from 'path'
import os from 'os'
import morgan from 'morgan'
import multer from 'multer'
import favicon from 'serve-favicon'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const tmpDir = path.join(os.tmpdir(), 'uploads')

if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

const storage = multer.diskStorage({
  destination: tmpDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = Math.random().toString(36).substring(2, 10) + ext
    cb(null, name)
  }
})

const upload = multer({ 
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }
})

app.set('json spaces', 2)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.use(favicon(path.join(__dirname, 'favicon.ico')))
app.use('/file', express.static(tmpDir))


app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      success: false, 
      message: 'No file uploaded. Please use form-data with "file" field' 
    })
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/file/${req.file.filename}`

  res.json({
    success: true,
    message: 'File uploaded successfully',
    filename: req.file.filename,
    originalname: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
    url: fileUrl
  })
})

app.get('/', (req, res) => {
  res.json({
    message: 'Nekochii Uploader API',
    endpoint: {
      method: 'POST',
      path: '/upload',
      description: 'Upload any file using form-data with "file" field',
      maxUploadSize: '8MB',
      expiry: 'None (manual deletion only)'
    }
  })
})

const PORT = process.env.PORT || 7860
app.listen(PORT, () => {
  console.log(`Uploader running at http://localhost:${PORT}`)
})