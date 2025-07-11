document.addEventListener('DOMContentLoaded', () => {
    const passengerCountSpan = document.getElementById('passenger-count');
    const minusBtn = document.getElementById('minus-btn');
    const plusBtn = document.getElementById('plus-btn');
    const saveRouteBtn = document.getElementById('save-route-btn');
    const sendDataBtn = document.getElementById('send-data-btn');
    const routeDisplay = document.getElementById('route-display');
    const alertMessage = document.getElementById('alert-message');
    const currentSpeedSpan = document.getElementById('current-speed');
    const timeSpan = document.getElementById('time');
    const mapArea = document.getElementById('map-area'); // Get map area
    const placeholderMapImg = document.getElementById('placeholder-map-img'); // Get the image element

    let passengerCount = 1;
    let routeSaved = false;

    // Update time display
    function updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeSpan.textContent = `${hours}:${minutes} NZST`; // Added NZST based on current location
    }
    setInterval(updateTime, 1000); // Update every second
    updateTime(); // Initial call

    // Simulate speed change
    let currentSpeed = 0;
    setInterval(() => {
        currentSpeed = Math.min(120, currentSpeed + Math.floor(Math.random() * 5)); // Increase speed randomly
        currentSpeedSpan.textContent = `Speed: ${currentSpeed} km/h`;
        if (currentSpeed >= 120) { // Simulate reaching max speed and slowing down
            currentSpeed = 0;
        }
    }, 2000);

    minusBtn.addEventListener('click', () => {
        if (passengerCount > 1) {
            passengerCount--;
            passengerCountSpan.textContent = passengerCount;
        }
    });

    plusBtn.addEventListener('click', () => {
        passengerCount++;
        passengerCountSpan.textContent = passengerCount;
    });

    saveRouteBtn.addEventListener('click', () => {
        routeSaved = true;
        routeDisplay.textContent = 'Route: Daily Commute (Saved!)';
        showAlert('Route Saved Successfully!');

        // --- FIX STARTS HERE ---
        // 1. Hide the <img> placeholder
        placeholderMapImg.style.display = 'none';

        // 2. Set the background image on the map-area div
        mapArea.style.backgroundImage = "url('map_route_example.jpg')"; // Use .jpg as per your uploaded file
        mapArea.style.backgroundSize = 'cover';
        mapArea.style.backgroundPosition = 'center'; // Center the image
        mapArea.style.backgroundRepeat = 'no-repeat';
        // --- FIX ENDS HERE ---
    });

    sendDataBtn.addEventListener('click', () => {
        if (routeSaved) {
            showAlert(`Sending data: Route 'Daily Commute', Passengers: ${passengerCount}. Data sent!`);
            console.log(`Sending data to CTMS: Route 'Daily Commute', Passengers: ${passengerCount}`);
        } else {
            showAlert('Please save a route first!', 'red');
        }
    });

    function showAlert(message, color = 'rgba(0, 150, 0, 0.8)') { // Default green for success
        alertMessage.textContent = message;
        alertMessage.style.backgroundColor = color;
        alertMessage.style.display = 'block';
        setTimeout(() => {
            alertMessage.style.display = 'none';
        }, 3000); // Hide after 3 seconds
    }

    // --- Example of a simulated alert (e.g., accident) ---
    setTimeout(() => {
        showAlert('ACCIDENT AHEAD! Rerouting initiated.', 'rgba(255, 0, 0, 0.8)');
        routeDisplay.textContent = 'Route: Rerouted (Accident Ahead)';
        // Ensure placeholder image is hidden if this alert also changes the map background
        placeholderMapImg.style.display = 'none';
        mapArea.style.backgroundImage = "url('map_route_example.jpg')"; // Or another map for reroute
        mapArea.style.backgroundSize = 'cover';
        mapArea.style.backgroundPosition = 'center';
        mapArea.style.backgroundRepeat = 'no-repeat';
    }, 10000); // Trigger an alert after 10 seconds for demo
});