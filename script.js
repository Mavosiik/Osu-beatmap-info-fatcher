// Function to save the API key
function saveApiKey() {
    const apiKeyInput = document.getElementById('apiKeyInput');
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
        alert('Please enter an API key.');
        return;
    }

    localStorage.setItem('osuApiKey', apiKey);
    apiKeyInput.value = ''; // Clear the input field
    toggleApiKeyInput(); // Hide the input field after saving
}

// Function to toggle API key input visibility
function toggleApiKeyInput() {
    const apiKeyContainer = document.getElementById('apiKeyContainer');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
    const changeApiKeyBtn = document.getElementById('changeApiKeyBtn');

    apiKeyContainer.classList.toggle('hidden'); // Toggle visibility of API key container

    // Toggle visibility of buttons based on container visibility
    if (apiKeyContainer.classList.contains('hidden')) {
        changeApiKeyBtn.textContent = 'Change API Key'; // Change button text
    } else {
        changeApiKeyBtn.textContent = 'Cancel'; // Change button text
        apiKeyInput.value = localStorage.getItem('osuApiKey') || ''; // Set API key from localStorage
        apiKeyInput.focus(); // Focus on API key input field
    }
}

// Function to fetch beatmap information
function fetchBeatmapInfo() {
    const beatmapId = document.getElementById('beatmapIdInput').value.trim();
    const mod = parseInt(document.getElementById('modSelect').value);

    if (!beatmapId) {
        alert('Please enter a beatmap ID.');
        return;
    }

    const apiKey = localStorage.getItem('osuApiKey');

    if (!apiKey) {
        alert('Please enter an API key.');
        return;
    }

    const url = `https://osu.ppy.sh/api/get_beatmaps?k=${apiKey}&b=${beatmapId}&mods=${mod}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                alert('Beatmap not found.');
                return;
            }

            let beatmap = data[0];
            let cs = parseFloat(beatmap.diff_size);
            let ar = parseFloat(beatmap.diff_approach);
            let od = parseFloat(beatmap.diff_overall);
            let hp = parseFloat(beatmap.diff_drain);
            let bpm = parseFloat(beatmap.bpm);
            let drain = parseFloat(beatmap.hit_length);

            // Apply modifications based on selected mod
            if (mod & 2) { // EZ
                cs /= 2;
                ar /= 2;
                od /= 2;
                hp /= 2;
            } else if (mod & 16) { // HR
                cs = Math.min(cs * 1.3, 10);
                ar = Math.min(ar * 1.4, 10);
                od = Math.min(od * 1.4, 10);
                hp = Math.min(hp * 1.4, 10);
            } else if (mod & 64 || mod & 512) { // DT/NC
                if (ar > 5) ar = ((1200 - ((1200 - (ar - 5) * 150) * 2 / 3)) / 150) + 5;
                else ar = (1800 - ((1800 - ar * 120) * 2 / 3)) / 120;
                od = (79.5 - ((79.5 - 6 * od) * 2 / 3)) / 6;
                bpm *= 1.5;
                drain /= 1.5;
            } else if (mod & 256) { // HT
                if (ar > 5) ar = ((1200 - ((1200 - (ar - 5) * 150) * 4 / 3)) / 150) + 5;
                else ar = (1800 - ((1800 - ar * 120) * 4 / 3)) / 120;
                od = (79.5 - ((79.5 - 6 * od) * 4 / 3)) / 6;
                bpm *= 0.75;
                drain *= 1.5;
            }

            // Round SR to 2 decimals
            const roundedSR = parseFloat(beatmap.difficultyrating).toFixed(2);

            // Round CS, AR, OD values based on presence of decimals
            const formattedCS = cs % 1 === 0 ? cs.toFixed(0) : cs.toFixed(1);
            const formattedAR = ar % 1 === 0 ? ar.toFixed(0) : ar.toFixed(1);
            const formattedOD = od % 1 === 0 ? od.toFixed(0) : od.toFixed(1);

            // Format drain time to m:ss
            const formattedDrain = formatTime(drain);

            // Display beatmap information
            const beatmapInfo = `
                <h2>${beatmap.title}</h2>
                <p>Artist: ${beatmap.artist}</p>
                <p>Mapper: ${beatmap.creator}</p>
                <p>Difficulty: ${beatmap.version}</p>
                <p>Star Rating (SR): ${roundedSR}</p>
                <p>Circle Size (CS): ${formattedCS}</p>
                <p>Approach Rate (AR): ${formattedAR}</p>
                <p>Overall Difficulty (OD): ${formattedOD}</p>
                <p>Drain Time: ${formattedDrain}</p>
                <img src="https://assets.ppy.sh/beatmaps/${beatmap.beatmapset_id}/covers/cover.jpg" alt="Beatmap Cover" style="max-width: 100%; margin-top: 10px;">
            `;

            document.getElementById('beatmapInfo').innerHTML = beatmapInfo;
        })
        .catch(error => {
            console.error('Error fetching beatmap:', error);
            alert('Failed to fetch beatmap information. Please try again later.');
        });
}

// Function to format time from seconds to m:ss
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Initial setup
window.onload = function () {
    // Check if API key is saved and hide/show input accordingly
    const savedApiKey = localStorage.getItem('osuApiKey');
    const apiKeyContainer = document.getElementById('apiKeyContainer');

    if (savedApiKey) {
        apiKeyContainer.classList.add('hidden'); // Hide API key input initially if key is saved
    }
};
