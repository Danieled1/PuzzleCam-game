let VIDEO = null
let CANVAS = null
let CONTEXT = null
//To scale and update values for responsivity 
let SCALER = 0.8
let SIZE={x:0,y:0,width:0,height:0,rows:3,cols:3} 
let PIECES = []
let SELECTED_PIECE = null
let START_TIME = null
let END_TIME = null

let POP_SOUND = new Audio('pop.mp3')
POP_SOUND.volume=0.1

let AUDIO_CONTEXT = new (AudioContext || webkitAudioContext || 
    window.webkitAudioContext) ()
let keys = {
    F:349.23,
    D:293.66,
    G:392,
    As:466.16
}
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
            updateGame()
        }
        //Handling errors when trying to open camera
    }).catch(function(err){
        alert("Camera error:" +err)
    })
}
// Function to set difficulty on the game
function setDifficulty(){
    let diff = document.getElementById("difficulty").value
    switch(diff){
        case "ez":
            initalizePieces(3,3)
            break
        case "medium":
            initalizePieces(5,5)
            break
        case "hard":
            initalizePieces(10,10)
            break
        case "extreme":
            initalizePieces(40,25)
            break
    }
}
// Function to restart the game, and track the time.
function restart(){
    START_TIME = new Date().getTime()
    END_TIME = null
    randomsizePieces()
    document.getElementById("menuItems").style.display="none"
}
function updateTime(){
    let now = new Date().getTime()
    if(START_TIME != null){
        if(END_TIME!= null){
            document.getElementById("time").innerHTML =
            formatTime(END_TIME-START_TIME)
        }
        else{
            document.getElementById("time").innerHTML =
            formatTime(now-START_TIME)
        }
        
    }
}
function isComplete(){
    for(let i =0; i < PIECES.length; i++){
        if(PIECES[i].correct===false){
            return false
        }
    }
    return true
}

function formatTime(millsec){
    let seconds=Math.floor(millsec/1000)
    let s=Math.floor(seconds%60)
    let m=Math.floor((seconds%(60*60))/60)
    let h=Math.floor((seconds%(60*60*24))/60)

    let formattedTime = h.toString().padStart(2,'0')
    formattedTime += ":"
    formattedTime += m.toString().padStart(2,'0')
    formattedTime += ":"
    formattedTime += s.toString().padStart(2,'0')

    return formattedTime
}
// function reset(){
    
// }
function addEventListeners(){
    // For mouse functionallity 
    CANVAS.addEventListener('mousedown',onMouseDown)
    CANVAS.addEventListener('mousemove',onMouseMove)
    CANVAS.addEventListener('mouseup',onMouseUp)
    CANVAS.addEventListener('touchstart',onTouchStart)
    CANVAS.addEventListener('touchmove',onTouchMove)
    CANVAS.addEventListener('touchend',onTouceEnd)
}

function onTouchStart(event){
    let loc={x:event.touches[0].clientX,
        y:event.touches[0].clientY}
        onMouseDown(loc)
}
function onTouchMove(event){
    let loc={x:event.touches[0].clientX,
        y:event.touches[0].clientY}
        onMouseMove(loc)
}
// When you dont touch the screen, where is your location?.
// So we dont need the location at the end on mobile.
function onTouceEnd(){
        onMouseUp()
}

function onMouseDown (event){
    SELECTED_PIECE = getPressedPiece(event)
    if(SELECTED_PIECE!=null){
        const index=PIECES.indexOf(SELECTED_PIECE)  //current pos
        if(index >-1){  //it's not possible to be missing, but i'll check to be sure.
            PIECES.splice(index,1)
            PIECES.push(SELECTED_PIECE)
        }
        //calc the top left corner
        SELECTED_PIECE.offset ={
            x:event.x-SELECTED_PIECE.x,
            y:event.y-SELECTED_PIECE.y
        }
        SELECTED_PIECE.correct=false
    }
}

function onMouseMove(event){
    if(SELECTED_PIECE!=null){
        //update the location to the new mouse location and consider offset
        SELECTED_PIECE.x=event.x-SELECTED_PIECE.offset.x
        SELECTED_PIECE.y=event.y-SELECTED_PIECE.offset.y
    }
}

function onMouseUp(){
    //if the selected piece is close to the right location, it will snap to it.
    if(SELECTED_PIECE.isClose()){
        SELECTED_PIECE.snap()
        if(isComplete() && END_TIME===null){
            let now = new Date().getTime()
            END_TIME=now
            setTimeout(playMelody(),500)
        }
    }
    SELECTED_PIECE=null

}

function getPressedPiece(loc){
    for(let i=PIECES.length-1; i>=0;i--){
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
function updateGame(){
    CONTEXT.clearRect(0,0,CANVAS.width,CANVAS.height)
    CONTEXT.globalAlpha = 0.5
    CONTEXT.drawImage(VIDEO,
        SIZE.x, SIZE.y,
        SIZE.width, SIZE.height)
    CONTEXT.globalAlpha=1
    for(let i=0;i<PIECES.length;i++){
        PIECES[i].draw(CONTEXT)
    }
    updateTime()
    window.requestAnimationFrame(updateGame)
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
            x:Math.random() * (CANVAS.width-PIECES[i].width),
            y:Math.random() * (CANVAS.height-PIECES[i].height)
        }
        PIECES[i].x=loc.x 
        PIECES[i].y=loc.y 
        PIECES[i].correct = false
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
        this.correct=true
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
        this.correct = true
        POP_SOUND.play()
    }
}
//Calcs the distance using pythagorean 
function distance(p1,p2){
    return Math.sqrt(
        (p1.x-p2.x) * (p1.x-p2.x) +
        (p1.y-p2.y) * (p1.y-p2.y)
    )
}

function playNote(key,duration){
    //Oscillator, generating sound with the given frequency
    let osc = AUDIO_CONTEXT.createOscillator()
    osc.frequency.value=key
    osc.start(AUDIO_CONTEXT.currentTime)
    osc.stop(AUDIO_CONTEXT.currentTime+duration/1000)
    //volume in a sense to control the game
    let envelope = AUDIO_CONTEXT.createGain()      
    osc.connect(envelope)
    osc.type='triangle'
    envelope.connect(AUDIO_CONTEXT.destination)     //To form a chain
    envelope.gain.setValueAtTime(0,AUDIO_CONTEXT.currentTime)   //0 - maximum gain really quickly
    envelope.gain.linearRampToValueAtTime(0.5,AUDIO_CONTEXT.currentTime+0.1)
    envelope.gain.linearRampToValueAtTime(0,AUDIO_CONTEXT.currentTime+duration/1000)
    setTimeout(function(){      //to disable background noise
        osc.disconnect()
    },duration)
}

function playMelody(){
    playNote(keys.F,500)
    setTimeout(function(){
        playNote(keys.D,250)
    },500)
    setTimeout(function(){
        playNote(keys.G,250)
    },500)
    setTimeout(function(){
        playNote(keys.As,250)
    },500)
    
}