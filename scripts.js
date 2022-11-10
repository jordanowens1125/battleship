function Game(playerBoard,cpuBoard){
    return{
        playerTurn:true,
        gameOver:false,
        mode:'on',
        changePlayerTurn(){
            this.playerTurn = !this.playerTurn
        },
        players:[
            {'board':playerBoard,name:'Player'},
            {'board':cpuBoard,name:'Admiral CPU'}
        ],
        receiveAttack(coordinates){
            if(this.playerTurn==true){
                let outcome = this.players[1]['board'].receiveAttack(coordinates)
                //Update Message Board
                //if hit is returned as true
                if(outcome.hit){
                    if(outcome.sunk){
                        document.getElementById('cpu-fleet-count').innerHTML=`Remaining fleet count: ${this.players[1]['board'].fleetCount}`
                    }
                }//nothing was hit
            }
            else if(this.playerTurn==false){
                
                let outcome = this.players[0]['board'].receiveAttack(coordinates)

                 //if hit is returned as true
                if(outcome.hit){
                    if(outcome.sunk){
                        document.getElementById('player-fleet-count').innerHTML=`Remaining fleet count: ${this.players[0]['board'].fleetCount}`
                    }
                }//nothing was hit
            }
            let gameOver = this.checkGameOver()
            if(gameOver==false){
                this.changePlayerTurn()
            }
            else{
                if(this.playerTurn){
                    document.getElementById('game-result').innerHTML =`You are victorious!`
                }else{
                    document.getElementById('game-result').innerHTML =`${this.players[1].name}.. has claimed victory`
                }
                document.getElementById('modal').style.display = 'block'
            }
        },
        checkGameOver(){
            let player = this.players[0]
            let cpu = this.players[1]
            if(player.board.checkIfLost()==true ||cpu.board.checkIfLost()==true){
                this.gameOver = true
            }
            return this.gameOver
        }
    }
}
//ship factory function
function createShip(name,length){
    return{
        name:name,
        length:length,
        sunk:false,
        placed:false,
        hit:Array.from({length:length},()=>(false)),
        display:true,
        checkSunk(){
            let checker = List=>List.every(v=>v===true)
            return checker(this.hit)
        },
    }
}
function createSquare(){
    return{
        'ship':null,
        'filled':false,
        'part':null,
        'hit':false,
    }
}
let ships = {
    "carrier": {
        'name':"carrier",
        'placed':false,
        'length':5,
        'sunk':false,
        'display':false,
        'hit':Array.from({length:5},()=>(false))
    },
    "battleship": {
        'name':"battleship",
        'placed':false,
        'length':4,
        'sunk':false,
        'display':false,
        'hit':Array.from({length:4},()=>(false))
    },
    "cruiser": {
        'name':"cruiser",
        'placed':false,
        'length':3,
        'sunk':false,
        'display':false,
        'hit':Array.from({length:3},()=>(false))
    },
    "submarine": {
        'name':"submarine",
        'placed':false,
        'length':3,
        'sunk':false,
        'display':false,
        'hit':Array.from({length:3},()=>(false))
    },
    "destroyer":{
        'name':"destroyer",
        'placed':false,
        'length':2,
        'sunk':false,
        'display':false,
        'hit':Array.from({length:2},()=>(false))
    }
}
//Gameboard factory
function Gameboard(){
    let carrier = createShip('carrier',5)
    let battleship = createShip('battleship',4)
    let cruiser = createShip('cruiser',3)
    let submarine = createShip('submarine',3)
    let destroyer = createShip('destroyer',2)
    let lastHitCoordinates=null
    let squareArray=[]
    let attackableCoordinates =[]
    for(let i=0;i<10;i++){
        let squareRow=[]//10 squares
        for(let j=0;j<10;j++){
            squareRow.push(createSquare())
            attackableCoordinates.push([i,j])
        }
        squareArray.push(squareRow)

    }
    return{
        squares:squareArray,
        lastHitCoordinates,
        ships:{'destroyer':destroyer,'submarine':submarine,'cruiser':cruiser,'battleship':battleship,'carrier':carrier},
        xAxis:true,
        lastHit:null,
        nextHitOptions:[],
        fleetCount:Object.values(ships).length,
        changeAxis(element){
            this.xAxis = !this.xAxis
            element.innerHTML = this.xAxis
            if (this.xAxis==true){
                element.innerHTML= 'Horizontal'
                showcaseShips(this)
            }
            else{
                element.innerHTML= 'Vertical'
                showcaseShips(this)
            }
        },
        putShip(ship,origin){
            //check to see that ship has not been placed
            let shipToBePlaced = this.ships[ship.name]
            if (shipToBePlaced.placed ==false){
                //get all coordinates if the ship was placed 
                let coordinatesList = this.getCoordinates(ship.length,origin)//return list with each item return as such [x,y]
                //check and see if these coordinates are filled 
                let validateList = this.validateCoordinatesList(coordinatesList)
                if(validateList){
                    //place ship 
                    //for each coordinate pair from list
                    //change the square objects 
                    for (let i=0;i<coordinatesList.length;i++){
                        let x = coordinatesList[i][0]
                        let y = coordinatesList[i][1]
                        let newSquare = createSquare()
                        newSquare.filled = true;
                        newSquare.ship= ship;
                        newSquare.part = i;
                        this.squares[x][y] = newSquare
                    }
                    this.ships[ship.name].placed = true
                }
            }
        },
        checkIfShipsPlaced(){
            let ships = this.ships
            let shipsList = Object.values(ships)
            let check = list => list.every(v=>v.placed===true)
            return check(shipsList)
        },
        receiveAttack(coordinates){
                let outcome ={
                    'hit':false,
                    'ship':null,
                    'sunk':null
                }
                let square =this.squares[coordinates[0]][coordinates[1]]
                square.hit=true
                let ship = square['ship']
                //send hit to ship object
                //if there is a ship
                if(ship!=null){
                    outcome.hit = true
                    outcome.ship =ship.name
                    //set part to hit
                    
                    ship.hit[square.part] = true
                    //check if ship is now sunk
                    let sunk = this.checkIfShipSunk(ship)
                    if (sunk==true){
                       this.ships[ship.name].sunk = true
                       ship.sunk=true
                       this.lastHitCoordinates=null
                       this.nextHitOptions=[]
                       outcome.sunk = true
                       this.fleetCount=this.fleetCount-1
                    }
                    else{
                        this.lastHitCoordinates=coordinates
                        outcome.sunk = false
                        //if a ship is hit then save options list
                        this.setNextHitOptions()
                    }
                }
                return outcome
        },
        checkIfShipSunk(ship){
            let check = list => list.every(v=>v===true)
            return check(ship.hit)
        },
        getCoordinates(length,origin){
            let coordinates =[];
            for (let i=0;i<length;i++){
                if(this.xAxis==true){
                    let x = origin[0]
                    let y = origin[1]+i
                    let coordinateSet=[x,y]
                    coordinates.push(coordinateSet)
                }
                if(this.xAxis==false){
                    let x = origin[0]+i
                    let y = origin[1]
                    let coordinateSet=[x,y]
                    coordinates.push(coordinateSet)
                }
            }
            return(coordinates)
        },
        validateCoordinatesList(coordinatesList){
            let available = true;
            try {
                for (let i=0;i<coordinatesList.length;i++){
                let x = coordinatesList[i][0]
                let y = coordinatesList[i][1]
                //first check if the squares are filled
                if(this.squares[x][y].filled){
                    available=false
                }
            }//if the gameboard does not have the given coordinates
            } catch (error) {
                available=false
            }
            return available
        },
        checkIfLost(){
            let ships = this.ships
            let shipsList = Object.values(ships)
            let check = list => list.every(v=>v.sunk===true)
            return check(shipsList)
        },
        autoPlaceAllShips(){
            let ships = this.ships
            //for each ship/key try and place it randomizing axis
            for (var key of Object.keys(ships)){
                while(ships[key].placed == false){
                    let randomNumberForAxis = Math.random()
                    if (randomNumberForAxis<.5){
                        this.xAxis=false
                    }
                    else if(randomNumberForAxis>=.5){
                        this.xAxis=true
                    }
                    let randomNumberForX = Math.floor(Math.random()*10)
                    let randomNumberForY = Math.floor(Math.random()*10)
                    let coordinates = [randomNumberForX,randomNumberForY]
                    this.putShip(ships[key],coordinates)
                }
            }
        },
        autoSelectAttack(){
            let coordinates=[]
            if(this.lastHitCoordinates==null){
                let randomNumberForX = Math.floor(Math.random()*10)
                let randomNumberForY = Math.floor(Math.random()*10)
                coordinates=[randomNumberForX,randomNumberForY]
            }
            else{
                let randomNumberForDirection=Math.floor(Math.random()*this.nextHitOptions.length)
                coordinates = this.nextHitOptions[randomNumberForDirection]
            }
            return coordinates
        },
        setNextHitOptions(){
            for(let i=0;i<4;i++){
                let hitOption=[]
                switch(i){
                    case 0:
                        //down one
                        hitOption[0]=parseInt(this.lastHitCoordinates[0])+1
                        hitOption[1]=parseInt(this.lastHitCoordinates[1])
                        break;
                    case 1:
                        //up one
                        hitOption[0]=parseInt(this.lastHitCoordinates[0])-1
                        hitOption[1]=parseInt(this.lastHitCoordinates[1])
                        break;
                    case 2:
                        //to the right
                        hitOption[0]=parseInt(this.lastHitCoordinates[0])
                        hitOption[1]=parseInt(this.lastHitCoordinates[1])+1
                        break;
                    case 3:
                        //to the left
                        hitOption[0]=parseInt(this.lastHitCoordinates[0])
                        hitOption[1]=parseInt(this.lastHitCoordinates[1])-1
                        break;
                }
                if(hitOption[0]<=9 && hitOption[0]>=0){
                    if(hitOption[1]<=9 && hitOption[1]>=0){
                        this.nextHitOptions.push(hitOption)
                    }
                }
            }
        },
        addGameInfoToDOM(){

        },
    }
}
//create a board
function populatePlayerBoard(gameBoard,boardElement){
    //reset the grid innerhtml everytime the value is changed
    boardElement.innerHTML=''
    let axisButton = document.getElementById('changeAxis')
    if (gameBoard.xAxis==true){
        axisButton.innerHTML= 'Horizontal'
    }
    else{
        axisButton.innerHTML= 'Vertical'
    }
    axisButton.onclick = function(){gameBoard.changeAxis(axisButton)}
    //Set grid column and rows equal to value
    boardElement.style.gridTemplateColumns = `repeat(${10},1fr)`;
    boardElement.style.gridTemplateRows = `repeat(${10},1fr)`;
    for (let row=0; row<gameBoard.squares.length; row++){
        for(let column=0;column<gameBoard.squares[row].length;column++){
            let square = gameBoard.squares[row][column]
            let newDiv = document.createElement('div');
            newDiv.classList.add('gamesquare')
            //setup allow drop
            //class so that we can see that a ship is here
            //filled as in filled with a ship
            if(square.filled){
                newDiv.classList.add('filled')
            }
            if(square.hit){
                newDiv.innerHTML=`<span class="dot"></span>`
                newDiv.classList.add('attacked')
            }
            newDiv.setAttribute('row',`${row}`);
            newDiv.setAttribute('column',`${column}`)
            newDiv.setAttribute('player',`player`)
            newDiv.addEventListener('click',attack)
            newDiv.addEventListener('drop',placeShip)
            newDiv.addEventListener('dragover',showIfDropped)
            boardElement.appendChild(newDiv)
        }
    }
    showcaseShips(gameBoard)
}
function populateCPUBoard(gameBoard,boardElement){
    //reset the grid innerhtml everytime the value is changed
    boardElement.innerHTML=''
    //Set grid column and rows equal to value
    boardElement.style.gridTemplateColumns = `repeat(${10},1fr)`;
    boardElement.style.gridTemplateRows = `repeat(${10},1fr)`;
    for (let row=0; row<gameBoard.squares.length; row++){
        for(let column=0;column<gameBoard.squares[row].length;column++){
            let square = gameBoard.squares[row][column]
            let newDiv = document.createElement('div');
            newDiv.classList.add('gamesquare')
            //setup allow drop
            //class so that we can see that a ship is here
            //filled as in filled with a ship
            if(square.hit){
                newDiv.innerHTML=`<span class="dot"></span>`
                newDiv.classList.add('attacked')
                if(square.filled){
                    newDiv.classList.add('filled') 
                }
            }
            newDiv.setAttribute('player',`cpu`)
            newDiv.setAttribute('row',`${row}`);
            newDiv.setAttribute('column',`${column}`)
            newDiv.addEventListener('click',attack)
            boardElement.appendChild(newDiv)
        }
    }
}
function attackMessage(){
}
async function attack(e){
    let promise = await game
    let attackedPlayer=e.target.getAttribute('player')
    //if it is the player turn
    if(promise.playerTurn==true){
        //and if the cpu board was clicked
        if(attackedPlayer=='cpu'){
            this.innerHTML=`<span class="dot"></span>`
            this.classList.add('attacked')
            let x = e.target.getAttribute('row')
            let y = e.target.getAttribute('column')
            let coordinates=[x,y]
            let cpuBoardElement = document.getElementById('cpu-board')
            let cpuBoard = promise.players[1]['board']
            if(cpuBoard.squares[x][y].hit==false){
                promise.receiveAttack(coordinates)
                populateCPUBoard(cpuBoard,cpuBoardElement)

                let playerBoard = promise.players[0]['board']
                let playerBoardElement =document.getElementById('player-board')

                //auto generate cpu turn
                let attackCoordinates = playerBoard.autoSelectAttack()
                populatePlayerBoard(playerBoard,playerBoardElement)
                let hit =false

                while (hit==false && 0<=attackCoordinates[0]<=9 && 0<=attackCoordinates[1]<=9){
                    //if this square has not been hit
                    if(playerBoard.squares[attackCoordinates[0]][attackCoordinates[1]].hit==false){
                        //then store this as a successful hit
                        hit = true
                        promise.receiveAttack(attackCoordinates) 
                        populatePlayerBoard(playerBoard,playerBoardElement)
                    }
                    attackCoordinates = playerBoard.autoSelectAttack()
                }
            }
        }
    }
}
function showIfDropped(e){
    e.preventDefault()
    //this will give us the ship name that is being placed
    
    let x = e.target.getAttribute('row')
    let y = e.target.getAttribute('column')
    //x and y come back as strings so make into int
    x= parseInt(x)
    y = parseInt(y)
    let coordinates =[x,y]
    let mockGameboard = Gameboard()
    // mockGameboard.squares = playerBoard.squares
}
function drag(e) {
    e.dataTransfer.setData("ship", e.target.id);
}
function drop(e) {
    e.preventDefault();
    let data = e.dataTransfer.getData("ship");
}
async function placeShip(e){
    //this will give us the ship name that is being placed
    // gameBoard.shipPlacement()
    // let ship = ships[data]
    let x = e.target.getAttribute('row')
    let y = e.target.getAttribute('column')
    let data = e.dataTransfer.getData("ship");
    let ship = ships[data]
    //x and y come back as strings so make into int
    x= parseInt(x)
    y = parseInt(y)
    let coordinates =[x,y]
    
    let promise = await game
    let playerBoard = promise['players'][0]['board']
    playerBoard.putShip(ship,coordinates)

    let playerBoardElement= document.getElementById('player-setup-board')
    populatePlayerBoard(playerBoard,playerBoardElement)
}
async function showcaseShips(gameBoard){
    //let promise = await game
    //get ships
    let ships = gameBoard.ships
    //get element that will display ships
    shipsElement = document.getElementById('draggable')
    shipsElement.innerHTML=''
    for (var key of Object.keys(ships)){
        let shipDiv = document.createElement('div')
        shipDiv.innerHTML = key
        shipDiv.id = key
        shipDiv.style.gridArea=key
        let shipdisplay = document.createElement('div')
        for(let i=0;i<ships[key].length;i++){
            newDiv = document.createElement('div');
            if(i==0){
                newDiv.classList.add('shiphead')
            }
            newDiv.classList.add('shipsquare')
            newDiv.classList.add('filled')
            shipdisplay.appendChild(newDiv)
        }
        //if this ship has not been placed then
        //make it draggable and give it ondragstart function
        if(ships[key].placed==false){
            shipDiv.setAttribute('draggable', true)
            // shipDiv.ondragstart=function(){drag(event)}
            shipDiv.ondragstart = function(event){
                event.dataTransfer.setData("ship", event.target.id);  
            }
        }
        else{
            shipDiv.classList.add('used')
        }
        if(gameBoard.xAxis){
            shipdisplay.classList.add('horizontal') 
        }else{
           shipdisplay.classList.add('vertical')  
        }
        shipDiv.appendChild(shipdisplay)
        shipsElement.appendChild(shipDiv)
    }
}
function setUpPlayerBoard(){
    let playerBoard = Gameboard()
    let playerBoardElement=document.getElementById('player-setup-board')
    //playerBoard.autoPlaceAllShips()
    populatePlayerBoard(playerBoard,playerBoardElement)
    //add fleet count to dom
    document.getElementById('player-fleet-count').innerHTML=`Remaining fleet count: ${playerBoard.fleetCount}`
    return playerBoard
}
async function setUpCPUBoard(){
    let cpuBoard = Gameboard()
    let cpuBoardElement=document.getElementById('cpu-board')
    cpuBoardElement.classList.add('gameboard')
    cpuBoard.autoPlaceAllShips()
    let promise = await game
    promise['players'][1]['board']=cpuBoard
    populateCPUBoard(cpuBoard,cpuBoardElement)
    //add fleet count to dom
    document.getElementById('cpu-fleet-count').innerHTML=`Remaining fleet count: ${promise.players[1]['board'].fleetCount}`
    return cpuBoard
}
async function changeGameMode(){
    let promise = await game
    if(promise.players[0]['board'].checkIfShipsPlaced()==true){
        //turn on display for game
        document.getElementById('game').style.display ='flex'
        //turn off display for setting
        document.getElementById('setup').style.display ='none'
        let playerBoardElement= document.getElementById('player-board')
        playerBoardElement.classList.add('gameboard')
        populatePlayerBoard(promise.players[0]['board'],playerBoardElement)
        setUpCPUBoard()
    }
}
async function startGame(){
    let game = Game()
    //first have player make board
    let playerBoard = setUpPlayerBoard()
    
    game.players[0]['board']=playerBoard
    showcaseShips(playerBoard)
    return game
}
async function autoPlaceShips(){
    let promise = await game
    playerBoard=promise['players'][0]['board']
    let playerBoardElement=document.getElementById('player-setup-board')
    playerBoard.autoPlaceAllShips()
    populatePlayerBoard(playerBoard,playerBoardElement)
}
async function replaceShips(){
    let promise = await game
    promise['players'][0]['board'] = Gameboard()
    playerBoard = promise['players'][0]['board']
    let playerBoardElement=document.getElementById('player-setup-board')
    playerBoard.autoPlaceAllShips()
    populatePlayerBoard(playerBoard,playerBoardElement)
}
async function clearShips(){
    let promise = await game
    promise['players'][0]['board'] = Gameboard()
    playerBoard = promise['players'][0]['board']
    let playerBoardElement=document.getElementById('player-setup-board')
    populatePlayerBoard(playerBoard,playerBoardElement)
}
function reload(){
    location.reload()
}
let game = startGame()

//next step is dragover to see what board will look like if it is placed 
//when i manually place the squares the game breaks somehow
//dress project up nicely space invader theme
//maybe add unique shapes for space theme like v and or u shape
//add dark mode to project