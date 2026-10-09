const express = require('express');
const path = require('path');
const { convertCurlToVRODetailed } = require('curl2vro');

const app = express();
app.use(express.json({ limit: '1mb' }));

// Enable CORS for API callers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// The page converts in the browser; the engine lives in public/engine (see scripts/copy-engine.js)
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders(res, filePath) {
        if (filePath.endsWith('.wasm')) res.setHeader('Content-Type', 'application/wasm');
        if (filePath.endsWith('.mjs')) res.setHeader('Content-Type', 'text/javascript');
    }
}));

// API: POST { curlCommand, options } -> { success, result, inputs, warnings, notes }
async function convertHandler(req, res) {
    const curlCommand = req.body && req.body.curlCommand;
    if (!curlCommand) {
        return res.status(400).json({ success: false, error: 'No curl command provided' });
    }
    try {
        const r = await convertCurlToVRODetailed(curlCommand, req.body.options || {});
        res.json({ success: true, result: r.code, inputs: r.inputs, warnings: r.warnings, notes: r.notes });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message || 'Failed to convert curl command' });
    }
}
app.post('/api/convert', convertHandler);
app.post('/convert', convertHandler); // older path, kept for existing callers

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve the main page for all other GET routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Vercel imports the app; Render / Docker / local runs start the server
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
