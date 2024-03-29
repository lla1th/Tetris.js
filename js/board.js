class Board {
    constructor(ctx, ctxNext) {
        this.ctx = ctx;
        this.ctxNext = ctxNext;
        this.piece = null;
        this.next = null;
    }

    
    reset() {
        this.grid = this.getEmptyBoard();
        this.piece = new Piece(this.ctx);
        this.piece.setStartPosition();
        this.getNewPiece();
    }

    getNewPiece() {
        this.next = new Piece(this.ctxNext);
        this.ctxNext.clearRect(0, 0, this.ctxNext.canvas.width, this.ctxNext.canvas.height);
        
        this.next.draw();
    }


    getEmptyBoard() {
        return Array.from(
            {length: ROWS}, () => Array(COLS).fill(0)
        )
    }

    rotate(p, direction) {
        let clone = JSON.parse(JSON.stringify(p));
        if(!p.hardDropped) {
            for(let y = 0; y < clone.shape.length; ++y) {
                for(let x = 0; x < y; ++x) {
                    [clone.shape[x][y], clone.shape[y][x]] =
                    [clone.shape[y][x], clone.shape[x][y]];
                }
            }
        }
        if(direction === ROTATION.RIGHT) {
            clone.shape.forEach(row => row.reverse());
        } else if(direction === ROTATION.LEFT) {
            clone.shape.reverse();
        }
        return clone;
    }



    aboveFloor(x,y) {
        return y <= ROWS && x >= 0 && x < COLS;
    }

    notOccupied(x, y) {
        return this.grid[y] && this.grid[y][x] === 0;
    }

    valid(p) {
        return p.shape.every((row, dy) => {
            return row.every((value, dx) => {
                let x = p.x + dx;
                let y = p.y + dy;
                return (value === 0 ||
                      (this.aboveFloor(x, y) && this.notOccupied(x, y))
                      );
            })
        })
    }

    draw() {
        this.piece.draw();
        this.drawBoard();
    }

    drawBoard() {
        this.grid.forEach((row, y) => {
            row.forEach((value, x) => {
                if(value > 0) {
                    console.log(value)
                    this.ctx.fillStyle = COLORS[value][0];
                    this.ctx.fillRect(x,y,1,1);
                    this.ctx.fillStyle = COLORS[value][1];
                    this.ctx.fillRect(x + .1,y + .1, .8, .8);
                    this.ctx.fillStyle = COLORS[value][2];
                    this.ctx.fillRect(x + .2, y + .2, .6, .6);
                }
            })
        })
    }
    
    freeze() {
        this.piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if(value > 0) {
                    this.grid[y + this.piece.y][x + this.piece.x] = value;
                }
            });
        });
    }

    drop() {
        let p = moves[KEY.DOWN](this.piece);
        if(this.valid(p)) {
            this.piece.move(p);
        } else {
            this.freeze();
            this.clearLines();
            
            if(this.piece.y === 0) {
                // Конец игры
                return false;
            }


            this.piece = this.next;
            this.piece.ctx = this.ctx;
            this.piece.setStartPosition();
            this.getNewPiece();
        }

        return true;
    }
    
    getLineClearPoints(lines, level) {
        const lineClearPoints = lines === 1 ? POINTS.SINGLE :
                                lines === 2 ? POINTS.DOUBLE :
                                lines === 3 ? POINTS.TRIPLE :
                                lines === 4 ? POINTS.TETRIS :
                                0;
        
        return (account.level + 1) * lineClearPoints
    }

    clearLines() {
        let lines = 0;

        this.grid.forEach((row, y) => {
            if(row.every(value => value > 0)) {
                lines++;

                this.grid.splice(y, 1);

                this.grid.unshift(Array(COLS).fill(0));
            }
        })

        if(lines > 0) {
            account.score += this.getLineClearPoints(lines, account.level);
            account.lines += lines;

            if(account.lines >= LINES_PER_LEVEL) {
                // Увеличить уровень
                account.level++; 
                // Сбросить счетчик линий
                account.lines -= LINES_PER_LEVEL;
                // Увеличить скорость
                time.level = LEVEL[account.level];
            }
        }
    }



}