var bigEnough = 3.0;						// When GIFs grow this big, show a new GIF
const maxImageScale = 15.0;				// GIFs can't grow bigger than this
const randomTag = false;			// To search with a specific tag, set to false, then set currentTag
let currentTag = 0;			
const frameSkip = 0;
const api = "https://api.giphy.com/v1/stickers/search?&api_key="; 
const apiKey = ["Ln1OMDKTMpwmS1AX3OnlmVBfPsuSEkje", "A6MgOoK9jJ0wFHnuM3rI9GzXLkrmAChZ", "cSsLBM6hA6jGEF5CySVunnXgEviMsWwF", "fpK8CwaWa9vraD6NFgEAjHMfnOTgvhZr"];
let sequentialDL = false;				// Instead of loading GIFs in advance, load them in the background.
													// A good idea in theory, but in practice it looks terrible until everything loads.
		// When you change tags sequentialDL changes to true, because it's better than stopping and waiting for 100% new GIFs.

// Customize variables above -- change the ones below at your own risk:

let query;
let currentKey = 3;			
let timer = 0;					
let images = [];				
let loadedImages = [];
let imgNum = 0;					
let imgLimit = 50;
let GIFurls = [];				
let GIFs = [];
let GIFnum = 0;					
let GIFsLoaded = 0;
let offset;							
let GIF;
let erasing = false;		
let erasedLoadMsg = false;
let msgFade, msgDiv;
let loadAnother = false, loadDelay = 0;

function setup() {
	// createCanvas(windowWidth, windowHeight);
	createCanvas(windowWidth, windowHeight, WEBGL);
	offset = int(random(100));
	if (randomTag) currentTag = int(random(tag.length));
	query = tag[currentTag];
	showMsg("loading " + query + " GIFs 0%");
  getJSON();
}

const tag = ["hanoi"];
function draw(){
	let tempGIF;
	// if (GIFsLoaded < 50) {			// still loading?
		if (loadAnother && GIFsLoaded < GIFurls.length) {
			if (loadDelay < 199) {
				loadDelay++;
			} else {
				if (GIFsLoaded % 5 == 4) {
					showMsg("loading " + query + " GIFs " + GIFsLoaded * 2 + "%");
				}
				loadImage(GIFurls[GIFsLoaded], gotGIF);		// download the next one
				loadAnother = false;
			}
		}
	// }

	if (GIFsLoaded > (sequentialDL ? 0 : 49)) {			// if enough images are loaded,
		if (!erasedLoadMsg) {
			background('gray');												// get the first GIF:
			tempGIF = new GIFzoomer(width / 2, height / 2, loadedImages[GIFnum]);
			GIFs.push(tempGIF);
			erasedLoadMsg = true;
			keyTyped();								// show valid keypresses
		}
		
		if (GIFs.length > 0) {
			if (GIFs[GIFs.length-1].scale > bigEnough &&
					GIFs[GIFs.length-1].scale < bigEnough + 0.2) {		// when the most recent GIF is big enough,
				GIFnum = ++GIFnum % loadedImages.length;
				tempGIF = new GIFzoomer(width / 2, height / 2, loadedImages[GIFnum]);
				GIFs.push(tempGIF);												// add another GIF to the display
			}
		} else {																		// if no GIFs are playing,
			GIFnum = ++GIFnum % loadedImages.length;
			tempGIF = new GIFzoomer(width / 2, height / 2, loadedImages[GIFnum]);
			GIFs.push(tempGIF);												// add another GIF to the display
		}
		if (frameSkip < 2 || frameCount % frameSkip == 0) {
			if (GIFs.length > 0) {
				// showMsg("\n\n" + GIFs.length + "\t" + GIFnum);
				for (let i = 0; i < GIFs.length; i++) {
					if (GIFs[i].fade <= 0) {			// GIF big enough?   (fading not implented)
						GIFs.shift();								// delete the oldest GIF displaying
					} else {
						GIFs[i].update();
						GIFs[i].draw();
					}
				}
			}
		}
	}
	showMsg();
}

function getJSON() {			// gets the giphy API to send us the URLs of 50 GIFs
	offset = int(random(100));
  let url = api + apiKey[currentKey] + "&offset=" + offset + "&q=" + query; //concatenate api call
	GIFsLoaded = 0;
  loadJSON(url, gotData, loadError);		// gotData is called once the API's response arrives
}

