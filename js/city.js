// Scene stuff
var renderer, scene;
var camera, cameraHelper;
var directionalLight;
var roadSpline;

// Other
var controls;
var mouseInScreen = true;
var stats;


var clock = new THREE.Clock();

settings = { 
	BUILDING_AMOUNT: 1000, 
	SEED: Math.random(),
	CAMERA_HELPER_ENABLE: false,
	SHADOW_MAP_SIZE: 2048,
	REGENERATE: function(){
		console.log("Regenerate");
	}}

const CITY_SIZE = 512;
const BUILDING_DISTANCE_OFFSET_X = 0;
const BUILDING_DISTANCE_OFFSET_Z = 0;

// Sample the noise
noise.seed(settings.SEED);

function animate () {
	stats.begin();

	if(mouseInScreen)
		controls.update(clock.getDelta());
	
	// Move light
	const newTargetVector = new THREE.Vector3( );
	newTargetVector.copy(camera.position)
	newTargetVector.add(new THREE.Vector3(380, -10, 385))
	newTargetVector.y = 110;

	directionalLight.position.copy(camera.position)
	directionalLight.position.add(new THREE.Vector3(400,0,400))
	directionalLight.position.y = 125;
	directionalLight.target.position.copy(newTargetVector)

	// Render scene and map
	map.drawMap([camera.position.x,camera.position.z])
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
	directionalLight.shadow.mapSize.width = settings.SHADOW_MAP_SIZE;  
	directionalLight.shadow.mapSize.height = settings.SHADOW_MAP_SIZE;
	directionalLight.shadow.camera = new THREE.OrthographicCamera(-512,512,512,-512, 1, 1000);

	// Adds the directional ligh t to the set position to the position
	directionalLight.position.set( 0, 100, 25 );

	directionalLight.target.position.set(0, 90, 5);
	scene.add( directionalLight );
	scene.add( directionalLight.target)

	cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
	cameraHelper.visible = false;
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

	const f1 = gui.addFolder("Camera");
	let controller = f1.add(settings, "SHADOW_MAP_SIZE");
	controller.onChange(function(value){
		console.log(value);
	});

	f1.add(settings, "CAMERA_HELPER_ENABLE").onChange(function(value){
		cameraHelper.visible = value;
	});
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

function createTerrain(){
	var geometry = new THREE.PlaneBufferGeometry(2000, 2000, 256, 256);
	geometry.rotateX(-Math.PI / 2);

	// TODO: fill thiswda
	var vertices = geometry.attributes.position.array;
	for ( var i = 0, j = 0, length = vertices.length; i < length; i ++, j += 3 ) {
		vertices[ j + 1 ] = Math.sin(i * Math.PI/ 2) * 2;
	}

	mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x999999 }) );
	mesh.receiveShadow = true;
	scene.add(mesh);
}

