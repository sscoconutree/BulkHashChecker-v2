document.addEventListener('DOMContentLoaded', () => {
    const hashInput = document.getElementById('hashInput');
    const checkButton = document.getElementById('checkButton');
    const maxLines = 500;
    const characterCounter = document.getElementById('characterCounter');

    hashInput.addEventListener('input', () => {
        let inputText = hashInput.value;
        let lines = inputText.split('\n').filter(line => line.trim() !== '');

        if (lines.length > maxLines) {
            const truncatedLines = lines.slice(0, maxLines);
            inputText = truncatedLines.join('\n');
            hashInput.value = inputText;
        }

        lines = inputText.split('\n').filter(line => line.trim() !== '');
        const lineCount = lines.length;

        characterCounter.textContent = `(${lineCount}/${maxLines})`;

        if (lineCount > maxLines) {
            checkButton.disabled = true;
        } else {
            checkButton.disabled = false;
        }
    });

    checkButton.addEventListener('click', async () => {
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

            if (!response.ok) {
                handleErrorResponse(response.status);
                return;
            }

            const data = await response.json();

            if (!data.success) {
                handleServerError(data.message);
                return;
            }

            displayAnalysisResults(data.analysisResults);
        } catch (error) {
            console.error('Error occurred:', error);
            handleUnexpectedError();
        } finally {
            resetInputElements();
        }
    });

    function resetInputElements() {
        hashInput.disabled = false;
        checkButton.disabled = false;
    }

    function handleErrorResponse(status) {
        if (status === 500) {
            flashApiLimitError('API limit has been reached. Please try again later.');
        } else {
            console.error('Error:', status);
            flashMessage('An error occurred. Please try again.');
        }
        resetInputElements();
    }

    function handleServerError(errorMessage) {
        console.error('Server Error:', errorMessage);
        flashMessage('An error occurred while processing your request. Please try again.');
        resetInputElements();
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

    function flashApiLimitError(message) {
        const flashContainer = createFlashElement(message, 'red');
        document.body.appendChild(flashContainer);

        setTimeout(() => {
            flashContainer.style.opacity = '0';
            setTimeout(() => {
                flashContainer.remove();
            }, 1000);
        }, 3000);
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
