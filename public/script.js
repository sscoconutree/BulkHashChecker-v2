document.addEventListener('DOMContentLoaded', () => {
    const hashInput = document.getElementById('hashInput');
    const checkButton = document.getElementById('checkButton');
    const characterCounter = document.getElementById('characterCounter');
    const analysisResultContainer = document.getElementById('analysisResult');
    let copyButton = null;
    const maxLines = 500; 

    characterCounter.textContent = `(0/${maxLines})`;

    hashInput.addEventListener('input', () => {
        let inputText = hashInput.value;
        let lines = inputText.split('\n').filter(line => line.trim() !== ''); 

        if (lines.length > maxLines) {
            lines = lines.slice(0, maxLines);
            inputText = lines.join('\n');
            hashInput.value = inputText;
        }

        const lineCount = lines.length;
        characterCounter.textContent = `(${lineCount}/${maxLines})`;

        checkButton.disabled = lineCount === 0 || lineCount > maxLines;
    });

    hashInput.addEventListener('keydown', (event) => {
        const lines = hashInput.value.split('\n').filter(line => line.trim() !== ''); 
        const lineCount = lines.length;

        if (lineCount >= maxLines && event.key === 'Enter') {
            event.preventDefault();
        }
    });

    checkButton.addEventListener('click', async () => {
        const inputText = hashInput.value.trim();
        if (inputText === '') {
            return;
        }

        resetUI();

        let lines = inputText.split('\n').filter(line => line.trim() !== ''); 
        lines = lines.slice(0, maxLines); 
        const uniqueLines = Array.from(new Set(lines));

        hashInput.disabled = true;
        checkButton.disabled = true;
        checkButton.classList.add('scanning');

        try {
            const response = await fetch('/checkHashes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ hashes: uniqueLines.join('\n') })
            });

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }

            const reader = response.body.getReader();
            let partialData = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                partialData += new TextDecoder().decode(value);
                const results = partialData.split('\n').filter(Boolean);

                for (const result of results) {
                    const { success, analysisResult, message } = JSON.parse(result);

                    if (success) {
                        displayAnalysisResult(analysisResult);

                        if (!copyButton) {
                            showCopyButton();
                        }
                    } else {
                        console.error('Error occurred:', message);
                        flashErrorMessage('API limit has been reached or there\'s no connection to the server. Please try again later.');
                    }
                }

                partialData = '';
            }

        } catch (error) {
            console.error('Error occurred:', error);
            
            if (error.message.includes('500')) {
                flashErrorMessage('API limit has been reached or there\'s no connection to the server. Please try again later.');
                displayAnalysisResults(analysisResults);
                resetInputElements();
            }
        } finally {
            hashInput.disabled = false;
            checkButton.disabled = false;
            checkButton.classList.remove('scanning');
        }
    });

    function resetUI() {
        analysisResultContainer.innerHTML = '';
        removeCopyButton();
    }

    function displayAnalysisResult(result) {
        const listItem = document.createElement('li');

        if (result.status === 'Malicious') {
            listItem.textContent = `${result.hash} (${result.type}) - ${result.enginesDetected} engines detected it as malicious`;
            listItem.style.color = 'red';
        } else if (result.status === 'Clean') {
            listItem.textContent = `${result.hash} (${result.type}) - Clean`;
            listItem.style.color = 'green';
        } else {
            listItem.textContent = `${result.hash} (${result.type}) - No matches found`;
            listItem.style.color = 'gray';
        }

        analysisResultContainer.appendChild(listItem);
    }

    function showCopyButton() {
        copyButton = document.createElement('button');
        copyButton.textContent = 'Copy Results';
        copyButton.classList.add('copyButton');
        copyButton.addEventListener('click', () => {
            const textToCopy = Array.from(analysisResultContainer.children)
                .map(li => li.textContent)
                .join('\n');
            copyToClipboard(textToCopy);
        });
        analysisResultContainer.parentNode.appendChild(copyButton); 
    }

    function removeCopyButton() {
        if (copyButton && copyButton.parentNode) {
            copyButton.parentNode.removeChild(copyButton);
            copyButton = null;
        }
    }

    function flashErrorMessage(message) {
        const flashMessage = document.createElement('div');
        flashMessage.textContent = message;
        flashMessage.classList.add('flashMessage');
        document.body.appendChild(flashMessage);

        setTimeout(() => {
            flashMessage.remove();
        }, 4000);
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => {
                showCopyMessage();
            })
            .catch(err => {
                console.error('Failed to copy:', err);
            });
    }

    function showCopyMessage() {
        const copyMessage = document.createElement('div');
        copyMessage.textContent = 'Results copied to clipboard';
        copyMessage.classList.add('copyMessage');
        document.body.appendChild(copyMessage);

        setTimeout(() => {
            copyMessage.style.opacity = '0';
            setTimeout(() => {
                copyMessage.remove();
            }, 1000);
        }, 2000);
    }
});
