// Global state
let currentMunicipality = 'dm'; // 'dm' or 'adm'
let inspectionData = {};

// Municipality configurations
const municipalities = {
    dm: {
        name: 'Dubai Municipality (DM Law 3/2026)',
        shortName: 'DM',
        healthScoreWeights: {
            structural: 0.40,
            regulatory: 0.30,
            maintenance: 0.20,
            safety: 0.10
        },
        certificateValidity: {
            new: { years: 10, label: '10 Years' },
            old: { years: 5, label: '5 Years' }
        },
        inspectionCategories: {
            structural: ['Foundation Quality', 'Wall Integrity', 'Roof Condition', 'Floor Systems'],
            regulatory: ['Building Permits', 'Safety Certifications', 'Compliance Records', 'Documentation'],
            maintenance: ['Plumbing Systems', 'Electrical Systems', 'HVAC Systems', 'General Upkeep'],
            safety: ['Fire Safety', 'Emergency Exits', 'Safety Equipment', 'Accessibility']
        }
    },
    adm: {
        name: 'Abu Dhabi Municipality (ADM/DMT)',
        shortName: 'ADM',
        healthScoreWeights: {
            structural: 0.35,
            fire_gas: 0.25,
            utilities: 0.20,
            maintenance: 0.20
        },
        certificateValidity: {
            full: { years: 5, label: '5 Years (Full)' },
            conditional: { years: 2, label: '2 Years (Conditional)' }
        },
        inspectionCategories: {
            structural: ['Foundation', 'Load-bearing Walls', 'Structural Frame', 'Cladding'],
            fire_gas: ['Fire Detection', 'Gas Safety', 'Suppression Systems', 'Emergency Protocols'],
            utilities: ['Water Supply', 'Electricity', 'Waste Systems', 'Drainage'],
            maintenance: ['External Facade', 'Internal Finishes', 'Equipment', 'General Condition']
        }
    }
};

function initInspection() {
    const config = municipalities[currentMunicipality];
    renderScoreInputs(config);
    renderInspectionItems(config);
}

function renderScoreInputs(config) {
    const container = document.getElementById('scoreInputs');
    container.innerHTML = '';
    
    Object.entries(config.healthScoreWeights).forEach(([category, weight]) => {
        const label = category.replace(/_/g, ' ').toUpperCase();
        const percentage = (weight * 100).toFixed(0);
        
        const group = document.createElement('div');
        group.className = 'score-input-group';
        group.innerHTML = `
            <label>${label} (${percentage}%)</label>
            <input type="number" min="0" max="100" value="0" 
                   onchange="updateScores()" 
                   data-category="${category}">
        `;
        container.appendChild(group);
    });
}

function renderInspectionItems(config) {
    const container = document.getElementById('inspectionItems');
    container.innerHTML = '';
    
    Object.entries(config.inspectionCategories).forEach(([category, items]) => {
        items.forEach((item, idx) => {
            const div = document.createElement('div');
            div.className = 'inspection-item';
            div.innerHTML = `
                <input type="checkbox" data-category="${category}" data-item="${item}" 
                       onchange="updateInspection()">
                <label>${item}</label>
            `;
            container.appendChild(div);
        });
    });
}

function updateScores() {
    const config = municipalities[currentMunicipality];
    let totalScore = 0;
    const inputs = document.querySelectorAll('.score-input-group input');
    
    inputs.forEach(input => {
        const category = input.dataset.category;
        const value = parseFloat(input.value) || 0;
        const weight = config.healthScoreWeights[category];
        totalScore += value * weight;
    });
    
    totalScore = Math.round(totalScore);
    displayScore(totalScore, config);
}

function displayScore(score, config) {
    const scoreCard = document.getElementById('healthScore');
    const statusCard = document.getElementById('certificateStatus');
    
    scoreCard.innerHTML = `
        <div class="score-number">${score}</div>
        <div class="score-label">Health Score</div>
    `;
    
    let status, validity;
    if (currentMunicipality === 'dm') {
        if (score < 40) status = { class: 'fail', text: 'Failed - Requires Remediation' };
        else if (score < 70) status = { class: 'conditional', text: 'Conditional - Action Required' };
        else status = { class: 'pass', text: 'Passed - Certificate Issued' };
        validity = score >= 40 ? (score >= 70 ? '10 Years' : '5 Years') : 'N/A';
    } else {
        if (score < 60) status = { class: 'fail', text: 'At Risk - Inspection Required' };
        else if (score < 80) status = { class: 'conditional', text: 'Conditional - 2 Year Certificate' };
        else status = { class: 'pass', text: 'Full Certificate - 5 Years' };
        validity = score >= 60 ? (score >= 80 ? '5 Years' : '2 Years') : 'N/A';
    }
    
    statusCard.className = `status-card ${status.class}`;
    statusCard.innerHTML = `<div class="status-text">${status.text}<br/>Valid: ${validity}</div>`;
    
    inspectionData.score = score;
    inspectionData.status = status.text;
    inspectionData.validity = validity;
}

function updateInspection() {
    const items = document.querySelectorAll('.inspection-item input[type="checkbox"]');
    let completedCount = 0;
    
    items.forEach(item => {
        if (item.checked) {
            completedCount++;
            item.closest('.inspection-item').classList.add('checked');
        } else {
            item.closest('.inspection-item').classList.remove('checked');
        }
    });
    
    inspectionData.completedItems = completedCount;
    inspectionData.totalItems = items.length;
}

function resetInspection() {
    document.getElementById('buildingName').value = '';
    document.getElementById('buildingLocation').value = '';
    document.getElementById('buildingYear').value = '';
    
    document.querySelectorAll('.score-input-group input').forEach(input => input.value = '0');
    document.querySelectorAll('.inspection-item input[type="checkbox"]').forEach(cb => cb.checked = false);
    
    inspectionData = {};
    updateScores();
    updateInspection();
}

function exportData() {
    const data = {
        municipality: municipalities[currentMunicipality].shortName,
        buildingName: document.getElementById('buildingName').value,
        location: document.getElementById('buildingLocation').value,
        yearBuilt: document.getElementById('buildingYear').value,
        inspectionData: inspectionData,
        timestamp: new Date().toISOString()
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AMPHR_${data.municipality}_${Date.now()}.json`;
    a.click();
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initInspection();
    updateScores();
});
