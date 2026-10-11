const video = document.getElementById('camera-video');
const canvas = document.getElementById('overlay-canvas');
const ctx = canvas.getContext('2d');
const constellationInfo = document.getElementById('constellation-info');
const constellationName = document.getElementById('constellation-name');
const constellationDescription = document.getElementById('constellation-description');
const startCameraBtn = document.getElementById('start-camera');
const capturePhotoBtn = document.getElementById('capture-photo');

let stream = null;

const constellations = [
    { name: 'Orione', description: 'La costellazione più riconoscibile dell\'inverno, con la sua caratteristica cintura di tre stelle.', stars: ['Betelgeuse', 'Rigel', 'Bellatrix', 'Mintaka', 'Alnilam', 'Alnitak'] },
    { name: 'Grande Carro', description: 'Parte dell\'Orsa Maggiore, visibile tutto l\'anno nell\'emisfero nord.', stars: ['Dubhe', 'Merak', 'Phecda', 'Megrez', 'Alioth', 'Mizar', 'Alkaid'] },
    { name: 'Cassiopea', description: 'La sua forma a W la rende inconfondibile nel cielo settentrionale.', stars: ['Schedar', 'Caph', 'Gamma Cas', 'Ruchbah', 'Segin'] },
    { name: 'Croce del Sud', description: 'La costellazione simbolo dell\'emisfero australe.', stars: ['Acrux', 'Mimosa', 'Gacrux', 'Delta Crucis'] },
    { name: 'Leone', description: 'Una costellazione zodiacale primaverile con la stella Regolo.', stars: ['Regolo', 'Denebola', 'Algieba', 'Zosma'] },
    { name: 'Scorpione', description: 'Costellazione estiva con la rossa Antares al cuore.', stars: ['Antares', 'Shaula', 'Sargas', 'Dschubba'] }
];

function getRandomConstellation() {
    return constellations[Math.floor(Math.random() * constellations.length)];
}

function resizeCanvas() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
}

async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        video.srcObject = stream;
        await video.play();
        resizeCanvas();
        startCameraBtn.classList.add('hidden');
        capturePhotoBtn.classList.remove('hidden');
        video.addEventListener('loadedmetadata', resizeCanvas);
    } catch (err) {
        alert('Impossibile accedere alla fotocamera: ' + err.message);
        console.error(err);
    }
}

function capturePhoto() {
    const constellation = getRandomConstellation();
    constellationName.textContent = constellation.name;
    constellationDescription.textContent = constellation.description;
    constellationInfo.classList.remove('hidden');

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
}

startCameraBtn.addEventListener('click', startCamera);
capturePhotoBtn.addEventListener('click', capturePhoto);

window.addEventListener('resize', resizeCanvas);