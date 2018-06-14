function fix(a,b=3) {
	var n = (a+Number.EPSILON).toFixed(b);
	if(n==0) n = '0.000'; // avoid problems with -0
	if(n>=0) n = ' '+n;
	return n+'\t';
}
function dump(mesh){
console.log('dxdt:');
for(let i=0; i < Math.max(mesh.state.x.m,mesh.state.u(mesh.state.x).m); i++){
	// dxdt
	if(i < mesh.state.dxdt.m) {
		var line = '['+fix(mesh.state.dxdt.mat[i][0])+'] = ';
	} else {
		var line = ' \t\t    ';
	}
/**/
	// A[i,j]
	yep = (i < mesh.state.A().m);
	line += yep?'[':' ';
	for(let j=0; j<mesh.state.A().n; j++){
		line += yep?fix(mesh.state.A().mat[i][j]):'\t\t';
	}
	line += yep?']':' ';
/**/
	// x[i]
	if(i < mesh.state.x.m) {
		line += '[' + fix(mesh.state.x.mat[i][0]) + ']';
	} else {
		line += ' \t\t ';
	}

	yep = (Math.min(mesh.state.x.m,mesh.state.B().m));
	line += yep?' + ':'   ';

	// B[i,j] if i is valid
	yep = (i < mesh.state.B().m);
	line += yep?'[':' ';
	for(let j=0; j<mesh.state.B().n; j++){
		line += yep?fix(mesh.state.B().mat[i][j]):'\t\t';
	}
	line += yep?']':' ';
/**/
	// u[i] if i is valid
	if(i < mesh.state.u(mesh.state.x).m) {
		line += '[' + fix(mesh.state.u(mesh.state.x).mat[i][0]) + ']';
	} else {
		line += ' \t\t ';
	}
/**/
	console.log(line);
}
console.log('');
console.log('u(x):');
var u = mesh.state.u(mesh.state.x);
for(let i=0; i < Math.max(mesh.state.x.m,u.m); i++){
	// u
	if(i < u.m) {
		var line = '['+fix(u.mat[i][0])+'] = ';
	} else {
		var line = ' \t\t    ';
	}
/**/
	// K[i,j]
	yep = (i < mesh.state.K().m);
	line += yep?'[':' ';
	for(let j=0; j<mesh.state.K().n; j++){
		line += yep?fix(mesh.state.K().mat[i][j]):'\t\t';
	}
	line += yep?']':' ';
/**/
	// r[i]
	if(i < mesh.state.r().m) {
		line += '([' + fix(mesh.state.r().mat[i][0]) + '] - ';
	} else {
		line += '  \t\t    ';
	}

	// x[i]
	if(i < mesh.state.x.m) {
		line += '[' + fix(mesh.state.x.mat[i][0]) + '])';
	} else {
		line += ' \t\t  ';
	}
	console.log(line);
}
}
