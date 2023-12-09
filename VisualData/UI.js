import { scene, createNewPoint } from './main.js';


document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();

        const latitude = parseFloat(document.getElementById('latID').value);
        const longitude = parseFloat(document.getElementById('longID').value);

        if (isNaN(latitude) || isNaN(longitude)) {
            alert('Please enter valid latitude and longitude values.');
            return;
        }

        if (latitude < -90 || latitude > 90) {
            alert('Latitude must be between -90 and 90 degrees.');
            return;
        }

        if (longitude < -180 || longitude > 180) {
            alert('Longitude must be between -180 and 180 degrees.');
            return;
        }

        createPointUI(latitude, longitude);
    });
});


function createPointUI(lat, lon)
{
    console.log(`Creating point at Latitude: ${lat}, Longitude: ${lon}`);
    createNewPoint(lat, lon, 1.501);
}
