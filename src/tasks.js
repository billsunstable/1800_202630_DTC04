import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import './loginSignup.js';
import '../styles/style.css';
import { collection, getDocs, doc, updateDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
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

            // 🔑 12-hour time conversion
            let formattedTime = "00:00";
            if (task.task_time) {
                let [hours, minutes] = task.task_time.split(':');
                let h = parseInt(hours, 10);
                let ampm = h >= 12 ? 'PM' : 'AM';
                h = h % 12 || 12;
                formattedTime = `${h}:${minutes} ${ampm}`;
            }
            newcard.querySelector('.card-time').textContent = formattedTime;

            let editBtn = newcard.querySelector('a');
            if (editBtn) {
                editBtn.href = `eachTask.html?docID=${taskDoc.id}`;
            }

            // Handle checkbox status and Firebase update (INSIDE the loop)
            const checkbox = newcard.querySelector('.task-checkbox');
            const statusBadge = newcard.querySelector('.task-status');

            checkbox.checked = task.completed || false;
            statusBadge.textContent = task.completed ? "Complete" : "Incomplete";
            statusBadge.className = task.completed ? "badge bg-success text-white task-status" : "badge bg-danger text-white task-status";

            checkbox.addEventListener('change', async () => {
                const checkedState = checkbox.checked;
                statusBadge.textContent = checkedState ? "Complete" : "Incomplete";
                statusBadge.className = checkedState ? "badge bg-success text-white task-status" : "badge bg-danger text-white task-status";

                const taskRef = doc(db, "users", userId, "tasks", taskDoc.id);
                await updateDoc(taskRef, {
                    completed: checkedState,
                    last_updated: serverTimestamp()
                });
            });

            container.appendChild(newcard);
        });

    } catch (error) {
        console.error("Error getting documents: ", error);
    }
}

async function init(userId) {
    await displayCardsDynamically(userId);
}