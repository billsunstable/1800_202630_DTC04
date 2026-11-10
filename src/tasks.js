import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import './loginSignup.js';
import '../styles/style.css';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db } from './firebaseConfig.js';
import { getAuth, onAuthStateChanged } from "firebase/auth";

const auth = getAuth();

// Wait for authentication so we know which user's tasks to fetch
onAuthStateChanged(auth, (user) => {
    if (user) {
        init(user.uid);
    } else {
        location.href = "index.html";
    }
});

async function addTaskData(userId) {
    const userTasksRef = collection(db, "users", userId, "tasks");
    await addDoc(userTasksRef, {
        name: "Task #1",
        details: "Sample task details...",
        task_day: "2026-11-09",
        task_time: "12:00",
        last_updated: serverTimestamp()
    });
    await addDoc(userTasksRef, {
        name: "Task #2",
        details: "Sample task details...",
        task_day: "2026-11-09",
        task_time: "12:00",
        last_updated: serverTimestamp()
    });
}

async function seedTasks(userId) {
    const userTasksRef = collection(db, "users", userId, "tasks");
    const querySnapshot = await getDocs(userTasksRef);

    if (querySnapshot.empty) {
        await addTaskData(userId);
    }
}

async function displayCardsDynamically(userId) {
    let cardTemplate = document.getElementById("taskCardTemplate");
    let container = document.getElementById("tasks-go-here");

    if (!cardTemplate || !container) {
        console.error("Template or container element not found in HTML!");
        return;
    }

    try {
        // Query only this specific user's tasks subcollection
        const userTasksRef = collection(db, "users", userId, "tasks");
        const q = query(userTasksRef, orderBy("last_updated", "desc"));
        const querySnapshot = await getDocs(q);

        container.innerHTML = "";

        querySnapshot.forEach(taskDoc => {
            let newcard = cardTemplate.content.cloneNode(true);
            const task = taskDoc.data();

            newcard.querySelector('.card-title').textContent = task.name;
            newcard.querySelector('.card-text').textContent = task.details;
            newcard.querySelector('.card-day').textContent = task.task_day || "00/00/00";
            newcard.querySelector('.card-time').textContent = task.task_time || "00:00";

            let editBtn = newcard.querySelector('a');
            if (editBtn) {
                editBtn.href = `eachTask.html?docID=${taskDoc.id}`;
            }

            container.appendChild(newcard);
        });
    } catch (error) {
        console.error("Error getting documents: ", error);
    }
}

async function init(userId) {
    await seedTasks(userId);
    await displayCardsDynamically(userId);
}
