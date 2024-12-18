let canvas;
let images = [];
let positions = [];
let angles = []; // Array to hold random angles for tiltings
let dragging = false;
let resizing = false;
let rotating = false;
let draggedImgIndex = null;
let offsetX, offsetY;
let saveButton, fullscreenButton, resetButton, screensaverButton, randomizeButton;
let saveIcon, fullscreenIcon, resetIcon;
let imgSize = 150; // Set uniform size for images = ratio to multiply
let spacing = 10; // Set spacing between images
let a = null;

// THIS CAUSED A BUG IN THE RESIZING!
//let imgWidths = Array(images.length).fill(imgSize);
//let imgHeights = Array(images.length).fill(imgSize); // the same??

let OriginalimgHeights;
let OriginalimgWidths;

let imgWidths; 
let imgHeights; 
let imgAngles  = Array(positions.angles).fill(a);

let savecount = 0;
let saving = false; // Flag to control selection drawing during save


//let radius = 250; // Distance from the center to place images
//let speed = 0.0005; // Control the speed of movement
let draggingImage = null; // Track which image is being dragged
let papertexture;
let showInstructions = true; // Control visibility of instructions

// For Screensaver
let floaters;
let lastInteractionTime;
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// UPDATE SCREENSAVER TIME HERE
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
let screensaverDelay = 90000; // 5 minutes (in ms, 10000 = 10 sec)
let screensaverActive = false;

let selectedImgIndex = null; // Track selected image index


// for cursor
let handOpen, handClosed;

// for randomization button
let randomize = false;


function preload() {
   
   // Load the paper background texture
  paperTexture = loadImage('elements/paper.jpg');
  
  // paper for instructions
  instructionPaper = loadImage('instructionpaper.png'); // Load the instruction paper
  
  handOpen = 'cursor/open-hand.png';
  handClosed = 'cursor/closed-hand.png';
  
  // Load images based on the filenames in the array
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // ADD AMOUNT OF ELEMENTS HERE
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const totalImages = 41; // Adjust based on the number of images
  for (let i = 0; i < totalImages; i++) {
    let filename = nf(i, 3) + '.png'; // Assuming filenames are 000.png, 001.png, etc.
    images.push(loadImage(`elements/${filename}`)); // Load the image
    angles.push(random(-PI / 8, PI / 8)); // Random angle between -22.5 and 22.5 degrees
  }
  
  // champloo gif
  // I know this can be done better, but just putting the first and last image didn't work T__T
  champloo = loadAnimation(
    "frames/c01.png", 
    "frames/c02.png", 
    "frames/c03.png", 
    "frames/c04.png", 
    "frames/c05.png", 
    "frames/c06.png", 
    "frames/c07.png", 
    "frames/c08.png", 
    "frames/c09.png", 
    "frames/c10.png", 
    "frames/c11.png", 
    "frames/c12.png", 
    "frames/c13.png", 
    "frames/c14.png", 
    "frames/c15.png", 
    "frames/c16.png",
    "frames/c17.png", 
    "frames/c18.png", 
    "frames/c19.png", 
    "frames/c20.png", 
    "frames/c21.png", 
    "frames/c22.png", 
    "frames/c23.png", 
    "frames/c24.png", 
    "frames/c25.png", 
    "frames/c26.png", 
    "frames/c27.png", 
    "frames/c28.png", 
    "frames/c29.png", 
    "frames/c30.png", 
    "frames/c31.png", 
    "frames/c32.png", 
    "frames/c33.png", 
    "frames/c34.png", 
    "frames/c35.png", 
    "frames/c36.png",
    "frames/c37.png", 
    "frames/c38.png",
    "frames/c39.png", 
    "frames/c40.png", 
    "frames/c41.png",
    "frames/c42.png", 
    "frames/c43.png", 
    "frames/c44.png", 
    "frames/c45.png", 
    "frames/c46.png",
    "frames/c47.png", 
    "frames/c48.png", 
    "frames/c49.png"
  );
  
  // Slow down the animation by increasing frame delay
  champloo.frameDelay = 15; // Higher number = slower animation
}


