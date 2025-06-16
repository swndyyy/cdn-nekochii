import express from 'express'
import fs from 'fs'
import path from 'path'
import os from 'os'
import morgan from 'morgan'
import multer from 'multer'
import favicon from 'serve-favicon'

const app = express()
const tmpDir = os.tmpdir()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: tmpDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const randomName = Math.random().toString(36).substring(2, 10) + ext
    cb(null, randomName)
  }
})

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 200 * 1024 * 1024 }
})

app.set('json spaces', 4)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(favicon(path.join(import.meta.dirname, 'favicon.ico')))
app.use(morgan('combined'))

app.use('/file', express.static(tmpDir))

app.use((req, res, next) => {
  const threeDays = 3 * 24 * 60 * 60 * 1000
  fs.readdirSync(tmpDir).forEach(file => {
    const filePath = path.join(tmpDir, file)
    const stat = fs.statSync(filePath)
    if (stat.isFile() && (Date.now() - stat.mtimeMs > threeDays)) {
      fs.unlinkSync(filePath)
      console.log(`Deleted old file: ${file}`)
    }
  })
  next()
})
 
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      success: false, 
      message: 'No file uploaded. Please use form-data with "file" field' 
    })
  }

  const fileUrl = `https://${req.hostname}/file/${req.file.filename}`
  
  res.json({
    success: true,
    message: 'File uploaded successfully',
    filename: req.file.filename,
    originalname: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
    url: fileUrl,
    expires: 'File will be automatically deleted after 3 days'
  })
})

app.get('/', (req, res) => {
  res.json({
    message: 'UlzNeko Uploader API',
    endpoint: {
      method: 'POST',
      path: '/upload',
      description: 'Upload any file using form-data with "file" field',
      note: 'Files are automatically deleted after 3 days'
    }
  })
})

const PORT = process.env.PORT || 7860
app.listen(PORT, () => console.log(`File uploader running on port ${PORT}`))