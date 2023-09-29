
import * as THREE from './three.module.js';
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js';
import Stats from './three/examples/jsm/libs/stats.module.js';
import * as CANNON from "./cannon-es.js";

const scene = new THREE.Scene();

const world = new CANNON.World();
world.gravity.set(0, -9.82 * 5, 0);

var delta;

const socket = await io.connect();
console.log(socket);
var parrotId;
var parrots = [];
var pos;
var rot;

//parrot variables
var parrot; // gltf
var parrotS; // scene
var parrotSize; //parrot Helping Box Size
var parrotBHelper; //parrot Helping Box
var parrotBox; //parrot hit box
var parrotBody; //parrot collider body in the world
// var parrotCollider;
var rotationSpeed; //rotation speed of parrot
var movementSpeed = 30; // movement speed of parrot
var parrotShape; // parrot Mesh
var forwardParrot = new CANNON.Vec3(0,0,1);
var clock = new THREE.Clock();

//house variables
var house; 

const box3 = new THREE.Box3();
const vector = new THREE.Vector3( 1, 1, 1);
var rotationQuat = new CANNON.Quaternion();

//var for axis
var axisX =  new CANNON.Vec3( 1, 0, 0 );
var axisY =  new CANNON.Vec3( 0, 1, 0 );
var axisZ =  new CANNON.Vec3( 0, 0, 1 );

//camera following the parrot
const followCamPivot = new THREE.Object3D();
followCamPivot.rotation.order = 'YXZ';
const followCam = new THREE.Object3D();
followCam.position.z = 4;
followCamPivot.add(followCam);

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000	 );
camera.position.set( 0, 0, -100 );
scene.add(camera);

const group = new THREE.Group();
group.add(camera);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//camera controls with left click and dragging
const controls = new OrbitControls( camera , renderer.domElement );
controls.enablePan = false;

const loader = new GLTFLoader();

// fonction pour créer une surface de déplacement 
function createPlane(posX,posY,posZ,lengthX,lengthY,lengthZ,Rotation,debug){

	//plane visual ( debug )
	const planeGeometry = new THREE.PlaneGeometry(lengthX*2, lengthZ*2);
	const planeMaterial = new THREE.MeshBasicMaterial({color : 0xffffff, side : THREE.DoubleSide});
	const plane = new THREE.Mesh(planeGeometry, planeMaterial);	
	plane.position.x = posX;
	plane.position.y = posY;
	plane.position.z = posZ;

	if(debug === true){
		scene.add(plane);
	}

	//physic for the plane
	const planeShape = new CANNON.Box(new CANNON.Vec3(lengthX,lengthY,lengthZ));
	const planeBody = new CANNON.Body({ mass: 0 , type : CANNON.Body.STATIC });
	planeBody.addShape(planeShape);
	world.addBody(planeBody);

	planeBody.position.x = plane.position.x;
	planeBody.position.y = plane.position.y;
	planeBody.position.z = plane.position.z;

	plane.position.x = planeBody.position.x;
	plane.position.y = planeBody.position.y;
	plane.position.z = planeBody.position.z;

	planeBody.quaternion.setFromAxisAngle(axisX, Rotation);
	plane.rotation.x = Rotation + Math.PI/2;

}

//fonction pour créer une barrière pour empêcher le joueur d'avancer 

function createWall(posX,posY,posZ,lengthX,lengthY,lengthZ,Rotation,debug){


	//plane visual ( debug )
	const planeGeometry = new THREE.PlaneGeometry(lengthX*2, lengthY*2);
	const planeMaterial = new THREE.MeshBasicMaterial({color : 0xffffff, side : THREE.DoubleSide})
	const plane = new THREE.Mesh(planeGeometry, planeMaterial);
	plane.position.x = posX;
	plane.position.y = posY;
	plane.position.z = posZ;

	if(debug === true){
		scene.add(plane);
	}

	//physic for the plane
	const planeShape = new CANNON.Box(new CANNON.Vec3(lengthX,lengthY,lengthZ));
	const planeBody = new CANNON.Body({ mass: 0 , type : CANNON.Body.STATIC });
	planeBody.addShape(planeShape);
	world.addBody(planeBody);

	planeBody.position.x = plane.position.x;
	planeBody.position.y = plane.position.y;
	planeBody.position.z = plane.position.z;

	planeBody.quaternion.setFromAxisAngle(axisY, 0);

	plane.position.x = planeBody.position.x;
	plane.position.y = planeBody.position.y;
	plane.position.z = planeBody.position.z;

	//console.log(plane.position,planeBody.position)

	planeBody.quaternion.setFromAxisAngle(axisY, Rotation);
	plane.rotation.y = Rotation;

};

