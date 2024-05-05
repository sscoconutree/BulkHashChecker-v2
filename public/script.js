document.getElementById('checkButton').addEventListener('click', async () => {
    const hashInput = document.getElementById('hashInput');
    const checkButton = document.getElementById('checkButton');
    hashInput.disabled = true;
    checkButton.disabled = true;

    const inputText = hashInput.value.trim();
    if (inputText === '') {
        resetInputElements();
        return;
    }

    try {
        const response = await fetch('/checkHashes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ hashes: inputText })
        });
        const data = await response.json();

        const analysisResult = document.getElementById('analysisResult');
        analysisResult.innerHTML = '';

        if (data.success) {
            data.analysisResults.forEach(result => {
                const listItem = document.createElement('li');
                listItem.textContent = result.message; 
                listItem.style.color = result.color; 

                analysisResult.appendChild(listItem);
            });

            
            const copyButton = document.createElement('button');
            copyButton.textContent = 'Copy Results';
            copyButton.classList.add('copyButton'); 
            copyButton.addEventListener('click', () => {
                const textToCopy = data.analysisResults.map(result => result.message).join('\n');
                copyToClipboard(textToCopy);
            });
            analysisResult.appendChild(copyButton);
        } else {
            console.error('Error occurred while checking hashes');
        }
    } catch (error) {
        console.error('Error occurred:', error);
    } finally {
        resetInputElements();
    }
});

function resetInputElements() {
    const hashInput = document.getElementById('hashInput');
    const checkButton = document.getElementById('checkButton');
    hashInput.disabled = false;
    checkButton.disabled = false;
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
    }, 2000); // Message will disappear after 2 seconds
}
