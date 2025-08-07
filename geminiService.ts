
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { BoardState, Player, Difficulty } from "../types";

const API_KEY = 'AIzaSyC4AMDc8z8UAYr84z1mci-OK0jyZKzgdbc'; 

const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- API Call Management ---
const API_TIMEOUT_MS = 5000; // Increased timeout to 5 seconds
let rateLimitCooldownUntil = 0;
const RATE_LIMIT_COOLDOWN_MS = 60 * 1000; // 1 minute cooldown

const getDifficultyInstructions = (difficulty: Difficulty): string => {
    switch (difficulty) {
        case 'easy':
            return `You are a beginner Tic-Tac-Toe player. You make random but valid moves. Your only goal is to place your symbol 'P2' on any empty square.`;
        case 'medium':
            return `You are an intermediate Tic-Tac-Toe player. You must follow these rules in order: 1. If you have an immediate winning move, take it. 2. If the opponent 'P1' is about to win on their next turn, you must block them. 3. If the center square (index 4) is empty, take it. 4. If any corner squares (0, 2, 6, 8) are empty, take one of them. 5. Take any remaining empty square. Do not use more advanced strategies like looking for forks.`;
        case 'hard':
            return `You are an AI that plays a perfect, unbeatable game of Tic-Tac-Toe. You must follow these rules in this exact order, without deviation. This is not a persona; it is a strict algorithm. 1. Check for an immediate winning move and take it. 2. Check for an immediate move to block the opponent 'P1' from winning, and take it. 3. Check if you can create a 'fork' (a move that creates two winning threats at once). If so, take that move. 4. Check if the opponent is about to create a fork. If so, you must block it. Your block should ideally create a two-in-a-row for you, if possible. 5. Take the center square (index 4) if it's available. 6. If the opponent is in a corner, take the opposite corner. 7. Take any empty corner square. 8. Take any empty side square.`;
    }
};

// --- Offline Fallback AI ---

const calculateWinnerForOfflineAI = (board: BoardState): Player | null => {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
};

const getOfflineAIMove = (board: BoardState, difficulty: Difficulty): number => {
    console.log(`Using offline AI logic for ${difficulty} difficulty.`);
    const emptySquares = board.map((sq, i) => sq === null ? i : null).filter(i => i !== null) as number[];

    if (emptySquares.length === 0) {
        throw new Error("No empty squares for offline AI.");
    }
    
    const findWinningMove = (brd: BoardState, player: Player): number | null => {
        for (const move of emptySquares) {
            const nextBoard = [...brd];
            nextBoard[move] = player;
            if (calculateWinnerForOfflineAI(nextBoard) === player) return move;
        }
        return null;
    };

    if (difficulty === 'hard') { // Unbeatable logic
        // 1. Win
        let move = findWinningMove(board, 'P2');
        if (move !== null) return move;

        // 2. Block
        move = findWinningMove(board, 'P1');
        if (move !== null) return move;
        
        // 3. Fork
        for (const move of emptySquares) {
            const tempBoard = [...board];
            tempBoard[move] = 'P2';
            let winningOpportunities = 0;
            const futureEmptySquares = tempBoard.map((sq, i) => sq === null ? i : null).filter(i => i !== null) as number[];
            for (const futureMove of futureEmptySquares) {
                const futureBoard = [...tempBoard];
                futureBoard[futureMove] = 'P2';
                if (calculateWinnerForOfflineAI(futureBoard) === 'P2') {
                    winningOpportunities++;
                }
            }
            if (winningOpportunities >= 2) return move;
        }

        // 4. Block opponent's fork
        const opponentForks = [];
        for (const oppMove of emptySquares) {
            const tempBoard = [...board];
            tempBoard[oppMove] = 'P1';
            
            let winningOpportunities = 0;
            const futureEmptySquares = tempBoard.map((sq, i) => sq === null ? i : null).filter(i => i !== null) as number[];
            if (futureEmptySquares.length < 2) continue;

            for (const futureMove of futureEmptySquares) {
                const futureBoard = [...tempBoard];
                futureBoard[futureMove] = 'P1';
                if (calculateWinnerForOfflineAI(futureBoard) === 'P1') {
                    winningOpportunities++;
                }
            }
            if (winningOpportunities >= 2) {
                opponentForks.push(oppMove);
            }
        }
        
        if (opponentForks.length === 1) {
            return opponentForks[0];
        } else if (opponentForks.length > 1) {
            // If multiple forks, play a side to force a block (a defensive move)
            const sidesToBlock = [1, 3, 5, 7].filter(m => board[m] === null);
            if (sidesToBlock.length > 0) {
                return sidesToBlock[Math.floor(Math.random() * sidesToBlock.length)];
            }
        }
        
        // 5. Center
        if (board[4] === null) return 4;

        // 6. Opposite Corner
        if (board[0] === 'P1' && board[8] === null) return 8;
        if (board[8] === 'P1' && board[0] === null) return 0;
        if (board[2] === 'P1' && board[6] === null) return 6;
        if (board[6] === 'P1' && board[2] === null) return 2;
        
        // 7. Empty Corner
        const corners = [0, 2, 6, 8].filter(m => board[m] === null);
        if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];

        // 8. Empty Side
        const sides = [1, 3, 5, 7].filter(m => board[m] === null);
        if (sides.length > 0) return sides[Math.floor(Math.random() * sides.length)];
    }

    if (difficulty === 'medium') { // Intermediate logic
        // 1. Win if possible
        let move = findWinningMove(board, 'P2');
        if (move !== null) return move;

        // 2. Block if necessary
        move = findWinningMove(board, 'P1');
        if (move !== null) return move;

        // 3. Play center if available
        if (board[4] === null) return 4;

        // 4. Play a random corner if available
        const corners = [0, 2, 6, 8].filter(m => board[m] === null);
        if (corners.length > 0) {
            return corners[Math.floor(Math.random() * corners.length)];
        }

        // 5. Play a random side
        const sides = [1, 3, 5, 7].filter(m => board[m] === null);
        if (sides.length > 0) {
            return sides[Math.floor(Math.random() * sides.length)];
        }
    }

    // Easy logic or fallback: take a random available square
    return emptySquares[Math.floor(Math.random() * emptySquares.length)];
};

