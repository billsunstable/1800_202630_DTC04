import { db } from "./firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";

const params = new URL(window.location.href).searchParams;
const taskId = params.get("docID");

// Fetch the task and display its info using classes
async function displayCalendar() {
    try {
        const taskRef = doc(db, "days", taskId);
        const taskSnap = await getDoc(taskRef);

        const task = taskSnap.data();
        const name = task.name;
        const day = task.date;

        // Update the page using class selectors (notice the dots '.')
        document.querySelector('.calendarName').textContent = name;
        document.querySelector('.calendarDay').textContent = day;

    } catch (error) {
        console.error("Error loading task:", error);
        const nameEl = document.querySelector('.calendarName');
        if (nameEl) nameEl.textContent = "Error loading task.";
    }
}

displayCalendar();