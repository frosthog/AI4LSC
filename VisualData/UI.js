import { createNewPoint, displayData, toggleDirectionalLight, setSphereSize, changeEarthTexture,
            colorTexture, colorTexture2, colorTexture3 } from './main.js';
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
export let selectedFeatures = [];

document.addEventListener('DOMContentLoaded', function() {
    const topButtons = document.querySelectorAll('.top-button');
    const featureButtons = document.querySelectorAll('input[name="feature"]');
    const textContainer = document.getElementById('textContainer');

    topButtons.forEach(button => {
        buttonStates[button.id] = false;
        button.addEventListener('click', handleTopButtonClick);
    });

    featureButtons.forEach(button => {
        featureStates[button.value.toLowerCase()] = false;
        button.addEventListener('click', handleFeatureButtonClick);
    });

    buttonStates['simpleValueBtn'] = true;
    document.getElementById('simpleValueBtn').classList.add('selected');
    selectedFeatures = ['coarse'];
    featureStates['coarse'] = true;
    updateTextContainer('simpleValueBtn');
    updateFeatureSelection();
    displayData(selectedYear);
});

function handleTopButtonClick(event)
{
    const buttonId = event.target.id;
    selectedMode = buttonId;

    updateButtonStates(buttonId);
    updateFeatureSelectionMode();
    updateFeatureSelection();
    updateTextContainer(buttonId);

    displayData(selectedYear);
}

function updateButtonStates(selectedButtonId)
{
    Object.keys(buttonStates).forEach(key => buttonStates[key] = false);
    buttonStates[selectedButtonId] = true;

    const topButtons = document.querySelectorAll('.top-button');
    topButtons.forEach(btn => btn.classList.remove('selected'));
    document.getElementById(selectedButtonId).classList.add('selected');
}

function updateFeatureSelectionMode()
{
    if (selectedMode === 'simpleValueBtn')
    {
        if (selectedFeatures.length === 0)
        {
            selectedFeatures = featureStates['coarse'] ? ['coarse'] : [Object.keys(featureStates)[0]];
        }
        else
        {
            selectedFeatures = selectedFeatures.slice(0, 1);
        }
        updateFeatureStatesForValueMode();
    }
    else if (selectedMode === 'comparisonBtn')
    {
        selectedFeatures = ['coarse', 'clay'];
        updateFeatureStatesForComparisonMode();
    }
    else if (selectedMode === 'additionBtn')
    {

    }
}

function updateFeatureStatesForValueMode()
{
    Object.keys(featureStates).forEach(feature => {
        featureStates[feature] = false;
    });
    featureStates[selectedFeatures[0]] = true;
}

function updateFeatureStatesForComparisonMode()
{
    Object.keys(featureStates).forEach(feature => {
        featureStates[feature] = (selectedFeatures.includes(feature));
    });
}

function handleFeatureButtonClick(event)
{
    const featureName = event.target.value.toLowerCase();
    toggleFeatureSelection(featureName);
    updateFeatureSelection();
    displayData(selectedYear);
}

function toggleFeatureSelection(featureName)
{
    const index = selectedFeatures.indexOf(featureName);

    if (selectedMode === 'simpleValueBtn')
    {
        selectedFeatures = [featureName];
        updateFeatureStates(featureName);
    }
    else if (selectedMode === 'comparisonBtn')
    {
        if (index === -1)
        {
            if (selectedFeatures.length < 2)
            {
                selectedFeatures.push(featureName);
            }
            else
            {
                selectedFeatures.shift();
                selectedFeatures.push(featureName);
            }
        }
        else
        {
            selectedFeatures.splice(index, 1);
            if (selectedFeatures.length < 2)
            {
                const remainingFeature = Object.keys(featureStates).find(key => featureStates[key] && key !== featureName);
                if (remainingFeature)
                {
                    selectedFeatures.push(remainingFeature);
                }
            }
        }
        updateFeatureStatesForComparison();
    }
    else if (selectedMode === 'additionBtn')
    {

    }
    //console.log("Selected Features:", selectedFeatures);
}

function updateFeatureStates(selectedFeature)
{
    Object.keys(featureStates).forEach(key => featureStates[key] = false);
    featureStates[selectedFeature] = true;
}

function updateFeatureStatesForComparison()
{
    Object.keys(featureStates).forEach(key => featureStates[key] = false);
    selectedFeatures.forEach(feature => featureStates[feature] = true);
}


function updateFeatureSelection()
{
    const featureButtons = document.querySelectorAll('input[name="feature"]');
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
    switch (selectedButtonId) {
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
        setSphereSize(newSize, selectedYear);
    });
});

document.querySelectorAll('.image-button').forEach(button => {
    document.getElementById('imageBtn1').addEventListener('click', () => {
        changeEarthTexture(colorTexture);
        updateSelectedButton('imageBtn1');
    });

    document.getElementById('imageBtn2').addEventListener('click', () => {
        changeEarthTexture(colorTexture2);
        updateSelectedButton('imageBtn2');
    });

    document.getElementById('imageBtn3').addEventListener('click', () => {
        changeEarthTexture(colorTexture3);
        updateSelectedButton('imageBtn3');
    });
});

function updateSelectedButton(buttonId)
{
    document.querySelectorAll('.image-button').forEach(btn => btn.classList.remove('selected'));
    document.getElementById(buttonId).classList.add('selected');
}