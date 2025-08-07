// This file centralizes all the sound data for the application.
// This keeps the sound logic file clean and makes it easier to manage or
// replace sounds in the future.

export const sounds = {
    // A soft, quick click for UI interactions.
    button: './sounds/button.mp3',

    // A satisfying wooden "tock" for placing a piece on the board.
    place: './sounds/place.mp3',

    // A positive, uplifting sound for winning the game.
    win: './sounds/win.mp3',
    
    // A descending, "failure" sound for losing the game.
    lose: './sounds/lose.mp3',
    
    // A neutral, two-tone sound for a draw game.
    draw: './sounds/draw.mp3',

    // A subtle "ping" for notifications like ads.
    notification: './sounds/notification.mp3',

    // A special sound for the hint button.
    hint: './sounds/hint.mp3'
};
