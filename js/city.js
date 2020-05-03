// Scene stuff
var renderer, scene;
var camera
var directionalLight;

// Other
var controls;
var mouseInScreen = true;
var stats;


var clock = new THREE.Clock();

settings = { 
	BUILDING_AMOUNT: 1000, 
	SEED: Math.random(),
	SHADOW_MAP_SIZE: 1024,
	REGENERATE: function(){
		console.log("Regenerate");
	}}

console.log(settings.BUILDING_AMOUNT);

const BUILDING_DISTANCE_MULTIPLIER = 4;
const BUILDING_DISTANCE_OFFSET_X = 0;
const BUILDING_DISTANCE_OFFSET_Z = 0;

// Sample the noise
noise.seed(settings.SEED);

function animate () {
	
	stats.begin();

	if(mouseInScreen)
		controls.update(clock.getDelta());
	
	renderer.render(scene, camera);

	stats.end();

	requestAnimationFrame(animate);
};

function initialize(){
	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0xd0e0f0, 0.0025);

	camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000 );
	camera.position.y = 175;

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( 0xd8e7ff ); // This will put sky'ish color
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
	
	
	document.body.appendChild( renderer.domElement );

	light = new THREE.HemisphereLight( 0xfffff0, 0x101020, 0.6 );
	light.position.set( 0.75, 5, 0.25 );
	scene.add(light);

	// General scene lighting
	directionalLight = new THREE.DirectionalLight( 0xfffff0, 0.8 );
	directionalLight.castShadow = true;
	
	// Set up shadow properties for the light
	// https://threejs.org/docs/#api/en/cameras/OrthographicCamera
	directionalLight.shadow.mapSize.width = 1028;  
	directionalLight.shadow.mapSize.height = 1028;
	directionalLight.shadow.camera = new THREE.OrthographicCamera(-256,256,256,-256, 1, 1024);

	// Adds the directional ligh t to the set position to the position
	directionalLight.position.set( 0, 100, 25 );
	directionalLight.target.position.set(0, 90, 5);
	scene.add( directionalLight );
	scene.add( directionalLight.target)

	const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    scene.add(cameraHelper);

	window.addEventListener("resize", onWindowResize, false );
	window.addEventListener("mouseout", onMouseOut, false );
	window.addEventListener("mouseover", onMouseOver, false );
}

function createStats(){
	stats = new Stats();
	stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
	document.body.appendChild( stats.dom );
}

function createGUIControls(){
	var gui = new dat.GUI();

	var f1 = gui.addFolder("Camera");
	f1.add(settings, "SHADOW_MAP_SIZE");

	gui.add(settings, "REGENERATE");
}

function createMouseControls(){
	controls = new THREE.FirstPersonControls( camera );
	controls.movementSpeed = 20;
	controls.lookSpeed = 0.05;
	controls.lookVertical = true;
	// Make camera face-down to the city
	controls.lat = -15;
	controls.lon = 15;
}

function createPlane(){
	let plane = new THREE.Mesh(new THREE.PlaneGeometry( 2000, 2000 ), new THREE.MeshStandardMaterial( { color: 0xFFFFFF } ) );
	plane.rotation.x = -90 * Math.PI / 180;
	scene.add(plane);
}

function createTerrain(){
	var geometry = new THREE.PlaneBufferGeometry(2000, 2000, 256, 256);
	geometry.rotateX(-Math.PI / 2);

	// TODO: fill thiswda
	var vertices = geometry.attributes.position.array;
	for ( var i = 0, j = 0, length = vertices.length; i < length; i ++, j += 3 ) {
		vertices[ j + 1 ] = Math.sin(i * Math.PI/ 2) * 2;
	}
	console.log(vertices.length);

	mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x999999 }) );
	mesh.receiveShadow = true;
	scene.add(mesh);
}

function createCube(){
	let geometry = new THREE.BoxGeometry();
	let material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	let cube = new THREE.Mesh( geometry, material );
	console.log(cube);
	scene.add(cube);
}

