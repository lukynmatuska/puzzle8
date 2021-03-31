const lettersSelector = '.playground li';
let countOfMoves = 0;
// select the list items
let ul = document.querySelectorAll(lettersSelector);
const letters = ["1", "2", "3", "4", "5", "6", "7", "8", ""];
const state = {};
state.content = letters;

function setUp() {
    fillGrid(ul, letters);
    setId(ul)

    state.content = getState(ul);
    isCorrect(letters, state.content)
    state.dimension = getDimension(state);
    // set up the droppable and dragabble contents
    setDroppable(ul);
    setDraggable(ul);

    console.log("The state content", state.content)
    console.log("The state dimension", state.dimension)
}

const getState = (items) => {
    const content = [];
    items.forEach((item, i) => {
        content.push(item.innerText)
    });
    return content;
}

const getEmptyCell = () => {
    const emptyCellNumber = state.emptyCellIndex + 1;
    const emptyCellRow = Math.ceil(emptyCellNumber / 3);
    const emptyCellCol = 3 - (3 * emptyCellRow - emptyCellNumber);
    // emptyCellRow holds the actual row number the empty tile falls into in a 9-cell grid
    // the array index will be one less than its value. Same goes for emptyCellCol
    return [emptyCellRow - 1, emptyCellCol - 1]
}

const getDimension = (state) => {
    let j = 0;
    let arr = [];
    const { content } = state;
    for (let i = 0; i < 3; i++) {
        arr.push(content.slice(j, j + 3));
        j += 3;
    }
    return arr;
}
const lettersDimension = getDimension({ content: letters });

/**
 * setters
*/
const setDroppable = (items) => {
    items.forEach((item, i) => {
        if (!item.innerText) {
            state.emptyCellIndex = i;
            item.setAttribute("ondrop", "drop_handler(event);");
            item.setAttribute("ondragover", "dragover_handler(event);");
            item.setAttribute("class", "empty");
            item.setAttribute("draggable", "false");
            item.setAttribute("ondragstart", "");
            item.setAttribute("ondragend", "")
        }
        return;

    })
}


const removeDroppable = (items) => {
    items.forEach((item) => {
        item.setAttribute("ondrop", "");
        item.setAttribute("ondragover", "");
        item.setAttribute("draggable", "false");
        item.setAttribute("ondragstart", "");
        item.setAttribute("ondragend", "");
    })
}

const setDraggable = (items) => {
    const [row, col] = getEmptyCell();

    let left, right, top, bottom = null;
    if (state.dimension[row][col - 1]) left = state.dimension[row][col - 1];
    if (state.dimension[row][col + 1]) right = state.dimension[row][col + 1];

    if (state.dimension[row - 1] != undefined) top = state.dimension[row - 1][col];
    if (state.dimension[row + 1] != undefined) bottom = state.dimension[row + 1][col];


    // make its right and left dragabble
    items.forEach(item => {
        if (item.innerText == top ||
            item.innerText == bottom ||
            item.innerText == right ||
            item.innerText == left) {
            item.setAttribute("draggable", "true");
            item.setAttribute("ondragstart", "dragstart_handler(event)");
            item.setAttribute("ondragend", "dragend_handler(event)")
        }

    })
}


// this function sets a unique id for each list item, in the form 'li0' to 'li8'
const setId = (items) => {
    for (let i = 0; i < items.length; i++) {
        items[i].setAttribute("id", `li${i}`)
    }
}

const isSolvable = (arr) => {
    let number_of_inv = 0;
    // get the number of inversions
    for (let i = 0; i < arr.length; i++) {
        // i picks the first element
        for (let j = i + 1; j < arr.length; j++) {
            // check that an element exist and index i and j, then check that element at i > at j
            if ((arr[i] && arr[j]) && arr[i] > arr[j]) number_of_inv++;
        }
    }
    // if the number of inversions is even
    // the puzzle is solvable
    return (number_of_inv % 2 == 0);
}

const isCorrect = (solution, content) => {
    for (let i = 0; i < solution.length; i++) {
        if (content[i] === solution[i]) {
            document.getElementById(`li${i}`).classList.add('success')
        } else {
            document.getElementById(`li${i}`).classList.remove('success')
        }
    }
    if (JSON.stringify(solution) == JSON.stringify(content)) return true;
    return false;
}

const fillGrid = (items, letters) => {
    let shuffled = shuffle(letters);
    // let shuffled = ["1", "2", "3", "4", "5", "6", "7", "", "8"];
    // shuffle the letters arraay until there is a combination that is solvable
    while (!isSolvable(shuffled)) {
        shuffled = shuffle(letters);
    }

    items.forEach((item, i) => {
        item.innerText = shuffled[i];
    })
}

