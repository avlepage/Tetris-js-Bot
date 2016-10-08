// Copyright (c) 2016 Will Clark



// Gameboard setup
(function() {
    var i = 0,
        j = 0;
    
    for (i = 2; i < 22; i++) {
        $('#gameboard').append("<tr id='row" + i +"'></tr>")
        for (j = 0; j < 10; j++) {
            $('#row' + i).append("<th id='cell" + i + j + "'></th>")
        }
    }
})();



// t #0058B1
// i #FFDD00
// s #FF9900
// z #33AA33
// o #C070FF
// l #EE3333
// j #66CCFF

var staticBlocks = (function() {
    
    var colours = {
        "t":"#0058B1",
        "i":"#FFDD00",
        "s":"#FF9900",
        "z":"#33AA33",
        "o":"#C070FF",
        "l":"#EE3333",
        "j":"#66CCFF",
        "0":"#FCFFFF"},
        blockArr = [],
        i = 0,
        j = 0,
        score = 0,
        clears = 0
    
    var removeRow = function(row) {
        var i = 0,
            j = 0
        
        for (i = row; i > 0; i--) {
            for (j = 0; j < 10; j++) {
                blockArr[i][j] = blockArr[i-1][j]
            }
        }
        
        for (j = 0; j < 10; j++) {
            blockArr[0][j] = 0
        }
    }
    
    for (i = 0; i < 22; i++) {
        blockArr.push([])
        for (j=0; j < 10; j++) {
            blockArr[i].push(0)
        }
    }
    
    return {
        
        checkTile : function(row, col){
            return (blockArr[row][col] !== 0) ? 1 : 0
        },
        addTiles : function(tiles){
            var points = 0,
                rowFill = 0,
                fullRows = []
                i = 0,
                j = 0
            
            for (i = 0; i < tiles.length; i++) {
                blockArr[tiles[i][0]][tiles[i][1]] = tiles[i][2]
            }
            
            for (i = 0; i < 22; i++){
                rowFill = 0
                for (j = 0; j < 10; j++) {
                    rowFill += (blockArr[i][j] !== 0)
                }
                if (rowFill === 10) {
                    fullRows.push(i)
                }
            }
            
            
            for (i = 0; i < fullRows.length; i++) {
                removeRow(fullRows[i])
            }
            
            score += (fullRows.length !== 4 ? 100 * fullRows.length : 800)
            clears += fullRows.length
            
            $('#score').html(score)
            $('#row').html(clears)
            
        },
        colourGrid : function(act){
            var i = 0,
                j = 0
    
            for (i = 0; i < 22; i++) {
                for (j = 0; j < 10; j++) {
                    $("#cell" + i + j).css("background-color", colours[blockArr[i][j]])
                }
            }
            
            for (i = 0; i < 4; i++) {
                $("#cell" + act[i][0] + act[i][1]).css("background-color", colours[act[i][2]])
            }

        }

    }
     
})()


//staticBlocks.addTiles([[2,3,"s"],[2,4,"z"]])

