
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal } from 'bootstrap';

import './loginSignup.js';
import '../styles/style.css';

import { db, auth } from './firebaseConfig.js';

import { onAuthStateChanged } from 'firebase/auth';

import {
    collection,
    getDocs,
    query
} from "firebase/firestore";


// Calendar Variables

// Store the currently displayed week.
let currentWeekStart = getSunday(new Date());

// Store all tasks retrieved from Firestore.
let allTasks = [];

// Bootstrap task details popup.
const taskModalElement = document.getElementById("taskDetailsModal");

const taskModal = new Modal(taskModalElement);


// Date Functions

// Get Monday of the week containing a given date.
function getSunday(date) {

    const sunday = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

    const day = sunday.getDay();

    sunday.setDate(sunday.getDate() - day);

    return sunday;
}


// Convert date into YYYY-MM-DD.
function formatDateKey(date) {

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, '0');

    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}


// Convert Firestore task_day into a JavaScript Date.
function convertTaskDate(taskDay) {

    if (!taskDay || typeof taskDay !== "string") {
        console.warn("Invalid task date:", taskDay);
        return null;
    }

    const parts = taskDay.split("-").map(Number);

    if (parts.length !== 3) {
        console.warn("Invalid task date:", taskDay);
        return null;
    }

    const [year, month, day] = parts;

    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        console.warn("Invalid task date:", taskDay);
        return null;
    }

    return date;
}


// Format a date for display.
function formatDisplayDate(date) {

    return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

}


// Format 24-hour time into 12-hour time.
function formatTaskTime(time) {

    if (!time) {
        return "No time specified";
    }

    const parts = time.split(":");

    if (parts.length !== 2) {
        return time;
    }

    const hours = Number(parts[0]);

    const minutes = Number(parts[1]);

    if (
        !Number.isInteger(hours) ||
        !Number.isInteger(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
    ) {
        return time;
    }

    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
    });

}

// Week Heading

function updateWeekHeading() {

    const heading = document.getElementById("current-week");

    const weekEnd = new Date(currentWeekStart);

    weekEnd.setDate(weekEnd.getDate() + 6);

    const options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };

    const startText = currentWeekStart.toLocaleDateString(
        'en-GB',
        options
    );

    const endText = weekEnd.toLocaleDateString(
        'en-GB',
        options
    );

    heading.textContent = `${startText} - ${endText}`;

}


// Generate Calendar day

function generateCalendar() {

    const container = document.getElementById("calendar-go-here");

    const template = document.getElementById("calendarCardTemplate");

    container.innerHTML = "";

    const weekdays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    // Get today's actual date.
    const todayKey = formatDateKey(new Date());

    weekdays.forEach((day, index) => {

        const newCard = template.content.cloneNode(true);

        const actualDate = new Date(currentWeekStart);

        actualDate.setDate(currentWeekStart.getDate() + index);

        const actualDateKey = formatDateKey(actualDate);

        const card = newCard.querySelector(".day-card");

        const header = newCard.querySelector(".card-header");

        // Display weekday.
        newCard.querySelector(".calendar-title").textContent = day;

        // Display actual date.
        newCard.querySelector(".calendar-day").textContent =
            actualDate.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

        // Store actual date for task matching.
        newCard.querySelector(".day-tasks").dataset.date =
            actualDateKey;

        // Highlight today's date.
        if (actualDateKey === todayKey) {

            card.classList.add("today-card");

            header.classList.remove("bg-dark");

            header.classList.add("today-header");

            newCard.querySelector(".calendar-title").textContent =
                `${day} • TODAY`;

        }

        container.appendChild(newCard);

    });

}


// Task details pop up

function openTaskDetails(task) {

    const taskDate = convertTaskDate(task.task_day);

    document.getElementById("modal-task-name").textContent =
        task.name || "Untitled Task";

    document.getElementById("modal-task-date").textContent =
        taskDate ? formatDisplayDate(taskDate) : "Unknown date";

    document.getElementById("modal-task-time").textContent =
        formatTaskTime(task.task_time);

    document.getElementById("modal-task-details").textContent =
        task.details || "No additional details provided.";

    // Open Bootstrap modal.
    taskModal.show();

}