function getBuildingGeometry(){
	let buildingGeometry = new THREE.BoxGeometry(1, 1, 1);
	// Move the pivot point to the bottom
	buildingGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0.5, 0));

	// Remove the bottom face
	buildingGeometry.faces.splice(6, 2);
	buildingGeometry.faceVertexUvs[0].splice(6, 2);

	// Add roof 
	if(Math.random() > 0.75){
		buildingGeometry.vertices.push(new THREE.Vector3(0,1.25,0.5));
		buildingGeometry.vertices.push(new THREE.Vector3(0,1.25,-0.5));

		buildingGeometry.faces.push(new THREE.Face3(4,8,9))
		buildingGeometry.faces.push(new THREE.Face3(4,5,8))
		buildingGeometry.faces.push(new THREE.Face3(9,8,0))
		buildingGeometry.faces.push(new THREE.Face3(0,1,9))
		// Sides
		buildingGeometry.faces.push(new THREE.Face3(1,4,9))
		buildingGeometry.faces.push(new THREE.Face3(5,0,8))

		// UV fix
		for(let i = 0; i < 6; i++){
			buildingGeometry.faceVertexUvs[0].push([new THREE.Vector2(0,0),new THREE.Vector2(0,0),new THREE.Vector2(0,0)])
		}
		// Sides
		//for(let i = 0; i < 2; i++){
		//	buildingGeometry.faceVertexUvs[0].push([new THREE.Vector2(0,0),new THREE.Vector2(0.5,0.5),new THREE.Vector2(0,0)])
		//}

		buildingGeometry.elementsNeedUpdate = true;
		buildingGeometry.computeFaceNormals();
		buildingGeometry.computeVertexNormals();
	}

	// Vertex color assignment
	const possibleColors = [
		new THREE.Color(0xc78689), // Red'ish/Brown
		new THREE.Color(0xa9a39c), // Gray'ish
		new THREE.Color(0x026397), // Blue
		new THREE.Color(0xddcfb4)] // Marble-like
	const randomColor = possibleColors[Math.floor(Math.random() * possibleColors.length)];
	let slightlyModified = new THREE.Color()
	slightlyModified.copy(randomColor);
	slightlyModified.r += Math.random() * 0.2 - 0.1;
	slightlyModified.g += Math.random() * 0.2 - 0.1;
	slightlyModified.b += Math.random() * 0.2 - 0.1;

	for(let i = 0; i < buildingGeometry.faces.length; i++){
		buildingGeometry.faces[i].color = slightlyModified;
	}

	buildingGeometry.colorsNeedUpdate = true

	// UV Mapping for the roofswrd
	buildingGeometry.faceVertexUvs[0][4][0].set(0, 0);
	buildingGeometry.faceVertexUvs[0][4][1].set(0, 0);
	buildingGeometry.faceVertexUvs[0][4][2].set(0, 0);
	buildingGeometry.faceVertexUvs[0][5][0].set(0, 0);
	buildingGeometry.faceVertexUvs[0][5][1].set(0, 0);
	buildingGeometry.faceVertexUvs[0][5][2].set(0, 0);
	return buildingGeometry;
}

////
// NOT USED ANYMORE
////
function createRandomBuildings(amount){
	let buildingGeometry = getBuildingGeometry();
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
	let cityMesh = new THREE.Mesh(cityGeometry, new THREE.MeshBasicMaterial( { map: buildingTexture, vertexColors: THREE.VertexColors } ) );
	cityMesh.castShadow = true;
	cityMesh.receiveShadow = true;
	scene.add(cityMesh);
}

function setRandomBuildingTransformation(buildingMesh){
	let xPos = (Math.random() * 2 - 1) * CITY_SIZE + BUILDING_DISTANCE_OFFSET_X;
	let zPos = (Math.random() * 2 - 1) * CITY_SIZE + BUILDING_DISTANCE_OFFSET_Z; 
	buildingMesh.position.x = Math.floor(xPos);
	buildingMesh.position.z = Math.floor(zPos);
	
	buildingMesh.rotation.y = Math.random() * Math.PI * 2;

	// More Math randoms to make smaller buildings more frequent (And more random :))
	buildingMesh.scale.x  = Math.random()*Math.random()*Math.random()*Math.random() * 50 + 10;
	buildingMesh.scale.z  = buildingMesh.scale.x;
	let perlinFactor = (noise.perlin2(xPos / 640, zPos / 640) + 1);
	buildingMesh.scale.y  = (Math.random() * Math.random() * buildingMesh.scale.x) * perlinFactor * perlinFactor * 6 + 8;
}

// TODO put this back into Create Buildigns from points and optimize it
var boundingBoxes = [];

