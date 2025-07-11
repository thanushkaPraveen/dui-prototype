// --- GLOBAL VARIABLES (Must be at the very top of your script.js file) ---
// These variables need to be accessible by initMap and other functions.
let map;
let directionsService;
let directionsRenderer;

let originPoint = null;
let destinationPoint = null;
let originMarker = null;
let destinationMarker = null;

// Declare element references globally so all functions can access them
let passengerCountSpan;
let minusBtn;
let plusBtn;
let saveRouteBtn;
let sendDataBtn;
let routeDisplay;
let alertMessage;
let currentSpeedSpan;
let timeSpan;
let savedRoutesDropdown;
let clearRouteBtn;

// --- END GLOBAL VARIABLES ---

// initMap is the callback function specified in the Google Maps API script URL.
// It runs once the Google Maps API is fully loaded.
function initMap() {
    // Initialize the map on the 'google-map' div
    map = new google.maps.Map(document.getElementById('google-map'), {
        center: { lat: -36.8485, lng: 174.7633 }, // Default center (e.g., Auckland)
        zoom: 12,
        disableDefaultUI: true // For a cleaner DIU look
    });

    // Initialize Directions Service and Renderer immediately after map
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({ map: map });

    // Add map click listener for setting origin and destination
    map.addListener('click', function(event) {
        if (!originPoint) {
            originPoint = event.latLng;
            // Clear any existing origin marker if the user re-clicks origin
            if (originMarker) originMarker.setMap(null);
            originMarker = new google.maps.Marker({
                position: originPoint,
                map: map,
                label: 'A' // Label for origin marker
            });
            console.log('Origin set:', originPoint.lat(), originPoint.lng());
            showAlert('Origin set. Now click on the map for destination.', 'lightblue');
            routeDisplay.textContent = 'Route: Setting Destination...';
            // Clear any previously displayed route and destination marker when setting new origin
            directionsRenderer.setDirections({ routes: [] });
            if (destinationMarker) destinationMarker.setMap(null);
            destinationPoint = null; // Reset destination

        } else if (!destinationPoint) {
            destinationPoint = event.latLng;
            // Clear any existing destination marker if the user re-clicks destination
            if (destinationMarker) destinationMarker.setMap(null);
            destinationMarker = new google.maps.Marker({
                position: destinationPoint,
                map: map,
                label: 'B' // Label for destination marker
            });
            console.log('Destination set:', destinationPoint.lat(), destinationPoint.lng());
            showAlert('Destination set. Click "Save Current Route" to finalize.', 'lightblue');
            routeDisplay.textContent = 'Route: Ready to Save.';

            // Optionally, draw the route immediately after destination is set
            calculateAndDisplayRoute(originPoint, destinationPoint);
        } else {
            // Both are already set. Inform the user or suggest clearing.
            showAlert('Origin and Destination already set. Click "Clear Route" to reset or "Save Current Route".', 'orange');
        }
    });

    // You can also add an initial marker or route here if desired
}

// Function to calculate and display the route on the map
function calculateAndDisplayRoute(origin, destination) {
    if (origin && destination && directionsService && directionsRenderer) {
        directionsService.route(
            {
                origin: origin,
                destination: destination,
                travelMode: google.maps.TravelMode.DRIVING, // or WALKING, BICYCLING, TRANSIT
            },
            (response, status) => {
                if (status === 'OK') {
                    directionsRenderer.setDirections(response);
                    // Fit the map bounds to the route
                    map.fitBounds(response.routes[0].bounds);
                } else {
                    showAlert('Directions request failed: ' + status, 'red');
                    console.error('Directions request failed due to ' + status);
                }
            }
        );
    }
}