var activeBlocks = (function() {
    var blockType = "",
        blockOrientation = 0,
        nextBlockType = "",
        actBlockArr = [], //First block is the middle one
        blockShapes = { // Rotation 0, 1, 2, 3
            't' : [4, [0, -1], [-1, 0],  [0, 1]],
            'i' : [2, [1, 0],  [2, 0],   [-1, 0]],
            's' : [2, [0, -1],  [-1, 0],  [-1, 1]],
            'z' : [2, [0, 1], [-1, 0],  [-1, -1]],
            'o' : [1, [0, -1], [-1, -1], [-1, 0]],
            'l' : [4, [0, 1],  [0, -1],  [-1, 1]],
            'j' : [4, [0, 1],  [0, -1],  [-1, -1]]
        },
        colourActive = function() {
            staticBlocks.colourGrid(actBlockArr)
        },
        reposBlock = function(row, col, ori) {
            var rev = ori % 2,
                invRev = (1 + rev) % 2,
                rowRev = (ori < 2) ? 1 : -1,
                colRev = (ori === 0 || ori === 3) ? 1 : -1,
                output = [[row, col, blockType]],
                i = 0
            

            
            for (i = 1; i < 4; i++) {
                output.push([row + (blockShapes[blockType][i][rev] * rowRev), col + (blockShapes[blockType][i][invRev] * colRev), blockType])
            }
            
            return output
        },
        genNextBlock = function() {
            var blockTypes = ['t', 'i', 's', 'z', 'o', 'l', 'j']
            nextBlockType = blockTypes[Math.floor(Math.random() * 7)]
            $("#nextpiecearea").css('background-image', "url(images/block_icon_" + nextBlockType + ".png)")
        }
    
    genNextBlock()
    
    return {
        newBlock : function(){
            var i = 0
            blockType = nextBlockType
            actBlockArr = reposBlock(1, 5, 0)
            blockOrientation = 0
            
            genNextBlock()
            
            for (i = 0; i < actBlockArr.length; i++) {
                if (actBlockArr[i][0] >= 0 && staticBlocks.checkTile(actBlockArr[i][0], actBlockArr[i][1])) {
                    return true // If game is over
                }
            }
            colourActive()
        },
        rotateBlock : function(){
            var trialBlockOrientation = (blockOrientation + 1) % blockShapes[blockType][0],
                trialNewPos = reposBlock(actBlockArr[0][0], actBlockArr[0][1], trialBlockOrientation),
                i = 0,
                j = 0,
                freeSpace = 0, // Make sure space isn't already occupied on rotate
                trialPositions = [0, 1, -1]
            
            for (i = 0; i < 3; i++) {

                trialNewPos = reposBlock(actBlockArr[0][0], actBlockArr[0][1], trialBlockOrientation)
                
                for (j = 0; j < 4; j++) {
                    if (!(staticBlocks.checkTile(trialNewPos[j][0], trialNewPos[j][1] + trialPositions[i]))) {
                        freeSpace++
                    }
                }
                
                if (freeSpace === 4) {
                    actBlockArr = trialNewPos
                    blockOrientation = trialBlockOrientation
                    colourActive()
                    return
                }
            }

        },
        processBlock : function() { // Returns true if block is placed
            var i = 0,
                atBottom = false,
                gameOver = false
            
            for (i = 0; i < 4; i++) {
                if (actBlockArr[i][0] === 21 || staticBlocks.checkTile(actBlockArr[i][0] + 1, actBlockArr[i][1])) {
                    atBottom = true
                }
            }
            
            if (atBottom) {
                staticBlocks.addTiles(actBlockArr)
                gameOver = activeBlocks.newBlock()
            } else {
                actBlockArr = reposBlock(actBlockArr[0][0] + 1, actBlockArr[0][1], blockOrientation)
            }
            colourActive()
            
            return gameOver
        },
        shiftBlock : function(dir) { // -1 for left, 1 for right
            var trialNewPos = reposBlock(actBlockArr[0][0], actBlockArr[0][1] + dir, blockOrientation),
                i = 0,
                moveIsAllowed = true
            
            for (i = 0; i < 4; i++) {
                if (trialNewPos[i][1] < 0 || trialNewPos[i][1] > 9 || (staticBlocks.checkTile(trialNewPos[i][0], trialNewPos[i][1]))) {
                    moveIsAllowed = false
                }
            }
            
            if (moveIsAllowed) {
                actBlockArr = trialNewPos
                colourActive()
            }
        },
    }
})()


$(document).keydown(function(key) {
    switch(key.keyCode) {
        case 37:
            activeBlocks.shiftBlock(-1)
            break
        case 38:
            activeBlocks.rotateBlock()
            break
        case 39:
            activeBlocks.shiftBlock(1)
            break
        case 40:
            activeBlocks.processBlock()
            break
        default:
    }
})


activeBlocks.newBlock()
setInterval(activeBlocks.processBlock, 1000)