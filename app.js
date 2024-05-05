const express = require('express');
const fetch = require('node-fetch');
const { isIPAddress, sleep } = require('./helpers'); 

const apikey = 'API_KEY_HERE'; // INSERT YOUR API KEY HERE

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public')); 

app.post('/checkHashes', async (req, res) => {
    const { hashes } = req.body;
    const analysisResults = [];
    const uniqueHashes = new Set(); 

    try {
        const hashesArray = hashes.trim().split('\n');

        hashesArray.forEach(hash => {
            const trimmedHash = hash.trim();
            if (!isIPAddress(trimmedHash)) {
                uniqueHashes.add(trimmedHash);
            } else {
                console.log(`Skipped IP address: ${trimmedHash}`);
            }
        });

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
                await sleep(15000); // Adjust delay between checks
            }

            const response = await fetch(`https://www.virustotal.com/vtapi/v2/file/report?apikey=${apikey}&resource=${trimmedHash}`);
            const result = await response.json();

            if (result.positives !== 0) {
                analysisResults.push({ 
                    hash: trimmedHash,
                    type: hashType,
                    status: 'Malicious',
                    enginesDetected: result.positives
                });
            } else {
                analysisResults.push({ 
                    hash: trimmedHash,
                    type: hashType,
                    status: 'Clean'
                });
            }
        }

        // Prepare a color-coded response based on analysis results
        const formattedResults = analysisResults.map(result => ({
            message: `${result.hash} (${result.type}) - ${result.status === 'Malicious' ? 
                `${result.enginesDetected} engines detected it as malicious` : 'Clean'}`,
            color: result.status === 'Malicious' ? 'red' : 'green'
        }));

        res.json({ success: true, analysisResults: formattedResults });
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ success: false, message: 'Error occurred while checking hashes.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