function gotData(giphy) { 	// this function is called after loadJSON is finished
	GIFurls = [];
	for (let i = 0; i < giphy.data.length; i++) {					// extract all fifty GIF URLs into the GIFurls array
		// GIFurls.push(giphy.data[i].images.original.url);		// original GIF versions look best but load slowest
		// GIFurls.push(giphy.data[i].images.downsized.url);		// downsized is medium quality, but slower than fixed
		GIFurls.push(giphy.data[i].images.fixed_height.url);	// fixed is fastest, but lowest image quality
		if (!sequentialDL)																	// if we're not downloading GIFs one at a time,
			loadImage(GIFurls[GIFurls.length-1], gotGIF, loadError);		// download GIFs as we get the URLs
  }
	GIFsLoaded = 0;				// at this point no GIFs have downloaded -- when each arrives, gotGIF is called
	if (sequentialDL) loadImage(GIFurls[GIFsLoaded], gotGIF, loadError);		// download just the first GIF
}

function gotGIF(giphyImg) { 	// this function is called after each loadImage is finished
	if (GIFsLoaded == 0 && loadedImages.length >= 50) loadedImages = [];
	if (GIFsLoaded < 50 && loadedImages.length >= 50) {
		loadedImages[GIFsLoaded] = giphyImg;
	} else {
		loadedImages.push(giphyImg);
	}
	GIFsLoaded++;
	if (sequentialDL) {														// if we're downloading GIFs one at a time,
		if (GIFsLoaded < GIFurls.length) {
	// 		loadImage(GIFurls[GIFsLoaded], gotGIF);		// download the next one
			loadAnother = true;
		}
	}
}

function loadError(errMsg) {
	print("load error: " + errMsg);
  setTimeout(1000);
	++currentKey;
	if (currentKey >= apiKey.length) currentKey = 0;
	print("...API daily limit reached?  Let's try another API key:  " + apiKey[currentKey]);
	getJSON();
}

function keyTyped() {
	let tempMsg = "";
	if (key === '-') { // Minus pressed = less images
		bigEnough += 0.5;
		if (bigEnough > maxImageScale) bigEnough = maxImageScale;
		tempMsg = "less images (" + int(map(bigEnough, 0.5, maxImageScale, 100, 0)) + "%)";
	} else if (key === '+' || key === '=') { 	// Plus pressed = more images
		bigEnough -= 0.5;
		if (bigEnough < 0.5) bigEnough = 0.5;
		tempMsg = "more images (" + int(map(bigEnough, 0.5, maxImageScale, 100, 0)) + "%)";
	} else if (key != null) {			// keypress that wasn't - or + but isn't nothing = change search tag
		++currentTag;
		if (currentTag >= tag.length) currentTag = 0;
		query = tag[currentTag];
		tempMsg = "<br>new tag: " + query;
		sequentialDL = true;
		getJSON();
	}
	showMsg(tempMsg);
}

function mouseClicked() {
	key = ' ';
	keyTyped();
}

function showMsg(tempMsg) {		// a more WebGL-friendly showMsg
	if (msgDiv == null) {
		msgDiv = createDiv();
		msgDiv.style('font-family', 'sans-serif');
		msgDiv.style('font-size', '18px');
		msgDiv.style('font-weight', 'bold');
		// msgDiv.style('color', 'white');
		msgDiv.style('position', 'fixed');
		msgDiv.style('top', '20px');
		msgDiv.style('left', '20px');
	}
	if (tempMsg != null) {			// new message to show
		tempMsg += "<br><br>press Minus or Plus for more or less images <br>any other key to change the search tag (" + tag[currentTag] + ")";
		msgDiv.html(tempMsg);
		msgFade = 1.0;
	}
	msgFade = msgFade > 0.01 ? msgFade - 0.01 : 0;
	msgDiv.style("opacity", msgFade);
}

class GIFzoomer {
  constructor(x, y, img) {
    this.x = x;
    this.y = y;
    this.img = img;
		this.scale =  0.1;
		this.scaleInc = 0.1;
    this.fade = 10;
  }

  update() {
		this.scale += this.scaleInc;
		if (this.scale < 0.5) this.fade = map(this.scale, 0, 0.5, 0, 255);
		if (this.scale > maxImageScale - 1) this.fade = map(this.scale, maxImageScale - 1, maxImageScale, 255, 0);
	}
	
	draw() {
		push();
		imageMode(CENTER);
		// translate(this.x, this.y);					// uncomment for non-WEBGL canvas
		scale(this.scale);
		image(this.img, 0, 0);
		pop();
	}
}
