import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import './loginSignup.js';
import '../styles/style.css';

import { auth, db } from './firebaseConfig.js';

import { onAuthStateChanged } from 'firebase/auth';

import {
    collection,
    getDocs,
    query,
    where,
    limit
} from 'firebase/firestore';


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

        // Get the first day of the week (Monday)
        const startOfWeek = new Date(today);
        const day = today.getDay();

        const difference = day === 0 ? -6 : 1 - day;

        startOfWeek.setDate(today.getDate() + difference);

        // Get the last day of the week (Sunday)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        // Format dates
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

// Display the user's three tasks
async function displayUserTasks(userId) {

    const taskList = document.getElementById('task-list');

    if (!taskList) return;

    try {

        const tasksRef = collection(db, 'tasks');

        const q = query(
            tasksRef,
            where('userId', '==', userId),
            limit(3)
        );

        const querySnapshot = await getDocs(q);


        taskList.innerHTML = '';

        if (querySnapshot.empty) {
            taskList.innerHTML = '<p>You have no tasks yet!</p>';
            return;
        }


        querySnapshot.forEach((docSnap) => {

            const task = docSnap.data();

            const taskCard = document.createElement('div');

            taskCard.className = 'card mb-3 p-3';

            const taskName = document.createElement('h5');
            taskName.textContent = task.name || 'Untitled Task';

            const taskDetails = document.createElement('p');
            taskDetails.textContent = task.details || 'No additional details';

            const taskDay = document.createElement('p');
            taskDay.textContent = `Day: ${task.day || 'Not specified'}`;

            const taskTime = document.createElement('p');
            taskTime.textContent = `Time: ${task.task_time || 'Not specified'}`;

            taskCard.appendChild(taskName);
            taskCard.appendChild(taskDetails);
            taskCard.appendChild(taskDay);
            taskCard.appendChild(taskTime);

            taskList.appendChild(taskCard);

        });

    } catch (error) {

        console.error('Error retrieving tasks:', error);

        taskList.textContent = 'Unable to load your tasks.';
    }
}

// Display current date
displayCurrentDate();

// Display current date
displayCurrentWeek();

// Check authentication and personalize dashboard
onAuthStateChanged(auth, async (user) => {

    if (user) {

        const displayName = user.displayName || user.email || 'Friend';

        const nameElement = document.getElementById('name-goes-here');

        if (nameElement) {
            nameElement.textContent = displayName;
        }

        await displayUserTasks(user.uid);


    };
})