var map = {}
var voronoi, delaunay;

const WIDTH = 256;
const HEIGHT = 256;

function getRandomPointsInCell(index, amount){
    points = [];
    while(amount >= 0){
        point = [Math.random() * WIDTH,Math.random() * HEIGHT]
        if(voronoi.contains(index, point[0], point[1])){
            points.push(point);
            amount--;
        }
    }

    return points;
}

function generate(){
    const context = document.getElementById("map-canvas").getContext("2d");

    let points = [];
    let i;
    for(i = 0; i < 32; i++){
        points.push([Math.random() * WIDTH,Math.random() * HEIGHT])
    }

    // Create delaunay and then voronoi from poitns
    delaunay = d3.Delaunay.from(points);
    voronoi = delaunay.voronoi([0, 0, 256, 256]);

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
    map.getRandomPointsInCell = getRandomPointsInCell;

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
            map.cells.push({polygons: cell, hasBuildings: true, randomPoints: getRandomPointsInCell(i, 128)})
            console.log(map.cells[i].randomPoints);
        }
        i++;
    }
}

generate();