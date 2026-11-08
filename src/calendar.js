
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import './loginSignup.js';
import '../styles/style.css';

import { db, auth } from './firebaseConfig.js';

import { onAuthStateChanged } from 'firebase/auth';

import {
    collection,
    getDocs,
    query
} from "firebase/firestore";


// Generate the seven days of the week.
const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];


// Generate calendar cards.
function generateCalendar() {

    const container = document.getElementById("calendar-go-here");
    const template = document.getElementById("calendarCardTemplate");

    container.innerHTML = "";

    weekdays.forEach(day => {

        const newCard = template.content.cloneNode(true);

        newCard.querySelector(".calendar-title").textContent = day;

        newCard.querySelector(".calendar-day").textContent = "";

        container.appendChild(newCard);

    });

}


// Retrieve tasks belonging to the logged-in user.
async function displayCalendarDynamically(userID) {

    try {

        const tasksRef = collection(db, "users", userID, "tasks");

        const q = query(tasksRef);

        const querySnapshot = await getDocs(q);

        // Create the seven calendar days.
        generateCalendar();

        const dayContainers = document.querySelectorAll(".day-tasks");

        // Store tasks in an array.
        const tasks = [];

        querySnapshot.forEach(taskDoc => {

            tasks.push({
                id: taskDoc.id,
                ...taskDoc.data()
            });

        });

        // Sort tasks by their start time.
        tasks.sort((a, b) => {

            return (a.task_time || "23:59").localeCompare(
                b.task_time || "23:59"
            );

        });

        // Match each task to its weekday.
        tasks.forEach(task => {

            const taskDay = task.day;

            const dayIndex = weekdays.indexOf(taskDay);

            // Ignore tasks without a matching weekday.
            if (dayIndex === -1) {
                console.warn("Invalid task day:", taskDay);
                return;
            }

            // Create the task card.
            const taskCard = document.createElement("div");

            taskCard.className = "card mb-2 p-2";

            taskCard.style.cursor = "pointer";

            // Task name.
            const taskName = document.createElement("h6");

            taskName.textContent = task.name || "Untitled Task";

            // Task time.
            const taskTime = document.createElement("small");

            taskTime.textContent = task.task_time || "No time specified";

            taskCard.appendChild(taskName);

            taskCard.appendChild(taskTime);

            // Add task under the matching weekday.
            dayContainers[dayIndex].appendChild(taskCard);

        });

    } catch (error) {

        console.error("Error displaying calendar:", error);

    }

}


// Retrieve subtasks for the selected task.
async function displaySubtasks(userID, taskID, taskName) {

    try {

        const taskNameElement = document.getElementById("selected-task-name");

        const subtasksContainer = document.getElementById("subtasks-go-here");

        taskNameElement.textContent = `Subtasks for: ${taskName}`;

        subtasksContainer.innerHTML = "Loading subtasks...";

        // Get the selected task's subtasks collection.
        const subtasksRef = collection(
            db,
            "users",
            userID,
            "tasks",
            taskID,
            "subtasks"
        );

        const querySnapshot = await getDocs(subtasksRef);

        subtasksContainer.innerHTML = "";

        if (querySnapshot.empty) {

            subtasksContainer.innerHTML = "<p>No subtasks yet.</p>";

            return;

        }

        querySnapshot.forEach(subtaskDoc => {

            const subtask = subtaskDoc.data();

            const subtaskElement = document.createElement("div");

            subtaskElement.className = "form-check mb-2";

            const checkbox = document.createElement("input");

            checkbox.type = "checkbox";

            checkbox.className = "form-check-input";

            checkbox.checked = subtask.completed || false;

            const label = document.createElement("label");

            label.className = "form-check-label";

            label.textContent = subtask.name || "Untitled subtask";

            subtaskElement.appendChild(checkbox);

            subtaskElement.appendChild(label);

            subtasksContainer.appendChild(subtaskElement);

        });

    } catch (error) {

        console.error("Error retrieving subtasks:", error);

    }

}


// Wait for Firebase authentication.
onAuthStateChanged(auth, async (user) => {

    if (user) {

        await displayCalendarDynamically(user.uid);

    } else {

        console.log("User is not logged in.");

    }

});
