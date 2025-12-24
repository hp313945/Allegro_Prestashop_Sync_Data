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
    // Get IP addresses from environment variables or use defaults
    const publicIP = process.env.PUBLIC_IP || '190.131.70.9';
    const localIP = process.env.LOCAL_IP || '192.168.200.234';
    
    // Certificate attributes
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    
    // Generate certificate with IP addresses included
    // This allows the certificate to work with localhost, local IP, and public IP
    const pems = await selfsigned.generate(attrs, {
      keySize: 4096,
      days: 365,
      algorithm: 'sha256',
      ip: ['127.0.0.1', 'localhost', localIP, publicIP] // Include all IPs
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
    console.log('Certificate includes the following IPs:');
    console.log('  - 127.0.0.1 (localhost)');
    console.log('  - localhost');
    console.log(`  - ${localIP} (local IP)`);
    console.log(`  - ${publicIP} (public IP)`);
    console.log('');
    console.log('You can customize IPs by setting environment variables:');
    console.log('  PUBLIC_IP=your.public.ip LOCAL_IP=your.local.ip npm run generate-cert');
    console.log('');
    console.log('You can now start the server with: npm start');
  } catch (error) {
    console.error('Error generating certificates:', error.message);
    process.exit(1);
  }
}

generateCertificates();

