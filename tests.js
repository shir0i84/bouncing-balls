/*
    Mock N mouse clicks at random positions within the canvas
 */
function mockRandomMouseClicks(nClicks){
    for(i = 0; i < nClicks; ++i){
        var e = {
            clientX: Math.random() * canvas.width + canvas.offsetLeft, 
            clientY: Math.random() * canvas.height + canvas.offsetTop,
        };
        mouseUpHandler(e);
    }
}

/*
    Test: Random ball creation, check the initial properties
*/
QUnit.test("Mock mouse clicks to create random balls", function( assert ) {
    balls = [];
    mockRandomMouseClicks(10);

    var prevBall = null;
    for(i = 0; i < balls.length; ++i){
        var ball = balls[i];
        assert.ok(-maxSpeed < ball.dx && ball.dx < maxSpeed, "[OK] ball:" + i + " has initial dx:" + ball.dx );
        assert.ok(-maxSpeed < ball.dy && ball.dy < 0, "[OK] ball:" + i + " has initial dy:" + ball.dy );
        assert.ok(ball.bounce == 0, "[OK] ball:" + i + " has initial bounce:" + ball.bounce );
        assert.ok(ball.stopped == false, "[OK] ball:" + i + " has initial stopped:" + ball.stopped );
        assert.ok((ball.t - Date.now()/1000) < 60, "[OK] ball:" + i + " is recently created:" + ball.t );
        if(prevBall != null){
            assert.notPropEqual( ball, prevBall, "[OK] each ball has randomly generated values." );
        }
        prevBall = ball;
    }
    balls = [];
});

/*
    Test: Balls bounce and "peak" height decreases over time 
*/
QUnit.test("Concave maximum of balls decreases over time", async function( assert ) {
    balls = [];
    mockRandomMouseClicks(20);

    var checkOffsetY = (ball) => {
        return new Promise((r) => {
            (function wait(){
                if (ball.stopped){
                    return r();
                }
                // detect change in direction
                if(ball.prevDy < 0 && ball.dy > 0){
                    if(ball.lastPeak == undefined){
                        ball.lastPeak = ball.y;
                    } else if ((ball.lastPeak - ball.y) < threshold) {
                        // each peak should decrease in time due to gravity (y-offset increases)
                        assert.ok( ball.lastPeak < ball.y, 
                            "[OK] ball:" + ball.i + ", y-offset increased: " + ball.lastPeak + " => " + ball.y);
                            ball.lastPeak = ball.y;
                    } 
                }
                ball.prevDy = ball.dy;
                setTimeout(wait, 100);
            })();
        });
    }

    var promises = [];
    for(i = 0; i < balls.length; ++i){
        var ball = balls[i];
        ball.i = i;
        promises.push(checkOffsetY(ball));
    }
    await Promise.all(promises);
    balls = [];
});

/*
    Test: Random behaviour of balls lead to random final stopped positions
*/
QUnit.test("Balls stop at random position", async function( assert ) {
    balls = [];
    mockRandomMouseClicks(30);

    // wait until every ball stops
    var waitBallStops = (ball) => {
        return new Promise((r) => {
            (function wait(){
                if (ball.stopped) return r();
                setTimeout(wait, 100);
            })();
        })
    }
    var promises = [];
    for(i = 0; i < balls.length; ++i){
        var ball = balls[i];
        promises.push(waitBallStops(ball));
    }
    await Promise.all(promises);

    // check properties of each ball
    var prevBall = null;
    for(i = 0; i < balls.length; ++i){
        var ball = balls[i];
        assert.ok( Math.abs(ball.y - canvas.height) < ballRadius, 
            "[OK] ball:" + i + " has final y:" + ball.y + "" );
        assert.equal( ball.dx, 0, "[OK] ball:" + i + " has zero dx" );
        assert.equal( ball.dy, 0, "[OK] ball:" + i + " has zero dy" );
        assert.equal( ball.stopped, true, "[OK] ball:" + i + " stopped: " + ball.stopped );
        assert.ok( ball.bounce > 0, "[OK] bounce:" + ball.bounce);

        if(prevBall != null){
            assert.notPropEqual( ball, prevBall, "[OK] each ball stops at a random position." );
        }
        prevBall = ball;
    }
    balls = [];
});