var map = {}

function getPointsWithinCell(points, voronoi){
    let minX = 0, minY = 0, maxX = 256, maxY = 256;
    let i;
    for(i = 0; i < 48; i++){
        points.push([Math.random() * 256,Math.random() * 256])
    }
}

function generate(){
    const context = document.getElementById("map-canvas").getContext("2d");
    const WIDTH = 256;
    const HEIGHT = 256;

    let points = [];
    let i;
    for(i = 0; i < 32; i++){
        points.push([Math.random() * WIDTH,Math.random() * HEIGHT])
    }

    // Create delaunay and then voronoi from poitns
    const delaunay = d3.Delaunay.from(points);
    const voronoi = delaunay.voronoi([0, 0, 256, 256]);

    context.fillStyle = "#ccc";
    context.fillRect(0,0,256,256)

    context.strokeStyle = "#000";
    voronoi.render(context);
    voronoi.renderBounds(context);
    context.stroke();
    
    // Prepare cells array
    map.cells = [];
    map.width = WIDTH;
    map.height = HEIGHT;
    map.contains = voronoi.contains;

    // Paint every 2nd cell red
    i = 0;
    for(const cell of voronoi.cellPolygons()){
        if(i % 6 == 0){
            map.cells.push({polygons: cell, hasBuildings: false})
            context.beginPath();
            context.strokeStyle = "#0F0";
            voronoi.renderCell(i,context)
            voronoi.renderCell(i,context)
            context.stroke();
        } else {
            map.cells.push({polygons: cell, hasBuildings: true})
        }

        i++;
    }
}

generate();