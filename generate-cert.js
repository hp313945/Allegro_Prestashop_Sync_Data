// Node.js script to generate self-signed SSL certificates without OpenSSL
// Uses the 'selfsigned' npm package (lightweight alternative)

const fs = require('fs');
const path = require('path');

// Check if selfsigned package is available
let selfsigned;
try {
  selfsigned = require('selfsigned');
} catch (e) {
  console.error('Error: selfsigned package not found.');
  console.log('Installing selfsigned package...');
  console.log('Please run: npm install selfsigned --save-dev');
  process.exit(1);
}

// Create ssl directory if it doesn't exist
const sslDir = path.join(__dirname, 'ssl');
if (!fs.existsSync(sslDir)) {
  fs.mkdirSync(sslDir, { recursive: true });
  console.log('Created ssl directory');
}

// Generate certificate (async)
async function generateCertificates() {
  try {
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    const pems = await selfsigned.generate(attrs, {
      keySize: 4096,
      days: 365,
      algorithm: 'sha256'
    });

    // Write certificate and key files
    // The selfsigned package returns: { cert, private, public }
    const certContent = pems.cert;
    const keyContent = pems.private;

    if (!certContent || !keyContent) {
      console.error('Error: Certificate generation failed. Got:', pems);
      process.exit(1);
    }

    fs.writeFileSync(path.join(sslDir, 'server.crt'), certContent);
    fs.writeFileSync(path.join(sslDir, 'server.key'), keyContent);

    console.log('✓ SSL certificates generated successfully!');
    console.log('  - ssl/server.key');
    console.log('  - ssl/server.crt');
    console.log('');
    console.log('You can now start the server with: npm start');
  } catch (error) {
    console.error('Error generating certificates:', error.message);
    process.exit(1);
  }
}

generateCertificates();

