
var renderer;
var scene;
var camera;
var controls;

var clock = new THREE.Clock();

var animate = function () {
	requestAnimationFrame(animate);

	controls.update(clock.getDelta());

	renderer.render(scene, camera);
};

function initializeScene(){
	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0xd0e0f0, 0.0025);

	camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000 );
	camera.position.z = 0;
	camera.position.y = 0.5;

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( 0xd8e7ff ); // This will put sky'ish color
	document.body.appendChild( renderer.domElement );

	light = new THREE.HemisphereLight( 0xfffff0, 0x101020, 0.90 );
	light.position.set( 0.75, 5, 0.25 );
	scene.add(light);

	controls = new THREE.FirstPersonControls( camera );
	controls.movementSpeed = 20;
	controls.lookSpeed = 0.05;
	controls.lookVertical = true;
}

function createPlane(){
	let plane = new THREE.Mesh(new THREE.PlaneGeometry( 2000, 2000 ), new THREE.MeshBasicMaterial( { color: 0xFFFFFF } ) );
	plane.rotation.x = -90 * Math.PI / 180;
	scene.add(plane);
}

function createCube(){
	let geometry = new THREE.BoxGeometry();
	let material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	let cube = new THREE.Mesh( geometry, material );
	console.log(cube);
	scene.add( cube );
}

function createBuilding(){
	let geometry = new THREE.BoxGeometry(1, 1, 1);
	// Move the pivot point to the bottom
	geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0.5, 0));

	// Remove the bottom face
	console.log(geometry.faces)
	geometry.faces.splice(6, 2);
	geometry.faceVertexUvs[0].splice(6, 2);
	console.log(geometry.faces)

	// UV Mapping for the roofs
	geometry.faceVertexUvs[0][4][0].set(0, 0);
	geometry.faceVertexUvs[0][4][1].set(0, 0);
	geometry.faceVertexUvs[0][4][2].set(0, 0);
	geometry.faceVertexUvs[0][5][0].set(0, 0);
	geometry.faceVertexUvs[0][5][1].set(0, 0);
	geometry.faceVertexUvs[0][5][2].set(0, 0);

	// Generate and assign the texture
	let buildingTexture = new THREE.Texture(getBuildingTexture());
	buildingTexture.anisotropy = renderer.getMaxAnisotropy();
	buildingTexture.needsUpdate = true;

	// Build final mesh and add it to scene
	let buildingMesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial( { map: buildingTexture } ) );
	buildingMesh.name = "Building";
	buildingMesh.position.y = 4;
	scene.add(buildingMesh);
	console.log(buildingMesh);
}

function getBuildingTexture(){
	let canvas = document.createElement("canvas");
	canvas.width = 32;
	canvas.height = 64;
	
	// Get Context and Disable the smoothing/aliasing
	let context = canvas.getContext("2d");
	context.imageSmoothingEnabled = false;
	context.webkitImageSmoothingEnabled = false;
	context.mozImageSmoothingEnabled = false;

	// Fill it all white
	context.fillStyle = "#ffffff";
	context.fillRect(0, 0, 32, 64);
	
	for(var y = 2; y < 64; y += 2 ){
		for(var x = 0; x < 32; x += 2 ){
		  var value = Math.floor( Math.random() * 64 );
		  context.fillStyle = 'rgb(' + [value, value, value].join( ',' )  + ')';
		  context.fillRect( x, y, 2, 1 );
		}
	}

	context.drawImage(canvas, 0, 0, 32, 64);
	return canvas;
}

initializeScene();

createPlane();
createCube();
createBuilding();

animate();