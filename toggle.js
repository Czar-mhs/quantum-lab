// Municipality toggle functionality

document.getElementById('municipalityToggle').addEventListener('click', function() {
    // Toggle between DM and ADM
    currentMunicipality = currentMunicipality === 'dm' ? 'adm' : 'dm';
    const config = municipalities[currentMunicipality];
    
    // Update UI
    document.getElementById('municipalityTitle').textContent = config.name;
    document.getElementById('scoringTitle').textContent = 
        `Health Score Breakdown (${config.shortName})`;
    document.getElementById('inspectionTitle').textContent = 
        `Inspection Items (${config.shortName})`;
    document.getElementById('municipalityToggle').textContent = 
        `Switch to ${currentMunicipality === 'dm' ? 'ADM' : 'DM'}`;
    
    // Update button color based on municipality
    const toggle = document.getElementById('municipalityToggle');
    if (currentMunicipality === 'adm') {
        toggle.style.background = '#10b981';
    } else {
        toggle.style.background = 'white';
        toggle.style.color = '#667eea';
    }
    
    // Re-initialize inputs and inspection items
    initInspection();
    updateScores();
    updateInspection();
    
    // Save preference to localStorage
    localStorage.setItem('selectedMunicipality', currentMunicipality);
});

// Load saved preference on page load
document.addEventListener('DOMContentLoaded', function() {
    const saved = localStorage.getItem('selectedMunicipality');
    if (saved && saved !== currentMunicipality) {
        document.getElementById('municipalityToggle').click();
    }
});
