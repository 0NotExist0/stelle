/* global google */
let google;
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- Elementi DOM ---
const canvas = document.getElementById('sky-canvas');
const statusEl = document.getElementById('sky-status');
const infoPanel = document.getElementById('info-panel');
const infoName = document.getElementById('info-name');
const infoDetail = document.getElementById('info-detail');
const infoPos = document.getElementById('info-pos');
const compassEl = document.getElementById('compass');
const btnLocate = document.getElementById('btn-locate');
const btnNight = document.getElementById('btn-night');
const btnConstellations = document.getElementById('btn-constellations');
const btnNow = document.getElementById('btn-now');
const datetimeInput = document.getElementById('datetime');

// --- Mappa (Google Maps, caricata dinamicamente) ---
const btnMap = document.getElementById('btn-map');
const mapContainer = document.getElementById('map-container');
const mapEl = document.getElementById('map');
const btnUseGps = document.getElementById('btn-use-gps');
const btnConfirmMap = document.getElementById('btn-confirm-map');
const btnCloseMap = document.getElementById('btn-close-map');
const mapTitle = document.getElementById('map-title');

// --- Stato mappa ---
let map = null;
let mapMarker = null;
let mapLoaded = false;
let mapApiKey = 'TUA_API_KEY_GOOGLE_MAPS'; // <-- inserisci qui la tua chiave Google Maps

// --- Stato ---
let lat = 41.9;
let lon = 12.5;
let showNight = true;
let showConstellations = true;
let autoTime = true;
let currentDate = new Date();
let selectedObject = null;

const RADIUS = 500;

