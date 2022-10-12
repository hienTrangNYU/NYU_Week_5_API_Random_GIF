var bigEnough = 15.0;
var maxImageScale = 15.0;
let randomTag = false;
let currentTag = 0 ;
var frameSkip = 0;
const api = "https://api.giphy.com/v1/stickers/search?&api_key=";
const apiKey = ["Ln1OMDKTMpwmS1AX3OnlmVBfPsuSEkje", "A6MgOoK9jJ0wFHnuM3rI9GzXLkrmAChZ", "cSsLBM6hA6jGEF5CySVunnXgEviMsWwF", "fpK8CwaWa9vraD6NFgEAjHMfnOTgvhZr"];
let sequentialDL = false;
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
let loadAnother = false,
    loadDelay = 0;
let tag = ["hanoi","tokyo","washington","newyork"];
let btn;
function setup() {
    // createCanvas(windowWidth, windowHeight);
    createCanvas(windowWidth, windowHeight, WEBGL);
    offset = int(random(100));
    btn = createButton("USE");
    btn.mousePressed(keyTyped);
    btn.size(50,50);
    btn.position(10,10);
    btn.style("font-family", "Bodoni");
    btn.style("font-size", "20px");
    if (randomTag) currentTag = int(random(tag.length));
    query = tag[currentTag];
    showMsg("loading " + query + " GIFs 0%");
    getJSON();
}


function draw() {
    let tempGIF;
    if (loadAnother && GIFsLoaded < GIFurls.length) {
        if (loadDelay < 199) {
            loadDelay++;
        } else {
            if (GIFsLoaded % 5 == 4) {
                showMsg("loading " + query + " GIFs " + GIFsLoaded * 2 + "%");
            }
            loadImage(GIFurls[GIFsLoaded], gotGIF);
            loadAnother = false;
        }
    }


    if (GIFsLoaded > (sequentialDL ? 0 : 49)) {
        if (!erasedLoadMsg) {
            background('gray');
            tempGIF = new GIFzoomer(width / 2, height / 2, loadedImages[GIFnum]);
            GIFs.push(tempGIF);
            erasedLoadMsg = true;
            keyTyped();
        }

        if (GIFs.length > 0) {
            if (GIFs[GIFs.length - 1].scale > bigEnough &&
                GIFs[GIFs.length - 1].scale < bigEnough + 0.2) {
                GIFnum = ++GIFnum % loadedImages.length;
                tempGIF = new GIFzoomer(width / 2, height / 2, loadedImages[GIFnum]);
                GIFs.push(tempGIF);
            }
        } else {
            GIFnum = ++GIFnum % loadedImages.length;
            tempGIF = new GIFzoomer(width / 2, height / 2, loadedImages[GIFnum]);
            GIFs.push(tempGIF);
        }
        if (frameSkip < 2 || frameCount % frameSkip == 0) {
            if (GIFs.length > 0) {
                for (let i = 0; i < GIFs.length; i++) {
                    if (GIFs[i].fade <= 0) {
                        GIFs.shift();
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

function getJSON() {
    offset = int(random(100));
    let url = api + apiKey[currentKey] + "&offset=" + offset + "&q=" + query;
    GIFsLoaded = 0;
    loadJSON(url, gotData, loadError);
}

function gotData(giphy) {
    GIFurls = [];
    for (let i = 0; i < giphy.data.length; i++) {
        GIFurls.push(giphy.data[i].images.fixed_height.url);
        if (!sequentialDL)
            loadImage(GIFurls[GIFurls.length - 1], gotGIF, loadError);
    }
    GIFsLoaded = 0;
    if (sequentialDL) loadImage(GIFurls[GIFsLoaded], gotGIF, loadError);
}

function gotGIF(giphyImg) {
    if (GIFsLoaded == 0 && loadedImages.length >= 50) loadedImages = [];
    if (GIFsLoaded < 50 && loadedImages.length >= 50) {
        loadedImages[GIFsLoaded] = giphyImg;
    } else {
        loadedImages.push(giphyImg);
    }
    GIFsLoaded++;
    if (sequentialDL) {
        if (GIFsLoaded < GIFurls.length) {

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
    if (key === '-') {
        bigEnough += 0.5;
        if (bigEnough > maxImageScale) bigEnough = maxImageScale;
        tempMsg = "less images (" + int(map(bigEnough, 0.5, maxImageScale, 100, 0)) + "%)";
    } else if (key === '+' || key === '=') {
        bigEnough -= 0.5;
        if (bigEnough < 0.5) bigEnough = 0.5;
        tempMsg = "more images (" + int(map(bigEnough, 0.5, maxImageScale, 100, 0)) + "%)";
    } else if (key != null) {
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

function showMsg(tempMsg) {
    if (msgDiv == null) {
        msgDiv = createDiv();
        msgDiv.style('font-family', 'sans-serif');
        msgDiv.style('font-size', '15px');
        msgDiv.style('font-weight', 'bold');
        // msgDiv.style('color', 'white');
        msgDiv.style('position', 'fixed');
        msgDiv.style('top', '35px');
        msgDiv.style('left', '15px');
    }
    if (tempMsg != null) {
        tempMsg += "<br><br>KEY '+' TO FAST <br> KEY '-'TO SLOW <br> ANY KEY TO CHOOSE ( HA NOI . TOKYO . WASHINGTON . NEWYORK)(" + tag[currentTag] + ")";;
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
        this.scale = 0.1;
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
        scale(this.scale);
        image(this.img, 0, 0);
        pop();
    }
}
