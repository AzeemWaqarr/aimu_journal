const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
                process.env[key.trim()] = valueParts.join('=').trim();
            }
        }
    });
}

const PORT = process.env.PORT || 8080;
const BACKUP_FILE = path.join(__dirname, 'journal-backup.json');
const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY || '';
const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID || '';

// MIME types for serving static files
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API: Get config (serves environment variables to client)
    if (req.method === 'GET' && req.url === '/api/config') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            JSONBIN_API_KEY: JSONBIN_API_KEY,
            JSONBIN_BIN_ID: JSONBIN_BIN_ID
        }));
        return;
    }

    // API: Save backup
    if (req.method === 'POST' && req.url === '/api/backup') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2), 'utf8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Backup saved!' }));
                console.log('✅ Backup saved to journal-backup.json');
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: error.message }));
                console.error('❌ Backup save error:', error.message);
            }
        });
        return;
    }

    // API: Load backup
    if (req.method === 'GET' && req.url === '/api/backup') {
        try {
            if (fs.existsSync(BACKUP_FILE)) {
                const data = fs.readFileSync(BACKUP_FILE, 'utf8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
                console.log('✅ Backup loaded from journal-backup.json');
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'No backup found' }));
            }
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: error.message }));
            console.error('❌ Backup load error:', error.message);
        }
        return;
    }

    // Serve static files
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, filePath);

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log('');
    console.log('📖 ====================================');
    console.log('   HANDWRITTEN JOURNAL SERVER');
    console.log('   ====================================');
    console.log(`   🌐 http://localhost:${PORT}`);
    console.log('   💾 Backup file: journal-backup.json');
    console.log('   📖 ====================================');
    console.log('');
});
