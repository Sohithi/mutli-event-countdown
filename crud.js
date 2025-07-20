const form = document.getElementById('eventForm');
const eventsContainer = document.getElementById('eventsContainer');

let events = JSON.parse(localStorage.getItem('events')) || [];
let reminderSent = {};

function saveEvents() {
    localStorage.setItem('events', JSON.stringify(events));
}

function getTimeLeft(datetime) {
    const now = new Date();
    const target = new Date(datetime);
    const diff = target - now;
    if (diff <= 0) return null;

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    return `${d} Days ${h}:${m}:${s}`;
}

function renderEvents() {
    eventsContainer.innerHTML = '';
    events.forEach(event => {
        const card = document.createElement('div');
        card.className = 'event-card';

        const timeLeft = getTimeLeft(event.datetime);
        const isPast = new Date(event.datetime) <= new Date();

        card.innerHTML = `
      <h3>${event.title}</h3>
      <p>${event.description || ''}</p>
      <p>Category: ${event.category}</p>
      <p>${event.email ? "📧 Reminder set" : ""}</p>
      <p id="countdown-${event.id}">
        ${isPast ? `🎉 ${event.title} is happening now!` : timeLeft}
      </p>
      <button onclick="deleteEvent(${event.id})">Delete</button>
    `;

        eventsContainer.appendChild(card);
    });
}

function deleteEvent(id) {
    if (confirm("Are you sure you want to delete this event?")) {
        events = events.filter(e => e.id !== id);
        saveEvents();
        renderEvents();
    }
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = form.title.value.trim();
    const description = form.description.value;
    const datetime = new Date(form.datetime.value);
    const email = form.email.value;
    const category = form.category.value;

    if (!title || datetime <= new Date()) {
        alert("Please enter a valid future datetime and title.");
        return;
    }

    const event = {
        id: Date.now(),
        title,
        description,
        datetime,
        email,
        category
    };

    events.push(event);
    saveEvents();
    renderEvents();
    form.reset();
});

setInterval(() => {
    events.forEach(event => {
        const countdownEl = document.getElementById(`countdown-${event.id}`);
        if (countdownEl) {
            const timeLeft = getTimeLeft(event.datetime);
            countdownEl.textContent = timeLeft ? timeLeft : `🎉 ${event.title} is happening now!`;
        }
    });
    checkReminders();
}, 1000);

function checkReminders() {
    const now = new Date();
    events.forEach(event => {
        const eventDate = new Date(event.datetime);
        const diffDays = Math.floor((eventDate - now) / (1000 * 60 * 60 * 24));

        if (diffDays === 1 && event.email && !reminderSent[event.id]) {
            console.log(`Reminder: '${event.title}' is happening tomorrow. Email sent to: ${event.email}`);
            alert(`📧 Reminder: '${event.title}' is happening tomorrow!`);
            reminderSent[event.id] = true;
        }
    });
}

renderEvents();
