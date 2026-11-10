import 'bootstrap/dist/css/bootstrap.min.css';

import {
    loginUser,
    signupUser,
    authErrorMessage,
} from './authentication.js';


// --- Login and Signup Page ---
function initAuthUI() {

    // --- DOM Elements ---
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    const redirectUrl = 'main.html';

    // --- Helper Functions ---

    // Create and display an alert message
    function showError(form, msg) {
        let alertEl = document.getElementById('authAlert');

        if (!alertEl) {
            alertEl = document.createElement('div');
            alertEl.id = 'authAlert';
            alertEl.className = 'alert alert-danger d-none';

            form.parentElement.insertBefore(alertEl, form);
        }

        alertEl.textContent = msg || '';
        alertEl.classList.remove('d-none');
    }

    // Hide alert message
    function hideError() {
        const alertEl = document.getElementById('authAlert');

        if (alertEl) {
            alertEl.classList.add('d-none');
            alertEl.textContent = '';
        }
    }

    // Enable/disable submit button
    function setSubmitDisabled(form, disabled) {
        const submitBtn = form?.querySelector('[type="submit"]');

        if (submitBtn) {
            submitBtn.disabled = disabled;
        }
    }


    // --- Login Form Submit ---
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();

        const email = document.getElementById('loginEmail')?.value.trim() ?? '';
        const password = document.getElementById('loginPassword')?.value ?? '';

        if (!email || !password) {
            showError(loginForm, 'Please enter your email and password.');
            return;
        }

        setSubmitDisabled(loginForm, true);

        try {
            const userCredential = await loginUser(email, password);

            console.log('Login successful:', userCredential.user.uid);
            console.log('Current auth user:', userCredential.user);

            window.location.assign('./main.html');

        } catch (err) {
            showError(loginForm, authErrorMessage(err));
            console.error(err);

        } finally {
            setSubmitDisabled(loginForm, false);
        }
    });


    // --- Signup Form Submit ---
    signupForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();

        const name = document.getElementById('fullName')?.value.trim() ?? '';
        const email = document.getElementById('email')?.value.trim() ?? '';
        const password = document.getElementById('password')?.value ?? '';
        const confirmPassword = document.getElementById('confirmPassword')?.value ?? '';

        if (!name || !email || !password || !confirmPassword) {
            showError(signupForm, 'Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            showError(signupForm, 'Passwords do not match.');
            return;
        }

        if (password.length < 8) {
            showError(signupForm, 'Password must be at least 8 characters.');
            return;
        }

        setSubmitDisabled(signupForm, true);

        try {
            await signupUser(name, email, password);

            location.href = redirectUrl;

        } catch (err) {
            showError(signupForm, authErrorMessage(err));
            console.error(err);

        } finally {
            setSubmitDisabled(signupForm, false);
        }
    });

}


// --- Initialize UI on DOMContentLoaded ---
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthUI);
} else {
    initAuthUI();
}