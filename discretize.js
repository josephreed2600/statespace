Array.range = function(start,end) {
    if(arguments.length == 1) {
        end = start;
        start = 0;
    }

    var foo = [];
    while(start <= end) {
        foo.push(start++);
    }
    return foo;
}

function discretize(A,B,C,D,dt) {
	var m = A.length;
	var n = B[0].length;
	var AB = math.resize(math.concat(A,B),[m+n,m+n]);
	for(let i = 0; i < m+n; i++) {
		for(let j = 0; j < m+n; j++) {
			AB[i][j] *= dt;
		}
	}
	AB = math.expm(AB);
	A = AB.subset(math.index(Array.range(0,m-1),Array.range(0,m-1)));
	B = AB.subset(math.index(Array.range(0,m-1),Array.range(m,m+n-1)));
	return {A:A._data,B:B._data,C:C,D:D,dt:dt};
}
