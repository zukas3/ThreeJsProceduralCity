var map = {}
var voronoi, delaunay;
var context;

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

function generateRoad(){
    let roadPoints = [];

    let currentY = HEIGHT / 2 + (Math.random() - 0.5) * 32;
    let currentX = 0;
    roadPoints.push([currentX,currentY])
    while(currentX < 256){
        currentX = currentX + 16 + Math.random() * 32;
        currentX = Math.min(256, currentX);

        currentY = currentY + (Math.random() - 0.5) * 64;

        // Clamp
        currentY = Math.min(Math.max(0,currentY), 256);

        // Add to points
        roadPoints.push([currentX, currentY])
    }

    map.roadPoints = roadPoints;
}

function generate(){
    context = document.getElementById("map-canvas").getContext("2d");

    let points = [];
    let i;
    for(i = 0; i < 32; i++){
        points.push([Math.random() * WIDTH, Math.random() * HEIGHT])
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
    map.points = [];
    map.width = WIDTH;
    map.height = HEIGHT;
    map.contains = voronoi.contains;
    map.getRandomPointsInCell = getRandomPointsInCell;
    map.drawMap = drawMapOnCanvas

    // Set cell info
    i = 0;
    for(const cell of voronoi.cellPolygons()){

        if(i % 6 == 0){
            map.cells.push({polygons: cell, hasBuildings: false, randomPoints: getRandomPointsInCell(i, 32)})
        } else {
            map.cells.push({polygons: cell, hasBuildings: true, randomPoints: getRandomPointsInCell(i, 128)})
        }

        // Gather all points
        for(let j = 0; j < cell.length; j++){
            map.points.push(cell[j]);
        }

        // Increment
        i++;
    }
    
    generateRoad();
}

function drawMapOnCanvas(point){
    context.fillStyle = "#ccc";
    context.fillRect(0,0,256,256)

    context.strokeStyle = "#000";
    voronoi.render(context);
    voronoi.renderBounds(context);
    context.stroke();

    i = 0;
    for(const cell of voronoi.cellPolygons()){
        if(i % 6 == 0){
            context.beginPath();
            context.strokeStyle = "#0F0";
            voronoi.renderCell(i,context)
            voronoi.renderCell(i,context)
            context.stroke();
        } else {
            
        }
        i++;
    }

    context.strokeStyle = "red";
    context.beginPath();
    context.moveTo(map.roadPoints[0][0],map.roadPoints[0][1])
    for(i = 1; i < map.roadPoints.length; i++){
        context.lineTo(map.roadPoints[i][0], map.roadPoints[i][1]);
    }
    context.stroke();
    context.closePath();

    // Camera point 
    if(point != null){
        context.beginPath();
        context.fillStyle = "#73f0ee"
        context.arc(point[0] / 4 + 128, point[1] / 4 + 128, 7, 0, 2 * Math.PI);
        context.fill();
    }
}

generate();
drawMapOnCanvas();