// --- Catalogo stelle (nome, RA ore, dec gradi, magnitudine, colore, costellazione) ---
const stelle = [
    { nome: 'Sirio', ra: 6.75, dec: -16.7, mag: -1.46, colore: '#a0c8ff', cost: 'Cane Maggiore' },
    { nome: 'Canopo', ra: 6.4, dec: -52.7, mag: -0.74, colore: '#a0c8ff', cost: 'Carena' },
    { nome: 'Arturo', ra: 14.3, dec: 19.2, mag: -0.05, colore: '#ffd700', cost: 'Bifolco' },
    { nome: 'Vega', ra: 18.6, dec: 38.8, mag: 0.03, colore: '#a0c8ff', cost: 'Lira' },
    { nome: 'Capella', ra: 5.3, dec: 46.0, mag: 0.08, colore: '#ffd700', cost: 'Auriga' },
    { nome: 'Rigel', ra: 5.2, dec: -8.2, mag: 0.13, colore: '#a0c8ff', cost: 'Orione' },
    { nome: 'Procyon', ra: 7.6, dec: 5.2, mag: 0.4, colore: '#a0c8ff', cost: 'Cane Minore' },
    { nome: 'Betelgeuse', ra: 5.9, dec: 7.4, mag: 0.5, colore: '#ff8c00', cost: 'Orione' },
    { nome: 'Achernar', ra: 1.6, dec: -57.2, mag: 0.5, colore: '#a0c8ff', cost: 'Eridano' },
    { nome: 'Altair', ra: 19.9, dec: 8.9, mag: 0.77, colore: '#a0c8ff', cost: 'Aquila' },
    { nome: 'Aldebaran', ra: 4.6, dec: 16.5, mag: 0.85, colore: '#ff8c00', cost: 'Toro' },
    { nome: 'Spica', ra: 13.4, dec: -11.2, mag: 1.0, colore: '#a0c8ff', cost: 'Vergine' },
    { nome: 'Antares', ra: 16.5, dec: -26.4, mag: 1.06, colore: '#ff8c00', cost: 'Scorpione' },
    { nome: 'Polluce', ra: 7.8, dec: 28.0, mag: 1.14, colore: '#ffd700', cost: 'Gemelli' },
    { nome: 'Fomalhaut', ra: 22.9, dec: -29.6, mag: 1.16, colore: '#a0c8ff', cost: 'Pesce Australe' },
    { nome: 'Deneb', ra: 20.7, dec: 45.3, mag: 1.25, colore: '#a0c8ff', cost: 'Cigno' },
    { nome: 'Regolo', ra: 10.1, dec: 12.0, mag: 1.35, colore: '#ffd700', cost: 'Leone' },
    { nome: 'Adhara', ra: 6.6, dec: -29.0, mag: 1.5, colore: '#a0c8ff', cost: 'Cane Maggiore' },
    { nome: 'Castore', ra: 7.6, dec: 31.9, mag: 1.58, colore: '#a0c8ff', cost: 'Gemelli' },
    { nome: 'Polare', ra: 2.5, dec: 89.3, mag: 2.0, colore: '#ffffff', cost: 'Orsa Minore' },
    { nome: 'Markab', ra: 23.1, dec: 15.2, mag: 2.5, colore: '#a0c8ff', cost: 'Pegaso' },
    { nome: 'Scheat', ra: 23.3, dec: 28.1, mag: 2.6, colore: '#ff8c00', cost: 'Pegaso' },
    { nome: 'Algenib', ra: 0.1, dec: 15.2, mag: 2.8, colore: '#a0c8ff', cost: 'Pegaso' },
    { nome: 'Alpheratz', ra: 0.7, dec: 29.1, mag: 2.1, colore: '#a0c8ff', cost: 'Andromeda' },
    { nome: 'Mirach', ra: 1.1, dec: 35.6, mag: 2.1, colore: '#ff8c00', cost: 'Andromeda' },
    { nome: 'Almach', ra: 2.4, dec: 42.3, mag: 2.2, colore: '#ff8c00', cost: 'Andromeda' },
    { nome: 'Caph', ra: 1.1, dec: 59.1, mag: 2.3, colore: '#ffffff', cost: 'Cassiopea' },
    { nome: 'Schedar', ra: 0.4, dec: 56.5, mag: 2.2, colore: '#ff8c00', cost: 'Cassiopea' },
    { nome: 'Ruchbah', ra: 1.5, dec: 60.2, mag: 2.7, colore: '#a0c8ff', cost: 'Cassiopea' },
    { nome: 'Segin', ra: 2.2, dec: 63.6, mag: 3.4, colore: '#a0c8ff', cost: 'Cassiopea' },
    { nome: 'Dubhe', ra: 11.0, dec: 61.8, mag: 1.8, colore: '#ff8c00', cost: 'Grande Carro' },
    { nome: 'Merak', ra: 11.1, dec: 57.0, mag: 2.4, colore: '#a0c8ff', cost: 'Grande Carro' },
    { nome: 'Phecda', ra: 11.4, dec: 53.7, mag: 2.4, colore: '#a0c8ff', cost: 'Grande Carro' },
    { nome: 'Megrez', ra: 12.2, dec: 57.2, mag: 3.3, colore: '#a0c8ff', cost: 'Grande Carro' },
    { nome: 'Alioth', ra: 12.9, dec: 55.9, mag: 1.8, colore: '#a0c8ff', cost: 'Grande Carro' },
    { nome: 'Mizar', ra: 13.2, dec: 55.0, mag: 2.2, colore: '#a0c8ff', cost: 'Grande Carro' },
    { nome: 'Alkaid', ra: 13.9, dec: 49.3, mag: 1.9, colore: '#a0c8ff', cost: 'Grande Carro' },
    { nome: 'Denebola', ra: 11.5, dec: 14.6, mag: 2.1, colore: '#a0c8ff', cost: 'Leone' },
    { nome: 'Algieba', ra: 10.3, dec: 19.8, mag: 2.1, colore: '#ff8c00', cost: 'Leone' },
    { nome: 'Zosma', ra: 11.4, dec: 20.5, mag: 2.6, colore: '#a0c8ff', cost: 'Leone' },
    { nome: 'Spica', ra: 13.4, dec: -11.2, mag: 1.0, colore: '#a0c8ff', cost: 'Vergine' },
    { nome: 'Antares', ra: 16.5, dec: -26.4, mag: 1.06, colore: '#ff8c00', cost: 'Scorpione' },
    { nome: 'Shaula', ra: 17.4, dec: -37.0, mag: 1.6, colore: '#a0c8ff', cost: 'Scorpione' },
    { nome: 'Kaus Australis', ra: 18.3, dec: -34.4, mag: 1.9, colore: '#a0c8ff', cost: 'Sagittario' },
    { nome: 'Nunki', ra: 18.6, dec: -26.3, mag: 2.0, colore: '#a0c8ff', cost: 'Sagittario' },
    { nome: 'Alnair', ra: 22.8, dec: -24.1, mag: 2.2, colore: '#a0c8ff', cost: 'Grus' },
    { nome: 'Fomalhaut', ra: 22.9, dec: -29.6, mag: 1.16, colore: '#a0c8ff', cost: 'Pesce Australe' },
    { nome: 'Deneb', ra: 20.7, dec: 45.3, mag: 1.25, colore: '#a0c8ff', cost: 'Cigno' },
    { nome: 'Vega', ra: 18.6, dec: 38.8, mag: 0.03, colore: '#a0c8ff', cost: 'Lira' },
    { nome: 'Altair', ra: 19.9, dec: 8.9, mag: 0.77, colore: '#a0c8ff', cost: 'Aquila' },
    { nome: 'Rasalgethi', ra: 17.2, dec: 14.4, mag: 3.0, colore: '#ff8c00', cost: 'Ercole' },
    { nome: 'Cor Caroli', ra: 12.9, dec: 38.3, mag: 2.9, colore: '#a0c8ff', cost: 'Cani da Caccia' },
    { nome: 'Alphard', ra: 9.3, dec: -8.7, mag: 2.0, colore: '#ff8c00', cost: 'Idra' },
    { nome: 'Regolo', ra: 10.1, dec: 12.0, mag: 1.35, colore: '#ffd700', cost: 'Leone' },
    { nome: 'Adhara', ra: 6.6, dec: -29.0, mag: 1.5, colore: '#a0c8ff', cost: 'Cane Maggiore' },
    { nome: 'Wezen', ra: 7.1, dec: -26.4, mag: 1.8, colore: '#a0c8ff', cost: 'Cane Maggiore' },
    { nome: 'Murzim', ra: 6.8, dec: -17.8, mag: 2.0, colore: '#a0c8ff', cost: 'Cane Maggiore' },
    { nome: 'Castore', ra: 7.6, dec: 31.9, mag: 1.58, colore: '#a0c8ff', cost: 'Gemelli' },
    { nome: 'Polluce', ra: 7.8, dec: 28.0, mag: 1.14, colore: '#ffd700', cost: 'Gemelli' },
    { nome: 'Mebsuta', ra: 6.8, dec: 25.1, mag: 3.0, colore: '#a0c8ff', cost: 'Gemelli' },
    { nome: 'Mekbuda', ra: 7.0, dec: 20.4, mag: 3.6, colore: '#a0c8ff', cost: 'Gemelli' },
    { nome: 'Procyon', ra: 7.6, dec: 5.2, mag: 0.4, colore: '#a0c8ff', cost: 'Cane Minore' },
    { nome: 'Gomeisa', ra: 7.4, dec: 8.3, mag: 2.9, colore: '#a0c8ff', cost: 'Cane Minore' },
    { nome: 'Capella', ra: 5.3, dec: 46.0, mag: 0.08, colore: '#ffd700', cost: 'Auriga' },
    { nome: 'Menkalinan', ra: 5.6, dec: 44.9, mag: 1.9, colore: '#a0c8ff', cost: 'Auriga' },
    { nome: 'Elnath', ra: 5.5, dec: 28.6, mag: 1.7, colore: '#a0c8ff', cost: 'Toro' },
    { nome: 'Aldebaran', ra: 4.6, dec: 16.5, mag: 0.85, colore: '#ff8c00', cost: 'Toro' },
    { nome: 'Rigel', ra: 5.2, dec: -8.2, mag: 0.13, colore: '#a0c8ff', cost: 'Orione' },
    { nome: 'Betelgeuse', ra: 5.9, dec: 7.4, mag: 0.5, colore: '#ff8c00', cost: 'Orione' },
    { nome: 'Bellatrix', ra: 5.4, dec: 6.3, mag: 1.6, colore: '#a0c8ff', cost: 'Orione' },
    { nome: 'Saiph', ra: 5.5, dec: -9.7, mag: 2.1, colore: '#a0c8ff', cost: 'Orione' },
    { nome: 'Mintaka', ra: 5.3, dec: -0.3, mag: 2.2, colore: '#a0c8ff', cost: 'Orione' },
    { nome: 'Alnilam', ra: 5.4, dec: -1.2, mag: 1.7, colore: '#a0c8ff', cost: 'Orione' },
    { nome: 'Alnitak', ra: 5.4, dec: -1.9, mag: 2.0, colore: '#a0c8ff', cost: 'Orione' },
    { nome: 'Sirio', ra: 6.75, dec: -16.7, mag: -1.46, colore: '#a0c8ff', cost: 'Cane Maggiore' },
    { nome: 'Canopo', ra: 6.4, dec: -52.7, mag: -0.74, colore: '#a0c8ff', cost: 'Carena' },
    { nome: 'Miaplacidus', ra: 9.2, dec: -69.7, mag: 1.7, colore: '#a0c8ff', cost: 'Carena' },
    { nome: 'Avior', ra: 8.4, dec: -59.5, mag: 1.9, colore: '#a0c8ff', cost: 'Carena' },
    { nome: 'Aspidiske', ra: 8.0, dec: -58.8, mag: 2.0, colore: '#a0c8ff', cost: 'Carena' },
    { nome: 'Achernar', ra: 1.6, dec: -57.2, mag: 0.5, colore: '#a0c8ff', cost: 'Eridano' },
    { nome: 'Acamar', ra: 3.0, dec: -40.2, mag: 3.0, colore: '#a0c8ff', cost: 'Eridano' },
    { nome: 'Alphard', ra: 9.3, dec: -8.7, mag: 2.0, colore: '#ff8c00', cost: 'Idra' },
    { nome: 'Alfard', ra: 9.3, dec: -8.7, mag: 2.0, colore: '#ff8c00', cost: 'Idra' }
];

