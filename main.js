var cubeRotation = 0.0;
var tr = [];
var xx = 0;
var ply;
var score = 0;
main();

//
// Start here
//
function callDead() {
    dead = true;
    $("#canvasDiv").html("<h1>Game Over</h1>");
    document.getElementById('music').pause();
    document.getElementById('crash').play();
}

function main() {

  document.getElementById('music').play();
  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  c = new cube(gl, [2, 5.0, -3]);
  ply = new player(gl, [2, 5.0, -1.6]);
  x = new train(gl,[2, 4.15, -15.0 ]);
  y = new train(gl,[2.8, 4.15, -10.0 ]);
  pp = new train(gl,[2.8, 4.15, -10.0 ]);
  z = new train(gl,[1.2, 4.15, -11.0 ]);
  tr.push(z);
  tr.push(x);
  tr.push(y);
  b1 = -15.0
  b2 = -10.0
  b3 = -11.0
  for (var i = 0  ; i <= 20; i += 1) {
        var rand = (Math.random() * (10) - 5);
         b1-=30.0
         b2-=25.0
         b3-=15.0
        if (rand < 0) {
           
           pp = new train(gl,[2, 4.15, b1 ]);
           tr.push(pp);
          
           pp = new train(gl,[2.8, 4.15, b2 ]);
           tr.push(pp);
        }
        else {
           pp = new train(gl,[2, 4.15, b1 ]);
           tr.push(pp);
           
           pp = new train(gl,[1.2, 4.15, b3 ]);
          tr.push(pp);
        }
    }
  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;

  // Fragment shader program

  const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    },
  };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  //const buffers
    Mousetrap.bind('a', function () {
     if(c.pos[0]==2){
     c.pos[0]=2.5;
     ply.pos[0]=1.9;
     for(var i=0;i<tr.length;i++){
       tr[i].pos[0]+=0.5;
      }
    }
     else if(c.pos[0]==1.5){
     c.pos[0]=2.0;
     ply.pos[0] = 2.0;
     for(var i=0;i<tr.length;i++){
       tr[i].pos[0]+=0.5;
      }
    }
    });
    Mousetrap.bind('d', function () {
     if(c.pos[0]==2.5){
     c.pos[0]=2.0;
     ply.pos[0] = 2.0;
     for(var i=0;i<tr.length;i++){
       tr[i].pos[0]-=0.5;
      }
    }
    else if(c.pos[0]==2.0){
     c.pos[0]=1.5;
    ply.pos[0]=2.1;
     for(var i=0;i<tr.length;i++){
       tr[i].pos[0]-=0.5;
      }
    }
    });

  var then = 0;
  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;
    score += deltaTime;
    $("#score").text("Score: " + (Math.round(score)));
    for(var j=0;j<tr.length;j++){
       tr[j].pos[2]+=0.1;
       if(ply.pos[0]==1.9 && tr[j].pos[0]==2.5){
      //  console.log(tr[j].pos[2]);
        // if(tr[j].pos[2]==-1.6){
        //   callDead();
        //   return;
        // }
    }
      if(ply.pos[0]==2.0 && tr[j].pos[0]==2){
         if(tr[j].pos[2]<=-2.0 && tr[j].pos[2]>=-4.5){
          callDead();
          return;
        }

    }
     if(ply.pos[0]==2.1 && tr[j].pos[0]==1.5){
        // if(tr[j].pos[2]<=-1.5 && tr[j].pos[2]>=-3.5){
        //   callDead();
        //   return;
        // }
     }
}
    //pp.pos[2]+=0.09;
    drawScene(gl, programInfo, deltaTime);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}



//
// Draw the scene.
//
function drawScene(gl, programInfo, deltaTime) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
    var cameraMatrix = mat4.create();
    mat4.translate(cameraMatrix, cameraMatrix, [2, 5.6, -0.5]);
    var cameraPosition = [
      cameraMatrix[12],
      cameraMatrix[13],
      cameraMatrix[14],
    ];

    var up = [0, 1, 0];

    mat4.lookAt(cameraMatrix, cameraPosition, c.pos, up);
    var viewMatrix = cameraMatrix;//mat4.create();

    //mat4.invert(viewMatrix, cameraMatrix);

    var viewProjectionMatrix = mat4.create();

    mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

  c.drawCube(gl, viewProjectionMatrix, programInfo, deltaTime);
  ply.drawCube(gl, viewProjectionMatrix, programInfo, deltaTime);
  pp.drawCube(gl, viewProjectionMatrix, programInfo, deltaTime);
  for(var j=0;j<tr.length;j++){
    tr[j].drawCube(gl, viewProjectionMatrix, programInfo, deltaTime);
  }
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