// Ensure the DOM is fully loaded before trying to access HTML elements
document.addEventListener('DOMContentLoaded', () => {
    // --- Assign element references (now that they are globally declared) ---
    passengerCountSpan = document.getElementById('passenger-count');
    minusBtn = document.getElementById('minus-btn');
    plusBtn = document.getElementById('plus-btn');
    saveRouteBtn = document.getElementById('save-route-btn');
    sendDataBtn = document.getElementById('send-data-btn');
    routeDisplay = document.getElementById('route-display');
    alertMessage = document.getElementById('alert-message');
    currentSpeedSpan = document.getElementById('current-speed');
    timeSpan = document.getElementById('time');
    savedRoutesDropdown = document.getElementById('saved-routes-dropdown');
    clearRouteBtn = document.getElementById('clear-route-btn');
    // --- END Assign element references ---

    // --- Initial state variables ---
    let passengerCount = 1;
    let routeSaved = false; // Tracks if a valid route is currently active (set or loaded)
    let currentSpeed = 0;
    // --- END Initial state variables ---

    // Load saved routes into the dropdown when the page loads
    loadSavedRoutesIntoUI();

    // --- Time Update Function ---
    function updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeSpan.textContent = `${hours}:${minutes} NZST`;
    }
    // Update time every second
    setInterval(updateTime, 1000);
    // Call immediately to set initial time
    updateTime();

    // --- Speed Simulation Function ---
    setInterval(() => {
        currentSpeed = Math.min(120, currentSpeed + Math.floor(Math.random() * 5)); // Increase speed randomly up to 120
        currentSpeedSpan.textContent = `Speed: ${currentSpeed} km/h`;
        if (currentSpeed >= 120) {
            currentSpeed = 0; // Reset speed after reaching 120 for the simulation
        }
    }, 2000); // Update speed every 2 seconds

    // --- Passenger Count Buttons ---
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

    // --- Save Route Button Listener ---
    saveRouteBtn.addEventListener('click', () => {
        if (originPoint && destinationPoint) {
            saveCurrentRoute(); // Call function to handle saving
        } else {
            showAlert('Please set origin and destination on the map by clicking first!', 'red');
        }
    });

    // --- Send Data Button Listener (Starts Trip and Sends Data) ---
    sendDataBtn.addEventListener('click', () => {
        if (routeSaved) { // Only send if a route is active
            // Extract route name from the routeDisplay text
            const currentRouteName = routeDisplay.textContent
                .replace('Route: ', '')
                .replace(' (Saved!)', '')
                .replace(' (Loaded)', '')
                .trim();
            
            showAlert(`Sending data: Route '${currentRouteName}', Passengers: ${passengerCount}. Data sent!`, 'green');
            console.log(`Sending data to CTMS: Route '${currentRouteName}', Passengers: ${passengerCount}`);
            
            // In a real system, you'd send this data to a backend server.
            // For this prototype, the visual confirmation and console log are the "sending".
            
            // Optionally, you might want to clear the route or disable controls after sending
            // clearCurrentRouteSelection(); // Uncomment if you want the route to clear after sending
            // saveRouteBtn.disabled = true; // Example: Disable save button until new route is set
            // savedRoutesDropdown.disabled = true; // Example: Disable dropdown
            // clearRouteBtn.disabled = true; // Example: Disable clear button

        } else {
            showAlert('Please save or load a route first!', 'red');
        }
    });

    // --- Clear Route Button Listener ---
    if (clearRouteBtn) {
        clearRouteBtn.addEventListener('click', () => {
            clearCurrentRouteSelection(); // Call function to clear all route-related states
            showAlert('Current route selection cleared.', 'gray');
        });
    }

    // --- Listener for when a saved route is selected from the dropdown ---
    if (savedRoutesDropdown) {
        savedRoutesDropdown.addEventListener('change', function() {
            const selectedRouteJson = this.value; // The value stores the JSON string of the route
            if (selectedRouteJson) { // If an actual route was selected (not the default empty option)
                const selectedRoute = JSON.parse(selectedRouteJson);

                // Clear any current manual selections or previous loaded route
                clearCurrentRouteSelection(); // This will also set routeSaved to false, so re-set it below

                // Set the global origin and destination points from the loaded route's coordinates
                originPoint = new google.maps.LatLng(selectedRoute.origin.lat, selectedRoute.origin.lng);
                destinationPoint = new google.maps.LatLng(selectedRoute.destination.lat, selectedRoute.destination.lng);

                // Add markers for the loaded route
                originMarker = new google.maps.Marker({ position: originPoint, map: map, label: 'A' });
                destinationMarker = new google.maps.Marker({ position: destinationPoint, map: map, label: 'B' });

                // Display the route on the map
                calculateAndDisplayRoute(originPoint, destinationPoint);

                // Update UI and state
                showAlert(`Loaded route: ${selectedRoute.name}`, 'green');
                routeDisplay.textContent = `Route: ${selectedRoute.name} (Loaded)`;
                routeSaved = true; // A route is now active, so allow sending data
            } else {
                // If the default "-- Select a saved route --" option is re-selected
                clearCurrentRouteSelection();
                showAlert('Please select a valid route to load.', 'orange');
            }
        });
    }

    // --- Function to display temporary alerts ---
    function showAlert(message, color = 'rgba(0, 150, 0, 0.8)') {
        alertMessage.textContent = message;
        alertMessage.style.backgroundColor = color;
        alertMessage.style.display = 'block';
        setTimeout(() => {
            alertMessage.style.display = 'none';
        }, 3000); // Alert disappears after 3 seconds
    }

    // --- Example of a simulated alert (e.g., accident) ---
    setTimeout(() => {
        showAlert('ACCIDENT AHEAD! Rerouting initiated.', 'rgba(255, 0, 0, 0.8)');
        // In a real system, you would calculate and render a new route here
        routeDisplay.textContent = 'Route: Rerouted (Accident Ahead)';
    }, 10000); // Fires after 10 seconds

}); // End of DOMContentLoaded

