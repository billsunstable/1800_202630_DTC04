import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import './loginSignup.js';
import '../styles/style.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from './firebaseConfig.js';
import { getAuth, onAuthStateChanged } from "firebase/auth";

const auth = getAuth();
let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
    } else {
        location.href = "index.html";
    }
});

async function saveTask(event) {
    event.preventDefault();

    if (!currentUser) {
        alert("You must be logged in to add a task.");
        return;
    }

    const newTask = {
        name: document.getElementById("taskNameInput").value,
        task_day: document.getElementById("dateInput") ? document.getElementById("dateInput").value : "",
        task_time: document.getElementById("timeInput").value,
        details: document.getElementById("detailsInput").value,
        last_updated: serverTimestamp()
    };

    try {
        const userTasksRef = collection(db, "users", currentUser.uid, "tasks");
        await addDoc(userTasksRef, newTask);
        location.href = "tasks.html";
    } catch (error) {
        console.error("Error saving task:", error);
        alert(`Error saving task:\n${error.message}`);
    }
}

const formElement = document.getElementById("addTaskForm");
if (formElement) {
    formElement.addEventListener("submit", saveTask);
}