// shuffle the array
const shuffle = (arr) => {
    const copy = [...arr];
    // loop over half or full of the array
    for (let i = 0; i < copy.length; i++) {
        // for each index,i pick a random index j 
        let j = parseInt(Math.random() * copy.length);
        // swap elements at i and j
        let temp = copy[i];
        copy[i] = copy[j];
        copy[j] = temp;
    }
    return copy;
}


/**
 * Drag and drop handlers
 */
const dragstart_handler = ev => {
    console.log("dragstart")
    ev.dataTransfer.setData("text/plain", ev.target.id)
    ev.dataTransfer.dropEffect = "move";
}

const dragover_handler = ev => {
    ev.preventDefault();
}

const drop_handler = ev => {
    console.log("drag")
    ev.preventDefault();
    // Get the id of the target and add the moved element to the target's DOM
    const data = ev.dataTransfer.getData("text/plain");
    ev.target.innerText = document.getElementById(data).innerText;

    // once dropped, unempty the cell :)
    ev.target.classList.remove("empty")
    ev.target.setAttribute("ondrop", "");
    ev.target.setAttribute("ondragover", "");
    document.getElementById(data).innerText = "";

    // get new state
    state.content = getState(ul);
    // get new dimention from the state
    state.dimension = getDimension(state);
}

const dragend_handler = ev => {
    console.log("dragEnd");
    countOfMoves++;
    document.getElementById('countOfMoves').innerHTML = countOfMoves;
    // Remove all of the drag data
    ev.dataTransfer.clearData();
    // remove all droppable attributes
    removeDroppable(document.querySelectorAll(lettersSelector));

    // set new droppable and draggable attributes
    setDroppable(document.querySelectorAll(lettersSelector));
    setDraggable(document.querySelectorAll(lettersSelector));

    // if correct
    if (isCorrect(letters, state.content)) {
        showModal();
    }
}

const showModal = () => {
    document.getElementById('modal').classList.remove("hide");

}

const hideModal = () => {
    document.getElementById('modal').classList.add("hide");
}
setUp();

const getEmptyCellFromMatrix = (matrix) => {
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] === '') {
                return { row: row, col: col }
            }
        }
    }
}

function whatCanISwap(coordinates, size = 2) {
    const { row, col } = coordinates
    let result = []
    if (row > 0) {
        result.push({
            row: row - 1,
            col
        })
    }
    if (col > 0) {
        result.push({
            row,
            col: col - 1
        })
    }
    if (row < size - 1) {
        result.push({
            row: row + 1,
            col
        })
    }
    if (col < size - 1) {
        result.push({
            row,
            col: col + 1
        })
    }
    return result;
}

const start = [3, '', 2, 1]
const startDimension = [[3, ''], [2, 1]]
const final = [1, 2, 3, '']
const finalDimension = [[1, 2], [3, '']]

// const start = [...state.content]
// console.log(state)
// const startDimension = JSON.parse(JSON.stringify(state.dimension))
// const final = [...letters]
// const finalDimension = JSON.parse(JSON.stringify(lettersDimension))

const history = []
const solve = () => {
    if (isCorrect(start, final)) {
        console.log('solved');
        return
    }
    history.push(startDimension)
    console.log('solving');
    console.log('final:');
    console.table(finalDimension);
    console.log('-------------------------')
    console.log('start:');
    console.table(startDimension);
    let solved = false;
    const queue = [{
        'lastMovedNumber': 0,
        'matrix': startDimension
    }];
    while (!solved) {
        let positionOfEmptyCell = getEmptyCellFromMatrix(queue[0].matrix);
        let moves = whatCanISwap(positionOfEmptyCell);
        for (const move of moves) {
            let matrix = JSON.parse(JSON.stringify(queue[0].matrix));
            let number = matrix[move.row][move.col];
            if (number === queue[0].lastMovedNumber) {
                continue;
            }
            matrix[positionOfEmptyCell.row][positionOfEmptyCell.col] = number;
            matrix[move.row][move.col] = '';
            if (JSON.stringify(matrix) == JSON.stringify(finalDimension)) {
                solved = true;
                console.log('Matej je nejlepsi ucitel!')
                break;
            }
            // console.table(matrix)
            queue.push({
                lastMovedNumber: number,
                matrix
            });
        }
        queue.shift()
    }
}
solve();