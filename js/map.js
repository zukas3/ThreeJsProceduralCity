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

function generate(){
    context = document.getElementById("map-canvas").getContext("2d");

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
            map.cells.push({polygons: cell, hasBuildings: false})
        } else {
            map.cells.push({polygons: cell, hasBuildings: true, randomPoints: getRandomPointsInCell(i, 256)})
        }

        // Gather all points
        for(let j = 0; j < cell.length; j++){
            map.points.push(cell[j]);
        }

        // Increment
        i++;
    }

    // Generate road
    let currCell = 0;
    let currPoint = voronoi.cellPolygon(currCell)[0];
    let currClosest = [256,256];
    
    while(true)
    {
        for(const cell of voronoi.neighbors(currCell)){
            points = voronoi.neighbors();
            for(let i = 0; i < points.length; i++){
                //if(points[i][0] < currPoint[0] && points[i][0] > currClosest[])
            }
        }

        break;
    }
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

    if(point != null){
        context.beginPath();
        context.fillStyle = "#73f0ee"
        context.arc(point[0] / 4 + 128, point[1] / 4 +128, 7, 0, 2 * Math.PI);
        context.fill();
    }
}

generate();
drawMapOnCanvas();