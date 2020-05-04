function getPointsWithinCell(points, voronoi){
    let minX = 0, minY = 0, maxX = 256, maxY = 256;
    let i;
    for(i = 0; i < 32; i++){
        points.push([Math.random() * 256,Math.random() * 256])
    }
}

function generate(){
    const context = document.getElementById("map-canvas").getContext("2d");

    let points = [];
    let i;
    for(i = 0; i < 32; i++){
        points.push([Math.random() * 256,Math.random() * 256])
    }

    const delaunay = d3.Delaunay.from(points);
    const voronoi = delaunay.voronoi([0, 0, 256, 256]);

    console.log(voronoi.cellPolygons())
    console.log(voronoi.cellPolygon(0))

    context.fillStyle = "#ccc";
    context.fillRect(0,0,256,256)

    context.strokeStyle = "#000";
    voronoi.render(context);
    voronoi.renderBounds(context);
    context.stroke();

    context.beginPath();
    context.strokeStyle = "#F00";
    voronoi.renderCell(0,context)
    voronoi.renderCell(0,context)
    voronoi.renderCell(0,context)
    voronoi.renderCell(0,context)
    context.stroke();
}

generate();