import { db, auth } from "./firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const params = new URL(window.location.href).searchParams;
const taskId = params.get("docID");

// Fetch the task and display its information.
async function displayCalendar(user) {

    try {

        const userID = user.uid;

        // Retrieve the task from the user's tasks collection.
        const taskRef = doc(db, "users", userID, "tasks", taskId);

        const taskSnap = await getDoc(taskRef);

        if (!taskSnap.exists()) {

            console.error("Task does not exist.");

            document.querySelector('.calendarName').textContent =
                "Task not found.";

            return;
        }

        const task = taskSnap.data();

        const name = task.name;
        const day = task.date;

        // Display the task information.
        document.querySelector('.calendarName').textContent = name;
        document.querySelector('.calendarDay').textContent = day;

    } catch (error) {

        console.error("Error loading task:", error);

        const nameEl = document.querySelector('.calendarName');

        if (nameEl) {
            nameEl.textContent = "Error loading task.";
        }
    }
}

// Wait for Firebase authentication.
onAuthStateChanged(auth, (user) => {

    if (user) {

        displayCalendar(user);

    } else {

        console.log("User is not logged in.");

    }

});