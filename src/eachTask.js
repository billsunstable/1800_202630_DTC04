import { db } from "./firebaseConfig.js";
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const auth = getAuth();
const params = new URL(window.location.href).searchParams;
const taskId = params.get("docID");

console.log("Task ID from URL:", taskId);

let activeUserId = null; // 🔑 Declare activeUserId here

// Wait for Firebase auth state before trying to load data
onAuthStateChanged(auth, (user) => {
    if (user) {
        activeUserId = user.uid;
        displayTaskInfo();
    } else {
        location.href = "index.html";
    }
});

// 1. Fetch task data and pre-fill the form inputs
async function displayTaskInfo() {
    try {
        // 🔑 Point to the user's subcollection path
        const taskRef = doc(db, "users", activeUserId, "tasks", taskId);
        const taskSnap = await getDoc(taskRef);

        if (!taskSnap.exists()) {
            console.error("No such task found!");
            alert("Task not found.");
            location.href = "tasks.html";
            return;
        }

        const task = taskSnap.data();

        // Populate the input fields with existing database values
        document.getElementById("taskNameInput").value = task.name || "";
        document.getElementById("detailsInput").value = task.details || "";
        document.getElementById("dateInput").value = task.task_day || "";
        document.getElementById("timeInput").value = task.task_time || "";

    } catch (error) {
        console.error("Error loading task:", error);
    }
}

// 2. Handle saving updates when the form is submitted
async function updateTask(event) {
    event.preventDefault();

    const updatedData = {
        name: document.getElementById("taskNameInput").value,
        details: document.getElementById("detailsInput").value,
        task_day: document.getElementById("dateInput").value,
        task_time: document.getElementById("timeInput").value,
        last_updated: serverTimestamp()
    };

    try {
        // 🔑 Point to the user's subcollection path for updating
        const taskRef = doc(db, "users", activeUserId, "tasks", taskId);
        await updateDoc(taskRef, updatedData);
        alert("Task updated successfully!");
        location.href = "tasks.html";
    } catch (error) {
        console.error("Error updating task:", error);
        alert("Failed to update task.");
    }
}

// 3. Delete Task Function
async function deleteTask() {
    if (confirm("Are you sure you want to delete this task?")) {
        try {
            // 🔑 Point to the user's subcollection path for deletion
            const taskRef = doc(db, "users", activeUserId, "tasks", taskId);
            await deleteDoc(taskRef);
            location.href = "tasks.html";
        } catch (error) {
            console.error("Error deleting task:", error);
            alert("Failed to delete task.");
        }
    }
}

// Attach event listeners
const editForm = document.getElementById("editTaskForm");
if (editForm) {
    editForm.addEventListener("submit", updateTask);
}

const deleteBtn = document.getElementById("deleteBtn");
if (deleteBtn) {
    deleteBtn.addEventListener("click", deleteTask);
}