async function fetchParticipants() {
  const response = await fetch('https://raw.githubusercontent.com/ExtremisMalis/participant-list-demo/refs/heads/main/participants.json');
  const participants = await response.json();
  
  const participantList = document.querySelectorAll('participant-list');
  participantList.innerHTML = '';
  participants.forEach(participant => {
    const listItem = document.createElement('p');
    listItem.textContent = participant.username;
    participantList.appendChild(listItem);
  });
}

window.onload = fetchParticipants;
