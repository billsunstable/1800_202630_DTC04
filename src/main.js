import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import '../styles/style.css';

import { auth, db } from './firebaseConfig.js';

import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';


// Display the current date
function displayCurrentDate() {
    const dateElement = document.getElementById('current-date');

    if (dateElement) {
        const today = new Date();

        dateElement.textContent = today.toLocaleDateString('en-CA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}


// Display the current week
function displayCurrentWeek() {
    const dateElement = document.getElementById('current-week');

    if (dateElement) {
        const today = new Date();

        const startOfWeek = new Date(today);
        const day = today.getDay();
        const difference = -day;

        startOfWeek.setDate(today.getDate() + difference);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const options = {
            month: 'long',
            day: 'numeric'
        };

        const startDate = startOfWeek.toLocaleDateString('en-CA', options);
        const endDate = endOfWeek.toLocaleDateString('en-CA', options);

        dateElement.textContent =
            `${startDate} – ${endDate}, ${endOfWeek.getFullYear()}`;
    }
}


// Display the live clock
function displayClock() {
    const clockElement = document.getElementById('current-time');

    if (!clockElement) return;

    function updateClock() {
        const now = new Date();

        clockElement.textContent = now.toLocaleTimeString('en-CA', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    }

    updateClock();

    setInterval(updateClock, 1000);
}


// Display the user's three most recently updated tasks
async function displayUserTasks(userId) {

    const taskList = document.getElementById('task-list');

    if (!taskList) return;

    try {

        // Access the user's tasks subcollection
        const userTasksRef = collection(db, 'users', userId, 'tasks');

        // Retrieve the three most recently updated tasks
        const q = query(
            userTasksRef,
            orderBy('last_updated', 'desc'),
            limit(3)
        );

        const querySnapshot = await getDocs(q);

        taskList.innerHTML = '';

        if (querySnapshot.empty) {
            taskList.innerHTML = '<p>You have no tasks yet!</p>';
            return;
        }

        querySnapshot.forEach((taskDoc) => {

            const task = taskDoc.data();

            // Create task card
            const taskCard = document.createElement('div');

            taskCard.className = 'card shadow-sm mb-3 p-3';

            // Task name
            const taskName = document.createElement('h5');
            taskName.className = 'card-title';
            taskName.textContent = task.name || 'Untitled Task';

            // Task details
            const taskDetails = document.createElement('p');
            taskDetails.className = 'card-text';
            taskDetails.textContent = task.details || 'No additional details';

            // Task date
            const taskDay = document.createElement('p');
            taskDay.textContent = `Day: ${task.task_day || 'Not specified'}`;

            // Task time
            const taskTime = document.createElement('p');

            let formattedTime = 'Not specified';

            if (task.task_time) {
                let [hours, minutes] = task.task_time.split(':');

                let h = parseInt(hours, 10);
                const ampm = h >= 12 ? 'PM' : 'AM';

                h = h % 12 || 12;

                formattedTime = `${h}:${minutes} ${ampm}`;
            }

            taskTime.textContent = `Time: ${formattedTime}`;

            // Task completion status
            const taskStatus = document.createElement('span');

            taskStatus.textContent = task.completed
                ? 'Complete'
                : 'Incomplete';

            taskStatus.className = task.completed
                ? 'badge bg-success text-white'
                : 'badge bg-danger text-white';

            // Edit task button
            const editButton = document.createElement('a');

            editButton.href = `eachTask.html?docID=${taskDoc.id}`;
            editButton.className = 'btn btn-primary mt-3';
            editButton.textContent = 'View / Edit Task';

            // Add elements to card
            taskCard.appendChild(taskName);
            taskCard.appendChild(taskDetails);
            taskCard.appendChild(taskDay);
            taskCard.appendChild(taskTime);
            taskCard.appendChild(taskStatus);
            taskCard.appendChild(editButton);

            taskList.appendChild(taskCard);

        });

    } catch (error) {

        console.error('Error retrieving tasks:', error);

        taskList.textContent = 'Unable to load your tasks.';
    }
}


// Display current date, week, and clock
displayCurrentDate();
displayCurrentWeek();
displayClock();


// Check authentication and personalize dashboard
auth.authStateReady().then(async () => {

    const user = auth.currentUser;

    console.log('Main page loaded');
    console.log('Current Firebase user:', user);

    console.log('User authenticated:', user.email);

    const displayName = user.displayName || user.email || 'Friend';

    const nameElement = document.getElementById('name-goes-here');

    if (nameElement) {
        nameElement.textContent = displayName;
    }

    await displayUserTasks(user.uid);

});