// Rimuovi duplicati per nome (mantieni la prima occorrenza)
const stelleUniche = [];
const nomiVisti = new Set();
for (const s of stelle) {
    if (!nomiVisti.has(s.nome)) {
        nomiVisti.add(s.nome);
        stelleUniche.push(s);
    }
}

// --- Costellazioni con collegamenti tra stelle membri ---
const costellazioni = [
    { nome: 'Orione', abbrev: 'Ori', ra: 5.5, dec: 5, colore: '#00ffff', stelle: ['Rigel', 'Betelgeuse', 'Bellatrix', 'Saiph', 'Mintaka', 'Alnilam', 'Alnitak'] },
    { nome: 'Grande Carro', abbrev: 'UMa', ra: 11, dec: 55, colore: '#00ffff', stelle: ['Dubhe', 'Merak', 'Phecda', 'Megrez', 'Alioth', 'Mizar', 'Alkaid'] },
    { nome: 'Cassiopea', abbrev: 'Cas', ra: 1, dec: 60, colore: '#00ffff', stelle: ['Caph', 'Schedar', 'Ruchbah', 'Segin'] },
    { nome: 'Leone', abbrev: 'Leo', ra: 10, dec: 15, colore: '#00ffff', stelle: ['Regolo', 'Denebola', 'Algieba', 'Zosma'] },
    { nome: 'Scorpione', abbrev: 'Sco', ra: 16.5, dec: -30, colore: '#00ffff', stelle: ['Antares', 'Shaula'] },
    { nome: 'Croce del Sud', abbrev: 'Cru', ra: 12.5, dec: -60, colore: '#00ffff', stelle: [] },
    { nome: 'Cigno', abbrev: 'Cyg', ra: 20.5, dec: 40, colore: '#00ffff', stelle: ['Deneb'] },
    { nome: 'Lira', abbrev: 'Lyr', ra: 18.5, dec: 35, colore: '#00ffff', stelle: ['Vega'] },
    { nome: 'Aquila', abbrev: 'Aql', ra: 19.5, dec: 5, colore: '#00ffff', stelle: ['Altair'] },
    { nome: 'Pegaso', abbrev: 'Peg', ra: 22.5, dec: 20, colore: '#00ffff', stelle: ['Markab', 'Scheat', 'Algenib', 'Alpheratz'] },
    { nome: 'Andromeda', abbrev: 'And', ra: 1.0, dec: 35, colore: '#00ffff', stelle: ['Alpheratz', 'Mirach', 'Almach'] },
    { nome: 'Toro', abbrev: 'Tau', ra: 4.5, dec: 15, colore: '#00ffff', stelle: ['Aldebaran', 'Elnath'] },
    { nome: 'Gemelli', abbrev: 'Gem', ra: 7.0, dec: 25, colore: '#00ffff', stelle: ['Castore', 'Polluce', 'Mebsuta', 'Mekbuda'] },
    { nome: 'Auriga', abbrev: 'Aur', ra: 5.5, dec: 45, colore: '#00ffff', stelle: ['Capella', 'Menkalinan'] },
    { nome: 'Cane Maggiore', abbrev: 'CMa', ra: 6.5, dec: -20, colore: '#00ffff', stelle: ['Sirio', 'Adhara', 'Wezen', 'Murzim'] },
    { nome: 'Carena', abbrev: 'Car', ra: 8.5, dec: -60, colore: '#00ffff', stelle: ['Canopo', 'Miaplacidus', 'Avior', 'Aspidiske'] },
    { nome: 'Eridano', abbrev: 'Eri', ra: 3.0, dec: -40, colore: '#00ffff', stelle: ['Achernar', 'Acamar'] },
    { nome: 'Idra', abbrev: 'Hya', ra: 9.5, dec: -10, colore: '#00ffff', stelle: ['Alphard'] },
    { nome: 'Cani da Caccia', abbrev: 'CVn', ra: 13.0, dec: 40, colore: '#00ffff', stelle: ['Cor Caroli'] },
    { nome: 'Ercole', abbrev: 'Her', ra: 17.0, dec: 25, colore: '#00ffff', stelle: ['Rasalgethi'] },
    { nome: 'Sagittario', abbrev: 'Sgr', ra: 19.0, dec: -25, colore: '#00ffff', stelle: ['Kaus Australis', 'Nunki'] },
    { nome: 'Grus', abbrev: 'Gru', ra: 22.5, dec: -45, colore: '#00ffff', stelle: ['Alnair'] },
    { nome: 'Pesce Australe', abbrev: 'PsA', ra: 23.0, dec: -30, colore: '#00ffff', stelle: ['Fomalhaut'] },
    { nome: 'Orsa Minore', abbrev: 'UMi', ra: 2.5, dec: 75, colore: '#00ffff', stelle: ['Polare'] },
    { nome: 'Vergine', abbrev: 'Vir', ra: 13.5, dec: -5, colore: '#00ffff', stelle: ['Spica'] },
    { nome: 'Bifolco', abbrev: 'Boo', ra: 14.5, dec: 25, colore: '#00ffff', stelle: ['Arturo'] },
    { nome: 'Cane Minore', abbrev: 'CMi', ra: 7.5, dec: 5, colore: '#00ffff', stelle: ['Procyon', 'Gomeisa'] }
];

