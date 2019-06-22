var canvas=document.getElementById("wl");
var ctx=canvas.getContext("2d");
var BB=canvas.getBoundingClientRect();
var offsetX=BB.left;
var offsetY=BB.top;
var width = canvas.width;
var height = canvas.height;
var minX = 0.4 * width;
var maxX  = 0.6 * width;
var minY = 0.4 * height;
var maxY = 0.6 * height;
var dragok = false;
var startX;
var startY;
var data;
var requestAnimationFrame = window.requestAnimationFrame;
var k = 50;
var initialTemp = 0.9;
var temp = 0.7;
var iter = 200;
var maxFrame= 0;

$( function() {
  $( "#slider-range-min" ).slider({
    range: "min",
    value: 50,
    min: 10,
    max: 100,
    slide: function( event, ui ) {
      $( "#amount" ).val(ui.value );
    }
  });
  $( "#amount" ).val($( "#slider-range-min" ).slider( "value" ) );
  $( "input" ).click( function () {
    temp = $("input[name='radio-1']:checked").val();
    });
  $( "#iterations" ).slider({
    range: "min",
    value: 200,
    min: 20,
    max: 1000,
    slide: function( event, ui ) {
      $( "#amount2" ).val(ui.value );
    }
  });
  $( "#amount2" ).val($( "#iterations" ).slider( "value" ) );
  $('#clear').click( function (){
    k = 200;
    iter = 200;
    initialTemo= 0.9;
    maxFrame  =  0;
  }),
  $('#layout').click( function (){
    frame = 0;
  })
 })

  $('#small').click(function() {
    k = $('#slider-range-min').slider("value");
    iter = $('#iterations').slider("value");
    maxFrame = 0;
    $.ajax({
      url: "/data/warren-data2.json",
      dataType: "text",
      success: function(result) {
          data= $.parseJSON(result);
          canvasApp();
      }
  });
  })
  $('#medium').click(function() {
    k = $('#slider-range-min').slider("value");
    iter = $('#iterations').slider("value");
    maxFrame = 0;
    $.ajax({
      url: "/data/warren-data.json",
      dataType: "text",
      success: function(result) {
          data= $.parseJSON(result);
          canvasApp();
      }
  });
  })
  $('#large').click(function() {
    k = $('#slider-range-min').slider("value");
    iter = $('#iterations').slider("value");
    maxFrame = 0;
    $.ajax({
      url: "/data/warren-data3.json",
      dataType: "text",
      success: function(result) {
          data= $.parseJSON(result);
          canvasApp();
      }
  });
  })

