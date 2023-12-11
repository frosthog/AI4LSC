
import { featureStates, buttonStates, selectedMode, selectedFeatures} from './UI.js';

let allCSVData = null;
let currentInstancedMesh = null;

let isDirectionalLightOn = true;
let sphereSize = 0.003;

let sphereGeometry = new THREE.SphereGeometry(sphereSize, 8, 8);
let sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });


export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x333232);
const camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const ambientLight = new THREE.AmbientLight(0xfcebc7, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(2, 2.3, -0.2);
directionalLight.visible = isDirectionalLightOn;
scene.add(directionalLight);

const textureLoader = new THREE.TextureLoader();
export const colorTexture = textureLoader.load('textures/earthmap.jpg');
export const colorTexture2 = textureLoader.load('textures/earthmap_blackwhite.jpg');
export const colorTexture3 = textureLoader.load('textures/earthmap_noTex.jpg');
const bumpTexture = textureLoader.load('textures/earthmap_bump.jpg');
const specularTexture = textureLoader.load('textures/earthmap_spec.jpg');


colorTexture.magFilter = THREE.LinearFilter;
colorTexture.minFilter = THREE.LinearMipmapLinearFilter;
bumpTexture.magFilter = THREE.LinearFilter;
bumpTexture.minFilter = THREE.LinearMipmapLinearFilter;
specularTexture.magFilter = THREE.LinearFilter;
specularTexture.minFilter = THREE.LinearMipmapLinearFilter;

colorTexture.generateMipmaps = true;
bumpTexture.generateMipmaps = true;
specularTexture.generateMipmaps = true;

const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
colorTexture.anisotropy = maxAnisotropy;
bumpTexture.anisotropy = maxAnisotropy;
specularTexture.anisotropy = maxAnisotropy;

const material = new THREE.MeshPhongMaterial({
    map: colorTexture,
    bumpMap: bumpTexture,
    specularMap: specularTexture,
    bumpScale: 0.02, 
    specular: new THREE.Color(0x0d0d0d)
});

const geometry = new THREE.SphereGeometry(1.5, 64, 64);
const earth = new THREE.Mesh(geometry, material);

scene.add(earth);
camera.position.set(2, 2.3, -0.2);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);


window.addEventListener('resize', onWindowResize, false);

displayData(2009);
animate();

