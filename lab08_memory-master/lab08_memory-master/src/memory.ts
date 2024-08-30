import fs from 'fs';

interface Game {
  score: number;
  mistakesRemaining: number;
  cluesRemaining: number;
  dictionary: string[];
}

const currentGame: Game = {
  score: 0,
  mistakesRemaining: 3,
  cluesRemaining: 3,
  dictionary: [],
};

// Note: key "dictionary" is NOT returned in this function.
export function getGameInfo() {
  // FIXME
  return {
    score: currentGame.score,
    mistakesRemaining: currentGame.mistakesRemaining,
    cluesRemaining: currentGame.cluesRemaining,
  };
}

export function addWord(word: string) {
  // FIXME
  if (currentGame.mistakesRemaining <= 0) {
    throw new Error('inactive game');
  }

  if (currentGame.dictionary.indexOf(word) !== -1) {
    currentGame.mistakesRemaining--;
    throw new Error('given word already exists in the current game\'s dictionary');
  } else {
    currentGame.dictionary.push(word);
    currentGame.score++;
  }
}

export function removeWord(word: string) {
  if (currentGame.mistakesRemaining <= 0) {
    throw new Error('Game is over');
  }
  const index = currentGame.dictionary.indexOf(word);
  if (index !== -1) {
    // find word
    currentGame.dictionary.splice(index, 1);
    currentGame.score++;
  } else {
    currentGame.mistakesRemaining--;
    throw new Error('The given word does not exist in the current game\'s dictionary');
  }
}

export function viewDictionary() {
  // FIXME
  if (currentGame.mistakesRemaining === 0) {
    return currentGame.dictionary;
  }
  if (currentGame.cluesRemaining > 0) {
    currentGame.cluesRemaining--;
    return currentGame.dictionary;
  } else {
    throw new Error('No clues remaining in this active game.');
  }
}

export function resetGame() {
  currentGame.cluesRemaining = 3;
  currentGame.score = 0;
  currentGame.mistakesRemaining = 3;
  currentGame.dictionary = [];
}

export function saveGame(name: string) {
  const path = 'memory_' + name + '.json';
  if (name === '') {
    throw new Error('The name given is an empty string');
  }
  if (name.match(/[^a-zA-Z0-9]/)) {
    throw new Error('The name given is not alphanumeric (only letters and numbers)');
  }
  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, JSON.stringify(currentGame));
  } else {
    throw new Error('Failed to load game example: File ' + path + ' already exits!');
  }
}

export function loadGame(name: string) {
  const path = 'memory_' + name + '.json';
  if (name === '') {
    throw new Error('The name given is an empty string');
  }
  if (name.match(/[^a-zA-Z0-9]/)) {
    throw new Error('The name given is not alphanumeric (only letters and numbers)');
  }
  if (fs.existsSync(path)) {
    const game = JSON.parse(fs.readFileSync(path, 'utf8'));
    currentGame.cluesRemaining = game.cluesRemaining;
    currentGame.dictionary = game.dictionary;
    currentGame.mistakesRemaining = game.mistakesRemaining;
    currentGame.score = game.score;
  } else {
    throw new Error('Failed to load game example: File ' + path + ' already exits!');
  }
}
