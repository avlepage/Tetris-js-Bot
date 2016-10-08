// Copyright (c) 2016 Will Clark



// Gameboard setup
(function() {
    var i = 0,
        j = 0;
    
    for (i = 0; i < 20; i++) {
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

var colorGrid = (function() {
    
    var colors = {
        "t":"#0058B1",
        "i":"#FFDD00",
        "s":"#FF9900",
        "z":"#33AA33",
        "o":"#C070FF",
        "l":"#EE3333",
        "j":"#66CCFF",
        "0":"rgba(0,0,0,0)"},
        i = 0,
        j = 0
    
    return function(grid){
    
        for (i = 0; i < 20; i++) {
            for (j = 0; j < 10; j++) {
                $("#cell" + i + j).css("background-color", colors[grid[i][j]])
            }
        }
        
    }
})()

var staticBlocks = (function() {
    
    var colors = {
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
        j = 0
    
    var removeRow = function(row) {
        
    }
    
    for (i = 0; i < 20; i++) {
        blockArr.push([])
        for (j=0; j < 10; j++) {
            blockArr[i].push(0)
        }
    }
    
    return {
        
        checkTile : function(row, col){
            return blockArr[row][col]
        },
        addTiles : function(tiles){
            var points = 0,
                rowFill = 0,
                fullRows = []
            
            for (i = 0; i < tiles.length; i++) {
                blockArr[tiles[i][0]][tiles[i][1]] = tiles[i][2]
            }
            
            for (i = 0; i < 20; i++){
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
            
            return (fullRows.length !== 4 ? 100 * fullRows.length : 800)
            
        },
        colourGrid : function(){
    
            for (i = 0; i < 20; i++) {
                for (j = 0; j < 10; j++) {
                    $("#cell" + i + j).css("background-color", colors[blockArr[i][j]])
                }
            }

        }

    }
     
})()


staticBlocks.addTiles([[2,3,"s"],[2,4,"z"]])
staticBlocks.colourGrid()