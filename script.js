// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Universal message display function
    window.displayMessage = function(msg, type, targetElementId = 'message') {
        const messageDiv = document.getElementById(targetElementId);
        if (messageDiv) {
            messageDiv.textContent = msg;
            messageDiv.className = `message ${type}`;
            messageDiv.style.display = 'block';
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000); // Hide after 5 seconds
        } else {
            console.warn(`Message target element with ID '${targetElementId}' not found.`);
        }
    };

    // --- User Authentication Simulation ---
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userEmail = localStorage.getItem('userEmail');

    window.checkLoginStatus = function() {
        return isLoggedIn;
    };

    window.getUserEmail = function() {
        return userEmail;
    };

    window.logoutUser = function() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userGreenPoints'); // Clear points on logout for demo
        localStorage.removeItem('pickupCount');
        localStorage.removeItem('tutorialCount');
        localStorage.removeItem('wasteRecycled');
        localStorage.removeItem('totalPlasticRecycled');
        localStorage.removeItem('totalEwasteRecycled');
        localStorage.removeItem('totalBottlesRecycled');
        localStorage.removeItem('recentActivities');
        window.location.href = 'index.html'; // Redirect to home after logout
    };

    // Update navigation based on login status
    const navUl = document.querySelector('.header nav ul');
    if (navUl) {
        // Remove existing login/register links if they exist
        const loginLink = navUl.querySelector('a[href="login.html"]');
        const registerLink = navUl.querySelector('a[href="register.html"]');
        if (loginLink) loginLink.parentElement.remove();
        if (registerLink) registerLink.parentElement.remove();


        // Also remove any links from previous combined pages if they exist
        const leaderboardLink = navUl.querySelector('a[href="leaderboard.html"]');
        if (leaderboardLink) leaderboardLink.parentElement.remove();

        const sortingGuideLink = navUl.querySelector('a[href="sorting_guide.html"]');
        if (sortingGuideLink) sortingGuideLink.parentElement.remove();

        const communityMapLink = navUl.querySelector('a[href="map.html"]');
        if (communityMapLink) communityMapLink.parentElement.remove();


        if (isLoggedIn) {
            // Add Dashboard and Logout links
            const dashboardLi = document.createElement('li');
            dashboardLi.innerHTML = `<a href="dashboard.html">Dashboard</a>`;
            navUl.appendChild(dashboardLi);

            const logoutLi = document.createElement('li');
            logoutLi.innerHTML = `<a href="#" id="logoutButton">Logout</a>`;
            navUl.appendChild(logoutLi);

            const logoutButton = document.getElementById('logoutButton');
            if (logoutButton) {
                logoutButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.logoutUser();
                });
            }
        } else {
            // Add a single Login link that goes to the combined page
            const loginLi = document.createElement('li');
            loginLi.innerHTML = `<a href="login.html">Login/Register</a>`; // Updated text
            navUl.appendChild(loginLi);
        }
    }


    // Highlight active navigation link
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.header nav ul li a');
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        // Handle index.html or empty path for home
        if (linkHref === currentPath || (currentPath === '' && linkHref === 'index.html')) {
            link.classList.add('active');
        } else if (currentPath === 'dashboard.html' && linkHref === 'index.html' && isLoggedIn) {
             // If logged in and on dashboard, don't highlight index.html
        } else if (currentPath === 'login.html' && linkHref.includes('login.html')) {
            // Special handling for combined login/register page
            link.classList.add('active');
        }
    });

    // --- Geolocation Function (used on pickup.html) ---
    window.handleGetLocation = function(locationInputId, locationDisplayId, messageTargetId) {
        const locationInput = document.getElementById(locationInputId);
        const locationDisplay = document.getElementById(locationDisplayId);
        if (!locationInput || !locationDisplay) {
            console.error("Location input or display element not found for geolocation.");
            return;
        }

        if (navigator.geolocation) {
            locationDisplay.textContent = 'Fetching your current location...';
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    locationInput.value = `Lat: ${lat}, Lon: ${lon}`;
                    locationDisplay.textContent = `Location retrieved: ${lat}, ${lon}`;
                    window.displayMessage('Location successfully retrieved!', 'success', messageTargetId);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    let errorMessage = 'Could not get location. Please enter manually.';
                    if (error.code === error.PERMISSION_DENIED) {
                        errorMessage = 'Location access denied. Please allow location in browser settings.';
                    } else if (error.code === error.POSITION_UNAVAILABLE) {
                        errorMessage = 'Location information unavailable.';
                    } else if (error.code === error.TIMEOUT) {
                        errorMessage = 'Getting location timed out. Please try again.';
                    }
                    locationDisplay.textContent = errorMessage;
                    window.displayMessage(errorMessage, 'error', messageTargetId);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            locationDisplay.textContent = 'Geolocation is not supported by this browser.';
            window.displayMessage('Geolocation not supported by your browser.', 'error', messageTargetId);
        }
    };

    // --- Simulate User Points & Waste Tracking ---
    window.userGreenPoints = localStorage.getItem('userGreenPoints') ? parseInt(localStorage.getItem('userGreenPoints')) : 0;
    window.wasteRecycled = localStorage.getItem('wasteRecycled') ? parseFloat(localStorage.getItem('wasteRecycled')) : 0;
    window.totalPlasticRecycled = localStorage.getItem('totalPlasticRecycled') ? parseFloat(localStorage.getItem('totalPlasticRecycled')) : 0;
    window.totalEwasteRecycled = localStorage.getItem('totalEwasteRecycled') ? parseFloat(localStorage.getItem('totalEwasteRecycled')) : 0;
    window.totalBottlesRecycled = localStorage.getItem('totalBottlesRecycled') ? parseFloat(localStorage.getItem('totalBottlesRecycled')) : 0;
    window.recentActivities = localStorage.getItem('recentActivities') ? JSON.parse(localStorage.getItem('recentActivities')) : [];


    window.updateGreenPointsDisplay = function() {
        const pointsDisplayElements = document.querySelectorAll('#greenPointsDisplay');
        pointsDisplayElements.forEach(el => {
            if (el) {
                el.textContent = `Your Green Points: ${window.userGreenPoints}`;
            }
        });
        localStorage.setItem('userGreenPoints', window.userGreenPoints);
    };

    window.addGreenPoints = function(points) {
        window.userGreenPoints += points;
        window.updateGreenPointsDisplay();
    };

    window.redeemGreenPoints = function(pointsToDeduct) {
        if (window.userGreenPoints >= pointsToDeduct) {
            window.userGreenPoints -= pointsToDeduct;
            window.updateGreenPointsDisplay();
            return true; // Success
        }
        return false; // Not enough points
    };

    // New: Update waste recycled amounts and add activity
    window.updateWasteRecycled = function(type, amountKg) {
        window.wasteRecycled += amountKg;
        localStorage.setItem('wasteRecycled', window.wasteRecycled);

        switch (type) {
            case 'plastic':
                window.totalPlasticRecycled += amountKg;
                localStorage.setItem('totalPlasticRecycled', window.totalPlasticRecycled);
                break;
            case 'e-waste':
                window.totalEwasteRecycled += amountKg;
                localStorage.setItem('totalEwasteRecycled', window.totalEwasteRecycled);
                break;
            case 'bottles':
                window.totalBottlesRecycled += amountKg;
                localStorage.setItem('totalBottlesRecycled', window.totalBottlesRecycled);
                break;
        }
    };

    window.addActivity = function(description) {
        const now = new Date();
        const dateString = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const activity = {
            date: `${dateString} ${timeString}`,
            description: description
        };
        window.recentActivities.push(activity);
        // Keep only the last 10 activities to prevent localStorage from growing too large
        if (window.recentActivities.length > 10) {
            window.recentActivities = window.recentActivities.slice(-10);
        }
        localStorage.setItem('recentActivities', JSON.stringify(window.recentActivities));
    };


    // Initial update of points display on page load if needed
    window.updateGreenPointsDisplay();
});