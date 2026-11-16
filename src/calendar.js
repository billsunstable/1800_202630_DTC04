
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
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
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


// Convert a YYYY/MM/DD date into its actual weekday.

function getWeekdayFromDate(taskDay) {

    if (!taskDay) {
        console.warn("Task has no task_day value.");
        return null;
    }

    let date;

    // If the value is a Firestore Timestamp.
    if (typeof taskDay.toDate === "function") {

        date = taskDay.toDate();

    }

    // If the value is already a JavaScript Date.
    else if (taskDay instanceof Date) {

        date = taskDay;

    }

    // If the value is a string.
    else if (typeof taskDay === "string") {

        const parts = taskDay.split(/[-/]/).map(Number);

        if (parts.length !== 3) {
            console.warn("Invalid task_day format:", taskDay);
            return null;
        }

        const [year, month, day] = parts;

        date = new Date(year, month - 1, day);

        if (
            date.getFullYear() !== year ||
            date.getMonth() !== month - 1 ||
            date.getDate() !== day
        ) {
            console.warn("Invalid task_day date:", taskDay);
            return null;
        }

    }

    else {

        console.warn("Unsupported task_day type:", taskDay);
        return null;

    }

    // Convert JavaScript weekday into Monday-Sunday order.
    const weekdayIndex = date.getDay();

    return weekdays[weekdayIndex];

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

        // Match each task to its actual weekday using task_day.
        tasks.forEach(task => {

            const taskDay = getWeekdayFromDate(task.task_day);

            const dayIndex = weekdays.indexOf(taskDay);

            // Ignore tasks with invalid dates.
            if (dayIndex === -1) {

                console.warn("Invalid task date:", task.task_day);

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


// Wait for Firebase authentication.
onAuthStateChanged(auth, async (user) => {

    if (user) {

        await displayCalendarDynamically(user.uid);

    } else {

        console.log("User is not logged in.");

    }

});