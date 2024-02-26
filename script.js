/*jslint esversion: 6 */
/* eslint-disable-next-line */
/* eslint-env es8 */

// script.js
// Adjusted URL to point to the model hosted on GitHub Pages
const modelURL = "https://lwoulfe765.github.io/Heart-Sound-Detector-/Heart%20Sounds%20Project/";

// Global recognizer variable
let recognizer;

// Initialize the recognizer and load the model
async function createModel() { // Added the missing opening brace here
    const checkpointURL = modelURL + "model.json"; // model topology
    const metadataURL = modelURL + "metadata.json"; // model metadata

    recognizer = speechCommands.create(
        "BROWSER_FFT", // Fourier transform type
        undefined, // Speech commands vocabulary feature
        checkpointURL,
        metadataURL);

    await recognizer.ensureModelLoaded();

async function init() {
    await createModel();
    await recognizer.ensureModelLoaded();
    const classLabels = recognizer.wordLabels(); // get class labels
    const labelContainer = document.getElementById("label-container");
    for (let i = 0; i < classLabels.length; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }
}

    // Function to start listening for live audio
function startListening() {
    recognizer.listen(result => {
        const scores = result.scores; // Existing score processing
        const classLabels = recognizer.wordLabels(); // get class labels
        const labelContainer = document.getElementById("label-container");
        for (let i = 0; i < classLabels.length; i++) {
            const classPrediction = classLabels[i] + ": " + scores[i].toFixed(2);
            labelContainer.childNodes[i].innerHTML = classPrediction;
        }
        
        // New: Visualize the Spectrogram
        const frequencies = result.spectrogram.data;
        const steps = result.spectrogram.frameSize;
        visualizeSpectrogram(frequencies, steps); // Call your visualization function
    }, {
        includeSpectrogram: true, // Make sure this is true to receive spectrogram data
        probabilityThreshold: 0.75,
        invokeCallbackOnNoiseAndUnknown: true,
        overlapFactor: 0.0
    });
}

// Function to handle pre-recorded audio files
async function predictAudio() {
    // Ensure the recognizer is loaded
    if (!recognizer) {
        await createModel();
    }

    const fileInput = document.getElementById('audio-upload');
    const audioFile = fileInput.files[0];

    if (audioFile) {
        // Load the audio file and decode it
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioData = await audioFile.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(audioData);

        // TODO: Preprocess the audio file here (convert it to a format your model expects)

        // Get the prediction
        const prediction = await recognizer.recognize(audioBuffer);
        // Update the UI with the prediction
        updateUIWithPrediction(prediction);
    }
}

// Function to update the UI with the prediction results
function updateUIWithPrediction(prediction) {
    // TODO: Implement this function to update the label container with the prediction results
    const labelContainer = document.getElementById('label-container');
    labelContainer.innerHTML = ''; // Clear previous results

    // Example: If your prediction object has properties that are the label names
    for (const [label, score] of Object.entries(prediction)) {
        const labelElement = document.createElement('div');
        labelElement.textContent = `${label}: ${score.toFixed(2)}`;
        labelContainer.appendChild(labelElement);
    }
}

// The preprocessAudio function needs to be implemented if required by your model
function preprocessAudio(audioBuffer) {
    // TODO: Convert the audioBuffer to the format your model was trained on
    // For example, this could involve generating a spectrogram or extracting MFCCs
    return audioBuffer; // Placeholder: return the processed audio data
}

// This ensures the code block runs after the HTML document has fully loaded
document.addEventListener('DOMContentLoaded', async (event) => {
    try {
        await init(); // Initialize everything before setting up the listener
        startListening(); // Now set up the recognizer to start listening
        // Attaches an event listener to the 'Analyze Uploaded Audio' button
        document.getElementById('analyze-button').addEventListener('click', predictAudio);
    } catch (error) {
        console.error("Initialization failed", error);
        // Handle the error appropriately
    }
});



