
export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x333232);
const camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const ambientLight = new THREE.AmbientLight(0xfcebc7, 0.3); 
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 0, 0);
scene.add(directionalLight);

const textureLoader = new THREE.TextureLoader();
const colorTexture = textureLoader.load('textures/earthmap.jpg');
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
camera.position.z = 6;

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);


loadCSV('soil_imputed_data.csv'); //CSV WORK AND CALL DATA DISPLAY FUNCTIONS


window.addEventListener('resize', onWindowResize, false);
animate();

function animate()
{
    requestAnimationFrame(animate);

    directionalLight.position.copy(camera.position);
    directionalLight.target.position.copy(scene.position);
    directionalLight.updateMatrix();
    directionalLight.updateMatrixWorld();

    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

export function createNewPoint(lat, long, radius)
{
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (long + 180) * (Math.PI / 180);

    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    const pointGeometry = new THREE.SphereGeometry(0.003, 8, 8);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);

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
    const sphereGeometry = new THREE.SphereGeometry(0.0008, 8, 8);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const instancedMesh = new THREE.InstancedMesh(sphereGeometry, sphereMaterial, data.length);

    data.forEach((point, index) =>
    {
        if (!isNaN(point.LAT) && !isNaN(point.LONG))
        {
            const position = latLongToVector3(point.LAT, point.LONG, radius);
            const matrix = new THREE.Matrix4().makeTranslation(position.x, position.y, position.z);
            instancedMesh.setMatrixAt(index, matrix);
        }
    });

    instancedMesh.instanceMatrix.needsUpdate = true;
    scene.add(instancedMesh);
}


function parseCSV(csvData)
{
    const rows = csvData.split('\n').map(row => row.trim()).filter(row => row);
    const headers = rows[0].split(',');

    const latIndex = headers.indexOf('LAT');
    const longIndex = headers.indexOf('LONG');

    if (latIndex === -1 || longIndex === -1)
    {
        console.error('LAT and/or LONG columns not found');
        return;
    }

    const data = rows.slice(1).map(row =>
        {
        const values = row.split(',');
        return {LAT: parseFloat(values[latIndex]), LONG: parseFloat(values[longIndex])};
    });

    processData(data);
}

function processData(data)
{
    //console.log('LAT | LONG - Data:', data);
    createInstances(data, 1.5);
}

function loadCSV(filePath)
{
    fetch(filePath)
        .then(response => response.text())
        .then(data => {
            parseCSV(data);
        })
        .catch(error => console.error('Error fetching the CSV file:', error));
}