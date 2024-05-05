# BulkHashChecker-v2
Improved GUI-based VirusTotal bulk hash checker for non-premium API key users.

This is a GUI based VirusTotal bulk hash checker that was designed for non-premium VirusTotal API users.
Due to API key limitations of 4 requests/minute, there's a sleep timer in between the scans per hashes.


<h3>How to use:</h3>

1. Edit ```app.js``` file and put your VirusTotal API key on the ```apikey``` field.
2. Run the following: ```node app.js```
3. Open ```localhost:3000```