// Mappa nome stella -> oggetto stella per lookup rapido
const stellaPerNome = {};
for (const s of stelleUniche) stellaPerNome[s.nome] = s;

// --- Variabili Three.js ---
let renderer, scene, camera, controls, starSystem, constellationLines, ground, skybox, bgStars, raycaster, mouse;
let compassNeedsUpdate = true;

// --- Inizializzazione ---
function init() {
    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050510, 1);

    // Scena
    scene = new THREE.Scene();

    // Camera prospettica al centro della sfera celeste
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 5, -15);

    // OrbitControls per navigazione mouse
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 100;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.5;

    // Raycaster per selezione stelle
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Costruisci oggetti celesti
    buildGround();
    buildSkybox();
    buildStars();
    buildConstellations();
    buildGrid();

    // Event listener click per selezione
    renderer.domElement.addEventListener('click', onCanvasClick);

    // Resize
    window.addEventListener('resize', onWindowResize);

    // Data/ora input
    datetimeInput.addEventListener('change', onDateTimeChange);

    // Aggiorna input con data attuale
    updateDateTimeInput();

    // Loop render
    animate();
}

// --- Costruzione stelle (Points su sfera celeste) ---
function buildStars() {
    const positions = [];
    const colors = [];
    const sizes = [];
    const starData = []; // parallelo: { nome, mag, cost }

    const now = currentDate;
    const temp = new THREE.Vector3();

    for (const s of stelleUniche) {
        const v = equatorialToVector3(s.ra * 15, s.dec, lat, lon, now);
        positions.push(v.x, v.y, v.z);

        const c = new THREE.Color(s.colore);
        colors.push(c.r, c.g, c.b);

        const size = Math.max(0.05, 0.3 - s.mag * 0.05); // stelle piÃ¹ luminose = piÃ¹ grandi
        sizes.push(size);

        starData.push({ nome: s.nome, mag: s.mag, cost: s.cost });
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: showNight ? 1 : 0.15,
        sizeAttenuation: true
    });

    starSystem = new THREE.Points(geometry, material);
    starSystem.userData = { starData };
    scene.add(starSystem);
}

