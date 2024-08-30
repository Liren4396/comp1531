import { authRegisterV1 } from './auth';
import { channelInviteV1, channelLeaveV1 } from './channel';
import { ifEmailExisting, emailToToken, emailToUId, isMember } from './helpers';
import { messageSendV1 } from './message';
import { getData, setData } from './dataStore';
import fs from 'fs';

let word = [];
let realWord = [];
let hp = 10;

function getNewWord() {
  let wordData = JSON.parse(fs.readFileSync('hangmanChineseCompany.json', 'utf8'));
  const length = wordData.length;

  const number = Math.floor(Math.random() * length);
  const wordLength = wordData[number].word.length;
  word = [];
  realWord = [];
  for (let i = 0; i < wordLength; i++) {
    word.push('?');
  }
  for (let i = 0; i < wordLength; i++) {
    realWord.push(wordData[number].word[i]);
  }
  wordData = wordData[number];
  const message = 'word: ' + '?'.repeat(wordLength) + '\n\thint:' + wordData.introduction + '\n\tYou have 10 chance to guess the word.';
  return message;
}

async function checkCreateBot(token: string, channelId: number) {
  if (!ifEmailExisting('hangman@robort.com')) {
    const bot = authRegisterV1('hangman@robort.com', 'password', 'hangman', 'bot');
    if ('authUserId' in bot) {
      channelInviteV1(token, channelId, bot.authUserId);
    }
  } else {
    const uId = emailToUId('hangman@robort.com');
    if (!isMember(uId, channelId)) {
      channelInviteV1(token, channelId, uId);
    }
  }
}

function changeGameStatus(start: number, channelId: number) {
  const data = getData();
  for (const channel of data.channels) {
    if (channel.id === channelId) {
      channel.gameStart = start;
      setData(data);
      break;
    }
  }
}
function checkGameStatus(start: number, channelId: number) {
  const data = getData();
  for (const channel of data.channels) {
    if (channel.id === channelId && channel.gameStart === start) {
      return true;
    }
  }
  return false;
}

function hangmanInit(token: string, channelId: number) {
  checkCreateBot(token, channelId);
  const botToken = emailToToken('hangman@robort.com');
  messageSendV1(botToken, channelId, 'Welcome To Hangman Game!\n\t' + getNewWord());
  changeGameStatus(1, channelId);
  hp = 10;
}

export async function hangmanStart(token: string, channelId: number) {
  if (checkGameStatus(0, channelId)) {
    hangmanInit(token, channelId);
  } else {
    const botToken = emailToToken('hangman@robort.com');
    messageSendV1(botToken, channelId, 'Game is already started.\nTry /guess + letter to continue game.');
  }
}

export async function exitHangman(token: string, channelId: number) {
  if (ifEmailExisting('hangman@robort.com')) {
    const uId = emailToUId('hangman@robort.com');
    if (isMember(uId, channelId)) {
      checkCreateBot(token, channelId);
      // game hasnt started
      const botToken = emailToToken('hangman@robort.com');
      messageSendV1(botToken, channelId, 'Bye Bye!\nHave a good day!');
      checkCreateBot(token, channelId);
      hp = 10;
      channelLeaveV1(botToken, channelId);
    }
  }
}

export async function resetHangman(token: string, channelId: number) {
  if (ifEmailExisting('hangman@robort.com')) {
    const uId = emailToUId('hangman@robort.com');
    if (isMember(uId, channelId) && checkGameStatus(1, channelId)) {
      changeGameStatus(1, channelId);
      hangmanInit(token, channelId);
    }
  }
}

export async function guessHanman(token: string, channelId: number, message: string) {
  if (ifEmailExisting('hangman@robort.com')) {
    const uId = emailToUId('hangman@robort.com');
    if (isMember(uId, channelId)) {
      if (checkGameStatus(0, channelId)) {
        const botToken = emailToToken('hangman@robort.com');
        messageSendV1(botToken, channelId, 'You haven\'t started the game\nPlease try /hangman to start game.');
      } else if (hp > 0) {
        // guess a to get word a
        // extract the word
        if (message.indexOf(' ') !== -1) {
          const pos = message.indexOf(' ');
          const extractWords = message.slice(pos + 1, message.length).toLowerCase();
          const StrRealWord = realWord.join('');
          if (StrRealWord.toLowerCase().includes(extractWords)) {
            const extractLength = extractWords.length;
            if (extractLength > 1) {
              // multiple word
              const StrWord = word.join('');
              for (let i = 0; i < StrWord.length; i++) {
                if (realWord[i].toLowerCase() === extractWords[0] && StrRealWord.slice(i, i + extractWords.length).toLowerCase() === extractWords &&
                word[i].toLowerCase() !== extractWords[i]) {
                  for (let j = i; j < i + extractWords.length; j++) {
                    word[j] = realWord[j];
                  }
                }
              }
            } else {
              // single word
              const StrWord = word.join('');
              for (let i = 0; i < StrWord.length; i++) {
                if (realWord[i].toLowerCase() === extractWords) {
                  word[i] = realWord[i];
                }
              }
            }
            const StrWord = word.join('');
            if (StrWord === StrRealWord) {
              // finish
              const botToken = emailToToken('hangman@robort.com');
              messageSendV1(botToken, channelId, 'You Win!\nThe Word is ' + StrWord + '\nEnter /exit to leave.\nEnter /hangman to new game.');
              changeGameStatus(0, channelId);
            } else {
              const botToken = emailToToken('hangman@robort.com');
              messageSendV1(botToken, channelId, 'Correct Guess!\nCurrent word is ' + StrWord + '\nHP is ' + hp);
            }
          } else {
            hp--;
            if (hp === 0) {
              const botToken = emailToToken('hangman@robort.com');
              messageSendV1(botToken, channelId, 'HP is ' + hp + '.\nGame Over.\n');
            } else {
              const botToken = emailToToken('hangman@robort.com');
              const StrWord = word.join('');
              messageSendV1(botToken, channelId, 'Answer is wrong\nCurrent word is ' + StrWord + '\nHP is ' + hp);
            }
          }
        } else {
          const botToken = emailToToken('hangman@robort.com');
          messageSendV1(botToken, channelId, 'Please try /guess + space + word to guess.');
        }
      } else {
        const botToken = emailToToken('hangman@robort.com');
        messageSendV1(botToken, channelId, 'Enter /reset to create a new game.');
      }
    }
  }
}
