document.addEventListener('DOMContentLoaded', () => {
    // Seleciona os elementos necessários do DOM
    const cells = document.querySelectorAll('.cell');
    const statusDisplay = document.getElementById('game-status');
    const difficultyButtons = document.getElementById('difficulty-buttons');
    const [easyButton, mediumButton, hardButton, vsButton] = difficultyButtons.children;
    const scoreDisplay = document.getElementById('scoreboard');

    // Define constantes para os jogadores
    const PLAYER_X = 'X';
    const PLAYER_O = 'O';
    
    // Define variáveis de estado do jogo
    let currentPlayer = PLAYER_X;  // Jogador atual
    let gameState = ['', '', '', '', '', '', '', '', ''];  // Estado do tabuleiro
    let isGameActive = true;  // Controle se o jogo está ativo
    let vsMode = false;  // Controla o modo "VS" (dois jogadores humanos)
    let difficulty = 'medium';  // Dificuldade padrão (médio)
    let scoreX = 0;  // Pontuação do jogador X
    let scoreO = 0;  // Pontuação do jogador O

    // Condições de vitória - todas as combinações possíveis para vencer
    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    // Função para atualizar a exibição do jogador atual
    const displayCurrentPlayer = () => statusDisplay.textContent = `Turno do jogador: ${currentPlayer}`;

    // Função para atualizar o contador de pontos
    const updateScoreboard = () => {
        scoreDisplay.innerHTML = `X = ${scoreX} | O = ${scoreO}`;
    };

    // Função para manipular a jogada do jogador
    const handleCellPlayed = (clickedCell, clickedCellIndex) => {
        gameState[clickedCellIndex] = currentPlayer;
        clickedCell.textContent = currentPlayer;
    };

    // Função para alternar entre os jogadores
    const handlePlayerChange = () => {
        currentPlayer = currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
        displayCurrentPlayer();
    };

    // Função para verificar se houve um vencedor ou empate
    const checkForWinner = () => {
        let roundWon = false;
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            statusDisplay.textContent = `Jogador ${currentPlayer} ganhou!`;
            isGameActive = false;  // Finaliza o jogo
            // Atualiza a pontuação
            if (currentPlayer === PLAYER_X) {
                scoreX++;
            } else {
                scoreO++;
            }
            updateScoreboard();

            // Reinicia o jogo após um curto intervalo
            setTimeout(handleRestartGame, 1500);
            return true;
        }

        // Verifica se todas as células foram preenchidas e é um empate
        const roundDraw = !gameState.includes('');
        if (roundDraw) {
            statusDisplay.textContent = 'Empate!';
            isGameActive = false;  // Finaliza o jogo

            // Reinicia o jogo após um curto intervalo
            setTimeout(handleRestartGame, 1500);
            return true;
        }

        return false;  // Jogo continua
    };

    // Função para lidar com o clique em uma célula
    const handleCellClick = (clickedCellEvent) => {
        const clickedCell = clickedCellEvent.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        // Verifica se a célula já foi preenchida ou se o jogo está inativo
        if (gameState[clickedCellIndex] !== '' || !isGameActive) {
            return;
        }

        // Realiza a jogada do jogador atual
        handleCellPlayed(clickedCell, clickedCellIndex);
        if (checkForWinner()) return;
        handlePlayerChange();

        // Realiza a jogada da IA
        if (!vsMode && currentPlayer === PLAYER_O) handleComputerMove();
    };

    // Função para a jogada do computador com base na dificuldade selecionada
    const handleComputerMove = () => {
        let bestMove;
        switch (difficulty) {
            case 'easy':
                bestMove = getRandomMove();  // Movimento aleatório (fácil)
                break;
            case 'medium':
                bestMove = getBestMoveMedium();  // Alterna entre aleatório e minimax (médio)
                break;
            case 'hard':
                bestMove = getBestMove();  // Usa minimax para a jogada ótima (avançado)
                break;
        }
        if (bestMove !== -1) {
            const bestCell = cells[bestMove];
            handleCellPlayed(bestCell, bestMove);
            if (checkForWinner()) return;
            handlePlayerChange();
        }
    };

    // Função para obter um movimento aleatório (para dificuldade fácil)
    const getRandomMove = () => {
        const availableMoves = gameState
            .map((cell, index) => cell === '' ? index : null)
            .filter(index => index !== null);
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    };

    // Função para obter um movimento aleatório ou o melhor movimento (para dificuldade médio)
    const getBestMoveMedium = () => {
        return Math.random() > 0.5 ? getBestMove() : getRandomMove();
    };

    // Função para obter o melhor movimento usando o algoritmo Minimax (para dificuldade avançado)
    const getBestMove = () => {
        const availableMoves = gameState
            .map((cell, index) => cell === '' ? index : null)
            .filter(index => index !== null);

        let bestScore = -Infinity;
        let move = -1;

        availableMoves.forEach(index => {
            gameState[index] = PLAYER_O;  // Simula a jogada do computador
            const score = minimax(gameState, 0, false);  // Avalia o tabuleiro
            gameState[index] = '';  // Desfaz a jogada

            if (score > bestScore) {
                bestScore = score;
                move = index;
            }
        });

        return move;
    };

    // Algoritmo Minimax para avaliar os movimentos possíveis
    const minimax = (newBoard, depth, isMaximizing) => {
        const scores = {
            [PLAYER_O]: 1,  // Vitória do computador
            [PLAYER_X]: -1,  // Vitória do jogador humano
            'tie': 0  // Empate
        };

        // Verifica se há um vencedor ou empate
        const result = checkWinner();
        if (result !== null) {
            return scores[result];
        }

        // Se é a vez do jogador "maximizar" (computador)
        if (isMaximizing) {
            let bestScore = -Infinity;
            newBoard.forEach((cell, index) => {
                if (cell === '') {
                    newBoard[index] = PLAYER_O;  // Simula a jogada do computador
                    const score = minimax(newBoard, depth + 1, false);
                    newBoard[index] = '';  // Desfaz a jogada
                    bestScore = Math.max(score, bestScore);  // Mantém a pontuação mais alta
                }
            });
            return bestScore;
        } else {
            // Se é a vez do jogador "minimizar" (jogador humano)
            let bestScore = Infinity;
            newBoard.forEach((cell, index) => {
                if (cell === '') {
                    newBoard[index] = PLAYER_X;  // Simula a jogada do jogador humano
                    const score = minimax(newBoard, depth + 1, true);
                    newBoard[index] = '';  // Desfaz a jogada
                    bestScore = Math.min(score, bestScore);  // Mantém a pontuação mais baixa
                }
            });
            return bestScore;
        }
    };

    // Função para verificar o vencedor ou empate sem considerar o jogador atual
    const checkWinner = () => {
        let winner = null;
        winningConditions.forEach(condition => {
            const [a, b, c] = condition;
            if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
                winner = gameState[a];
            }
        });

        // Se não houver vencedor e todas as células estão preenchidas, é um empate
        if (winner === null && !gameState.includes('')) {
            return 'tie';
        }

        return winner;
    };

    // Função para reiniciar o jogo e resetar todas as variáveis
    const handleRestartGame = () => {
        currentPlayer = PLAYER_X;
        gameState = ['', '', '', '', '', '', '', '', ''];
        isGameActive = true;
        vsMode = false;  // Reseta o modo VS ao reiniciar

        cells.forEach(cell => cell.textContent = '');
        statusDisplay.textContent = `Turno do jogador: ${currentPlayer}`;

        // Remove a classe 'selected' de todos os botões de dificuldade ao reiniciar
        difficultyButtons.querySelectorAll('button').forEach(button => button.classList.remove('selected'));
    };

    // Função para alterar a dificuldade do jogo e reiniciar o jogo
    const handleDifficultyChange = (newDifficulty, button) => {
        difficulty = newDifficulty;
        vsMode = newDifficulty === 'vs';  // Ativa o modo VS se selecionado
        handleRestartGame();  // Reinicia o jogo

        // Zera o placar
        scoreX = 0;
        scoreO = 0;
        updateScoreboard();

        // Remove a classe 'selected' de todos os botões e adiciona ao botão clicado
        difficultyButtons.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
    };

    // Adiciona ouvintes de eventos para cada célula do tabuleiro
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));

    // Adiciona ouvintes de eventos aos botões de dificuldade
    easyButton.addEventListener('click', () => handleDifficultyChange('easy', easyButton));
    mediumButton.addEventListener('click', () => handleDifficultyChange('medium', mediumButton));
    hardButton.addEventListener('click', () => handleDifficultyChange('hard', hardButton));
    vsButton.addEventListener('click', () => handleDifficultyChange('vs', vsButton));

    // Exibe o jogador atual na inicialização
    displayCurrentPlayer();
    updateScoreboard();  // Inicializa o contador de pontos
});