// --- Costruzione linee costellazioni ---
function buildConstellations() {
    if (constellationLines) {
        scene.remove(constellationLines);
        constellationLines.geometry.dispose();
        constellationLines.material.dispose();
    }

    const positions = [];
    const colors = [];

    for (const c of costellazioni) {
        const nomi = c.stelle;
        if (nomi.length < 2) continue;

        const col = new THREE.Color(c.colore);

        for (let i = 0; i < nomi.length - 1; i++) {
            const a = stellaPerNome[nomi[i]];
            const b = stellaPerNome[nomi[i + 1]];
            if (!a || !b) continue;

            const va = equatorialToVector3(a.ra * 15, a.dec, lat, lon, currentDate);
            const vb = equatorialToVector3(b.ra * 15, b.dec, lat, lon, currentDate);

            positions.push(va.x, va.y, va.z);
            positions.push(vb.x, vb.y, vb.z);

            colors.push(col.r, col.g, col.b);
            colors.push(col.r, col.g, col.b);
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: showConstellations ? 0.6 : 0,
        linewidth: 1
    });

    constellationLines = new THREE.LineSegments(geometry, material);
    constellationLines.visible = showConstellations;
    scene.add(constellationLines);
}

// --- Griglia celeste (orizzonte + punti cardinali + equatore) ---
function buildGrid() {
    // Cerchio orizzonte
    const horizonSegments = 64;
    const horizonPos = [];
    const horizonCol = [];
    const horizonColor = new THREE.Color(0x333333);

    for (let i = 0; i <= horizonSegments; i++) {
        const ang = (i / horizonSegments) * Math.PI * 2;
        horizonPos.push(Math.cos(ang) * RADIUS, 0, Math.sin(ang) * RADIUS);
        horizonCol.push(horizonColor.r, horizonColor.g, horizonColor.b);
    }

    const horizonGeo = new THREE.BufferGeometry();
    horizonGeo.setAttribute('position', new THREE.Float32BufferAttribute(horizonPos, 3));
    horizonGeo.setAttribute('color', new THREE.Float32BufferAttribute(horizonCol, 3));
    const horizonMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.3 });
    const horizon = new THREE.LineLoop(horizonGeo, horizonMat);
    scene.add(horizon);

    // Linee azimutali (N, E, S, W) da centro a orizzonte
    const cardPos = [];
    const cardCol = [];
    const cardColor = new THREE.Color(0x555555);
    for (const az of [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2]) {
        cardPos.push(0, 0, 0);
        cardPos.push(Math.sin(az) * RADIUS, 0, Math.cos(az) * RADIUS);
        cardCol.push(cardColor.r, cardColor.g, cardColor.b);
        cardCol.push(cardColor.r, cardColor.g, cardColor.b);
    }
    const cardGeo = new THREE.BufferGeometry();
    cardGeo.setAttribute('position', new THREE.Float32BufferAttribute(cardPos, 3));
    cardGeo.setAttribute('color', new THREE.Float32BufferAttribute(cardCol, 3));
    const cardMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.2 });
    scene.add(new THREE.LineSegments(cardGeo, cardMat));

    // Etichette cardinali (sprite di testo semplificate: usiamo CSS overlay per la bussola)
}
// --- Terreno (piano scuro sotto l'orizzonte) ---
function buildGround() {
    const geo = new THREE.PlaneGeometry(RADIUS * 2.5, RADIUS * 2.5, 64, 64);
    geo.rotateX(-Math.PI / 2);
    const positions = geo.attributes.position.array;
    const colors = [];
    const dark = new THREE.Color(0x0a0a14);
    const mid = new THREE.Color(0x12121e);
    for (let i = 0; i < positions.length / 3; i++) {
        const x = positions[i * 3];
        const z = positions[i * 3 + 2];
        const c = (Math.floor(Math.abs(x) / 20) + Math.floor(Math.abs(z) / 20)) % 2 === 0 ? dark : mid;
        colors.push(c.r, c.g, c.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const mat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
    ground = new THREE.Mesh(geo, mat);
    ground.position.y = -RADIUS * 0.02;
    scene.add(ground);
}

// --- Skybox (cielo stellato di fondo) ---
function buildSkybox() {
    const geo = new THREE.SphereGeometry(RADIUS * 4, 64, 64);
    geo.scale(-1, 1, 1);
    const positions = geo.attributes.position.array;
    const colors = [];
    const deep = new THREE.Color(0x020205);
    const mid = new THREE.Color(0x050510);
    for (let i = 0; i < positions.length / 3; i++) {
        const y = positions[i * 3 + 1];
        const t = (y / (RADIUS * 4) + 1) / 2;
        const c = deep.clone().lerp(mid, t);
        colors.push(c.r, c.g, c.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const mat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide });
    skybox = new THREE.Mesh(geo, mat);
    skybox.name = 'skybox';
    scene.add(skybox);

    const starCount = 8000;
    const starPos = [];
    const starCol = [];
    const starSize = [];
    for (let i = 0; i < starCount; i++) {
        const phi = Math.random() * Math.PI * 2;
        const cost = Math.random() * 2 - 1;
        const r = Math.sqrt(1 - cost * cost);
        starPos.push(Math.cos(phi) * r * RADIUS * 3.9, cost * RADIUS * 3.9, Math.sin(phi) * r * RADIUS * 3.9);
        const brightness = 0.3 + Math.random() * 0.7;
        starCol.push(brightness, brightness, brightness);
        starSize.push(0.03 + Math.random() * 0.08);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.Float32BufferAttribute(starCol, 3));
    starGeo.setAttribute('size', new THREE.Float32BufferAttribute(starSize, 1));
    const starMat = new THREE.PointsMaterial({ size: 0.12, vertexColors: true, transparent: true, sizeAttenuation: false });
    bgStars = new THREE.Points(starGeo, starMat);
    bgStars.name = 'bgStars';
    scene.add(bgStars);
}


// --- Conversione equatoriale -> vettore 3D sulla sfera celeste ---
function equatorialToVector3(raDeg, decDeg, latDeg, lonDeg, date) {
    const now = date || new Date();
    const jd = julianDay(now);
    const gmst = greenwichMeanSiderealTime(jd);
    const lst = (gmst + lonDeg / 15) % 24;
    if (lst < 0) lst += 24;

    const ha = (lst - raDeg / 15) * 15; // angolo orario gradi
    const haRad = ha * Math.PI / 180;
    const decRad = decDeg * Math.PI / 180;
    const latRad = latDeg * Math.PI / 180;

    const sinAlt = Math.sin(decRad) * Math.sin(latRad) +
                   Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);
    const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));

    const cosAzNum = Math.sin(decRad) - Math.sin(latRad) * Math.sin(alt);
    const cosAzDen = Math.cos(latRad) * Math.cos(alt);
    let az = Math.acos(Math.max(-1, Math.min(1, cosAzNum / Math.max(cosAzDen, 1e-6))));
    if (Math.sin(haRad) > 0) az = 2 * Math.PI - az;

    // Proiezione su sfera: Y = su, X = est, Z = nord
    const x = Math.cos(alt) * Math.sin(az);
    const y = Math.sin(alt);
    const z = Math.cos(alt) * Math.cos(az);

    return new THREE.Vector3(x * RADIUS, y * RADIUS, z * RADIUS);
}

