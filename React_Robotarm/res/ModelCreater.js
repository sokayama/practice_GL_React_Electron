function createCylinder(height,splitCircle,r)
{
	// モデルデータ(頂点位置)
	var vPosition = [];
	var index_lines = [];
	var index_triangles = [];
	var texCoord = [];
	var normal = [];
	var i,j;
	var counter = 0;
	

	for(i=0;i<height;i++){
		for(j=0;j<splitCircle;j++){
			vPosition.push(Math.cos(j*2*Math.PI/splitCircle)*r, i, Math.sin(j*2*Math.PI/splitCircle)*r);

			texCoord.push((1/splitCircle)*j,(1/height)*i);

			normal.push(Math.cos(j*2*Math.PI/splitCircle),0.0,Math.sin(j*2*Math.PI/splitCircle));
			//index_lines
			if(j< (splitCircle-1) ) {
				index_lines.push(counter,counter+1);
			}else{
				index_lines.push(counter,counter-(splitCircle-1) )
			}

			if(i< (height-1) ) {
				index_lines.push(counter,counter+splitCircle);
			}

			//index_triangles
			if(i < height-1){
				if(j < splitCircle-1){
					index_triangles.push(counter+splitCircle,counter+splitCircle+1,counter+1);
					index_triangles.push(counter,counter+splitCircle,counter+1);
				}else{
					index_triangles.push(counter+splitCircle,counter+1,counter-(splitCircle-1));
					index_triangles.push(counter-(splitCircle-1),counter,counter+splitCircle);
				}
			}
			counter++;
		}
	}

	// モデルデータ(頂点カラー)
	var vColor = [];
	for(i=0;i<(height * splitCircle);i++)
	{
		vColor.push(1.0, 1.0, 1.0, 1.0);
	}

	return {p : vPosition, c : vColor, i_lines : index_lines , i_triangles : index_triangles , t : texCoord , n : normal};
}

function createEarth(r,split)
{
	// モデルデータ(頂点位置)
	var vPosition = [];
	var index_lines = [];
	var index_triangles = []
	var vColor = [];
	var texCoord = [];
	var normal = [];
	var i,j,k;
	var counter = 0;
	
	var x_split = split;
	var y_split = split;


	var x,y,z;//法線でもある

	for(i=0;i<x_split/2;i++){
		for(j=0;j<y_split;j++){

			x = Math.sin(j*2*Math.PI/y_split) * Math.sin(i*Math.PI/(x_split/2));
			y = Math.sin(i*Math.PI/(x_split/2) + 1/2*Math.PI);
			z = Math.cos(j*2*Math.PI/y_split) * Math.sin(i*Math.PI/(x_split/2))
			vPosition.push(x*r, y*r, z*r);

			//vColor.push(x, y, z, 1.0);
			vColor.push(1.0, 1.0, 1.0, 1.0);
			texCoord.push(1/y_split*j,1/(x_split/2)*i);
			normal.push(x,y,z);

		//index_lines
			if(j < (y_split-1) ) {
				index_lines.push(counter,counter+1);
			}else{
				index_lines.push(counter,counter-(y_split-1) )
			}

			if(i < (x_split/2-1) ) {
				index_lines.push(counter,counter+y_split);
			}


		//index_triangles

			if(0 < i)
			{
				if(j == 0)
				{
					index_triangles.push(counter,counter-y_split,counter+x_split-1);
					index_triangles.push(counter-x_split,counter-1,counter+x_split-1);
				}else{
				
					index_triangles.push(counter,counter-y_split,counter-1);
					index_triangles.push(counter-x_split,counter-x_split-1,counter-1);
				}
			}

			counter++;
		}
	}

	// モデルデータ(頂点カラー)
	// for(i=0;i<(y_split * y_split);i++)
	// {
	// 	vColor.push(1.0, 1.0, 1.0, 1.0);
	// }

	return {p : vPosition, c : vColor, i_lines : index_lines, i_triangles : index_triangles , t : texCoord , n : normal};
}