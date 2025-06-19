# 📁 NEKOCHII UPLOADER

## Deskripsi

This uploader allows you to upload files to **NEKOCHII** by requesting the backend. Built using `axios`, `form-data`, and several related modules, the upload process

**SDK**: Docker 
**Pinned**: No 
**Theme Color**: Blue to Yellow

Check out the configuration reference at [Hugging Face Docs](https://huggingface.co/docs/hub/spaces-config-reference).

---

## How to use

To upload files using **NEKOCHII UPLOADER**, you can use the `uploadNeko` function. Here is an example of its implementation:

### 💻 **Implementation of Request to Backend**

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const FileType = require('file-type');

/**
 * Upload files to https://nekochii-up.hf.space/upload
 * @param {Buffer|string} input - Buffer or file path
 * @returns {Promise<Object>} - The result of the response from the server
 */
async function uploadNeko(buffer) {
  try {
    let fileBuffer;

    // Check whether the input is a Buffer or a file path
    if (Buffer.isBuffer(buffer)) {
      fileBuffer = buffer;
    } else if (typeof buffer === 'string' && fs.existsSync(buffer)) {
      fileBuffer = fs.readFileSync(buffer);
    } else {
      throw new Error('File not found or buffer invalid.');
    }

    // Determine the file type
    const type = await FileType.fromBuffer(fileBuffer);
    const form = new FormData();

    // Add file to form
    form.append('file', fileBuffer, {
      filename: 'upload.' + (type?.ext || 'bin'),
      contentType: type?.mime || 'application/octet-stream'
    });

    // Send POST request to upload file
    const { data } = await axios.post('https://nekochii-up.hf.space/upload', form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
    });

    // Check if upload was successful
    if (!data?.success) throw new Error(data.message || 'Upload fail.');

    return data;
  } catch (err) {
    throw new Error('Gagal upload: ' + err.message);
  }
}