// logic to be used in setup() and arrangeimages()
function calculatePosition(i, totalImages) {
  let angle = map(i, 0, totalImages, 0, TWO_PI); // this angle is for the borders
  let padding = 30; // Increased padding for visibility on edges
  let cornersRadius = 50;
  let x, y;

  // Determine position based on angle for a rounded rectangle
    if (angle < HALF_PI) { // Top edge
      // Adjust right edge position to bring it towards the center
      x = lerp(padding, width * 0.85, angle / (HALF_PI)); // Adjust right to 75% of width
      y = padding;

    } else if (angle < PI) { // RIGHT edge
      // Adjust right edge position
      x = width * 0.90; // Fixed position at 75% of width
      y = lerp(padding, height * 0.90, (angle - HALF_PI) / (HALF_PI)); // Adjust bottom to 75% of height

    } else if (angle < 1.5 * PI) { // BOTTOM edge
      // Adjust bottom edge position
      x = lerp(width * 0.75, padding, (angle - PI) / (HALF_PI)); // From 75% of width to padding
      y = height * 0.80; // Fixed position at 75% of height

    } else { // Left edge
      // Adjust left edge position
      x = padding;
      y = lerp(height * 0.75, padding, (angle - 1.5 * PI) / (HALF_PI)); // From 75% of height to padding
    }

  // Zigzag effect and random offset
  let zigzagOffset = (i % 2 === 0) ? cornersRadius : -cornersRadius;
  let randomOffsetX = random(-10, 10);
  let randomOffsetY = random(-10, 10);

  return {
    x: x + cos(angle) * zigzagOffset + randomOffsetX,
    y: y + sin(angle) * zigzagOffset + randomOffsetY,
    angle: random(-25 , 25) // "push()" pushes it to the external array
  };
}