function createBox(posX,posY,posZ,lengthX,lengthY,lengthZ,Rotation,debug){


	//plane visual ( debug )
	const boxGeometry = new THREE.BoxGeometry(lengthX*2, lengthY*2, lengthZ*2);
	const boxMaterial = new THREE.MeshBasicMaterial({color : 0xffffff, side : THREE.DoubleSide})
	const box = new THREE.Mesh(boxGeometry, boxMaterial);
	box.position.x = posX;
	box.position.y = posY;
	box.position.z = posZ;

	if(debug === true){
		scene.add(box);
	}

	//physic for the plane
	const boxShape = new CANNON.Box(new CANNON.Vec3(lengthX,lengthY,lengthZ));
	const boxBody = new CANNON.Body({ mass: 0 , type : CANNON.Body.STATIC });
	boxBody.addShape(boxShape);
	world.addBody(boxBody);

	boxBody.position.x = box.position.x;
	boxBody.position.y = box.position.y;
	boxBody.position.z = box.position.z;

	boxBody.quaternion.setFromAxisAngle(axisY, 0);

	box.position.x = boxBody.position.x;
	box.position.y = boxBody.position.y;
	box.position.z = boxBody.position.z;

	//console.log(box.position,boxBody.position)

	boxBody.quaternion.setFromAxisAngle(axisY, Rotation);
	box.rotation.y = Rotation;

};

//section mur invisible

//plage
createPlane( 30, 6, -85, 50, 0.1, 60, 0, false);
//escalier
createPlane( 25, 16, -85, 10, 0.1, 12.5, 5*Math.PI / 7, false);
//porche
createPlane( 30, 26, -24, 35, 0.1, 50, 0, false);

//oceéan
createWall( 40, 26, -135, 75, 30, 0.2, 0, false);
//autre coté de l'ile
createWall( 80, 26, -85, 75, 30, 0.2, Math.PI/2, false);
//eau peu profonde
createWall( -20, 26, -85, 75, 30, 0.2, Math.PI/2, false);
//sous le porche
createWall( 30, 26, -25, 75, 30, 0.2, 0, false);

//caisse porche
createBox( 56, 33, -35, 6, 6, 6, -Math.PI/32, false);
//tonneau
createBox( 26, 31, -45, 2.5, 4.5, 2.5, 0, false);


//background color
scene.background = new THREE.Color(0x40E0D0);

//permet de charger dans la scène le gltf de la maison

loader.load( 'scripts/GLTF/sea_house/scene.gltf', function ( gltf ) {
	
	house = gltf;
   	scene.add( house.scene );
}, undefined, function ( error ) {

   	console.error( error );

} );

// loader.load( 'scripts/GLTF/Tonneau.gltf', function ( gltf ) {

//    	scene.add( gltf.scene );

// 	gltf.scene.position.x = 26;
// 	gltf.scene.position.y = 31;
// 	gltf.scene.position.z = -45;
// }, undefined, function ( error ) {

//    	console.error( error );

// } );




//permet de charger un perroquet dans la scène que le joueur controlera
function createParrot(id){
	loader.load( 'scripts/GLTF/parrot/scene.gltf', function ( gltf ) {

		parrot = gltf;

		parrotS = parrot.scene;
	
		scene.add( parrotS );
	
		parrotBHelper = new THREE.BoxHelper( parrotS, 0x000000 );
		scene.add( parrotBHelper );
	
		box3.setFromObject(parrotBHelper);
		//console.log( box3 );
	
		parrotS.scale.set( 20,20,20 );
		parrotS.position.x = 0;
		parrotS.position.y = 20;
		parrotS.position.z = -115;
	
		parrotS.add( followCam );
	
		parrotBox = new THREE.Object3D();
	
		parrotBox.position.x = parrotS.position.x;
		parrotBox.position.y = parrotS.position.y;
		parrotBox.position.z = parrotS.position.z;
	
		parrotSize = box3.getSize(vector);
		//console.log( parrotSize );
	
		parrotBox.scale.set(parrotSize);
	
		parrotS.add( parrotBox );
	
		parrotBody = new CANNON.Body({mass : 0.001})
		parrotShape = new CANNON.Box(new CANNON.Vec3(parrotSize.x  * 9.5,parrotSize.y * 9.5,parrotSize.z  * 9.5));
		parrotBody.angularDamping = 1;
		parrotBody.addShape(parrotShape);
	
		world.addBody(parrotBody);
	
		parrotBody.position.x = parrotS.position.x;
		parrotBody.position.y = parrotS.position.y;
		parrotBody.position.z = parrotS.position.z;
		
		//console.log(parrotBox.userData.halfSize);
	
		//console.log( "parrot position : ", parrotS.position , "\n parrot scale : " , parrotS.scale,"\nbox position : " , parrotBody.position , "\n box scale : " , parrotShape.halfExtents, "\n parrot Size", parrotSize);
		
		let parrotId = id;

		addParrot(parrotId, parrotS);

		return parrotS;
	}, undefined, function ( error ) {
	
		console.error( error );
	
	} );
}

