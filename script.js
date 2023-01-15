let VIDEO = null
let CANVAS = null
let CONTEXT = null
//To scale and update values for responsivity 
let SCALER = 0.8
let SIZE={x:0,y:0,width:0,height:0,rows:3,cols:3} 
let PIECES = []
let SELECTED_PIECE = null

function main(){
    CANVAS=document.getElementById("myCanvas")
    CONTEXT=CANVAS.getContext("2d")
    addEventListeners()

    let promise=navigator.mediaDevices.getUserMedia({
        video:true
    })
    promise.then(function(signal){
        VIDEO=document.createElement("video")
        VIDEO.srcObject=signal
        VIDEO.play()

        VIDEO.onloadeddata=function(){
            handleResize()
            //resizer automatically using evenetlistener
            window.addEventListener('resize',handleResize)
            initalizePieces(SIZE.rows,SIZE.cols)
            updateCanvas()
        }
        //Handling errors when trying to open camera
    }).catch(function(err){
        alert("Camera error:" +err)
    })
}
function addEventListeners(){
    // For mouse functionallity 
    CANVAS.addEventListener('mousedown',onMouseDown)
    CANVAS.addEventListener('mousemove',onMouseMove)
    CANVAS.addEventListener('mouseup',onMouseUp)
}

function onMouseDown (event){
    SELECTED_PIECE = getPressedPiece(event)
    if(SELECTED_PIECE!=null){
        //calc the top left corner
        SELECTED_PIECE.offset ={
            x:event.x-SELECTED_PIECE.x,
            y:event.y-SELECTED_PIECE.y
        }
    }
}

function onMouseMove(event){
    if(SELECTED_PIECE!=null){
        //update the location to the new mouse location and consider offset
        SELECTED_PIECE.x=event.x-SELECTED_PIECE.offset.x
        SELECTED_PIECE.y=event.y-SELECTED_PIECE.offset.y
    }
}

function onMouseUp(event){
    //if the selected piece is close to the right location, it will snap to it.
    if(SELECTED_PIECE.isClose()){
        SELECTED_PIECE.snap()
    }
    SELECTED_PIECE=null

}

function getPressedPiece(loc){
    for(let i =0;i<PIECES.length;i++){
        if(loc.x>PIECES[i].x && loc.x<PIECES[i].x + PIECES[i].width &&
            loc.y>PIECES[i].y && loc.y<PIECES[i].y + PIECES[i].height) {
                return PIECES[i]
            }
    }
    //if nothing is pressed
    return null
}
function handleResize(){
    CANVAS.width=window.innerWidth
    CANVAS.height=window.innerHeight
    
    let resizer = SCALER*
                Math.min(
                    window.innerHeight/VIDEO.videoHeight,
                    window.innerWidth/VIDEO.videoWidth
                )
            //Adjust the size of the screen to the capture of the camara
            SIZE.width = resizer*VIDEO.videoWidth
            SIZE.height=resizer*VIDEO.videoHeight
            SIZE.x=window.innerWidth/2-SIZE.width/2
            SIZE.y=window.innerHeight/2-SIZE.height/2
}
function updateCanvas(){
    CONTEXT.clearRect(0,0,CANVAS.width,CANVAS.height)
    CONTEXT.globalAlpha = 0.5
    CONTEXT.drawImage(VIDEO,
        SIZE.x, SIZE.y,
        SIZE.width, SIZE.height)
    CONTEXT.globalAlpha=1
    for(let i=0;i<PIECES.length;i++){
        PIECES[i].draw(CONTEXT)
    }
    window.requestAnimationFrame(updateCanvas)
}
function initalizePieces(rows,cols){
    SIZE.rows=rows
    SIZE.cols=cols
    PIECES = []
    for(let i = 0;i<SIZE.rows;i++){
        for(let j = 0;j<SIZE.cols;j++){
            PIECES.push(new Piece(i,j))
        }
    }
}
function randomsizePieces(){
    for(let i=0;i<PIECES.length;i++){
        let loc={
            x:Math.random(),
            y:Math.random()
        }
        PIECES[i].x=loc.x * (CANVAS.width-PIECES[i].width),
        PIECES[i].y=loc.y * (CANVAS.height-PIECES[i].height)
    }
}

class Piece{
    constructor(rowIndex,colIndex){
        this.rowIndex=rowIndex
        this.colIndex=colIndex
        //Each piece is define to be at the correct location first
        this.x=SIZE.x+SIZE.width*this.colIndex/SIZE.cols
        this.y=SIZE.y+SIZE.height*this.rowIndex/SIZE.rows
        //the width and height are divided by cols and rows 
        this.width=SIZE.width/SIZE.cols
        this.height=SIZE.height/SIZE.rows
        this.xCorrect=this.x
        this.yCorrect=this.y
    }
    draw(context){
        context.beginPath()
        context.drawImage(VIDEO,
            this.colIndex*VIDEO.videoWidth/SIZE.cols,   //left part
            this.rowIndex*VIDEO.videoHeight/SIZE.rows,  //top part
            VIDEO.videoWidth/SIZE.cols,                 //width
            VIDEO.videoHeight/SIZE.rows,                //height
            this.x,
            this.y,
            this.width,
            this.height)                //these a relative to the video
        context.rect(this.x,this.y,this.width,this.height)
        context.stroke()
    }
    isClose(){
        //calc the distance to correct location and check if its on the their threshold
        if(distance({x:this.x,y:this.y},
            {x:this.xCorrect,y:this.yCorrect})<this.width/3){ //about 33% of its size, after trial and error.
                return true
        }
        return false
        
    }
    snap(){
        this.x=this.xCorrect
        this.y=this.yCorrect
    }
}
//Calcs the distance using pythagorean 
function distance(p1,p2){
    return Math.sqrt(
        (p1.x-p2.x) * (p1.x-p2.x) +
        (p1.y-p2.y) * (p1.y-p2.y)
    )
}