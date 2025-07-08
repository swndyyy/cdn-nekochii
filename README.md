# NEKOSEKAI UPLOADER

## Description

A file uploader utility for **NEKOSEKAI** that communicates with a backend service. Built using Express.js with support for file handling through `axios`, `form-data`, and related modules.

**SDK**: Docker  
**Pinned**: No  
**Theme Color**: Blue to Yellow  

Configuration reference available at [Hugging Face Docs](https://huggingface.co/docs/hub/spaces-config-reference).

---

## Usage

To upload files using **NEKOSEKAI UPLOADER**, call the `uploadNeko` function. Below is an implementation example:

### Backend Request Implementation

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const FileType = require('file-type');

/**
 * Uploads files to https://nekosekai-upx.hf.space/upload
 * @param {Buffer|string} input - Either a Buffer or file path
 * @returns {Promise<Object>} - Server response data
 */
async function uploadNeko(buffer) {
  try {
    let fileBuffer;

    // Validate input type (Buffer or file path)
    if (Buffer.isBuffer(buffer)) {
      fileBuffer = buffer;
    } else if (typeof buffer === 'string' && fs.existsSync(buffer)) {
      fileBuffer = fs.readFileSync(buffer);
    } else {
      throw new Error('Invalid input: File not found or buffer invalid.');
    }

    // Detect file type
    const type = await FileType.fromBuffer(fileBuffer);
    const form = new FormData();

    // Append file to form data
    form.append('file', fileBuffer, {
      filename: `upload.${type?.ext || 'bin'}`,
      contentType: type?.mime || 'application/octet-stream'
    });

    // Submit POST request
    const { data } = await axios.post('https://nekochii-up.hf.space/upload', form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
    });

    // Verify upload success
    if (!data?.success) throw new Error(data.message || 'Upload failed');

    return data;
  } catch (err) {
    throw new Error(`Upload error: ${err.message}`);
  }
}