function setup() {
  createCanvas(windowWidth, windowHeight); // Set the canvas size
  
  cursor(handOpen); // Set the open hand as the default cursor
  
  //Setup for Screensaver
  lastInteractionTime = millis();
  initializeFloaters();
  champloo.scale = min(width / champloo.width, height / champloo.height); // Scale to fit screen

  
  // store original size
  OriginalimgWidths = images.map(() => imgSize);
  OriginalimgHeights = images.map((img) => imgSize * (img.height / img.width)); // maintain aspect ratio
 
  
  imgWidths = images.map(() => imgSize);
  imgHeights = images.map((img) => imgSize * (img.height / img.width));
  
  arrangeImages(); // Arrange images initially

  // Define the rounded rectangle parameters
  let padding = 30; // Padding from edges
  let cornersRadius = 30; // Radius for the rounded corners
  let totalImages = images.length;
  
  
  
  
  
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// BUTTONS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  // Create buttons for saving, fullscreen, and resetting
  //saveButton = createButton('<i class="fas fa-save"></i>');
  //saveButton.position(10, 10);
  //saveButton.style('background-color', 'transparent');
  //saveButton.style('border', 'none'); // Remove the border
  //saveButton.style('cursor', 'pointer'); // Change cursor on hover
  //saveButton.mousePressed(saveCollage);
  //
  //
  //fullscreenButton = createButton('<i class="fas fa-expand"></i>');
  //fullscreenButton.position(40, 10);
  //fullscreenButton.style('background-color', 'transparent');
  //fullscreenButton.style('border', 'none'); // Remove the border
  //fullscreenButton.style('cursor', 'pointer'); // Change cursor on hover
  //fullscreenButton.mousePressed(toggleFullscreen);
  
  //resetButton = createButton('<i class="fas fa-redo"></i>'); //cant find solid in offline css file?
  resetButton = createButton('🔁');
  resetButton.style('font-size', '20px'); 
  //resetButton.position(70, 10);
  resetButton.position(20, 10);
  resetButton.style('background-color', 'transparent');
  resetButton.style('border', 'none'); // Remove the border
  resetButton.style('cursor', 'pointer'); // Change cursor on hover
  resetButton.mousePressed(resetPositions);
  
  //screensaverButton = createButton('<i class="fa-solid fa-moon"></i>'); 
  screensaverButton = createButton('✨');
  screensaverButton.style('font-size', '20px'); 
  //screensaverButton.position(105, 10);
  screensaverButton.position(55, 10);
  screensaverButton.style('background-color', 'transparent');
  screensaverButton.style('border', 'none'); // Remove the border
  screensaverButton.style('cursor', 'pointer'); // Change cursor on hover
  screensaverButton.mousePressed(() => {
  screensaverActive = true; // Activate the screensaver
  lastInteractionTime = millis(); // Reset last interaction time to prevent immediate deactivation
  });
  
  randomizeButton = createButton('Randomize Layout');
  //randomizeButton.position(10, 40);
  randomizeButton.position(10, 40);
  randomizeButton.style('font-family', 'Courier New, monospace'); 
  randomizeButton.style('font-size', '9px'); 
  randomizeButton.style('font-weight', 'bold'); 
  randomizeButton.style('color', 'white'); // White text
  randomizeButton.style('background-color', 'rgba(176, 0, 48, 0.6)'); // red with transparency
  //randomizeButton.style('background-color', '#B00030'); // more reddish
  //randomizeButton.style('background-color', '#c71585'); // very pink
  //randomizeButton.style('background-color', '#c71585'); // more pinkish
  
  randomizeButton.style('border', 'none'); // Remove border
  randomizeButton.style('padding', '10px 15px'); // Add some padding
  randomizeButton.style('cursor', 'pointer'); // Change cursor on hover
  randomizeButton.style('border-radius', '25px'); // Rounded edges
  randomizeButton.style('box-shadow', '2px 2px 5px rgba(0, 0, 0, 0.5)'); // Drop shadow
  randomizeButton.style('cursor', 'pointer'); // Change cursor on hover
  
  randomizeButton.html('ランダム化<br>RANDOMIZE'); // Set button text
  
  randomizeButton.mousePressed(() => {
  randomize = true; 
  randomizeLayout();
  });

  
  
}


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// DRAW
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function draw() {
  //background(255, 255, 255);
  

  // Draw the paper texture as background
  for (let x = 0; x < width; x += paperTexture.width) {
    for (let y = 0; y < height; y += paperTexture.height) {
      image(paperTexture, x, y);
    }
  }
  
  // randomize button logic
  //if (randomize) randomizeLayout();

  // Screensaver logic
  if (screensaverActive) {
    runScreensaver();
    // Hide buttons when screensaver is active
    //saveButton.hide();
    //fullscreenButton.hide();
    resetButton.hide();
    screensaverButton.hide();
    randomizeButton.hide();
  } else {
    checkInactivity();
    //saveButton.show();
    //fullscreenButton.show();
    resetButton.show();
    screensaverButton.show();
    randomizeButton.show();
    
    // Draw and position images
    for (let i = 0; i < images.length; i++) {
      push();
      translate(positions[i].x + imgWidths[i] / 2, positions[i].y + imgHeights[i] / 2);
      rotate(positions[i].angle);
      image(images[i], -imgWidths[i] / 2, -imgHeights[i] / 2, imgWidths[i], imgHeights[i]);
      pop();
    }

    // Draw selection rectangle if an image is selected, but only if not saving
    if (selectedImgIndex !== null && !saving) {
      drawSelectionRectangle(selectedImgIndex);
    }
    
    // Draw the instructional text
    if (showInstructions) {
      drawInstructions();
    }
    
    // Show buttons only if screensaver is not active
    //saveButton.show();
    //fullscreenButton.show();
    resetButton.show();
    screensaverButton.show();
  }
  randomize = false;
}



function checkInactivity() {
  if (millis() - lastInteractionTime > screensaverDelay) {
    screensaverActive = true;
  }
}

// ~~~~~~~~~ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~ SCREENSAVERS
// ~~~~~~~~~ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

let champloo;
function runScreensaver() {
    //dark background for screensaver
    const rectWidth = windowWidth;  
    const rectHeight = windowHeight; 
    const rectX = width / 2 - rectWidth / 2; // Center the rectangle horizontally
    const rectY = height / 2 - rectHeight / 2; // Center the rectangle vertically
    fill(40, 40, 40, 200); // dark gray transparent
    
    strokeWeight(0);
    rect(rectX, rectY, rectWidth, rectHeight); // 20 is the corner radius
    floaters.forEach(floater => displayFloater(floater));
    animation(champloo, width / 2, height / 2);
  
}

function displayFloater(floater) {
  floater.angleX += floater.speedX * 0.01;
  floater.angleY += floater.speedY * 0.01;
  
  let x = floater.x + sin(floater.angleX) * floater.amplitudeX;
  let y = floater.y + cos(floater.angleY) * floater.amplitudeY;
  
  push();
  translate(x, y);
  rotate(floater.rotation);
  floater.rotation += floater.rotationSpeed;
  tint(255, floater.alpha);  // Apply transparency
  tint(floater.color); // change color tint (optional)
  image(floater.img, 0, 0, floater.img.width * floater.scale, floater.img.height * floater.scale);
  pop();
}