function addParrot(id, scene){
	parrots.push([id, scene]);
	console.log("id " + id + " scene " + scene);
}

//les inputs que le joueur peut utiliser pour se déplacer
const controller = {
	"z" 	: {pressed : false , func : moveForward	},
	"s" 	: {pressed : false , func : moveBackward},
	"q" 	: {pressed : false , func : rotateLeft	},
	"d" 	: {pressed : false , func : rotateRight	},
	//"a" 	: {pressed : false , func : MajRequest }

};

function MajRequest(){
	socket.emit('MajPositionsRequest');

}

function createParrotForClient(clientId) {
	const parrotName = `parrot_${clientId}`;
	const newParrot = createParrot();
	parrots[parrotName] = newParrot;
	newParrot.name = parrotName;
	scene.add(newParrot);
	return newParrot;
  }

socket.on('connect', () => {
    parrotId = socket.id;
    socket.emit('newParrot');
	createParrot(socket.id);

});




function sendPlayerPos(parrotBody){
	pos = parrotBody.position;
	rot = parrotBody.quaternion;
	socket.emit('parrotHasMoved', {pos, rot});
	MajRequest();
}
function removeAllParrotsFromScene() {
	const objectsToRemove = [];
	
	scene.traverse((object) => {
	  if (object.userData.isParrot) {
		objectsToRemove.push(object);
	  }
	});
  
	for (const object of objectsToRemove) {
	  scene.remove(object);
	  world.removeBody(object.body);
	}
  }

socket.on('parrotUpdate', (data) => {
   

	// for (const socketId in data) {
	// 	if (data.hasOwnProperty(socketId)) {
	// 		let existingParrot = scene.getObjectByName(socketId);
	// 		if (existingParrot) {
	// 			// If the parrot exists, update its position and rotation
	// 			existingParrot.position.set(data[socketId].position.x, data[socketId].position.y, data[socketId].position.z);
	// 			existingParrot.rotation.set(data[socketId].rotation.x, data[socketId].rotation.y, data[socketId].rotation.z);
	// 			console.log("is existing");
	// 		} else {
	// 			// If the parrot doesn't exist, create a new parrot with the received data
	// 			//removeAllParrotsFromScene();
	// 			createParrotAtPosition(data[socketId].position, data[socketId].rotation, socketId);
	// 			console.log("is created");
	// 		}
	// 	}
	//   }

	//   for(var socketId in data){
	// 	for(var listedParrot in parrots){
	// 		if(parrot[0] == listedParrot){
	// 			existingParrot.position.set(data[socketId].position.x, data[socketId].position.y, data[socketId].position.z);
	// 			existingParrot.rotation.set(data[socketId].rotation.x, data[socketId].rotation.y, data[socketId].rotation.z);
	// 			console.log("is existing");
	// 		}
	// 		else{
	// 			createParrotAtPosition(data[socketId].position, data[socketId].rotation, socketId);
	// 			console.log("is created");
	// 			console.log(data);

	// 		}
	// 	}
	//   }


	for(var id in data)
	{
		console.log(id + " " + socket.id);
		//createParrotAtPosition(data[id].position, data[id].rotation, parrot);
		if(!parrots.includes(id)){
			
		}

		if(id != socket.id)
		{
			SetParrotAtPosition(data[id].position, data[id].rotation, parrot);

		}
	 }


});

