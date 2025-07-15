const fs = require('fs');
const path = require('path');
const os = require('os');
const FormData = require('form-data');
const fetch = require('node-fetch');
const QRCode = require('qrcode');

module.exports = {
  async uploadQRToStrapi(cognitoId) {
    try {
      const svgString = await QRCode.toString(cognitoId, { type: 'svg' });
      
      const tempDir = os.tmpdir(); // ✅ cross-platform temp directory
      const tempPath = path.join(tempDir, `${cognitoId}.svg`);
      fs.writeFileSync(tempPath, svgString);

      const form = new FormData();
      form.append('files', fs.createReadStream(tempPath), {
        filename: `${cognitoId}.svg`,
        contentType: 'image/svg',
      });

      const strapi_url = process.env.STRAPI_URL;
      const res = await fetch(`${strapi_url}/upload`, {
        method: 'POST',
        headers: {
          ...form.getHeaders(),
        },
        body: form,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Upload failed: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      console.log('✅ Upload successful:', data);
      fs.unlinkSync(tempPath);
      return data[0];

    } catch (err) {
      console.error('🧨 Upload via fetch failed:', err);
      throw err;
    }
  }
};
