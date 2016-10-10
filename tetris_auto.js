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
    
    var resetBoard = function() {
        blockArr = []
        for (i = 0; i < 22; i++) {
            blockArr.push([])
            for (j=0; j < 10; j++) {
                blockArr[i].push(0)
            }
        }
    }
    
    resetBoard()
    
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

        },
        returnScore : function() {
            return score
        },
        getStaticArr : function() {
            return blockArr
        },
        resetGame : function() {
            resetBoard()
            score = 0
            clears = 0
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
            'i' : [2, [0, 1],  [0, 2],   [0, -1]],
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
                freeSpace = 0 // Make sure space isn't already occupied on rotate

            trialNewPos = reposBlock(actBlockArr[0][0], actBlockArr[0][1], trialBlockOrientation)

            for (j = 0; j < 4; j++) {
                if (!(staticBlocks.checkTile(trialNewPos[j][0], trialNewPos[j][1]))) {
                    freeSpace++
                }
            }

            if (freeSpace === 4) {
                actBlockArr = trialNewPos
                blockOrientation = trialBlockOrientation
                colourActive()
                return
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
            
            return {"gameOver" : gameOver, "atBottom" : atBottom}
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
        getActiveArr : function() {
            return actBlockArr
        },
        drop : function() {
            var dropped = false
            
            while (!dropped) {
                dropped = activeBlocks.processBlock().atBottom
            }
            
        }
    }
})()

/*
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
*/

//activeBlocks.newBlock()
//setInterval(activeBlocks.processBlock, 1000)












// AI CODE HERE