function createParrotAtPosition(position, rotation, socketId) {
	loader.load( 'scripts/GLTF/parrot/scene.gltf', function ( gltf ) {
		let exist = false;
		parrots.forEach(parrot =>{
			if(parrot[0] == socketId && parrot[0] != socket.id){


				parrot[1].position.copy(position);
				parrot[1].quaternion.copy(rotation);

				//position : { x: 0, y: 20, z: -115 },
                //rotation : { x: 0, y: 0, z: 0, w: 1 }
			}
		} )	
		
	}, undefined, function ( error ) {
	
		console.error( error );
	
	} );


}		

  
  

function moveForward(){
	
	forwardParrot.z = movementSpeed;
	forwardParrot = parrotBody.quaternion.vmult( forwardParrot );
	forwardParrot.normalize();
	parrotBody.velocity.set( forwardParrot.x * 20, parrotBody.velocity.y, forwardParrot.z * 20 );

	sendPlayerPos(parrotBody);
	
}

function moveBackward(){

   forwardParrot.z = -movementSpeed;
   forwardParrot = parrotBody.quaternion.vmult( forwardParrot );
   forwardParrot.normalize();
   parrotBody.velocity.set( forwardParrot.x * 20, parrotBody.velocity.y, forwardParrot.z * 20 );

}

function rotateLeft(){

	//faire une rotation sur la gauche douce du perroquet
	
	rotationQuat.setFromAxisAngle(axisY, rotationSpeed);
	parrotBody.quaternion = rotationQuat.mult(parrotBody.quaternion)
}

function rotateRight(){

	//faire une rotation sur la droite douce du perroquet

	rotationQuat.setFromAxisAngle(axisY, -rotationSpeed);
	parrotBody.quaternion = rotationQuat.mult(parrotBody.quaternion)
}


document.addEventListener("keydown", (e) => {

	if(controller[e.key]){
		controller[e.key].pressed = true
	}

})

document.addEventListener("keyup", (e) => {

	if(controller[e.key]){
		controller[e.key].pressed = false
	}

})

const executeMoves = () => {
	
	Object.keys(controller).forEach(key=> {
	  controller[key].pressed && controller[key].func()
	});

}

const light1 = new THREE.AmbientLight( 0xffffff, 7.5);
scene.add( light1 );

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render();
}

const stats = new Stats();
document.body.appendChild(stats.dom);

function animate() {

	world.step(1 / 60);

	delta = clock.getDelta();

	rotationSpeed = Math.PI / 3 * delta * 2;

	if(parrotS){

		//camera attaché au perroquet

		group.position.x = parrotS.position.x;
		group.position.y = parrotS.position.y;
		group.position.z = parrotS.position.z;

		camera.lookAt(parrotS.position.x,parrotS.position.y,parrotS.position.z);

		//

		parrotBox.position.x = parrotS.position.x;
		parrotBox.position.y = parrotS.position.y;
		parrotBox.position.z = parrotS.position.z;

		parrotS.position.x = parrotBody.position.x;
		parrotS.position.y = parrotBody.position.y;
		parrotS.position.z = parrotBody.position.z;

		parrotS.quaternion.x = parrotBody.quaternion.x;
		parrotS.quaternion.y = parrotBody.quaternion.y;
		parrotS.quaternion.z = parrotBody.quaternion.z;
		parrotS.quaternion.w = parrotBody.quaternion.w;

		parrotBHelper.update();

		box3.setFromObject(parrotBHelper);

		parrotSize = box3.getSize(vector);

		parrotBox.scale.set(parrotSize);

		parrotShape = new CANNON.Box(new CANNON.Vec3(parrotSize.x  * 9.5,parrotSize.y * 9.5,parrotSize.z  * 9.5));

		if(parrotS.position.y < -25){
			parrotBody.position.x = 0;
			parrotBody.position.y = 20;
			parrotBody.position.z = -115;

			parrotS.position.x = parrotBody.position.x;
			parrotS.position.y = parrotBody.position.y;
			parrotS.position.z = parrotBody.position.z;

			
			parrotBox.position.x = parrotS.position.x;
			parrotBox.position.y = parrotS.position.y;
			parrotBox.position.z = parrotS.position.z;
		}
	
	}


	executeMoves();
	requestAnimationFrame( animate );
    stats.update();
	controls.update();
	render();
}

function render(){
	renderer.render( scene, camera );
}


animate();