// --- Funzioni ausiliarie tempo ---
function julianDay(date) {
    return date.getTime() / 86400000 + 2440587.5;
}

function greenwichMeanSiderealTime(jd) {
    const t = (jd - 2451545.0) / 36525.0;
    let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) +
               0.000387933 * t * t - t * t * t / 38710000.0;
    gmst = ((gmst % 360) + 360) % 360;
    return gmst / 15; // ore
}

// --- Aggiorna cielo (posizioni stelle/costellazioni in base a data/posizione) ---
function updateSky() {
    if (!starSystem) return;

    const now = currentDate;
    const positions = starSystem.geometry.attributes.position.array;
    const starData = starSystem.userData.starData;

    for (let i = 0; i < stelleUniche.length; i++) {
        const s = stelleUniche[i];
        const v = equatorialToVector3(s.ra * 15, s.dec, lat, lon, now);
        positions[i * 3] = v.x;
        positions[i * 3 + 1] = v.y;
        positions[i * 3 + 2] = v.z;
    }
    starSystem.geometry.attributes.position.needsUpdate = true;

    // Aggiorna linee costellazioni
    if (constellationLines) {
        const cpos = constellationLines.geometry.attributes.position.array;
        let idx = 0;
        for (const c of costellazioni) {
            const nomi = c.stelle;
            if (nomi.length < 2) continue;
            for (let i = 0; i < nomi.length - 1; i++) {
                const a = stellaPerNome[nomi[i]];
                const b = stellaPerNome[nomi[i + 1]];
                if (!a || !b) continue;
                const va = equatorialToVector3(a.ra * 15, a.dec, lat, lon, now);
                const vb = equatorialToVector3(b.ra * 15, b.dec, lat, lon, now);
                cpos[idx++] = va.x; cpos[idx++] = va.y; cpos[idx++] = va.z;
                cpos[idx++] = vb.x; cpos[idx++] = vb.y; cpos[idx++] = vb.z;
            }
        }
        constellationLines.geometry.attributes.position.needsUpdate = true;
    }

    // Aggiorna info posizione
    infoPos.textContent = `Lat: ${lat.toFixed(2)}Â°  Lon: ${lon.toFixed(2)}Â°  Ora: ${now.toLocaleTimeString('it-IT')}`;

    // Aggiorna bussola (indica nord approssimativo basato su azimut 0)
    compassEl.textContent = 'N';
}