var learner = (function() {
    
    var genData = [],
        blockShapes = { // Rotation 0, 1, 2, 3
            't' : [4, [0, -1], [-1, 0],  [0, 1]],
            'i' : [2, [1, 0],  [2, 0],   [-1, 0]],
            's' : [2, [0, -1],  [-1, 0],  [-1, 1]],
            'z' : [2, [0, 1], [-1, 0],  [-1, -1]],
            'o' : [1, [0, -1], [-1, -1], [-1, 0]],
            'l' : [4, [0, 1],  [0, -1],  [-1, 1]],
            'j' : [4, [0, 1],  [0, -1],  [-1, -1]]
        },
        currentCreature = 0
    
    $(document).on('gameover', function(event, score) {
        
        console.log(genData[genData.length - 1][currentCreature].genes)
        //console.log("Score is: " + score)
        if (score > highestScore) {
            highestScore = score
        }
        //console.log("Highest Score is: " + highestScore)
        
        
        var currGen = genData.length
        
        $('#g' + genData.length + 'c' + currentCreature).removeClass("c_testing")
        $('#g' + genData.length + 'c' + currentCreature).addClass("c_tested")
        $('#g' + genData.length + 'c' + currentCreature + ' .creaturescore').html(score)
        genData[currGen - 1][currentCreature].score = score
        
        if (currentCreature !== 9) {
            $('#g' + genData.length + 'c' + (currentCreature + 1)).removeClass("c_untested")
            $('#g' + genData.length + 'c' + (currentCreature + 1)).addClass("c_testing")
            currentCreature++
        } else {
            newGen()
        }
        
        staticBlocks.resetGame()
        gameFlow.startGame()
    })
    
    var sigmoid = function(n) {
        return (2/(1+Math.pow(Math.E, -n))) - 1
    }
    
    
    var newGen = function() {
        var i = 0,
            currentGen = genData.length + 1,
            scrolledToBottom = ($('#gens')[0].scrollHeight - $('#gens').scrollTop() - $('#gens').outerHeight() <= 1)
        
        if (genData.length) { // Generations past 1
            
            var arrCopy = genData[genData.length - 1].slice(),
                j = 0,
                k = 0,
                l = 0
            
            arrCopy.sort(function(a,b) {return b.score - a.score})
            
            console.log("Prev Gen Median: " + (arrCopy[4].score + (arrCopy[5].score - arrCopy[4].score) / 2))
            
            $('#g' + genData.length + 'c' + arrCopy[0].placeInGen).removeClass("c_tested")
            $('#g' + genData.length + 'c' + arrCopy[0].placeInGen).addClass("c_best")
            arrCopy[0].status = "Reproduced"
            
            for (i = 1; i < 5; i++) {
                $('#g' + genData.length + 'c' + arrCopy[i].placeInGen).removeClass("c_tested")
                $('#g' + genData.length + 'c' + arrCopy[i].placeInGen).addClass("c_survived")
                arrCopy[i].status = "Reproduced"
            }
            
            for (i = 5; i < 10; i++) {
                $('#g' + genData.length + 'c' + arrCopy[i].placeInGen).removeClass("c_tested")
                $('#g' + genData.length + 'c' + arrCopy[i].placeInGen).addClass("c_killed")
                arrCopy[i].status = "Killed"
            }
            
            genData.push([])
            
            $('#gens').append('<li class="gen" id="gen' + currentGen + '"><p>' + currentGen + '</p></li>')
            
            if (scrolledToBottom) {
                $('#gens').scrollTop($('#gens').scrollTop() + 51)
            }
        
            $('#currgen').html("Current Generation: " + currentGen)
            
            for (i = 0; i < 4; i++) {
                for (j = i + 1; j < 5; j++) { // Reproduce new creatures
                    
                    let newGenome = []
                    
                    for (k = 0; k < 6; k++) { // For each gene
                        let randNum = Math.random(),
                            newGene = 0
                        
                        if (randNum < 0.5) {
                            newGene = arrCopy[i].genes[k]
                        } else {
                            newGene = arrCopy[j].genes[k]
                        }
                        
                        if (randNum < 0.05 || randNum > 0.95) {
                            newGene *= 1 + (Math.random() - 0.5) / 20
                        }
                        
                        if (randNum < 0.005 || randNum > 0.995) {
                            newGene *= (Math.random() + 0.5)
                        }
                        
                        newGenome.push(newGene)
                    }
                    
                    
                    
                    let newCreature = {
                        "name" : chance.first(),
                        "score" : -1,
                        "parents" : "g" + (currentGen - 1) + "c" + arrCopy[i].placeInGen + ", " + "g" + (currentGen - 1) + "c" + arrCopy[j].placeInGen,
                        "placeInGen" : l,
                        "status" : "untested",
                        "genes" : newGenome // Max Height, Avg Height, Std Dev Height, Covered Holes
                    }
                    
                    genData[currentGen - 1].push(newCreature)
            
                    $('#gen' + currentGen).append(
                        '<div class="creature c_untested" id="g'
                        + currentGen
                        + 'c'
                        + l 
                        + '"><p class="creaturenumber">C'
                        + l
                        + '</p><p class="creaturescore">0</p><p class="creaturename">'
                        + newCreature.name
                        + '</p></div>'

                    )
                    l++
                }
            }
            
            
        } else { // The first generation
            genData.push([])
            $('#gens').append('<li class="gen" id="gen' + currentGen + '"><p>' + currentGen + '</p></li>')
        
            $('#currgen').html("Current Generation: " + currentGen)
            
            for (i = 0; i < 10; i++) {
            
                let newCreature = {
                    "name" : chance.first(),
                    "score" : -1,
                    "parents" : "",
                    "placeInGen" : i,
                    "status" : "untested",
                    "genes" : [Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random()] // Max Height, Avg Height, Std Dev Height, Covered Holes, 3 tile deep holes
                }

                genData[currentGen - 1].push(newCreature)

                $('#gen' + currentGen).append(
                    '<div class="creature c_untested" id="g'
                    + currentGen
                    + 'c'
                    + i 
                    + '"><p class="creaturenumber">C'
                    + i
                    + '</p><p class="creaturescore">0</p><p class="creaturename">'
                    + newCreature.name
                    + '</p></div>'

                )
            }
        }

        currentCreature = 0
        
        
        
        $('#g' + genData.length + 'c0').addClass("c_testing")
        $('#g' + genData.length + 'c0').removeClass("c_untested")
    }
    
    
    
    var removeRow = function(row, grid) {
        var i = 0,
            j = 0
        
        for (i = row; i > 0; i--) {
            for (j = 0; j < 10; j++) {
                grid[i][j] = grid[i-1][j]
            }
        }
        
        for (j = 0; j < 10; j++) {
            grid[0][j] = 0
        }
    }
    
    var fitness = function(activeArr, staticArr) {
        
        var i = 0,
            j = 0,
            combinedArr = [],
            heightAvg = 0,
            highestInCol = [],
            heightStdDev = 0,
            maxPileHeight = 0,
            hiddenHoles = 0,
            iOnlyHoles = 0,
            currGen = genData.length - 1
        
        for (i = 0; i < 22; i++) {
            combinedArr.push(staticArr[i].slice())
            
        }
        
        
        for (i = 0; i < 4; i++) {
            combinedArr[activeArr[i][0]][activeArr[i][1]] = 1
        }
        
        for (i = 0; i < 22; i++) {
            let fullness = 0
            for (j = 0; j < 10; j++) {
                if (combinedArr[i][j]) {
                    fullness++
                }
            }
            if (fullness == 10) {
                removeRow(i, combinedArr)
            }
        }
        
        for (i = 0; i < 10; i++) {
            highestInCol.push(0)
        }
        
        for (i = 21; i >= 0; i--) {
            for (j = 0; j < 10; j++) {
                if (combinedArr[i][j] !== 0) {
                    highestInCol[j] = 22 - i
                }
            }
        }
        
        for (i = 0; i < 10; i++) { // Mean height
            heightAvg += highestInCol[i]
        }
        heightAvg /= 10
        
        
        for (i = 0; i < 10; i++) {
            heightStdDev += (heightAvg - highestInCol[i]) * (heightAvg - highestInCol[i])
        }
        heightStdDev /= 9
        heightStdDev = Math.sqrt(heightStdDev)
        
        for (i = 0; i < 22; i++) { // Hidden Holes
            for (j = 0; j < 10; j++) {
                if (combinedArr[i][j] === 0 && highestInCol[j] > 22 - i) {
                    hiddenHoles++
                }
            }
        }
        
        if (highestInCol[1] - highestInCol[0] > 2) {
            iOnlyHoles++
        }
        if (highestInCol[8] - highestInCol[9] > 2) {
            iOnlyHoles++
        }
        for (i = 1; i < 9; i++) {
            if (highestInCol[i - 1] - highestInCol[i] > 2 && highestInCol[i + 1] - highestInCol[i] > 2) {
                iOnlyHoles++
            }
        }
        
        
        
        maxPileHeight = Math.max.apply(null, highestInCol) // Max pile height
        
        return -(maxPileHeight * genData[currGen][currentCreature].genes[0]) - (heightAvg * genData[currGen][currentCreature].genes[1]) - (heightStdDev * genData[currGen][currentCreature].genes[2]) - (hiddenHoles * genData[currGen][currentCreature].genes[3]) - (iOnlyHoles * genData[currGen][currentCreature].genes[4]) - (Math.max(iOnlyHoles - 1, 0) * genData[currGen][currentCreature].genes[5])
    }
    
    var reposBlock = function(row, col, ori, blockType) {
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
        }
    
    var rotateBlock = function(trialOrientation, activeArr, staticArr){
        var trialNewPos = reposBlock(activeArr[0][0], activeArr[0][1], trialOrientation, activeArr[0][2]),
            i = 0,
            freeSpace = 0 // Make sure space isn't already occupied on rotate

        for (i = 0; i < 4; i++) {

            if (staticArr[trialNewPos[i][0]][trialNewPos[i][1]] === 0) {
                freeSpace++
                
            }

        }

        

        if (freeSpace === 4) {
            return trialNewPos
        }
        return false

    }
    
    var shiftBlock = function(dir, activeArr, staticArr, blockOrientation) { // -1 for left, 1 for right
        var trialNewPos = reposBlock(activeArr[0][0], activeArr[0][1] + dir, blockOrientation, activeArr[0][2]),
            i = 0,
            moveIsAllowed = true

        for (i = 0; i < 4; i++) {
            if (trialNewPos[i][1] < 0 || trialNewPos[i][1] > 9 || staticArr[trialNewPos[i][0]][trialNewPos[i][1]] !== 0) {
                moveIsAllowed = false
            }
        }

        if (moveIsAllowed) {
            return trialNewPos
        }
        return false
    }
    
    var processBlock = function(activeArr, staticArr, blockOrientation) { // Returns true if block is placed
            var i = 0,
                atBottom = false
            
            for (i = 0; i < 4; i++) {
                if (activeArr[i][0] === 21 || staticArr[activeArr[i][0] + 1][activeArr[i][1]] !== 0) {
                    atBottom = true
                }
            }
            
            if (atBottom) {
                return false
            } else {
                return reposBlock(activeArr[0][0] + 1, activeArr[0][1], blockOrientation, activeArr[0][2])
            }

        }
    
    var findMove = function(board, piece) {
        var i = 0,
            movesData = {score : -100000, moves : []}
        
        for (i = 0; i < blockShapes[piece[0][2]][0]; i++) { //each orientation
            
            let trialOrientation = rotateBlock(i, piece, board)
        
            
            if (trialOrientation) {
                let canStillMove = true,
                    trialPosition = [],
                    j = 0
                
                while (trialPosition) { // Try moving left
                    
                    trialPosition = shiftBlock(j, trialOrientation, board, i)
                    
                    if (trialPosition) { // if move j blocks left is valid
                        let trialDrop = trialPosition,
                            lastTrialDrop = trialPosition,
                            fitnessScore = 0,
                            k = 0
                        
                        while (trialDrop) {
                            k++
                            trialDrop = processBlock(trialDrop, board, i)
                            
                            if (trialDrop) {
                                lastTrialDrop = trialDrop
                            } else {
                                fitnessScore = fitness(lastTrialDrop, board)
                                
                                if (fitnessScore > movesData.score) {
                                    movesData.score = fitnessScore
                                    movesData.moves = [i, j, k]
                                }
                                
                            }
                            
                        }
                    }
                    j--
                }
                
                trialPosition = []
                j = 0
                
                while (trialPosition) { // Try moving right
                    j++
                    trialPosition = shiftBlock(j, trialOrientation, board, i)
                    
                    if (trialPosition) { // if move j blocks left is valid
                        let trialDrop = trialPosition,
                            lastTrialDrop = trialPosition,
                            fitnessScore = 0,
                            k = -1
                        
                        while (trialDrop) {
                            k++
                            trialDrop = processBlock(trialDrop, board, i)
                            
                            if (trialDrop) {
                                lastTrialDrop = trialDrop
                            } else {
                                fitnessScore = fitness(lastTrialDrop, board)
                                
                                
                                if (fitnessScore > movesData.score) {
                                    movesData.score = fitnessScore
                                    movesData.moves = [i, j, k]
                                }
                                
                            }
                            
                        }
                    }
                    
                }

            } else {
                break
            }
            
        }
        return movesData
    }
    
    var doMove = function(activeArr, staticArr) {
        var moveSeq = findMove(staticArr, activeArr),
            i = 0
        
        //console.log("Chosen Score: " + moveSeq.score)
        
        for (i = 0; i < moveSeq.moves[0]; i++) {
            activeBlocks.rotateBlock()
        }
        
        activeBlocks.shiftBlock(moveSeq.moves[1])
        
        activeBlocks.drop()
        
    }
    
    return {
        nextGeneration : function() {
            newGen()
        },
        figureMove : function() {
            doMove(activeBlocks.getActiveArr(), staticBlocks.getStaticArr())
        }
    }
    
    
    
})()

learner.nextGeneration()



/*

.c_untested {
    background-color: #CCC;
}

.c_testing {
    background-color: #FC0;
}

.c_tested {
    background-color: #FF0;
}

.c_killed {
    background-color: #E88;
}

.c_survived {
    background-color: #BEB;
}

.c_best {
    background-color: #5E5;
}

*/







var highestScore = 0


var gameFlow = (function() {
    var gameInProgress = false
    
    var nextTick = function() {
        
        if (gameInProgress) {
            learner.figureMove()
            if (!activeBlocks.processBlock().gameOver) {
                setTimeout(nextTick, 000)
            } else {
                gameInProgress = false
                $(document).trigger('gameover', [staticBlocks.returnScore()])
            }
            
        }
    }
    
    return {
        startGame : function() {
            activeBlocks.newBlock()
            gameInProgress = true
            nextTick()
        }
    }
})()

/*

$(document).on('gameover', function(event, score) {
    console.log("Score is: " + score)
    if (score > highestScore) {
        highestScore = score
    }
    console.log("Highest Score is: " + highestScore)
    staticBlocks.resetGame()
    gameFlow.startGame()
})
*/
gameFlow.startGame()