function mouseMoved() {
  lastInteractionTime = millis();
  //screensaverActive = false; // changed it to stop screensaver on doubleclick

  initializeFloaters(); // Reinitialize floaters when screensaver is exited, adds cool effect
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~ FLOATERS SETUP
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function initializeFloaters() {
  floaters = images.map((img, index) => {
    // Create a smaller version of the image for the screensaver
    let lowResImg = createImage(img.width / 2, img.height / 2);
    lowResImg.copy(img, 0, 0, img.width, img.height, 0, 0, img.width / 2, img.height / 2);

    return {
      img: lowResImg, // Use the lower-resolution image
      //x: random(width),
      //y: random(height),
      x: random(mouseX),
      y: random(mouseY),
      amplitudeX: random(10, 250), 
      amplitudeY: random(50, 150),
      //amplitudeX: random(50, 150), // trying out to see what looks nice
      //amplitudeY: random(30, 100),
      speedX: random(1, 3), // Increased speed for faster movement
      speedY: random(1, 2.5),
      //speedX: random(0.5, 2),
      //speedY: random(0.5, 1.5),
      angleX: random(TWO_PI),
      angleY: random(TWO_PI),
      alpha: random(100, 200),
      scale: random(0.4, 0.9), // Scaling down the image even more
      rotation: random(TWO_PI),
      rotationSpeed: random(-0.1, 0.3),
      color: color(random(100, 255), random(100, 255), random(100, 200), random(100, 200))
    };
  });
}




function drawInstructions() {

  
  // Calculate rectangle dimensions
  const rectWidth = windowWidth;  // Adjust the width as needed
  const rectHeight = 500; // Adjust the height as needed
  const rectX = width / 2 - rectWidth / 2; // Center the rectangle horizontally
  const rectY = height / 2 - rectHeight / 2; // Center the rectangle vertically

  
  // Draw the semi-transparent rounded rectangle
  //fill(255, 255, 255, 150); // White with alpha for transparency
  //fill(214, 124, 160, 150); // pink 
  fill(40, 40, 40,150); // dark gray
  
  strokeWeight(0);
  rect(rectX, rectY, rectWidth, rectHeight, 20); // 20 is the corner radius
   
  // Draw the instruction paper behind the text
  //image(instructionPaper, rectX+500, rectY-50); // Draw the paper
  //paperw = instructionPaper.width + 300;
  //paperh = instructionPaper.height + 150;
  
  // set paper size dynamically
  //const paperw = windowWidth - 800;
  const paperw = instructionPaper.width + 300;
  //const paperh = windowHeight - 100;
  const paperh = instructionPaper.height + 150;
  const pX = width / 2 - paperw / 2; // Center the paper horizontally
  const pY = height / 2 - paperh / 2; // Center the paper vertically
  image(instructionPaper, pX, pY, paperw, paperh); 
  
  // Text info
  textSize(32);
  textAlign(LEFT, CENTER);
  //fill(217, 255, 249); // aqua 
  fill(80,80,80,); // aqua 
  //stroke(80, 80, 80);
  //strokeWeight(1);
  textFont('Georgia'); // Font for the header
  
  text("指示 | Instructions", width / 2 - 200, height / 2 - 210);
  
  textSize(18);
  textFont('Arial'); // Font for the body text
  text("画像をドラッグして移動できます。\nDrag and drop images to move them around.\n\n " +
       "👆 画像をダブルクリックして最前面か最背面に持ってくる。\nDouble-click on an image to bring it to the front or back.\n\n" +
       "🔴  画像の右上隅をドラッグして回転。\nDrag the top-right corner of an image to rotate it.\n\n" +
       "🔵 画像の右下隅をドラッグしてサイズ変更。\nDrag the bottom-right corner of an image to resize it.\n\n" +
       "🔁 リセットボタンを押して、画像を再配置しこのガイドを再表示。\nClick the reset button to reset images and show this guide again.",
       width / 2 - 200, height / 2 +10 );
  
  textSize(15);
  //textStyle(ITALIC);
  text("\n\n(ダブルクリックで閉じる | Double-click to close)", width / 2 - 200, height / 2 +180 );
  
 
    
  
}



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~ KEYBOARD KEYPRESS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function keyPressed() {
    if (key === 's'){
        saveCollage();
    }
    
}




// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~ CLICK
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function mousePressed() {
  cursor(handClosed); // Switch to closed hand cursor when mouse is pressed
  
  let imageClicked = false;

  for (let i = images.length - 1; i >= 0; i--) {
    let cx = positions[i].x + imgWidths[i] / 2;
    let cy = positions[i].y + imgHeights[i] / 2;

    // Rotate the mouse position into the image's local space
    let rotatedMouseX = cos(-positions[i].angle) * (mouseX - cx) - sin(-positions[i].angle) * (mouseY - cy) + cx;
    let rotatedMouseY = sin(-positions[i].angle) * (mouseX - cx) + cos(-positions[i].angle) * (mouseY - cy) + cy;

    let x = positions[i].x;
    let y = positions[i].y;
    let w = imgWidths[i];
    let h = imgHeights[i];

    // Expand resize and rotate areas for easier clicking (add the 20s and 10s for increased area)
    if (rotatedMouseX > x + w - 30 && rotatedMouseX < x + w + 20 && rotatedMouseY > y + h - 30 && rotatedMouseY < y + h + 20) {
      resizing = true;
      selectedImgIndex = i;
      initialWidth = imgWidths[i]; //We use initialWidth, initialHeight, initialMouseX, and initialMouseY to keep track of the state when resizing starts.
      initialHeight = imgHeights[i];
      initialMouseX = mouseX;
      initialMouseY = mouseY;
      imageClicked = true;
      break;
    } else if (rotatedMouseX > x + w - 30 && rotatedMouseX < x + w + 20 && rotatedMouseY > y - 30 && rotatedMouseY < y + 30) {
      rotating = true;
      selectedImgIndex = i;
      imageClicked = true;
      break;
    } else if (rotatedMouseX > x && rotatedMouseX < x + w && rotatedMouseY > y && rotatedMouseY < y + h) {
      dragging = true;
      draggedImgIndex = i;
      selectedImgIndex = i;
      offsetX = rotatedMouseX - x;
      offsetY = rotatedMouseY - y;
      imageClicked = true;
      break;
    }
  }

  if (!imageClicked) selectedImgIndex = null;
}



function drawSelectionRectangle(index) {
  let x = positions[index].x;
  let y = positions[index].y;
  let w = imgWidths[index];
  let h = imgHeights[index];
  
  // Draw rectangle and handles for easier interaction
  push();
  translate(x + w / 2, y + h / 2);
  rotate(positions[index].angle);
  stroke(80,80,80);
  strokeWeight(1);
  drawingContext.setLineDash([5, 5]);
  noFill();
  rect(-w / 2, -h / 2, w, h);
  drawingContext.setLineDash([]);

  // Resize and rotate handles
  fill(250,29,73); // Rotate handle (red)
  ellipse(w / 2 - 5, -h / 2 + 5, 20, 20); // change the 20s to 30 or something else, w,h,x,y
  
  fill(86,121,203); // Resize handle (blue)
  ellipse(w / 2 - 5, h / 2 - 5, 20, 20); 
  pop();
}


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~ DRAG
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


let initialAngle = null; // New variable to store initial angle

function mouseDragged() {   
    if (dragging && draggedImgIndex !== null) {
        // Move the selected image based on the offset
        positions[draggedImgIndex].x = mouseX - offsetX;
        positions[draggedImgIndex].y = mouseY - offsetY;

    } else if (resizing && selectedImgIndex !== null) {
        // Calculate the new width while maintaining the aspect ratio
        //let newWidth = dist(mouseX, mouseY, positions[selectedImgIndex].x, positions[selectedImgIndex].y);
        //let aspectRatio = imgHeights[selectedImgIndex] / imgWidths[selectedImgIndex];
        //let newHeight = newWidth * aspectRatio;
        
        // Calculate the change in mouse position from the initial click point
        let deltaX = mouseX - initialMouseX;
        let newWidth = initialWidth + deltaX;
        let aspectRatio = imgHeights[selectedImgIndex] / imgWidths[selectedImgIndex];
        let newHeight = newWidth * aspectRatio;

        // Ensure minimum dimensions of 50 for both width and height
        if (newWidth >= 50 && newHeight >= 50) {
            imgWidths[selectedImgIndex] = newWidth;
            imgHeights[selectedImgIndex] = newHeight;
        }
        
    } else if (rotating && selectedImgIndex !== null) {
        let dx = mouseX - (positions[selectedImgIndex].x + imgWidths[selectedImgIndex] / 2);
        let dy = mouseY - (positions[selectedImgIndex].y + imgHeights[selectedImgIndex] / 2);
        
        // Set initial angle when rotation starts
        if (initialAngle === null) {
            initialAngle = atan2(dy, dx) - positions[selectedImgIndex].angle;
        }

        // Calculate and update the new angle relative to initialAngle
        positions[selectedImgIndex].angle = atan2(dy, dx) - initialAngle;
    }
}


function mouseReleased() {
  cursor(handOpen); // Switch back to open hand cursor when mouse is released
  
  dragging = false;
  resizing = false;
  rotating = false;
  draggedImgIndex = null;
}



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~ DOUBLECLICK
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Bring image to the front on double click
function doubleClicked() {
  // close screensaver and instructions
  //if (showInstructions) showInstructions = false;
  //screensaverActive = false; // this was in mouse moved, changed it to when doubleclicked
  
  if (screensaverActive) {
    screensaverActive = false;
    initializeFloaters();  // Reinitialize floaters if needed
  } else if (showInstructions) {
    showInstructions = false; // Hide instructions when double-clicked separately
  }
  

  // Store the original length of the arrays before splicing
  let originalLength = images.length;
  
  for (let i = images.length - 1; i >= 0; i--) {
    let cx = positions[i].x + imgWidths[i] / 2;
    let cy = positions[i].y + imgHeights[i] / 2;

    let rotatedMouseX = cos(-positions[i].angle) * (mouseX - cx) - sin(-positions[i].angle) * (mouseY - cy) + cx;
    let rotatedMouseY = sin(-positions[i].angle) * (mouseX - cx) + cos(-positions[i].angle) * (mouseY - cy) + cy;

    let x = positions[i].x;
    let y = positions[i].y;
    let w = imgWidths[i];
    let h = imgHeights[i];

    if (rotatedMouseX > x && rotatedMouseX < x + w && rotatedMouseY > y && rotatedMouseY < y + h) {
      let selectedPosition = positions.splice(i, 1)[0];
      let selectedImage = images.splice(i, 1)[0];
      let selectedWidth = imgWidths.splice(i, 1)[0];
      let selectedHeight = imgHeights.splice(i, 1)[0];

      // Add them back to the end of the arrays (this bringgs them to the front)
      //positions.push(selectedPosition);
      //images.push(selectedImage);
      //imgWidths.push(selectedWidth);
      //imgHeights.push(selectedHeight);

      let clickedImageIndex = i; // Store the index of the clicked image (this is so the selection rectangle doesnt move around after doubleclick)
      

      //if (i === images.length) {
        if (i === originalLength-1) {
        // If the clicked image is already at the top (last in the array)
        // Send it to the back (beginning of the array)
        positions.unshift(selectedPosition);
        images.unshift(selectedImage);
        imgWidths.unshift(selectedWidth);
        imgHeights.unshift(selectedHeight);
        selectedImgIndex =  0;
      } else {
        // Otherwise, move it to the end of the array
        positions.push(selectedPosition);
        images.push(selectedImage);
        imgWidths.push(selectedWidth);
        imgHeights.push(selectedHeight);
        selectedImgIndex = images.length - 1;
      }

      // Update selectedImgIndex to the position of the clicked image (before it was moved)
      //selectedImgIndex = clickedImageIndex; // Set it back to the index of the image that was clicked

      
      // Update selectedImgIndex to the new position at the end of the arrays
      //selectedImgIndex = images.length - 1;
      break;
    }
  }
}



//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ARRANGE IMAGES ~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function arrangeImages() {
  let padding = 30; // Increased padding for visibility on edges
  let cornersRadius = 50;
  let totalImages = images.length;

  for (let i = 0; i < totalImages; i++) {
    positions[i] = calculatePosition(i, totalImages);
    // Store initial positions - x, y and angle
    positions[i].initialX = positions[i].x; 
    positions[i].initialY = positions[i].y;
    //positions[i].initialAngle = positions[i].angle;
  }

  }
  
  
 //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// RANDOMIZE IMAGES - users can play around with some random starting points ~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  function randomizeLayout() {
  let padding = 30; // Padding from edges
  let totalImages = images.length;

  for (let i = 0; i < totalImages; i++) {
    // Randomize size within a reasonable range (e.g., 50% to 150% of original size)
    let randomSizeFactor = random(0.5, 1.5);
    
    // RESIZE BUG!!!!!! EDIT: fixeddd
    // why is this malfunctioning???!?!??!?!??
    // answer: because in my variable i set them up as this!!!!!!!!!!!!!
    //let imgWidths = Array(images.length).fill(imgSize); they were the same smh
    //let imgHeights = Array(images.length).fill(imgSize);
     // HOW DID IT WORK PROPERLY ALL THIS TIME
    //imgWidths[i] = imgSize * randomSizeFactor; // Update width
    //imgHeights[i] = images[i].height * (imgSize / images[i].width) // Maintain aspect ratio based on new width


    //imgWidths[i] = OriginalimgWidths[i] * randomSizeFactor; // Update width
    ////imgHeights[i] = OriginalimgHeights[i] * randomSizeFactor;
    //imgHeights[i] = (OriginalimgHeights[i] / OriginalimgWidths[i]) * imgWidths[i]; // Maintain aspect ratio based on new width
    
    
    imgWidths[i] = imgWidths[i] * randomSizeFactor; // Update width
    imgHeights[i] = imgWidths[i] * (imgHeights[i] / imgWidths[i]) ; // Maintain aspect ratio based on new width

    // just used the same logic as everywhere else. THIS IS THE ACTUAL FIX smh
    let newsize = imgSize * randomSizeFactor;
    imgWidths[i] = newsize; // Reset to original image width
    imgHeights[i] = images[i].height * (newsize / images[i].width);

    // Calculate bounds based on the image size
    let minX = padding; // LEFT EDGE
    let maxX = width - padding - imgWidths[i]; // RIGHT EDGE
    let minY = padding * 0.85; // TOP EDGE
    let maxY = height* 0.85 - padding - imgHeights[i]; // BOTTOM EDGE

    // Ensure the randomized position is within bounds
    let x = random(minX, maxX);
    let y = random(minY, maxY);

    // Randomize rotation
    let randomRotation = random(-45, 45); // Random rotation between -45° and 45°

    positions[i] = {
      x: x,
      y: y,
      angle: randomRotation // Update the angle for rotation
    };
  }
  randomize = false;
}


