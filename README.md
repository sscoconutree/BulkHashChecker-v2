# BulkHashChecker-v2
Improved GUI-based VirusTotal bulk hash checker for non-premium API key users.

This is a GUI based VirusTotal bulk hash checker that was designed for non-premium VirusTotal API users.
Due to API key limitations of 4 requests/minute, there's a sleep timer in between the scans per hashes.

![image](https://github.com/sscoconutree/BulkHashChecker-v2/assets/59388557/45150b80-4178-4abe-917b-fafac7684626)
![image](https://github.com/sscoconutree/BulkHashChecker-v2/assets/59388557/d23cee38-90a2-44c1-bbee-13220d5a4d8f)



<h3>How to use:</h3>

1. Clone this repository.
2. Edit ```app.js``` file and put your VirusTotal API key on the ```apikey``` field.
3. Run the following: ```node app.js```
4. Open ```localhost:3000```

# CHANGELOGS

<h3>v2.2</h3>

* Analysis outputs now reflects in real-time instead of waiting all of the inputs to be scanned completely before displaying the results.

<h3>v2.1</h3>

* Added a maximum of 500 input hash limit to cater the daily quota of non-premium VirusTotal API.
* Added an error handling feature if maximum API daily quota has been reached.
* Improved result description and color scheme for the identified hashes.
