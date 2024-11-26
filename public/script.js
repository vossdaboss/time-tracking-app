let currentEntry = null;
let timerInterval = null;

// DOM Elements
const taskNameInput = document.getElementById('taskName');
const projectNameInput = document.getElementById('projectName');
const startTimerBtn = document.getElementById('startTimer');
const stopTimerBtn = document.getElementById('stopTimer');
const currentTimerDiv = document.querySelector('.current-timer');
const currentTaskDiv = document.getElementById('currentTask');
const timerDiv = document.getElementById('timer');
const entriesList = document.getElementById('entriesList');

// Event Listeners
startTimerBtn.addEventListener('click', startTimer);
stopTimerBtn.addEventListener('click', stopTimer);

// Load existing entries
loadEntries();

function startTimer() {
    const taskName = taskNameInput.value.trim();
    const projectName = projectNameInput.value.trim();
    
    if (!taskName) {
        alert('Please enter a task name');
        return;
    }

    currentEntry = {
        taskName,
        projectName,
        startTime: new Date(),
    };

    // Save to server
    fetch('/api/entries', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentEntry),
    })
    .then(response => response.json())
    .then(entry => {
        currentEntry = entry;
        updateTimerDisplay();
        currentTimerDiv.classList.remove('hidden');
        currentTaskDiv.textContent = `${taskName} (${projectName})`;
        startTimerBtn.disabled = true;
    });

    // Start timer update
    timerInterval = setInterval(updateTimerDisplay, 1000);
}

function stopTimer() {
    if (!currentEntry) return;

    const endTime = new Date();
    
    // Update entry on server
    fetch(`/api/entries/${currentEntry.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endTime }),
    })
    .then(() => {
        clearInterval(timerInterval);
        currentEntry = null;
        currentTimerDiv.classList.add('hidden');
        startTimerBtn.disabled = false;
        taskNameInput.value = '';
        projectNameInput.value = '';
        loadEntries();
    });
}

function updateTimerDisplay() {
    if (!currentEntry) return;
    
    const now = new Date();
    const diff = now - new Date(currentEntry.startTime);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    timerDiv.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function pad(num) {
    return num.toString().padStart(2, '0');
}

function loadEntries() {
    fetch('/api/entries')
        .then(response => response.json())
        .then(entries => {
            entriesList.innerHTML = '';
            entries.reverse().forEach(entry => {
                const duration = entry.endTime 
                    ? formatDuration(new Date(entry.endTime) - new Date(entry.startTime))
                    : 'In progress';
                
                const entryDiv = document.createElement('div');
                entryDiv.className = 'entry';
                entryDiv.innerHTML = `
                    <div>
                        <strong>${entry.taskName}</strong>
                        ${entry.projectName ? `(${entry.projectName})` : ''}
                        <br>
                        <small>${new Date(entry.startTime).toLocaleString()}</small>
                        - Duration: ${duration}
                    </div>
                    <button class="delete-btn" onclick="deleteEntry(${entry.id})">Delete</button>
                `;
                entriesList.appendChild(entryDiv);
            });
        });
}

function formatDuration(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function deleteEntry(id) {
    fetch(`/api/entries/${id}`, {
        method: 'DELETE',
    })
    .then(() => loadEntries());
} 