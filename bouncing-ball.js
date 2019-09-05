// global variables
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var balls = [];

// constants
var ballRadius = 2;
var ballColor = "#000000";
var maxSpeed = 3;
var threshold = 0.0001;
var reboundEnergyPercentage = 0.75;

document.addEventListener("mouseup", mouseUpHandler, false);

/*
    mouseUp input event handler - spawn 1x ball
    @e input event
*/
function mouseUpHandler(e) {
    var canvas = document.getElementById("myCanvas");
    ball = 
    { 
        x : e.clientX - canvas.offsetLeft,
        y : e.clientY - canvas.offsetTop,
        dx : Math.random() * (maxSpeed*2) - maxSpeed,
        dy : Math.random() * -(maxSpeed),
        t : Date.now()/1000,
        bounce : 0,
        stopped : false,
    };
    balls.push(ball);
}

/*
    Update each ball's position, collision, gravity
    @ball specific ball to update
    @index index of ball
*/
function doUpdate(ball, index) {
    // skip updates if movement is 0
    if(ball.dx == 0 && ball.dy == 0){
        ball.stopped = true;
        return;
    }

    // rebound on horizontal canvas edges
    if(ball.x + ball.dx > canvas.width-ballRadius || 
    ball.x + ball.dx < ballRadius) {
        ball.dx *= -1;
    }

    // rebound on top canvas edge
    if(ball.y + ball.dy < ballRadius) {
        ball.dy *= -1;
    }

    // rebound on bottom canvas edge - multiple energy by percentage
    if(ball.y + ball.dy > canvas.height-ballRadius){
        ball.dy *= -reboundEnergyPercentage;
        ball.dx *= reboundEnergyPercentage;
        ball.bounce += 1;
    } else {
        // gravity
        ball.dy += 0.0981 * (Date.now()/1000-ball.t);
    }

    // move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // complete stop
    if(Math.abs(ball.dx) < threshold){
        ball.dx = 0;
    }
    if(Math.abs(ball.dy) < threshold){
        ball.dy = 0;
    }
}

/*
    Draw the ball on the canvas
    @ball specific ball to draw
*/
function doRender(ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = ballColor;
    ctx.fill();
    ctx.closePath();
}

/*
    Main run logic loop
*/
function run() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    balls.forEach(doRender);
    balls.forEach(doUpdate);
    requestAnimationFrame(run);
}

run();