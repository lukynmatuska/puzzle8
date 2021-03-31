class PuzzlePlayground {
    constructor(DOM, puzzle) {
        this.DOM = DOM;
        this.puzzle = puzzle;
        this.DOM.classList.add(`size${this.puzzle.size}x${this.puzzle.size}`);
        this.ul = document.createElement('ul');
        for (let i = 0; i < this.puzzle.numbers.length; i++) {
            let li = document.createElement('li');
            li.id = `li${i}`;
            li.innerHTML = this.puzzle.numbers[i];
            if (this.puzzle.numbers[i] === '') {
                li.classList.add('empty');
            }
            this.ul.append(li);
        }
        this.DOM.append(this.ul);
        this.DOM.classList.add('playground');
        this.dragAndDropSetUp();
    }

    dragAndDropSetUp() {
        this.activeEvent = '';
        this.originalX = '';
        this.originalY = '';
        /**
         * SetUpListeners
         */
        this.listeners = {};
        this.listeners.handleDragEnter = this.handleDragEnter.bind(this);
        this.listeners.handleDragLeave = this.handleDragLeave.bind(this);
        this.listeners.handleDragDrop = this.handleDragDrop.bind(this);
        this.listeners.handleDragStart = this.handleDragStart.bind(this);
        this.listeners.handleDragEnd = this.handleDragEnd.bind(this);
        this.listeners.handleTouchStart = this.handleTouchStart.bind(this);
        this.listeners.handleTouchMove = this.handleTouchMove.bind(this);
        this.listeners.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.availableMoves = this.puzzle.whatCanISwap(this.puzzle.getEmptyCellFromMatrix(this.puzzle.matrix));
        this.empty = document.querySelector('li.empty');
        this.preparePlaygroundForNextMove();
        for (const move of this.availableMoves) {
            let DOM = document.getElementById(`li${(move.row * this.puzzle.size) + move.col}`);
            DOM.setAttribute('draggable', true);
            DOM.addEventListener('dragstart', this.listeners.handleDragStart, false);
            DOM.addEventListener('dragend', this.listeners.handleDragEnd, false);
            DOM.addEventListener('touchstart', this.listeners.handleTouchStart, false);
            DOM.addEventListener('touchmove', this.listeners.handleTouchMove, false);
            DOM.addEventListener('touchend', this.listeners.handleTouchEnd, false);
        }
    }

    preparePlaygroundForNextMove() {
        if (this.puzzle.isSame(this.puzzle.matrix, this.puzzle.finalMatrix)) {
            document.getElementById('modal').classList.remove('hide');
        }
        this.empty.classList.add('empty');
        this.empty.innerHTML = '';
        this.empty.removeAttribute('style');
        this.empty.removeAttribute('draggable');
        // Remove listeners
        for (const move of this.availableMoves) {
            let DOM = document.getElementById(`li${(move.row * this.puzzle.size) + move.col}`);
            DOM.removeAttribute('draggable');
            DOM.removeEventListener('dragstart', this.listeners.handleDragStart, false);
            DOM.removeEventListener('dragend', this.listeners.handleDragEnd, false);
            DOM.removeEventListener('touchstart', this.listeners.handleTouchStart, false);
            DOM.removeEventListener('touchmove', this.listeners.handleTouchMove, false);
            DOM.removeEventListener('touchend', this.listeners.handleTouchEnd, false);
        }
        // Add listeners
        this.empty.addEventListener('dragenter', this.listeners.handleDragEnter, false);
        this.empty.addEventListener('dragleave', this.listeners.handleDragLeave, false);
        this.empty.addEventListener('drop', this.listeners.handleDragDrop, false);
        this.availableMoves = this.puzzle.whatCanISwap(this.puzzle.getEmptyCellFromMatrix(this.puzzle.matrix));
        for (const move of this.availableMoves) {
            let DOM = document.getElementById(`li${(move.row * this.puzzle.size) + move.col}`);
            DOM.setAttribute('draggable', true);
            DOM.addEventListener('dragstart', this.listeners.handleDragStart, false);
            DOM.addEventListener('dragend', this.listeners.handleDragEnd, false);
            DOM.addEventListener('touchstart', this.listeners.handleTouchStart, false);
            DOM.addEventListener('touchmove', this.listeners.handleTouchMove, false);
            DOM.addEventListener('touchend', this.listeners.handleTouchEnd, false);
        }
    }

    handleDragEnter(e) { }

    handleDragLeave(e) { }

    handleDragDrop(e) {
        e.preventDefault();
    }

    handleDragStart(e) { }

    handleDragEnd(e) {
        this.touchAndDragEnd(e);
    }

    handleTouchStart(e) {
        // console.log('handleTouchStart');
        this.originalX = `${e.target.offsetLeft - 10}px`;
        this.originalY = `${e.target.offsetTop - 10}px`;
        this.activeEvent = 'start';
        e.target.style.display = 'none';
        this.fakeDOM = e.target.cloneNode(false);
        this.insertAfter(e.target, this.fakeDOM);
        this.fakeDOM.style = '';
    }

    handleTouchMove(e) {
        // console.log('handleTouchMove')
        let touchLocation = e.targetTouches[0];
        let pageX = `${touchLocation.pageX - 50}px`;
        let pageY = `${touchLocation.pageY - 50}px`;
        // console.log(`Touch x:${pageX} y:${pageY}`);
        e.target.style.display = 'initial';
        e.target.style.position = "absolute";
        e.target.style.left = pageX;
        e.target.style.top = pageY;
        this.activeEvent = 'move';
    }

    handleTouchEnd(e) {
        // https://www.uriports.com/blog/easy-fix-for-intervention-ignored-attempt-to-cancel-a-touchmove-event-with-cancelable-false/
        // console.log('handleTouchEnd');
        e.preventDefault();
        this.fakeDOM.remove();
        let pageX, pageY;
        if (this.activeEvent === 'move') {
            pageX = (parseInt(e.target.style.left) - 50);
            pageY = (parseInt(e.target.style.top) - 50);
        }

        if (this.detectTouchEnd(this.empty.offsetLeft, this.empty.offsetTop, pageX, pageY, this.empty.offsetWidth, this.empty.offsetHeigh)) {
            this.touchAndDragEnd(e);
        } else {
            console.log('co se to deje? :D')
            e.target.style.left = this.originalX;
            e.target.style.top = this.originalY;
        }
    }

    detectTouchEnd(x1, y1, x2, y2, w, h) {
        //Very simple detection here
        if (x2 - x1 > w)
            return false;
        if (y2 - y1 > h)
            return false;
        return true;
    }

    touchAndDragEnd(e) {
        /**
         * Swap content and CSS classes of li DOMs
         */
        let { row: emptyCellRow, col: emptyCellCol } = this.puzzle.getEmptyCellFromMatrix(this.puzzle.matrix);
        let oldEmptyCellDOM = document.getElementById(`li${emptyCellRow * this.puzzle.size + emptyCellCol}`);
        oldEmptyCellDOM.innerHTML = e.target.innerHTML;
        oldEmptyCellDOM.classList.remove('empty');
        this.empty = e.target;
        /**
         * Push changes to Puzzle's matrix
         */
        let { row: sourceRow, col: sourceCol } = this.getCellFromMatrixByValue(this.empty.innerHTML);
        this.puzzle.matrix[emptyCellRow][emptyCellCol] = this.puzzle.matrix[sourceRow][sourceCol];
        this.puzzle.matrix[sourceRow][sourceCol] = '';
        document.getElementById('countOfMoves').innerHTML = parseInt(document.getElementById('countOfMoves').innerHTML) + 1;
        this.preparePlaygroundForNextMove();
    }

    getCellFromMatrixByValue(value) {
        for (let row = 0; row < this.puzzle.matrix.length; row++) {
            for (let col = 0; col < this.puzzle.matrix[row].length; col++) {
                if (this.puzzle.matrix[row][col] == value) {
                    return { row, col }
                }
            }
        }
    }

    moveEmptyTo(row, col) {
        // swap the content of <li> objects
        const { row: fRow, col: fCol } = this.puzzle.getEmptyCellFromMatrix(this.puzzle.matrix);
        this.puzzle.matrix[fRow][fCol] = this.puzzle.matrix[row][col];

        let oldEmpty = document.getElementById(`li${(fRow * this.puzzle.size) + fCol}`);
        oldEmpty.innerHTML = this.puzzle.matrix[row][col];
        oldEmpty.classList.remove('empty');

        let newEmpty = document.getElementById(`li${row * (this.puzzle.size) + col}`);
        this.puzzle.matrix[row][col] = '';
        newEmpty.innerHTML = '';
        newEmpty.classList.add('empty');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    insertAfter(referenceNode, newNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

    solve() {
        let result = this.puzzle.solve();
        for (let i = 0; i < result.steps.length; i++) {
            this.sleep(i * 500).then(() => {
                let coordinates = this.getCellFromMatrixByValue(result.steps[i]);
                this.moveEmptyTo(coordinates.row, coordinates.col);
                document.getElementById('countOfMoves').innerHTML = i + 1;
            })
        }
        return result
    }
}

const showModal = () => {
    document.getElementById('modal').classList.remove("hide");

}

const hideModal = () => {
    document.getElementById('modal').classList.add("hide");
}