// in this version, save was reset before draw() which is why the selection rectangles saved too
// in the new version use setTimeout(): Delays the saveCanvas call by 0 milliseconds, ensuring draw completes without the selection rectangle.
//function saveCollage() {
//  savecount += 1;
//  let cnv = get(0, 0, width, height);
//  cnv.save('collage'+savecount,'png');
//}

// also didn't work. try with redraw
//function saveCollage() { 
//  saving = true;  // Set the flag to hide selection
//  // Wait for one frame to pass before saving, so draw completes without selection
//  setTimeout(() => { 
//    saveCanvas('collage'+savecount,'png'); // Save the canvas
//    saving = false;  // Reset the flag after saving
//  }, 5); // milliseconds
//}

let dateAndTime = new Date().toLocaleString("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
}).replace(/\//g, "-").replace(":", "_");

function saveCollage() {
saving = true;  // Set flag to hide selection
redraw();  // Trigger draw without selection for sving
saveCanvas('collage'+nf(savecount,3)+'_'+dateAndTime,'png'); // Save the canvas
saving = false;  // Reset flag after saving
//redraw();  // Draw again to re-show selection if needed
savecount ++;
}
function toggleFullscreen() {
  let fs = fullscreen();
  fullscreen(!fs);
}

function resetPositions() {
  // Reset each image to its original position, size, and angle
  for (let i = 0; i < images.length; i++) {
    // Reset to the initial positions and sizes defined in arrangeImages()
    positions[i].x = positions[i].initialX;
    positions[i].y = positions[i].initialY;
    imgWidths[i] = imgSize; // Reset to original image width
    imgHeights[i] = images[i].height * (imgSize / images[i].width); // Preserve original aspect ratio
    
  }
  
  arrangeImages(); // Set images back to the arranged positions
  showInstructions = true; // Show instructions again on reset
  
}


// Adjust the canvas size when the window is resized
function windowResized() {
  //resizeCanvas(windowWidth - 4, windowHeight - 4);
  resizeCanvas(windowWidth, windowHeight);  // hide scrollbars in CSS!
  arrangeImages(); // Call the function to arrange images around the perimeter
  champloo.scale = min(width / champloo.width, height / champloo.height); // Recalculate scale on resize
}