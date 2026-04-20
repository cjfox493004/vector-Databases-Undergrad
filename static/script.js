// DOM elements
const textInput1 = document.getElementById('textInput1');
const textInput2 = document.getElementById('textInput2');
const embedButton = document.getElementById('embedButton');
const loadingDiv = document.getElementById('loading');
const resultDiv = document.getElementById('result');
const vectorDisplay1 = document.getElementById('vectorDisplay1');
const vectorDisplay2 = document.getElementById('vectorDisplay2');
const vectorInfo = document.getElementById('vectorInfo');
const similarityInfo = document.getElementById('similarityInfo');
const errorDiv = document.getElementById('error');
const copyButton = document.getElementById('copyButton');

let lastVectors = null;

// Event listeners
embedButton.addEventListener('click', embedText);
textInput1.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        embedText();
    }
});
textInput2.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        embedText();
    }
});
copyButton.addEventListener('click', copyVector);

async function embedText() {
    const text1 = textInput1.value.trim();
    const text2 = textInput2.value.trim();
    
    // Validate input
    if (!text1 || !text2) {
        showError('Please enter both text fields');
        return;
    }

    // Show loading, hide error
    loadingDiv.classList.remove('hidden');
    errorDiv.classList.add('hidden');
    resultDiv.classList.add('hidden');

    try {
        const response = await fetch('/api/embed-pair', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text1: text1, text2: text2 })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to get embeddings');
        }

        const data = await response.json();
        lastVectors = data;
        displayVectors(data.vector1, data.vector2, data.cosine_similarity);
        
    } catch (error) {
        showError(`Error: ${error.message}`);
    } finally {
        loadingDiv.classList.add('hidden');
    }
}

function displayVectors(vector1, vector2, similarity) {
    const formattedVector1 = vector1
        .map((val, idx) => `${idx}: ${val.toFixed(6)}`)
        .join('\n');
    const formattedVector2 = vector2
        .map((val, idx) => `${idx}: ${val.toFixed(6)}`)
        .join('\n');

    vectorDisplay1.textContent = formattedVector1;
    vectorDisplay2.textContent = formattedVector2;
    vectorInfo.textContent = `Vector dimension: ${vector1.length} and ${vector2.length}`;
    similarityInfo.textContent = `Cosine similarity: ${similarity.toFixed(6)}`;
    resultDiv.classList.remove('hidden');
}

function copyVector() {
    if (!lastVectors) return;
    
    const vectorString = JSON.stringify(lastVectors, null, 2);
    navigator.clipboard.writeText(vectorString).then(() => {
        const originalText = copyButton.textContent;
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
            copyButton.textContent = originalText;
        }, 2000);
    }).catch(err => {
        showError('Failed to copy vector');
    });
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    resultDiv.classList.add('hidden');
}