// --- Seleziona stella al click ---
function onCanvasClick(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(starSystem);

    if (intersects.length > 0) {
        const index = intersects[0].index;
        const data = starSystem.userData.starData[index];
        selectStar(data.nome);
    } else {
        deselectStar();
    }
}

function selectStar(nome) {
    const s = stellaPerNome[nome];
    if (!s) return;
    selectedObject = s;
    infoPanel.classList.remove('hidden');
    infoName.textContent = s.nome;
    infoDetail.textContent = `Costellazione: ${s.cost}  â€¢  Magnitudine: ${s.mag.toFixed(2)}`;
    infoPos.textContent = `Lat: ${lat.toFixed(2)}Â°  Lon: ${lon.toFixed(2)}Â°`;
}

function deselectStar() {
    selectedObject = null;
    infoPanel.classList.add('hidden');
}

// --- Geolocalizzazione ---
function getLocation() {
    if (!navigator.geolocation) {
        statusEl.textContent = 'Geolocalizzazione non supportata (usa Roma)';
        lat = 41.9;
        lon = 12.5;
        updateSky();
        return;
    }
    statusEl.textContent = 'Ricerca posizione...';
    navigator.geolocation.getCurrentPosition(pos => {
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
        statusEl.textContent = `Posizione: ${lat.toFixed(3)}, ${lon.toFixed(3)}`;
        updateSky();
    }, err => {
        statusEl.textContent = 'Posizione non disponibile (usa Roma di default)';
        lat = 41.9;
        lon = 12.5;
        updateSky();
    });
    setTimeout(() => {
        if (lat === null) {
            statusEl.textContent = 'Posizione non disponibile (usa Roma di default)';
            lat = 41.9;
            lon = 12.5;
            updateSky();
        }
    }, 1500);
}