function canvasApp() {
  var gameloop = true;
  chart = data;
  canvas.onmousedown = myDown;
  canvas.onmouseup = myUp;
  canvas.onmousemove = myMove;
  var frame = 0;

  chart.nodes.forEach( function (node) {
    node.x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
    node.y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
    node.r = 5;
    node.isDragging = false
  });

  function draw (){
    ctx.clearRect(0, 0, width, height);
    var margin = 20;
    //set initial positions
    chart.nodes.forEach(function(d) { 
      d.x = Math.max(margin, Math.min(width- margin, d.x))
      d.y = Math.max(margin, Math.min(height - margin, d.y))
    });

    ctx.beginPath();
    chart.links.forEach(drawLink);
    ctx.strokeStyle = "teal";
    ctx.stroke();

    ctx.beginPath();
    chart.nodes.forEach(drawNode);
    ctx.fill();
    ctx.strokeStyle = "white";
    //ctx.stroke();

    //C = Math.log(frame + 1) * 100;
    frame += 1;
    repulsiveForces();
    attractiveForce();
    moveNodes();
  }
  if (gameloop) {
  setInterval(draw, 16);
  }

function drawLink(d) {
  var id1Coords = findNodeforLink(d.id1);
  var id2Coords = findNodeforLink(d.id2);
  ctx.moveTo((id1Coords.x), (id1Coords.y));
  ctx.lineTo((id2Coords.x), (id2Coords.y)); 
}

function drawNode(d) {
  ctx.moveTo((d.x), (d.y));
  ctx.arc(d.x, d.y, d.r, 0, 2 * Math.PI);
  ctx.font = '8pt Calibri';
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.fillText('text Label', 0, 0);
}

function findNodeforLink (node) { 
  var lx = chart.nodes.find(x => x.id === node);
  return lx;
};

// calculate repulsive forces
function repulsiveForces () {
  chart.nodes.forEach( function (v) {

    // Initialize velocity to none.
    v.vx = 0.0;
    v.vy = 0.0;

    // for each other node, calculate the repulsive force and adjust the velocity
    // in the direction of repulsion.
    chart.nodes.forEach( function (u) {
        if (v === u) {
            return;
      }

    // D is short hand for the difference vector between the positions
    // of the two vertices
    var Dx = v.x - u.x;
    var Dy = v.y - u.y;
    var len = Math.pow( Dx*Dx+Dy*Dy, 0.5 ); // distance
    if ( len === 0 ) {return;}
    if ( len > 100 ) {return;}
    var mul = k * k / (len*len);

    v.vx += Dx * mul;
    v.vy += Dy * mul;

    });
  });
}

  // calculate attractive forces
  function attractiveForce () {
    chart.links.forEach( function (e) {
      // fine id1 and id2 nodes
      // each edge is an ordered pair of vertices .v and .u

      var linkEnd1 = findNodeforLink(e.id1);
      var linkEnd2 = findNodeforLink(e.id2);

      var Dx = linkEnd1.x - linkEnd2.x;
      var Dy = linkEnd1.y - linkEnd2.y;


      var len = Math.pow( Dx * Dx + Dy * Dy, 0.5 ); // distance.
      if ( len === 0 ) {return};

      var mul = len * len / k;
      var Dxmul = Dx * mul;
      var Dymul = Dy * mul;
      // attract both nodes towards eachother.
      linkEnd1.vx -= Dxmul;
      linkEnd1.vy -= Dymul;
      linkEnd2.vx += Dxmul;
      linkEnd2.vy += Dymul;
  });
}


// Here we go through each node and actually move it in the given direction.
function moveNodes () {
  chart.nodes.forEach( function (v) {
    var len = v.vx * v.vx + v.vy * v.vy;
    // max refers to the maximum movement of each node in pixels
    var max = 10;
    v.vx = temp * v.vx;
    v.vy = temp * v.vy;
    // after x frames can only move at new max pixels
    
    if (frame > (iter/12)) max = 16;
    if (frame > (iter/6)) max = 8;
    if (frame > (iter/4)) max = 2;
    if (frame > (iter/2)) max = 1;
    if (frame > iter) {
      max = 0;
      gameloop = 0;
    }
    
    //if (frame > 400) max = 20;
    //if (frame > 650) max = 10;

    if (len > max*max) 
    {
        len = Math.pow( len, 0.5 );
        v.vx *= max / len;
        v.vy *= max / len;
    }
    
    v.x += v.vx;
    v.y += v.vy;

  });
};

// handle mousedown events
function myDown(e){
  // make sure forces are forces
  //temp = 0;
  gameloop = 0;
  // tell the browser we're handling this mouse event
  e.preventDefault();
  e.stopPropagation();

  // get the current mouse position
  var mx=parseInt(e.clientX-offsetX);
  var my=parseInt(e.clientY-offsetY);

  // test each shape to see if mouse is inside
  dragok=false;
  chart.nodes.forEach( function (node){
      var s = node;              
      var drx = s.x - mx;
      var dry = s.y - my;
      // test if the mouse is inside this circle
      if(drx * drx + dry * dry < s.r * s.r){
        dragok = true;
        node.isDragging = true;
      }
    })
  // save the current mouse position
  startX = mx;
  startY = my;
}

// handle mouseup events
function myUp(e){
  // tell the browser we're handling this mouse event
  e.preventDefault();
  e.stopPropagation();

  // clear all the dragging flags
  dragok = false;
  chart.nodes.forEach ( function (node) {
    node.isDragging=false;
  })
}


// handle mouse moves
function myMove(e){
  // if we're dragging anything...
  if (dragok){

    // tell the browser we're handling this mouse event
    e.preventDefault();
    e.stopPropagation();

    // get the current mouse position
    var mx=parseInt(e.clientX-offsetX);
    var my=parseInt(e.clientY-offsetY);

    // calculate the distance the mouse has moved
    // since the last mousemove
    var drx = mx - startX;
    var dry = my - startY;

    // move each rect that isDragging 
    // by the distance the mouse has moved
    // since the last mousemove
    chart.nodes.forEach ( function (node) {
      var s=node;
      if(s.isDragging){
        s.x += drx;
        s.y += dry;
      }
    })

    // redraw the scene with the new rect positions
    draw();

    // reset the starting mouse position for the next mousemove
    startX=mx;
    startY=my;

  }
}
}
