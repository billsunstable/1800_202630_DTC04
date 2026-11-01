import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import './loginSignup.js';
import '../styles/style.css';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore"; // Added query and orderBy
import { db } from './firebaseConfig.js';

// Helper function to add the sample task documents.
function addTaskData() {
    const taskRef = collection(db, "tasks");
    console.log("Adding sample task data...");
    addDoc(taskRef, {
        code: "T01", name: "Task #1",
        details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        task_day: "00/00/00", task_time: "00:00",
        last_updated: serverTimestamp()
    });
    addDoc(taskRef, {
        code: "T02", name: "Task #2",
        details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        task_day: "00/00/00", task_time: "00:00",
        last_updated: serverTimestamp()
    });
    addDoc(taskRef, {
        code: "T03", name: "Task #3",
        details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        task_day: "00/00/00", task_time: "00:00",
        last_updated: serverTimestamp()
    });
}

// Seeds the "tasks" collection with initial data if it is empty
async function seedTasks() {
    const taskRef = collection(db, "tasks");
    const querySnapshot = await getDocs(taskRef);

    if (querySnapshot.empty) {
        console.log("Tasks collection is empty. Seeding data...");
        addTaskData();
    } else {
        console.log("Tasks collection already contains data. Skipping seed.");
    }
}

async function displayCardsDynamically() {
    let cardTemplate = document.getElementById("taskCardTemplate");
    const tasksCollectionRef = collection(db, "tasks");

    try {
        // Create a sorted query by the 'code' field
        const q = query(tasksCollectionRef, orderBy("code"));
        const querySnapshot = await getDocs(q); // Pass the query 'q' here instead of just the collection ref

        let container = document.getElementById("tasks-go-here");
        container.innerHTML = ""; // Clears container to prevent duplicate cards

        querySnapshot.forEach(taskDoc => {
            let newcard = cardTemplate.content.cloneNode(true);
            const task = taskDoc.data();

            newcard.querySelector('.card-title').textContent = task.name;
            newcard.querySelector('.card-text').textContent = task.details;
            newcard.querySelector('.card-day').textContent = task.task_day;
            newcard.querySelector('.card-time').textContent = task.task_time;
            newcard.querySelector(".read-more").href = `eachTask.html?docID=${taskDoc.id}`;

            container.appendChild(newcard);
        });
    } catch (error) {
        console.error("Error getting documents: ", error);
    }
}

// Call seed first, then display cards once seeding completes
seedTasks().then(() => {
    displayCardsDynamically();
});