function animate()
{
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

export function changeEarthTexture(newTexture)
{
    earth.material.map = newTexture;
    earth.material.needsUpdate = true;
}

function onWindowResize()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

export function toggleDirectionalLight()
{
    isDirectionalLightOn = !isDirectionalLightOn;
    directionalLight.visible = isDirectionalLightOn;
}

export function setSphereSize(newSize, year)
{
    sphereSize = newSize;
    displayData(year);
}

export function createNewPoint(lat, long, radius)
{
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (long + 180) * (Math.PI / 180);
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const pointMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    pointMesh.position.set(x, y, z);
    scene.add(pointMesh);
    return pointMesh;
}

function latLongToVector3(lat, long, radius)
{
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (long + 180) * (Math.PI / 180);

    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}

function createInstances(data, radius)
{
    removeAllInstances();

    const selectedFeature = getSelectedFeature();

    sphereGeometry = new THREE.SphereGeometry(sphereSize, 8, 8);
    sphereMaterial = new THREE.MeshBasicMaterial();

    const instancesCount = data.length;
    currentInstancedMesh = new THREE.InstancedMesh(sphereGeometry, sphereMaterial, instancesCount);

    let i = 0;
    data.forEach(point => {
        let color;
        if (selectedMode === 'comparisonBtn')
        {
            const difference = point['comparison'];
            color = new THREE.Color(difference, 0, 1 - difference);
        }
        else if (selectedMode === 'simpleValueBtn' && selectedFeature in point)
        {
            const featureValue = point[selectedFeature];
            color = new THREE.Color(featureValue, 0, 1 - featureValue);
        }

        if (color)
        {
            const position = latLongToVector3(point.LAT, point.LONG, radius);
            const matrix = new THREE.Matrix4();
            matrix.setPosition(position);
            currentInstancedMesh.setColorAt(i, color);
            currentInstancedMesh.setMatrixAt(i, matrix);
            i++;
        }
    });

    currentInstancedMesh.instanceMatrix.needsUpdate = true;
    currentInstancedMesh.instanceColor.needsUpdate = true;

    scene.add(currentInstancedMesh);
}


function removeAllInstances()
{
    if (currentInstancedMesh)
    {
        currentInstancedMesh.geometry.dispose();
        currentInstancedMesh.material.dispose();
        scene.remove(currentInstancedMesh);
        currentInstancedMesh = null;
    }
}

function parseCSV(csvData, specificYear)
{
    const rows = csvData.split('\n').map(row => row.trim()).filter(row => row);
    const headers = rows[0].split(',');

    const latIndex = headers.indexOf('LAT');
    const longIndex = headers.indexOf('LONG');
    const surveyYearIndex = headers.indexOf('SURVEY_YEAR');

    if (latIndex === -1 || longIndex === -1 || surveyYearIndex === -1)
    {
        console.error('LAT, LONG, and/or SURVEY_YEAR columns not found');
        return;
    }

    let featureIndexes = {};
    let comparisonFeatures = [];

    //console.log(featureStates);

    if (selectedMode === 'comparisonBtn')
    {
        comparisonFeatures = [];
        const featureButtons = document.querySelectorAll('input[name="feature"]');
    
        featureButtons.forEach(button => {
            const featureName = button.value;
            if (featureStates[featureName.toLowerCase()])
            {
                const featureIndex = headers.indexOf(featureName);
                //console.log("featureName: ", featureName);
                //console.log("featureIndex: ", featureIndex);
    
                if (featureIndex !== -1 && comparisonFeatures.length < 2)
                {
                    featureIndexes[featureName.toLowerCase()] = featureIndex;
                    comparisonFeatures.push(featureName.toLowerCase());
                    //console.log("COMPCOMP: ", comparisonFeatures);
                }
            }
        });
    }
    else if (selectedMode === 'simpleValueBtn')
    {
        const featureButtons = document.querySelectorAll('input[name="feature"]');
        featureButtons.forEach(button => {
            const featureName = button.value;
            if (featureStates[featureName.toLowerCase()])
            {
                const featureIndex = headers.indexOf(featureName);
                featureIndexes[featureName.toLowerCase()] = featureIndex;
            }
        });
    }

    const data = rows.slice(1).map(row => {
        const values = row.split(',');

        let pointData = {
            LAT: parseFloat(values[latIndex]),
            LONG: parseFloat(values[longIndex]),
            SURVEY_YEAR: parseInt(values[surveyYearIndex], 10)
        };

        if (selectedMode === 'comparisonBtn' && comparisonFeatures.length === 2)
        {
            const featureValue1 = parseFloat(values[featureIndexes[comparisonFeatures[0]]]);
            const featureValue2 = parseFloat(values[featureIndexes[comparisonFeatures[1]]]);
            pointData['comparison'] = Math.abs(featureValue1 - featureValue2);
        }
        else if (selectedMode === 'simpleValueBtn')
        {
            Object.keys(featureIndexes).forEach(feature => {
                if (featureIndexes[feature] !== -1)
                {
                    pointData[feature] = parseFloat(values[featureIndexes[feature]]);
                }
            });
        }

        return pointData;
    }).filter(point => point.SURVEY_YEAR === specificYear);

    //console.log(data);
    processData(data);
}


let lastProcessedFeature = null;
let lastProcessedYear = null;
let currentData = null;

function getSelectedFeature()
{
    return Object.keys(featureStates).find(key => featureStates[key]);
}

function processAndDisplayData(year)
{
    const selectedFeature = getSelectedFeature();
    if (allCSVData && (lastProcessedFeature !== selectedFeature || lastProcessedYear !== year))
    {
        parseCSV(allCSVData, year);
        lastProcessedFeature = selectedFeature;
        lastProcessedYear = year;
    }
}

function processData(data)
{
    currentData = data;
    createInstances(data, 1.5);
}

function loadCSV(filePath)
{
    return fetch(filePath)
        .then(response => response.text())
        .catch(error => {
            console.error('Error fetching the CSV file:', error);
            throw error;
        });
}

export function displayData(year)
{
    if (!allCSVData)
    {
        loadCSV('prediction.csv').then(csvData => {
            allCSVData = csvData;
            processAndDisplayData(year);
        }).catch(error => console.error('Error in displayData:', error));
    }
    else
    {
        if (year !== lastProcessedYear || getSelectedFeature() !== lastProcessedFeature)
        {
            processAndDisplayData(year);
        }
        else
        {
            processData(currentData);
        }
    }
}
