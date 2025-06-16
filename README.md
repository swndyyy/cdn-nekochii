## ULZNEKO UPLOADER

*💻 Implementasi Request Ke Backend*
```Javascript
const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const FileType = require('file-type')

/**
 * Upload file ke https://ulzneko-ups.hf.space/upload
 * @param {Buffer|string} input - Buffer atau path file
 * @returns {Promise<Object>}
 */
async function uploadNeko(buffer) {
  try {
    let fileBuffer
    if (Buffer.isBuffer(buffer)) {
      fileBuffer = buffer
    } else if (typeof buffer === 'string' && fs.existsSync(buffer)) {
      fileBuffer = fs.readFileSync(buffer)
    } else {
      throw new Error('buffer nyo ora ada ajg.')
    }

    const type = await FileType.fromBuffer(fileBuffer)
    const form = new FormData()
    form.append('file', fileBuffer, {
      filename: 'upload.' + (type?.ext || 'bin'),
      contentType: type?.mime || 'application/octet-stream'
    })

    const { data } = await axios.post('https://ulzneko-ups.hf.space/upload', form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity
    })

    if (!data?.success) throw new Error(data.message || 'Upload gagal.')

    return data
  } catch (err) {
    throw new Error('Gagal upload: ' + err.message)
  }
}
