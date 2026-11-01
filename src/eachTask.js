import { db } from "./firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";

const params = new URL(window.location.href).searchParams;
const taskId = params.get("docID");

// Fetch the task and display its info using classes
async function displayTaskInfo() {
    try {
        const taskRef = doc(db, "tasks", taskId);
        const taskSnap = await getDoc(taskRef);

        if (!taskSnap.exists()) {
            console.error("No such task found!");
            return;
        }

        const task = taskSnap.data();
        const name = task.name;
        const info = task.details;
        const day = task.task_day;
        const time = task.task_time;

        // Update the page using class selectors (notice the dots '.')
        document.querySelector('.taskName').textContent = name;
        document.querySelector('.taskInfo').textContent = info;
        document.querySelector('.taskDay').textContent = day;
        document.querySelector('.taskTime').textContent = time;

    } catch (error) {
        console.error("Error loading task:", error);
        const nameEl = document.querySelector('.taskName');
        if (nameEl) nameEl.textContent = "Error loading task.";
    }
}

displayTaskInfo();