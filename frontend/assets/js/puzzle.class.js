class Puzzle {
    constructor(size = 2) {
        this.size = size;
        this.numbers = [];
        for (let i = 1; i < (this.size * this.size); i++) {
            this.numbers.push(i);
        }
        this.numbers.push('');
        this.final = [...this.numbers];
        this.finalMatrix = this.createMatrix(this.numbers);
        this.numbers = this.shuffle(this.numbers);
        this.matrix = this.createMatrix(this.numbers);
        while (!this.isSolvable(this.matrix)) {
            this.numbers = this.shuffle(this.numbers);
            this.matrix = this.createMatrix(this.numbers);
        }
    }

    createMatrix(letters) {
        let arr = [];
        let j = 0;
        for (let i = 0; i < this.size; i++) {
            arr.push(letters.slice(j, j + this.size));
            j += this.size;
        }
        return arr;
    }

    isSolvable(arr) {
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

    // shuffle the array
    shuffle(arr) {
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

    getEmptyCellFromMatrix(matrix) {
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                if (matrix[row][col] === '') {
                    return { row, col }
                }
            }
        }
    }

    whatCanISwap(coordinates) {
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
        if (row < this.size - 1) {
            result.push({
                row: row + 1,
                col
            })
        }
        if (col < this.size - 1) {
            result.push({
                row,
                col: col + 1
            })
        }
        return result;
    }

    isSame(solution, content) {
        return (JSON.stringify(solution) === JSON.stringify(content))
    }

    solve() {
        if (this.isSame(this.matrix, this.finalMatrix)) {
            console.log('The puzzle is already solved.');
            return;
        }
        let startDate = new Date();
        console.log('Solving the puzzle.');
        console.log('-------------------------')
        console.log('Final:');
        console.table(this.finalMatrix);
        console.log('Start:');
        console.table(this.matrix);
        console.log('-------------------------')
        let solved = false;
        const set = new Set();
        set.add(JSON.stringify(this.matrix));
        const queue = [{
            matrix: this.matrix,
            moves: []
        }];
        while (!solved) {
            let positionOfEmptyCell = this.getEmptyCellFromMatrix(queue[0].matrix);
            for (const move of this.whatCanISwap(positionOfEmptyCell)) {
                let matrix = JSON.parse(JSON.stringify(queue[0].matrix));
                let number = matrix[move.row][move.col];
                matrix[positionOfEmptyCell.row][positionOfEmptyCell.col] = number;
                matrix[move.row][move.col] = '';
                if (JSON.stringify(matrix) === JSON.stringify(this.finalMatrix)) {
                    let endDate = new Date();
                    solved = true;
                    this.matrix = matrix;
                    queue[0].moves.push(number)
                    console.log('Pocet vygenerovaných stavu (uzlu): ', set.size);
                    console.log('Pocet kroku:', queue[0].moves.length);
                    console.log('Vypis vsech kroku:', queue[0].moves);
                    console.log('Start v', startDate);
                    console.log('Konec v ', endDate);
                    console.log('Celkem:', endDate - startDate, 'ms');
                    return {
                        countOfStates: set.size,
                        countOfSteps: queue[0].moves.length + 1,
                        steps: queue[0].moves,
                        time: endDate - startDate
                    };
                }
                if (set.has(JSON.stringify(matrix))) {
                    continue;
                }
                set.add(JSON.stringify(matrix))
                queue.push({
                    matrix,
                    moves: [...queue[0].moves, number]
                });
            }
            queue.shift()
        }
    }
}

/*const puzzle = new Puzzle(3)
console.log(puzzle)
console.table(puzzle.matrix)*/
// puzzle.solve()