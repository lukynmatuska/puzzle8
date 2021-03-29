function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class PuzzlePlayground {
    constructor(DOM, puzzle) {
        this.DOM = DOM;
        this.puzzle = puzzle;
        this.DOM.classList.add(`size${this.puzzle.size}x${this.puzzle.size}`);
        this.matrix = JSON.parse(JSON.stringify(this.puzzle.matrix))
        this.ul = document.createElement('ul');
        for (let i = 0; i < this.puzzle.numbers.length; i++) {
            let li = document.createElement('li');
            li.id = `li${i}`;
            li.innerHTML = this.puzzle.numbers[i];
            if (this.puzzle.numbers[i] === '') {
                li.classList.add('empty')
            }
            this.ul.append(li);
        }
        this.DOM.append(this.ul);
        this.DOM.classList.add('playground');
    }

    getCellFromMatrixByValue(value) {
        for (let row = 0; row < this.matrix.length; row++) {
            for (let col = 0; col < this.matrix[row].length; col++) {
                if (this.matrix[row][col] == value) {
                    return { row, col }
                }
            }
        }
    }

    moveEmptyTo(row, col) {
        // swap the content of <li> objects
        const { row: fRow, col: fCol } = this.puzzle.getEmptyCellFromMatrix(this.matrix);
        this.matrix[fRow][fCol] = this.matrix[row][col];

        let oldEmpty = document.getElementById(`li${(fRow * this.puzzle.size) + fCol}`);
        oldEmpty.innerHTML = this.matrix[row][col];
        oldEmpty.classList.remove('empty');

        let newEmpty = document.getElementById(`li${row * (this.puzzle.size) + col}`);
        this.matrix[row][col] = '';
        newEmpty.innerHTML = '';
        newEmpty.classList.add('empty');
    }


    solve() {
        let result = this.puzzle.solve();
        for (let i = 0; i < result.steps.length; i++) {
            sleep(i * 500).then(() => {
                let coordinates = this.getCellFromMatrixByValue(result.steps[i]);
                this.moveEmptyTo(coordinates.row, coordinates.col);
                document.getElementById('countOfMoves').innerHTML = i + 1;
            })
        }
        return result
    }
}

const prvniPuzzle = new PuzzlePlayground(document.getElementById('playground'), new Puzzle(3));
prvniPuzzle.solve()