function createBuildingsFromPoints(points, approximateHeight, approximateRotation){
	let buildingGeometry = getBuildingGeometry();
	let cityGeometry = new THREE.Geometry();
	for(let i = 0; i < points.length; i++){
		// Build final mesh and add it to scene
		let buildingMesh = new THREE.Mesh(buildingGeometry);

		// Set transformation
		buildingMesh.rotation.y = approximateRotation + Math.random() * Math.PI * 0.1;

		// Offset from map's scale
		buildingMesh.position.x = points[i][0] * 4 - 512
		buildingMesh.position.z = points[i][1] * 4 - 512

		buildingMesh.scale.x  = Math.random() * Math.random() * Math.random() * approximateHeight * 0.25 + 16 + 16 * (approximateHeight * 0.01);

		// Randomize size
		if(Math.random() > 0.25)
			buildingMesh.scale.z  = buildingMesh.scale.x;
		else
			buildingMesh.scale.z  = buildingMesh.scale.x * 2;

		buildingMesh.scale.y  = approximateHeight + 20 * Math.random() * Math.random();

		// Create bounding box and comapre for other boxes
		let boundingBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
		let doesIntersect = false;
		boundingBox.setFromObject(buildingMesh);

		// Compare with buildings
		for(let j = 0; j < boundingBoxes.length; j++){
			if(boundingBox.intersectsBox(boundingBoxes[j])){
				doesIntersect = true;
				break;
			}
		}
		
		// Compare with road points
		if(!doesIntersect){
			for(let j = 0; j < 100; j++){
				let sphere = new THREE.Sphere(roadSpline.getPoint(j / 100), 11)
				if(boundingBox.intersectsSphere(sphere)){
					doesIntersect = true;
					break;
				}
			}
		}

		if(!doesIntersect)
		{
			// Merge meshes together into a single geometry for optimization
			cityGeometry.mergeMesh(buildingMesh);
			boundingBoxes.push(boundingBox);
		}
	}
	
	// Generate and assign the texture
	let buildingTexture = new THREE.Texture(getBuildingTexture());
	buildingTexture.anisotropy = renderer.getMaxAnisotropy();
	buildingTexture.needsUpdate = true;

	// Build final mesh and add it to scene
	let cityMesh = new THREE.Mesh(cityGeometry, new THREE.MeshLambertMaterial( { map: buildingTexture, vertexColors: THREE.VertexColors } )  );
	cityMesh.castShadow = true;
	cityMesh.receiveShadow = true;
	scene.add(cityMesh);
}

function createCellFoundations(){
	for(let i = 0; i < map.cells.length; i++){
		var shape = new THREE.Shape();

		// Move through the current polygon and offset it by city scale times 
		let polygon = map.cells[i].polygons[0]

		shape.moveTo(polygon[0] * 4 - 512, polygon[1] * 4 - 512)
		for(let j = 1; j < map.cells[i].polygons.length; j++){
			polygon = map.cells[i].polygons[j];
			shape.lineTo(polygon[0] * 4 - 512, polygon[1] * 4 - 512)
		}

		var extrudeSettings = { depth: 0.25 };
		var geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);

		let color;
		if(map.cells[i].hasBuildings)
		{
			var value = Math.floor( Math.random() * 128) + 40;
			color = `rgb(${value}, ${value}, ${value})`;
		}
		else
			color = 0x00AA00

		var mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: color } ) );
		mesh.rotation.x = Math.PI * 0.5;
		mesh.receiveShadow = true;
		scene.add(mesh);
	}
}

function createRoad(){
	// Convert map road points to vector points
	let vectorArray = [];
	for (let i = 0; i < map.roadPoints.length; i++) {
		vectorArray.push(new THREE.Vector3(map.roadPoints[i][0] * 4 - 512, 2.5, map.roadPoints[i][1] * 4 - 512));

	}

	roadSpline =  new THREE.CatmullRomCurve3(vectorArray);
	roadSpline.type = 'catmullrom';

	const extrudeSettings = {
		steps           : 64,
		bevelEnabled    : false,
		extrudePath     : roadSpline
	};

	let pts = [], count = 3;
	for (let i = 0; i < count; i ++ ) {
		let l = 8;
		let a = 2 * i / count * Math.PI;
		pts.push( new THREE.Vector2 ( Math.cos( a ) * l, Math.sin( a ) * l ) );
	}
	let shape = new THREE.Shape(pts);
	console.log(roadSpline.getPoint(0.5))

	// Extrude the triangle along the CatmullRom curve
	let geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
	let material = new THREE.MeshLambertMaterial( { color: 0xb00000, wireframe: false } );

	// Create mesh with the resulting geometry
	let mesh = new THREE.Mesh(geometry, material);
	mesh.receiveShadow = true;
	scene.add(mesh);
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

	// turn off smoothing
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
//createGUIControls();
createMouseControls();

// Geometry
createTerrain();
createCellFoundations();
createRoad();

// Buildings
let i = 0;
for(i; i < map.cells.length; i++){

	if(map.cells[i].hasBuildings)
		createBuildingsFromPoints(map.cells[i].randomPoints, 
			Math.random() * Math.random() * Math.random() * 140 + 15,
			Math.random() * Math.PI * 2)
}

animate();