document.addEventListener('DOMContentLoaded', () => {
    const hashInput = document.getElementById('hashInput');
    const checkButton = document.getElementById('checkButton');
    const maxLines = 500;
    const characterCounter = document.getElementById('characterCounter');

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
        checkButton.disabled = lineCount === 0;
    });

    checkButton.addEventListener('click', async () => {
        const inputText = hashInput.value.trim();
        if (inputText === '') {
            return resetInputElements();
        }
    
        hashInput.disabled = true;
        checkButton.disabled = true;
        checkButton.classList.add('scanning');
    
        let analysisResults = []; 
    
        try {
            const response = await fetch('/checkHashes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ hashes: inputText })
            });
    
            if (!response.ok) {
                throw new Error(`${response.status}`);
            }
    
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Invalid response format. Expected JSON.');
            }
    
            const data = await response.json();
            analysisResults = data.analysisResults; 

        } catch (error) {
            console.error('Error occurred:', error);
        
            if (error.message.includes('500')) {
                flashErrorMessage('API limit has been reached or there\'s no connection to the server. Please try again later.');
                displayAnalysisResults(analysisResults);
                resetInputElements();
            } else {
                displayAnalysisResults(analysisResults);
                resetInputElements();
            }
        
        
        } finally {
           
            displayAnalysisResults(analysisResults);
            resetInputElements();
        }              
  
    });
    
    
    function resetInputElements() {
        hashInput.disabled = false;
        checkButton.disabled = false;
        checkButton.classList.remove('scanning'); 
    }

    function displayAnalysisResults(results) {
        const analysisResult = document.getElementById('analysisResult');
        analysisResult.innerHTML = '';

        results.forEach(result => {
            const listItem = document.createElement('li');
            listItem.textContent = result.message;
            listItem.style.color = result.color;
            analysisResult.appendChild(listItem);
        });

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy Results';
        copyButton.classList.add('copyButton');
        copyButton.addEventListener('click', () => {
            const textToCopy = results.map(result => result.message).join('\n');
            copyToClipboard(textToCopy);
        });
        analysisResult.appendChild(copyButton);
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
