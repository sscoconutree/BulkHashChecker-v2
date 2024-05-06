const express = require('express');
const fetch = require('node-fetch');
const { isIPAddress, sleep } = require('./helpers'); 

const apikey = 'API KEY HERE'; // INSERT YOUR API KEY HERE

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public')); 

let apiRequestCount = 0;
const maxApiRequests = 500;

app.post('/checkHashes', async (req, res) => {
    if (apiRequestCount >= maxApiRequests) {
        const errorMessage = 'Maximum API daily quota has been reached. Please try again tomorrow.';
        console.log(errorMessage);
        return res.status(429).json({ success: false, message: errorMessage });
    }

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
            apiRequestCount++;

            const result = await response.json();

            if (typeof result.positives === 'undefined') {
                analysisResults.push({ 
                    hash: trimmedHash,
                    type: hashType,
                    status: 'Unknown'
                });
                console.log(`Hash ${trimmedHash} analysis result is unknown.`);
            } else if (result.positives !== 0) {
                analysisResults.push({ 
                    hash: trimmedHash,
                    type: hashType,
                    status: 'Malicious',
                    enginesDetected: result.positives
                });
                console.log(`Hash ${trimmedHash} is malicious (${result.positives} engines detected).`);
            } else {
                analysisResults.push({ 
                    hash: trimmedHash,
                    type: hashType,
                    status: 'Clean'
                });
                console.log(`Hash ${trimmedHash} is clean.`);
            }
        }

        // Prepare a color-coded response based on analysis results
        const formattedResults = analysisResults.map(result => {
            let message;
            let color;
            
            if (result.status === 'Malicious') {
                message = `${result.hash} (${result.type}) - ${result.enginesDetected} engines detected it as malicious`;
                color = 'red';
            } else if (result.status === 'Clean') {
                message = `${result.hash} (${result.type}) - Clean`;
                color = 'green';
            } else {
                message = `${result.hash} (${result.type}) - No matches found`;
                color = 'gray';
            }
            
            return { message, color };
        });

        res.json({ success: true, analysisResults: formattedResults });
    } catch (error) {
        console.error('Error occurred:', error);
        console.log('Error occurred while checking hashes:', error.message);
        res.status(500).json({ success: false, message: 'Error occurred while checking hashes.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
