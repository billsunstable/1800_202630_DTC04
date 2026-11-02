
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import './loginSignup.js';
import '../styles/style.css';

import { collection, getDocs, addDoc, serverTimestamp, query } from "firebase/firestore";
import { db } from './firebaseConfig.js';

// Helper function to add the sample task documents.
async function addCalendarData() {
    const taskRef = collection(db, "days");

    console.log("Adding sample task data...");

    await addDoc(taskRef, {
        name: "Monday",
        date: "Nov 2",
        last_updated: serverTimestamp()
    });

    await addDoc(taskRef, {
        name: "Tuesday",
        date: "Nov 3",
        last_updated: serverTimestamp()
    });

    await addDoc(taskRef, {
        name: "Wednesday",
        date: "Nov 4",
        last_updated: serverTimestamp()
    });
    
}

// Seeds the "days" collection with initial data if it is empty
async function seedTasks() {
    const taskRef = collection(db, "days");
    const querySnapshot = await getDocs(taskRef);

    if (querySnapshot.empty) {
        console.log("Collection is empty. Adding sample data...");
        await addCalendarData();
    } else {
        console.log("Calendar data already exists.");
    }
}

async function displayCalendarDynamically() {
    let cardTemplate = document.getElementById("calendarCardTemplate");
    const tasksCollectionRef = collection(db, "days");

    try {
        // Get all calendar documents
        const q = query(tasksCollectionRef);
        const querySnapshot = await getDocs(q);

        let container = document.getElementById("calendar-go-here");
        container.innerHTML = "";

        querySnapshot.forEach(taskDoc => {
            let newcard = cardTemplate.content.cloneNode(true);
            const task = taskDoc.data();

            newcard.querySelector('.calendar-title').textContent = task.name;
            newcard.querySelector('.calendar-day').textContent = task.date;
            newcard.querySelector(".read-more").href = `eachCalendar.html?docID=${taskDoc.id}`;

            container.appendChild(newcard);
        });

    } catch (error) {
        console.error("Error getting documents: ", error);
    }
}

// Call seed first, then display cards once seeding completes
seedTasks().then(() => {
    displayCalendarDynamically();
});