// --- Mappa Google Maps: caricamento dinamico ---
function loadMapApi() {
    if (mapLoaded || window.google) {
        initMap();
        return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${mapApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
        mapLoaded = true;
        initMap();
    };
    script.onerror = () => {
        statusEl.textContent = 'Mappa non disponibile (inserisci una chiave Google Maps valida)';
        mapTitle.textContent = 'Mappa non disponibile â€” usa GPS o inserisci coordinate';
    };
    document.head.appendChild(script);
}

function initMap() {
    if (!window.google || !window.google.maps) return;
    const center = { lat, lng: lon };
    map = new google.maps.Map(mapEl, {
        center,
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
            { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#9aa0b2' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#050510' }] },
            { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#2a2a4a' }] },
            { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#2a2a4a' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#3a3a5a' }] },
            { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9aa0b2' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f1a2a' }] }
        ]
    });

    mapMarker = new google.maps.Marker({
        position: center,
        map,
        draggable: true,
        title: 'Posizione osservatorio'
    });

    map.addListener('click', (e) => {
        mapMarker.setPosition(e.latLng);
    });

    mapMarker.addListener('dragend', () => {
        const pos = mapMarker.getPosition();
        mapTitle.textContent = `Posizione: ${pos.lat().toFixed(4)}, ${pos.lng().toFixed(4)}`;
    });

    mapTitle.textContent = `Posizione: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}

function openMap() {
    if (!mapLoaded && !window.google) {
        loadMapApi();
    }
    mapContainer.classList.remove('hidden');
    if (map) google.maps.event.trigger(map, 'resize');
}

function closeMap() {
    mapContainer.classList.add('hidden');
}

function confirmMapPosition() {
    if (!mapMarker) return;
    const pos = mapMarker.getPosition();
    lat = pos.lat();
    lon = pos.lng();
    statusEl.textContent = `Posizione: ${lat.toFixed(3)}, ${lon.toFixed(3)} (mappa)`;
    updateSky();
    closeMap();
}

// --- Controlli UI ---
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDateTimeChange() {
    if (!datetimeInput.value) return;
    autoTime = false;
    currentDate = new Date(datetimeInput.value + 'Z');
    updateSky();
}

function updateDateTimeInput() {
    const d = new Date(currentDate);
    // datetime-local accetta "YYYY-MM-DDTHH:MM"
    const pad = (n) => String(n).padStart(2, '0');
    const str = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
    datetimeInput.value = str;
}

function setNow() {
    autoTime = true;
    currentDate = new Date();
    updateDateTimeInput();
    updateSky();
}

// --- Loop render ---
function animate() {
    requestAnimationFrame(animate);

    if (autoTime) {
        currentDate = new Date();
        // Aggiorna cielo solo se passato almeno un secondo (riduce ridisegni)
        if (!animate.lastSecond || Math.floor(Date.now() / 1000) !== animate.lastSecond) {
            animate.lastSecond = Math.floor(Date.now() / 1000);
            updateSky();
        }
    }

    controls.update();
    renderer.render(scene, camera);
}

// --- Avvio ---
btnLocate.addEventListener('click', getLocation);
btnMap.addEventListener('click', openMap);
btnUseGps.addEventListener('click', getLocation);
btnConfirmMap.addEventListener('click', confirmMapPosition);
btnCloseMap.addEventListener('click', closeMap);
btnNight.addEventListener('click', () => {
    showNight = !showNight;
    btnNight.textContent = showNight ? '🌙 Notturna' : '☀️ Diurna';
    renderer.setClearColor(showNight ? 0x050510 : 0x87ceeb, 1);
    const mat = starSystem.material;
    mat.opacity = showNight ? 1 : 0.15;
    mat.needsUpdate = true;
    // Stelle di fondo visibili solo di notte
    if (bgStars) bgStars.visible = showNight;
    // Skybox visibile solo di notte
    if (skybox) skybox.visible = showNight;
    // Terreno sempre visibile, leggermente più scuro di giorno
    if (ground) ground.material.opacity = showNight ? 0.9 : 0.5;
});
btnConstellations.addEventListener('click', () => {
    showConstellations = !showConstellations;
    btnConstellations.classList.toggle('active', showConstellations);
    if (constellationLines) constellationLines.visible = showConstellations;
});
btnNow.addEventListener('click', setNow);

// Posizione di default e avvio
statusEl.textContent = `Posizione: ${lat.toFixed(3)}, ${lon.toFixed(3)} (default)`;
init();