function createBuildings(amount){
	let buildingGeometry = new THREE.BoxGeometry(1, 1, 1);
	// Move the pivot point to the bottom
	buildingGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0.5, 0));

	// Remove the bottom face
	buildingGeometry.faces.splice(6, 2);
	buildingGeometry.faceVertexUvs[0].splice(6, 2);

	// UV Mapping for the roofs
	buildingGeometry.faceVertexUvs[0][4][0].set(0, 0);
	buildingGeometry.faceVertexUvs[0][4][1].set(0, 0);
	buildingGeometry.faceVertexUvs[0][4][2].set(0, 0);
	buildingGeometry.faceVertexUvs[0][5][0].set(0, 0);
	buildingGeometry.faceVertexUvs[0][5][1].set(0, 0);
	buildingGeometry.faceVertexUvs[0][5][2].set(0, 0);

	let cityGeometry = new THREE.Geometry();
	for(let i = 0; i < amount; i++){
		// Build final mesh and add it to scene
		let buildingMesh = new THREE.Mesh(buildingGeometry);
		setRandomBuildingTransformation(buildingMesh)

		// Merge meshes together into a single geometry for optimization
		cityGeometry.mergeMesh(buildingMesh);
	}
	
	// Generate and assign the texture
	let buildingTexture = new THREE.Texture(getBuildingTexture());
	buildingTexture.anisotropy = renderer.getMaxAnisotropy();
	buildingTexture.needsUpdate = true;

	// Build final mesh and add it to scene
	let cityMesh = new THREE.Mesh(cityGeometry, new THREE.MeshLambertMaterial( { map: buildingTexture } ) );
	cityMesh.castShadow = true;
	cityMesh.receiveShadow = true;
	scene.add(cityMesh);
}

function setRandomBuildingTransformation(buildingMesh){
	let xPos = (Math.random() * 200 - 100) * BUILDING_DISTANCE_MULTIPLIER + BUILDING_DISTANCE_OFFSET_X;
	let zPos = (Math.random() * 200 - 100) * BUILDING_DISTANCE_MULTIPLIER + BUILDING_DISTANCE_OFFSET_Z; 
	buildingMesh.position.x = Math.floor(xPos);
	buildingMesh.position.z = Math.floor(zPos);
	
	buildingMesh.rotation.y = Math.random() * Math.PI * 2;

	// More Math randoms to make smaller buildings more frequent (And more random :))
	buildingMesh.scale.x  = Math.random()*Math.random()*Math.random()*Math.random() * 50 + 10;
	buildingMesh.scale.z  = buildingMesh.scale.x;
	let perlinFactor = (noise.perlin2(xPos / 640, zPos / 640) + 1);
	buildingMesh.scale.y  = (Math.random() * Math.random() * buildingMesh.scale.x) * perlinFactor * perlinFactor * 6 + 8;
}

function getBuildingTexture(){
	let canvas = document.createElement("canvas");
	canvas.width = 32;
	canvas.height = 64;
	
	// Get Context and Disable the smoothing/aliasing
	let context = canvas.getContext("2d");

	// Fill it all white
	context.fillStyle = "#ffffff";
	context.fillRect(0, 0, 32, 64);
	
	for(var y = 2; y < 64; y += 2 ){
		for(var x = 0; x < 32; x += 2 ){
		  var value = Math.floor( Math.random() * 64 );
		  context.fillStyle = `rgb(${value}, ${value}, ${value})`;
		  context.fillRect( x, y, 2, 1 );
		}
	}

	// We will now create new canvas to stretch the texture
	let canvas2 = document.createElement("canvas");
	canvas2.width = 512;
	canvas2.height  = 1024;

	context = canvas2.getContext("2d");
	context.imageSmoothingEnabled   = false;
	context.webkitImageSmoothingEnabled = false;
	context.mozImageSmoothingEnabled  = false;

	context.drawImage(canvas, 0, 0, canvas2.width, canvas2.height );
	return canvas2;
}

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

function onMouseOut(){
	mouseInScreen = false;
}

function onMouseOver(){
	mouseInScreen = true;
}

initialize();

createStats();
createTerrain();
createMouseControls();
createBuildings(1000);
createGUIControls();

animate();