const getOfflineHintMove = (board: BoardState): number => {
    console.log(`Using offline AI logic for hint.`);
     // The hint is for 'P1'. We use the 'hard' AI logic to find the best move for 'P1'.
    // To do this, we can ask the AI for its move ('P2') on a swapped board.
    const swappedBoard = board.map(p => {
        if (p === 'P1') return 'P2';
        if (p === 'P2') return 'P1';
        return null;
    });
    // Now find the best move for 'P2' on the swapped board, which is equivalent to 'P1's best move.
    return getOfflineAIMove(swappedBoard, 'hard');
};

/**
 * Wraps a promise with a timeout.
 * @param promise The promise to wrap.
 * @param ms The timeout in milliseconds.
 * @returns A new promise that either resolves with the original promise's result
 *          or rejects if the timeout is exceeded.
 */
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
    const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Promise timed out after ${ms} ms`)), ms)
    );
    return Promise.race([promise, timeout]);
};

const handleApiError = (error: unknown, context: 'AI move' | 'hint') => {
    console.error(`An error or timeout occurred while getting ${context}. Falling back to offline logic.`, error);
    
    // Check if the error indicates rate limiting. We'll stringify the error to
    // catch different forms it might appear in (string, object, etc.).
    const errorString = String(error).toUpperCase();
    if (errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED')) {
        if (Date.now() > rateLimitCooldownUntil) {
             rateLimitCooldownUntil = Date.now() + RATE_LIMIT_COOLDOWN_MS;
             console.warn(`API rate limit hit. Activating cooldown for ${RATE_LIMIT_COOLDOWN_MS / 1000} seconds.`);
        }
    }
}


export const getAIMove = async (board: BoardState, difficulty: Difficulty): Promise<number> => {
  // Check for active cooldown or offline status first
  if (Date.now() < rateLimitCooldownUntil) {
    console.warn("API is on cooldown due to rate limiting. Using offline AI.");
    return getOfflineAIMove(board, difficulty);
  }
  if (!navigator.onLine) {
    console.warn("Browser is offline. Using offline AI.");
    return getOfflineAIMove(board, difficulty);
  }
  
  try {
    const apiCall = () => {
        const difficultyInstructions = getDifficultyInstructions(difficulty);
        const systemInstruction = `You are a Tic-Tac-Toe AI player. Your designated symbol is 'P2'. The human player is 'P1'. This is your persona and skill level: ${difficultyInstructions}`;
        const userPrompt = `
            The game board is represented as a 1D array of 9 elements. Indices correspond to board positions:
            0 | 1 | 2
            ---------
            3 | 4 | 5
            ---------
            6 | 7 | 8

            Current board state: ${JSON.stringify(board)}

            Your task is to choose the best possible move based on your skill level. Select an index (0-8) corresponding to an empty (null) square.
            Return your move as a JSON object with a single key "move", which is the index of the square you choose to play on. Make sure the move is on an empty square.
        `;

        return ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        move: {
                            type: Type.INTEGER,
                            description: "The index (0-8) of the square for the AI's move.",
                        },
                    },
                    required: ["move"],
                },
                thinkingConfig: {
                    thinkingBudget: 0
                }
            },
        });
    };
    
    const response: GenerateContentResponse = await withTimeout(apiCall(), API_TIMEOUT_MS);
    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);

    if (typeof result.move === 'number' && result.move >= 0 && result.move <= 8) {
      if (board[result.move] === null) {
        return result.move; // Success!
      } else {
        console.warn("AI chose a filled square. Falling back to offline AI.");
        return getOfflineAIMove(board, difficulty);
      }
    } else {
      console.warn("Invalid move received from AI. Falling back to offline AI.");
      return getOfflineAIMove(board, difficulty);
    }

  } catch (error) {
    handleApiError(error, 'AI move');
    return getOfflineAIMove(board, difficulty);
  }
};

export const getHint = async (board: BoardState): Promise<number> => {
    // Check for active cooldown or offline status first
    if (Date.now() < rateLimitCooldownUntil) {
        console.warn("API is on cooldown due to rate limiting. Using offline logic for hint.");
        return getOfflineHintMove(board);
    }
    if (!navigator.onLine) {
        console.warn("Browser is offline. Using offline logic for hint.");
        return getOfflineHintMove(board);
    }
    
    try {
        const apiCall = () => {
            const systemInstruction = `You are a perfect Tic-Tac-Toe engine. Your only function is to analyze a board state and return the single best possible move for player 'P1' based on a strict, unbreakable algorithm. You must always provide the optimal move that leads to a win or a draw. Do not add any commentary or explanation.`;
            const userPrompt = `
              The human player is 'P1' and the AI is 'P2'. The human player has requested a hint for their next move.

              Game board state: ${JSON.stringify(board)}
              (Board indices: 0|1|2, 3|4|5, 6|7|8)

              Determine the single best move for player 'P1' by following this algorithm in exact order:
              1.  **Win:** If 'P1' has a winning move, return that move.
              2.  **Block:** If 'P2' has a winning move, return the move to block it.
              3.  **Fork:** If 'P1' can create a fork (a move creating two winning threats), return that move.
              4.  **Block Fork:** If 'P2' is about to create a fork, return the move to block it.
              5.  **Center:** If the center square (index 4) is empty, return 4.
              6.  **Opposite Corner:** If 'P2' is in a corner and the opposite corner is empty, return the opposite corner.
              7.  **Empty Corner:** If any corner square (0, 2, 6, 8) is empty, return one.
              8.  **Empty Side:** If any side square (1, 3, 5, 7) is empty, return one.

              Analyze the board and return only the JSON object with the single integer for the best move. Make sure the move is on an empty square.
            `;
            
            return ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: userPrompt,
                config: {
                    systemInstruction: systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            move: { type: Type.INTEGER, description: `The index (0-8) of the best move for player 'P1'.` },
                        },
                        required: ["move"],
                    },
                    thinkingConfig: { thinkingBudget: 0 }
                },
            });
        };
        
        const response: GenerateContentResponse = await withTimeout(apiCall(), API_TIMEOUT_MS);
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        
        if (typeof result.move === 'number' && result.move >= 0 && result.move <= 8) {
            if (board[result.move] === null) {
                return result.move; // Success!
            }
        }
        
        console.warn("Invalid hint received from AI. Falling back to offline logic.");
        return getOfflineHintMove(board);
        
    } catch(error) {
        handleApiError(error, 'hint');
        return getOfflineHintMove(board);
    }
};
