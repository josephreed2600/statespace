/*

u  = K(r-x)
x' = Ax+Bu
x += x'

   x
[ pos ]
[ vel ]

// http://blog.wesleyac.com/posts/intro-to-control-part-six-pole-placement

Model of a mass on a spring
    x'    	=         A          x    	+	    B	    u
[  pos'  ]	=   [   0   1   ][  pos  ]	+	[   0  	][  in	]
[  vel'  ]	=   [ -k/m -c/m ][  vel  ]	+	[  1/m	]

   u	 	=          K       (   r      -      x    )
[  in	]	=   [   kP   kD   ]([ goal ]  -  [  pos  ])
		=                  ([  0   ]  -  [  vel  ])

*/

with(Matrix) { // e.g., Matrix.add() is now just add()
var massSpringModel = {
////////////////
// Physical characteristics of system
	phys: {
		desc: "mass on spring",
		_m: 1,      // kg       // mass of weight on spring                (*****   1   *****)
//		_m: 100,    // kg       // mass of weight on spring         Increasing mass makes system harder to move, which helps
		_k: 0.4,    // N/m      // spring constant (strength of spring)
		_c: 0.3,    // N/m/s    // damping coefficient (essentially friction)
		m: function(){return this._m;},
		k: function(){return this._k;},
		c: function(){return this._c;}
	},

////////////////
// Plant
// State matrix
	A: function(){return create([[ 0,	1],
	                             [ -this.phys.k()/this.phys.m(),	-this.phys.c()/this.phys.m()]]);},
//	                             [ 0,	0]]);},

// Input matrix
	B: function(){return create([[ 0   	],
	                             [ 1/this.phys.m()	]]);},
//	                             [ 0.01	]]);},

////////////////
// Observer
// TODO: Implement Kalman filter
// Output matrix
	C: function(){return create([[ 1,	0]]);},

// Transmission matrix
	D: function(){return create([[ 0]]);},

////////////////
// Variables
// Initial state of system
	x: create([[ 0],
	           [ 0]]),
	// these aren't a thing before the first cycle I guess
	y: null,
	dxdt: null,

////////////////
// Formula for controller: u = K(r-x)
	k: {
		// generated from pole placement for -2.5+-0i
		// -2.5 to converge at some arbitrary speed
		// 0i because we want no oscillation
		// place(A,B,-2.5,-2.5)
		// TODO: Implement pole placement
		_poles: [5.85, 4.7],  //                                           (*****   2   *****)
//		_poles: [4, 40],      //  Hand-tuned PD values, because poles don't work even with increased mass
		poles: function(){return this._poles;}
	},
	K: function(){return create([ this.k.poles() ]);},

	setpoint: 0, // Assign a number to this to change setpoint: this.setpoint = 4;
	r: function(){return create([[this.setpoint],
	                             [      0      ]]);}, // does this row mean that velocity of 0 is also part of our setpoint?

	// u is a function of x because x is a variable, while K and r are technically constants
	u: function(x){return mult(this.K(),sub(this.r(),x));}, // Austin wrote it K(r-x) at least once so I'm going with that


////////////////
// Miscellaneous
	// Measure error between current state and goal
	error: function(){return this.setpoint - this.y.mat[0][0];},
	// Update the internal state of the actual mesh that we see on the screen
	update: function(dxdt,x,y){}, // implement in the mesh, same as below
	// Measure some aspect of our current state, with some noise
	sensor: null // implement after stapling to the mesh, becaue it will need to access properties of the mesh
}; // end of SS representation of the system
} // end of with(Matrix)


/////////////////////
// Control loop
// mesh is a thing in the scene
// this function requires the mesh to have an SS representation inside it, like the one above, named mesh.state
// A,B,C,D are matrices
// x is current internal state vector
// u is a function that returns an input vector based on x
function updateState(mesh) {
with(mesh.state) {
with(Matrix) {
	var input = u(x);
	dxdt = add(mult(A(),x),mult(B(),input));
	x    = add(x,dxdt);
	y    = add(mult(C(),x),mult(D(),input)); // pretty sure this is all wrong yo
	update(dxdt,x,y);
}
}
}


// https://threejs.org/docs/index.html#manual/introduction/Creating-a-scene
function animate() {
	requestAnimationFrame( animate );
	updateState(cube);
	renderer.render( scene, camera );
}


/////////////////////
// Stuff for renderer
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
camera.position.set(-5,5,5);
camera.lookAt(new THREE.Vector3(5,0,0));
/**
camera.rotation.x = 0.6;
camera.rotation.y = -0.6;
camera.rotation.z = -0.4;
camera.position.x = -1;
camera.position.y = -4;
camera.position.z = 5;
/**/
/////////////////////

// Make a cube
var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var cube = new THREE.Mesh( geometry, material );

// Add SS model to cube
cube.state = massSpringModel;
//cube.state.update = function(dxdt,x,y){cube.position.x = y.mat[0][0];};
cube.state.update = function(dxdt,x,y){cube.position.x = x.mat[0][0];};
cube.state.sensor = function(){return cube.position.x + (((Math.random()>0.5)?1:-1)*Math.random()/100);} // introduce noise to measurement
scene.add( cube );

/////////////////////
// Quick testing
function test() {cube.state.setpoint = 10 - cube.state.setpoint;}


$(function(){
	document.body.appendChild( renderer.domElement );
	animate();
	console.log("'cube' is the object, 'cube.state' has SS representation");
	console.log("test() changes setpoint by 10, for quick testing of values");
	console.log("dump(cube) displays the current state equations of the system");
	console.log("https://github.com/josephreed2600/statespace");
	console.log("Physical values come from http://blog.wesleyac.com/posts/intro-to-control-part-six-pole-placement");
});
