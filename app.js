const express = require('express');
const fetch = require('node-fetch');
const { isIPAddress, sleep } = require('./helpers');

const apikey = 'API_KEY_HERE'; // INSERT YOUR API KEY HERE

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

let apiRequestCount = 0;
const maxApiRequests = 500;

app.post('/checkHashes', async (req, res) => {
    if (apiRequestCount >= maxApiRequests) {
        return res.status(500).json({ success: false });
    }

    const { hashes } = req.body;
    const hashesArray = hashes.trim().split('\n');
    const uniqueHashes = new Set();

    for (const hash of hashesArray) {
        const trimmedHash = hash.trim();
        if (!isIPAddress(trimmedHash)) {
            uniqueHashes.add(trimmedHash);
        } else {
            console.log(`Skipped IP address: ${trimmedHash}`);
        }
    }

    const shouldSkipSleep = uniqueHashes.size < 4;
    
    for (const trimmedHash of uniqueHashes) {
        let hashType;
        switch (trimmedHash.length) {
            case 32:
                hashType = 'MD5';
                break;
            case 40:
                hashType = 'SHA-1';
                break;
            case 64:
                hashType = 'SHA-256';
                break;
            default:
                hashType = 'Unknown';
        }

        if (!shouldSkipSleep) {
            await sleep(15000); 
        }

        try {
            const response = await fetch(`https://www.virustotal.com/vtapi/v2/file/report?apikey=${apikey}&resource=${trimmedHash}`);
            apiRequestCount++;

            const result = await response.json();

            let status, enginesDetected;
            if (typeof result.positives === 'undefined') {
                status = 'Unknown';
            } else if (result.positives !== 0) {
                status = 'Malicious';
                enginesDetected = result.positives;
            } else {
                status = 'Clean';
            }

            const formattedResult = {
                hash: trimmedHash,
                type: hashType,
                status: status,
                enginesDetected: enginesDetected
            };

            res.write(JSON.stringify({ success: true, analysisResult: formattedResult }));
        } catch (error) {
            console.error(`Error occurred while checking hash ${trimmedHash}:`, error);
            res.write(JSON.stringify({ success: false, message: `Error occurred while checking hash ${trimmedHash}.` }));
        }
    }

    res.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
