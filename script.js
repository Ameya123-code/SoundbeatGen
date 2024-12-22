const audioContext = new (window.AudioContext || window.webkitAudioContext)();

let oscillator1 = null;

let oscillator2 = null;

let gainNode = null;

const frequencyInput = document.getElementById('frequency');

const volumeSlider = document.getElementById('volume');

const waveformSelector = document.getElementById('waveform');

const startStopButton = document.getElementById('start-stop');

const playBeatsButton = document.getElementById('play-beats');

const beatFrequencyInput = document.getElementById('beat-frequency');

const presetButtons = document.querySelectorAll('.preset-buttons button');

const darkModeToggle = document.querySelector('.dark-mode-toggle');

const volValue = document.getElementById('vol-value');

const canvas = document.getElementById('oscilloscope');

const canvasCtx = canvas.getContext('2d');

const graphSpeedSlider = document.getElementById('graph-speed');

const graphSpeedValue = document.getElementById('graph-speed-value');

let isPlaying = false;

let isPlayingBeats = false;

let analyser = null;

let dataArray = null;

let animationId = null;

let graphSpeed = 30; // Default update speed in ms

// Setup the analyser node

function setupAnalyser() {

    analyser = audioContext.createAnalyser();

    analyser.fftSize = 2048;

    const bufferLength = analyser.frequencyBinCount;

    dataArray = new Uint8Array(bufferLength);

    // Connect the analyser to the gain node

    gainNode.connect(analyser);

    analyser.connect(audioContext.destination);

}

// Draw the oscilloscope visualization

function drawOscilloscope() {

    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.lineWidth = 2;

    canvasCtx.strokeStyle = '#00f';

    canvasCtx.beginPath();

    const sliceWidth = canvas.width / dataArray.length;

    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {

        const v = dataArray[i] / 128.0; // Normalize to [0, 2]

        const y = (v * canvas.height) / 2;

        if (i === 0) {

            canvasCtx.moveTo(x, y);

        } else {

            canvasCtx.lineTo(x, y);

        }

        x += sliceWidth;

    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);

    canvasCtx.stroke();

    // Adjust the speed of the graph updates

    animationId = setTimeout(drawOscilloscope, graphSpeed);

}

// Start or stop a single tone

startStopButton.addEventListener('click', () => {

    if (!isPlaying) {

        oscillator1 = audioContext.createOscillator();

        gainNode = audioContext.createGain();

        oscillator1.type = waveformSelector.value;

        oscillator1.frequency.value = parseFloat(frequencyInput.value);

        gainNode.gain.value = parseFloat(volumeSlider.value);

        oscillator1.connect(gainNode);

        setupAnalyser();

        oscillator1.start();

        isPlaying = true;

        startStopButton.textContent = 'Stop Single Tone';

        drawOscilloscope();

    } else {

        oscillator1.stop();

        oscillator1 = null;

        isPlaying = false;

        startStopButton.textContent = 'Start Single Tone';

        clearTimeout(animationId);

    }

});

// Play or stop beats using two oscillators

playBeatsButton.addEventListener('click', () => {

    if (!isPlayingBeats) {

        const beatFrequency = parseFloat(beatFrequencyInput.value);

        if (beatFrequency < 0 || beatFrequency > 15) {

            alert('Beat frequency difference must be between 0 and 15 Hz.');

            return;

        }

        oscillator1 = audioContext.createOscillator();

        oscillator2 = audioContext.createOscillator();

        gainNode = audioContext.createGain();

        oscillator1.type = waveformSelector.value;

        oscillator2.type = waveformSelector.value;

        const baseFrequency = parseFloat(frequencyInput.value);

        oscillator1.frequency.value = baseFrequency;

        oscillator2.frequency.value = baseFrequency + beatFrequency;

        gainNode.gain.value = parseFloat(volumeSlider.value);

        oscillator1.connect(gainNode);

        oscillator2.connect(gainNode);

        setupAnalyser();

        oscillator1.start();

        oscillator2.start();

        isPlayingBeats = true;

        playBeatsButton.textContent = 'Stop Beats';

        drawOscilloscope();

    } else {

        oscillator1.stop();

        oscillator2.stop();

        oscillator1 = null;

        oscillator2 = null;

        isPlayingBeats = false;

        playBeatsButton.textContent = 'Play Beats';

        clearTimeout(animationId);

    }

});

// Update volume dynamically

volumeSlider.addEventListener('input', () => {

    volValue.textContent = volumeSlider.value;

    if (gainNode) gainNode.gain.value = volumeSlider.value;

});

// Update frequency dynamically

frequencyInput.addEventListener('input', () => {

    const frequency = parseFloat(frequencyInput.value);

    if (frequency < 20 || frequency > 20000) {

        alert('Frequency must be between 20 and 20,000 Hz.');

        frequencyInput.value = Math.min(20000, Math.max(20, frequency));

    } else if (oscillator1) {

        oscillator1.frequency.value = frequency;

        if (oscillator2) {

            const beatFrequency = parseFloat(beatFrequencyInput.value);

            oscillator2.frequency.value = frequency + beatFrequency;

        }

    }

});

// Preset frequency buttons

presetButtons.forEach(button => {

    button.addEventListener('click', () => {

        const frequency = button.getAttribute('data-frequency');

        frequencyInput.value = frequency;

        if (oscillator1) oscillator1.frequency.value = frequency;

    });

});

// Dark mode toggle

darkModeToggle.addEventListener('click', () => {

    document.body.classList.toggle('dark-mode');

});

// Adjust graph speed

graphSpeedSlider.addEventListener('input', () => {

    graphSpeed = parseInt(graphSpeedSlider.value, 10);

    graphSpeedValue.textContent = graphSpeed;

});