// --- Function to save the current origin/destination as a named route ---
function saveCurrentRoute() {
    // Prompt the user for a name for the route
    const routeName = prompt("Enter a name for this route (e.g., 'Home to Work'):");
    if (!routeName) {
        showAlert('Route save cancelled.', 'orange');
        return; // Exit if user cancels or enters empty name
    }

    // Retrieve existing saved routes from localStorage, or initialize an empty array
    const savedRoutes = JSON.parse(localStorage.getItem('savedRoutes') || '[]');

    // Create a new route object with name, origin, and destination coordinates
    const newRoute = {
        name: routeName,
        origin: { lat: originPoint.lat(), lng: originPoint.lng() },
        destination: { lat: destinationPoint.lat(), lng: destinationPoint.lng() }
    };

    // Add the new route to the array and save back to localStorage
    savedRoutes.push(newRoute);
    localStorage.setItem('savedRoutes', JSON.stringify(savedRoutes));

    showAlert(`Route "${routeName}" saved successfully!`, 'green');
    
    // Refresh the dropdown list to include the newly saved route
    loadSavedRoutesIntoUI();

    // After loading, attempt to select the newly added route in the dropdown
    // This will ensure the dropdown visually updates and the correct route is active.
    const dropdown = document.getElementById('saved-routes-dropdown');
    if (dropdown) {
        const newRouteValue = JSON.stringify(newRoute);
        // Find the option that matches the new route's value and select it
        for (let i = 0; i < dropdown.options.length; i++) {
            if (dropdown.options[i].value === newRouteValue) {
                dropdown.selectedIndex = i;
                break;
            }
        }
        // Manually trigger the change event to ensure the map and 'routeSaved' flag update
        // This is crucial because programmatically changing selectedIndex doesn't fire 'change' event automatically.
        const event = new Event('change');
        dropdown.dispatchEvent(event);
    }
}

// --- Function to load and display saved routes into the HTML dropdown ---
function loadSavedRoutesIntoUI() {
    const savedRoutes = JSON.parse(localStorage.getItem('savedRoutes') || '[]');
    console.log('Loaded Saved Routes from localStorage:', savedRoutes); // For debugging purposes

    const dropdown = document.getElementById('saved-routes-dropdown');
    if (!dropdown) return; // Exit if the dropdown element doesn't exist in HTML

    // Clear existing options and add the default placeholder option
    dropdown.innerHTML = '<option value="">-- Select a saved route --</option>';

    // Populate the dropdown with saved routes
    savedRoutes.forEach(route => {
        const option = document.createElement('option');
        // Store the entire route object (as a stringified JSON) in the option's value
        option.value = JSON.stringify(route);
        option.textContent = route.name;
        dropdown.appendChild(option);
    });
}

// --- Function to clear the current selected/drawn route state ---
function clearCurrentRouteSelection() {
    // Reset global point/marker variables
    originPoint = null;
    destinationPoint = null;
    // Remove markers from the map
    if (originMarker) {
        originMarker.setMap(null);
        originMarker = null; // Clear reference
    }
    if (destinationMarker) {
        destinationMarker.setMap(null);
        destinationMarker = null; // Clear reference
    }
    // Clear any displayed route on the map
    directionsRenderer.setDirections({ routes: [] });
    // Reset UI text and route status
    routeDisplay.textContent = 'Your Route: Not set';
    routeSaved = false; // No route is currently active
    // Reset the dropdown selection to its default option
    const dropdown = document.getElementById('saved-routes-dropdown');
    if (dropdown) dropdown.value = "";
}