// Display tasks

function displayCalendar() {

    // Generate the seven days.
    generateCalendar();

    // Update the displayed week.
    updateWeekHeading();

    const dayContainers = document.querySelectorAll(".day-tasks");

    // Loop through every Firestore task.
    allTasks.forEach(task => {

        const taskDate = convertTaskDate(task.task_day);

        if (!taskDate) {
            return;
        }

        const taskDateKey = formatDateKey(taskDate);

        // Find the day matching the complete date.
        const dayContainer = Array.from(dayContainers).find(
            container => container.dataset.date === taskDateKey
        );

        // Skip tasks outside the displayed week.
        if (!dayContainer) {
            return;
        }

        // Create task card

        const taskCard = document.createElement("div");

        taskCard.className = "card mb-2 p-2 task-card";

        taskCard.style.cursor = "pointer";

        taskCard.setAttribute("role", "button");

        taskCard.setAttribute("tabindex", "0");

        taskCard.setAttribute(
            "aria-label",
            `View task: ${task.name || "Untitled Task"}`
        );

        // Task name.
        const taskName = document.createElement("h6");

        taskName.className = "mb-1 fw-semibold";

        taskName.textContent = task.name || "Untitled Task";

        // Task time.
        const taskTime = document.createElement("small");

        taskTime.className = "text-muted";

        taskTime.textContent = formatTaskTime(task.task_time);

        taskCard.appendChild(taskName);

        taskCard.appendChild(taskTime);

        // Open details when clicked.
        taskCard.addEventListener("click", () => {

            openTaskDetails(task);

        });

        // Also support keyboard access.
        taskCard.addEventListener("keydown", (event) => {

            if (event.key === "Enter" || event.key === " ") {

                event.preventDefault();

                openTaskDetails(task);

            }

        });

        // Add task to the correct date.
        dayContainer.appendChild(taskCard);

    });


    // Update task indicators

    dayContainers.forEach(dayContainer => {

        const taskCount = dayContainer.children.length;

        const indicator = dayContainer
            .closest(".day-card")
            .querySelector(".task-indicator");

        if (taskCount > 0) {

            indicator.textContent =
                `${taskCount} ${taskCount === 1 ? "task" : "tasks"}`;

            indicator.classList.remove("d-none");

        }

        else {

            indicator.classList.add("d-none");

        }

    });

}


// Sort tasks by time

function sortTasks() {

    allTasks.sort((a, b) => {

        return (a.task_time || "23:59").localeCompare(
            b.task_time || "23:59"
        );

    });

}


// Load tasks from firestore

async function loadTasks(userID) {

    try {

        const tasksRef = collection(
            db,
            "users",
            userID,
            "tasks"
        );

        const q = query(tasksRef);

        const querySnapshot = await getDocs(q);

        allTasks = [];

        querySnapshot.forEach(taskDoc => {

            allTasks.push({
                id: taskDoc.id,
                ...taskDoc.data()
            });

        });

        sortTasks();

        displayCalendar();

    }

    catch (error) {

        console.error("Error loading calendar tasks:", error);

    }

}


// Week Navigation

// Previous week.
document.getElementById("previous-week").addEventListener("click", () => {

    currentWeekStart.setDate(currentWeekStart.getDate() - 7);

    displayCalendar();

});


// Current week.
document.getElementById("this-week").addEventListener("click", () => {

    currentWeekStart = getSunday(new Date());

    displayCalendar();

});


// Next week.
document.getElementById("next-week").addEventListener("click", () => {

    currentWeekStart.setDate(currentWeekStart.getDate() + 7);

    displayCalendar();

});


// Firebase Authentication

onAuthStateChanged(auth, (user) => {

    if (user) {

        loadTasks(user.uid);

    }

    else {

        location.href = "index.html";

    }

});
