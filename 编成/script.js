class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 游戏配置
        this.gridSize = 12; // 12x12网格
        this.cellSize = this.canvas.width / this.gridSize;
        
        // 游戏状态
        this.isRunning = false;
        this.isPaused = false;
        this.gameOver = false;
        
        // 蛇的初始状态
        this.snake = [
            {x: 6, y: 6}, // 蛇头
            {x: 5, y: 6},
            {x: 4, y: 6}
        ];
        
        // 移动方向
        this.direction = 'right';
        this.nextDirection = 'right';
        
        // 果实
        this.food = this.generateFood();
        
        // 分数
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        
        // 游戏速度 (1秒移动一格)
        this.gameSpeed = 1000;
        this.gameLoop = null;
        
        // 初始化
        this.init();
    }
    
    init() {
        this.updateScore();
        this.updateHighScore();
        this.bindEvents();
        this.draw();
    }
    
    bindEvents() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
        
        // 按钮事件
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restart();
        });
    }
    
    handleKeyPress(e) {
        if (this.gameOver) return;
        
        switch(e.key) {
            case 'ArrowUp':
                if (this.direction !== 'down') {
                    this.nextDirection = 'up';
                }
                break;
            case 'ArrowDown':
                if (this.direction !== 'up') {
                    this.nextDirection = 'down';
                }
                break;
            case 'ArrowLeft':
                if (this.direction !== 'right') {
                    this.nextDirection = 'left';
                }
                break;
            case 'ArrowRight':
                if (this.direction !== 'left') {
                    this.nextDirection = 'right';
                }
                break;
            case ' ':
                e.preventDefault();
                this.togglePause();
                break;
        }
    }
    
    togglePause() {
        if (this.gameOver) return;
        
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseBtn');
        
        if (this.isPaused) {
            pauseBtn.textContent = '继续';
            pauseBtn.classList.add('paused');
            this.stopGameLoop();
        } else {
            pauseBtn.textContent = '暂停';
            pauseBtn.classList.remove('paused');
            this.startGameLoop();
        }
    }
    
    start() {
        if (!this.isRunning && !this.gameOver) {
            this.isRunning = true;
            this.startGameLoop();
        }
    }
    
    startGameLoop() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => {
            this.update();
        }, this.gameSpeed);
    }
    
    stopGameLoop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }
    
    update() {
        if (this.isPaused || this.gameOver) return;
        
        // 更新方向
        this.direction = this.nextDirection;
        
        // 移动蛇
        this.moveSnake();
        
        // 检查碰撞
        if (this.checkCollision()) {
            this.gameOver = true;
            this.stopGameLoop();
            this.showGameOver();
            return;
        }
        
        // 检查是否吃到食物
        if (this.checkFood()) {
            this.eatFood();
        } else {
            // 如果没吃到食物，移除蛇尾
            this.snake.pop();
        }
        
        // 重新绘制
        this.draw();
    }
    
    moveSnake() {
        const head = {...this.snake[0]};
        
        switch(this.direction) {
            case 'up':
                head.y--;
                break;
            case 'down':
                head.y++;
                break;
            case 'left':
                head.x--;
                break;
            case 'right':
                head.x++;
                break;
        }
        
        this.snake.unshift(head);
    }
    
    checkCollision() {
        const head = this.snake[0];
        
        // 检查墙壁碰撞
        if (head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize) {
            return true;
        }
        
        // 检查自身碰撞
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                return true;
            }
        }
        
        return false;
    }
    
    checkFood() {
        const head = this.snake[0];
        return head.x === this.food.x && head.y === this.food.y;
    }
    
    eatFood() {
        this.score += 10;
        this.updateScore();
        this.food = this.generateFood();
    }
    
    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.gridSize),
                y: Math.floor(Math.random() * this.gridSize)
            };
        } while (this.isSnakeBody(food.x, food.y));
        
        return food;
    }
    
    isSnakeBody(x, y) {
        return this.snake.some(segment => segment.x === x && segment.y === y);
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#f7fafc';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格
        this.drawGrid();
        
        // 绘制蛇
        this.drawSnake();
        
        // 绘制食物
        this.drawFood();
        
        // 如果游戏结束，显示游戏结束信息
        if (this.gameOver) {
            this.drawGameOver();
        }
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#e2e8f0';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.gridSize; i++) {
            // 垂直线
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellSize, 0);
            this.ctx.lineTo(i * this.cellSize, this.canvas.height);
            this.ctx.stroke();
            
            // 水平线
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellSize);
            this.ctx.lineTo(this.canvas.width, i * this.cellSize);
            this.ctx.stroke();
        }
    }
    
    drawSnake() {
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // 蛇头
                this.ctx.fillStyle = '#2d3748';
                this.ctx.fillRect(
                    segment.x * this.cellSize + 2,
                    segment.y * this.cellSize + 2,
                    this.cellSize - 4,
                    this.cellSize - 4
                );
                
                // 蛇头眼睛
                this.ctx.fillStyle = '#ffffff';
                const eyeSize = this.cellSize / 8;
                const eyeOffset = this.cellSize / 4;
                
                // 根据方向调整眼睛位置
                let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
                
                switch(this.direction) {
                    case 'right':
                        leftEyeX = segment.x * this.cellSize + this.cellSize - eyeOffset;
                        leftEyeY = segment.y * this.cellSize + eyeOffset;
                        rightEyeX = segment.x * this.cellSize + this.cellSize - eyeOffset;
                        rightEyeY = segment.y * this.cellSize + this.cellSize - eyeOffset;
                        break;
                    case 'left':
                        leftEyeX = segment.x * this.cellSize + eyeOffset;
                        leftEyeY = segment.y * this.cellSize + eyeOffset;
                        rightEyeX = segment.x * this.cellSize + eyeOffset;
                        rightEyeY = segment.y * this.cellSize + this.cellSize - eyeOffset;
                        break;
                    case 'up':
                        leftEyeX = segment.x * this.cellSize + eyeOffset;
                        leftEyeY = segment.y * this.cellSize + eyeOffset;
                        rightEyeX = segment.x * this.cellSize + this.cellSize - eyeOffset;
                        rightEyeY = segment.y * this.cellSize + eyeOffset;
                        break;
                    case 'down':
                        leftEyeX = segment.x * this.cellSize + eyeOffset;
                        leftEyeY = segment.y * this.cellSize + this.cellSize - eyeOffset;
                        rightEyeX = segment.x * this.cellSize + this.cellSize - eyeOffset;
                        rightEyeY = segment.y * this.cellSize + this.cellSize - eyeOffset;
                        break;
                }
                
                this.ctx.fillRect(leftEyeX, leftEyeY, eyeSize, eyeSize);
                this.ctx.fillRect(rightEyeX, rightEyeY, eyeSize, eyeSize);
            } else {
                // 蛇身
                this.ctx.fillStyle = '#4a5568';
                this.ctx.fillRect(
                    segment.x * this.cellSize + 2,
                    segment.y * this.cellSize + 2,
                    this.cellSize - 4,
                    this.cellSize - 4
                );
            }
        });
    }
    
    drawFood() {
        this.ctx.fillStyle = '#e53e3e';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.cellSize + this.cellSize / 2,
            this.food.y * this.cellSize + this.cellSize / 2,
            this.cellSize / 3,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
        
        // 添加高光效果
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.cellSize + this.cellSize / 2 - 2,
            this.food.y * this.cellSize + this.cellSize / 2 - 2,
            this.cellSize / 8,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
    }
    
    drawGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏结束!', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`最终得分: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText('点击重玩按钮重新开始', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }
    
    showGameOver() {
        // 更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.updateHighScore();
        }
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
    }
    
    updateHighScore() {
        document.getElementById('highScore').textContent = this.highScore;
    }
    
    restart() {
        // 重置游戏状态
        this.isRunning = false;
        this.isPaused = false;
        this.gameOver = false;
        
        // 重置蛇
        this.snake = [
            {x: 6, y: 6},
            {x: 5, y: 6},
            {x: 4, y: 6}
        ];
        
        // 重置方向
        this.direction = 'right';
        this.nextDirection = 'right';
        
        // 重置分数
        this.score = 0;
        this.updateScore();
        
        // 生成新食物
        this.food = this.generateFood();
        
        // 重置按钮状态
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.textContent = '暂停';
        pauseBtn.classList.remove('paused');
        
        // 停止游戏循环
        this.stopGameLoop();
        
        // 重新绘制
        this.draw();
    }
}

// 当页面加载完成后启动游戏
document.addEventListener('DOMContentLoaded', () => {
    const game = new SnakeGame();
    
    // 点击画布开始游戏
    game.canvas.addEventListener('click', () => {
        if (!game.isRunning && !game.gameOver) {
            game.start();
        }
    });
    
    // 显示开始提示
    game.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
    
    game.ctx.fillStyle = '#ffffff';
    game.ctx.font = 'bold 32px Arial';
    game.ctx.textAlign = 'center';
    game.ctx.fillText('点击画布开始游戏', game.canvas.width / 2, game.canvas.height / 2);
    
    game.ctx.font = '18px Arial';
    game.ctx.fillText('使用方向键控制蛇的移动', game.canvas.width / 2, game.canvas.height / 2 + 40);
    game.ctx.fillText('按空格键暂停/继续', game.canvas.width / 2, game.canvas.height / 2 + 70);
}); 