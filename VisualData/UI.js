import { createNewPoint, displayData, toggleDirectionalLight, setSphereSize } from './main.js';
import {  } from './main.js';

export let selectedYear = 2009;


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

document.addEventListener('DOMContentLoaded', (event) => {
    const yearSlider = document.getElementById('yearSlider');
    const yearLabel = document.getElementById('yearLabel');

    yearSlider.addEventListener('input', function() {
        yearLabel.textContent = this.value;
    });

    yearSlider.addEventListener('change', function() {
        handleYearChange(parseInt(this.value));
    });
});

function handleYearChange(year)
{
    console.log(`Selected Year: ${year}`);
    selectedYear = year;
    displayData(year);
}

export let buttonStates = {};
export let featureStates = {};
export let selectedMode = 'simpleValueBtn';

document.addEventListener('DOMContentLoaded', function() {
    const topButtons = document.querySelectorAll('.top-button');
    const featureButtons = document.querySelectorAll('input[name="feature"]');
    const textContainer = document.getElementById('textContainer');
    let selectedFeatures = [];

    topButtons.forEach(button => {
        buttonStates[button.id] = false;
    });

    featureButtons.forEach(button => {
        featureStates[button.value.toLowerCase()] = false;
    });

    topButtons.forEach(button => {
        button.addEventListener('click', function() {
            selectedMode = this.id;
    
            Object.keys(buttonStates).forEach(key => {
                buttonStates[key] = false;
            });
            buttonStates[this.id] = true;
    
            topButtons.forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');
    
            if (selectedMode === 'simpleValueBtn')
            {
                selectedFeatures = ['coarse'];
            }
            else if (selectedMode === 'comparisonBtn' || selectedMode === 'additionBtn')
            {
                const secondFeature = featureButtons[1]?.value.toLowerCase();
                selectedFeatures = ['coarse', secondFeature].filter(Boolean);
            }
    
            updateFeatureSelection();
            updateTextContainer(this.id);
    
            displayData(selectedYear);
        });
    });

    featureButtons.forEach(button => {
        button.addEventListener('click', function() {
            const featureName = button.value.toLowerCase();
            const index = selectedFeatures.indexOf(featureName);
    
            Object.keys(featureStates).forEach(key => {
                featureStates[key] = false;
            });
    
            if (selectedMode === 'simpleValueBtn')
            {
                selectedFeatures = [featureName];
                featureStates[featureName] = true;
            }
            else if (selectedMode === 'comparisonBtn')
            {
                if (index === -1)
                {
                    if (selectedFeatures.length < 2)
                    {
                        selectedFeatures.push(featureName);
                        featureStates[featureName] = true;
                    }
                }
                else
                {
                    selectedFeatures.splice(index, 1);
                }
            }
            else if (selectedMode === 'additionBtn')
            {
                if (index === -1)
                {
                    selectedFeatures.push(featureName);
                    featureStates[featureName] = true;
                }
                else
                {
                    selectedFeatures.splice(index, 1);
                }
            }
            updateFeatureSelection();
            displayData(selectedYear);
        });
    });
    

    function updateFeatureSelection()
    {
        featureButtons.forEach(button => {
            const label = document.querySelector(`label[for="${button.id}"]`);
            if (selectedFeatures.includes(button.value.toLowerCase()))
            {
                label.classList.add('selected');
            }
            else
            {
                label.classList.remove('selected');
            }
        });
    }

    function updateTextContainer(selectedButtonId)
    {
        let text = "";
        switch (selectedButtonId)
        {
            case 'simpleValueBtn':
                text = "Display color for each feature [choose only one feature]";
                break;
            case 'comparisonBtn':
                text = "Display the difference between 2 features [choose 2 features]";
                break;
            case 'additionBtn':
                text = "Display a mix of features [select several features]";
                break;
            default:
                text = "Select a button.";
        }
        textContainer.textContent = text;
    }

    const valueButton = document.getElementById('simpleValueBtn');
    buttonStates[valueButton.id] = true;
    valueButton.classList.add('selected');
    updateTextContainer(valueButton.id);
    updateFeatureSelection();
});


document.addEventListener('DOMContentLoaded', () => {
    const toggleLightBtn = document.getElementById('toggleLight');
    toggleLightBtn.addEventListener('click', () => {
        toggleDirectionalLight();
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const sphereSizeSlider = document.getElementById('sphereSizeSlider');

    sphereSizeSlider.addEventListener('change', function()
    {
        const newSize = parseFloat(this.value);
        console.log(`New Sphere Size: ${newSize}`);
        setSphereSize(newSize, selectedYear);
    });
});