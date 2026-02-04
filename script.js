const Gameboard = (() => {
    let board = ["", "", "", "", "", "", "", "", ""];

    const getBoard = () => board;

    const setMark = (index, marker) => {
        if (index >= 0 && index < 9 && board[index] === "") {
            board[index] = marker;
            return true;
        }
        return false;
    };

    const resetBoard = () => {
        board = ["", "", "", "", "", "", "", "", ""];
    };

    const isFull = () => board.every((cell) => cell !== "");

    return { getBoard, setMark, resetBoard, isFull };
})();

const Player = (name, marker) => {
    return { name, marker };
};

const GameController = (() => {
    let players = [];
    let currentPlayerIndex = 0;
    let gameOver = false;
    let scores = [0, 0];
    let startingPlayerIndex = 0;

    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    const startGame = (player1Name, player2Name, isRestart = false) => {
        players = [Player(player1Name || "Player 1", "X"), Player(player2Name || "Player 2", "O")];
        if (isRestart) {
            // Alternate starting player for restart
            startingPlayerIndex = startingPlayerIndex === 0 ? 1 : 0;
        } else {
            // First game always starts with player 0
            startingPlayerIndex = 0;
        }
        currentPlayerIndex = startingPlayerIndex;
        gameOver = false;
        Gameboard.resetBoard();
    };

    const getCurrentPlayer = () => players[currentPlayerIndex];

    const switchPlayer = () => {
        currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
    };

    const checkWinner = () => {
        const board = Gameboard.getBoard();
        for (let combination of winningCombinations) {
            const [a, b, c] = combination;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return { winner: board[a], combination };
            }
        }
        return null;
    };

    const playTurn = (index) => {
        if (gameOver) {
            return { success: false, message: "Game is over!" };
        }

        const currentPlayer = getCurrentPlayer();
        const success = Gameboard.setMark(index, currentPlayer.marker);

        if (!success) {
            return { success: false, message: "Invalid move!" };
        }

        const winnerResult = checkWinner();
        if (winnerResult) {
            gameOver = true;
            const winningPlayer = players.find((p) => p.marker === winnerResult.winner);
            const winnerIndex = players.indexOf(winningPlayer);
            scores[winnerIndex]++;
            return { success: true, gameOver: true, winner: winningPlayer, winningCombination: winnerResult.combination };
        }

        if (Gameboard.isFull()) {
            gameOver = true;
            return { success: true, gameOver: true, tie: true };
        }

        switchPlayer();
        return { success: true, gameOver: false };
    };

    const isGameOver = () => gameOver;

    const getScores = () => scores;

    const resetScores = () => {
        scores = [0, 0];
        startingPlayerIndex = 0;
    };

    return { startGame, getCurrentPlayer, playTurn, isGameOver, getScores, resetScores };
})();

const DisplayController = (() => {
    const boardElement = document.getElementById("board");
    const messageElement = document.getElementById("message");
    const restartButton = document.getElementById("restart-btn");
    const homeButton = document.getElementById("home-btn");
    const startButton = document.getElementById("start-btn");
    const player1Input = document.getElementById("player1");
    const player2Input = document.getElementById("player2");
    const setupDiv = document.getElementById("setup");
    const gameDiv = document.getElementById("game");
    const player1ScoreElement = document.getElementById("player1-score");
    const player2ScoreElement = document.getElementById("player2-score");
    const player1NameElement = document.getElementById("player1-name");
    const player2NameElement = document.getElementById("player2-name");

    const renderBoard = () => {
        const board = Gameboard.getBoard();
        boardElement.innerHTML = "";

        board.forEach((cell, index) => {
            const cellElement = document.createElement("div");
            cellElement.classList.add("cell");
            cellElement.textContent = cell;

            if (cell === 'X') {
                cellElement.classList.add('x');
            } else if (cell === 'O') {
                cellElement.classList.add('o');
            }

            cellElement.addEventListener("click", () => handleCellClick(index));
            boardElement.appendChild(cellElement);
        });
    };

    const highlightWinningCells = (combination) => {
        const cells = boardElement.querySelectorAll('.cell');
        combination.forEach(index => {
            cells[index].classList.add('winning');
        });
    };

    const updateScores = () => {
        const scores = GameController.getScores();
        player1ScoreElement.textContent = scores[0];
        player2ScoreElement.textContent = scores[1];
    };

    const handleCellClick = (index) => {
        const result = GameController.playTurn(index);

        if (!result.success) {
            updateMessage(result.message);
            return;
        }

        renderBoard();

        if (result.gameOver) {
            homeButton.style.display = "inline-block";
            if (result.tie) {
                updateMessage("It's a tie!");
            } else if (result.winner) {
                updateMessage(`${result.winner.name} wins!`);
                highlightWinningCells(result.winningCombination);
                updateScores();
            }
        } else {
            updateMessage(`${GameController.getCurrentPlayer().name}'s turn`);
        }
    };

    const updateMessage = (message) => {
        messageElement.textContent = message;
    };

    const handleStart = () => {
        const player1Name = player1Input.value.trim() || "Player 1";
        const player2Name = player2Input.value.trim() || "Player 2";

        GameController.startGame(player1Name, player2Name);
        setupDiv.style.display = "none";
        gameDiv.style.display = "block";

        player1NameElement.textContent = player1Name;
        player2NameElement.textContent = player2Name;

        renderBoard();
        updateScores();
        updateMessage(`${GameController.getCurrentPlayer().name}'s turn`);
    };

    const handleRestart = () => {
        GameController.startGame(player1Input.value.trim() || "Player 1", player2Input.value.trim() || "Player 2", true);
        homeButton.style.display = "none";
        renderBoard();
        updateMessage(`${GameController.getCurrentPlayer().name}'s turn`);
    };

    const handleHome = () => {
        GameController.resetScores();
        setupDiv.style.display = "block";
        gameDiv.style.display = "none";
        homeButton.style.display = "none";
        player1Input.value = "";
        player2Input.value = "";
    };

    const init = () => {
        startButton.addEventListener("click", handleStart);
        restartButton.addEventListener("click", handleRestart);
        homeButton.addEventListener("click", handleHome);
    };

    return { init };
})();

document.addEventListener("DOMContentLoaded", () => {
    DisplayController.init();
});



