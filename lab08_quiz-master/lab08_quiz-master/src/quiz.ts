import httpError from 'http-errors';

interface answers {
  isCorrect: boolean;
  answerString: string;
}

interface questions {
  questionId: number;
  questionString: string;
  questionType: string;
  answers: answers[];
}

interface quiz {
  quizId: number;
  quizTitle: string;
  quizSynopsis: string;
  questions: questions[];
}

/*
interface quizzestype {
  quizId: number;
  quizTitle: string;
}

interface quizzes {
  quiz: quizzestype;
}

*/
let Quiz: quiz[] = [];
let Question: questions[] = [];
let count_quiz = 0;
let count_question = 0;

export function quizCreate(quizTitle : string, quizSynopsis: string) {
  if (quizTitle === '' || quizSynopsis === '') {
    throw httpError(400, 'empty string');
  }
  const newId = count_quiz + 1;
  count_quiz++;

  Quiz.push({
    quizId: newId,
    quizTitle: quizTitle,
    quizSynopsis: quizSynopsis,
    questions: [],
  })

  return { quizId: newId }
}

export function quizDetails(quizId: number) {
  for (const quiz of Quiz) {
    if (quiz.quizId === quizId) {
      return {quiz};
    }
  }
  throw httpError(400, 'invalid quizId');
}

export function quizEdit(quizId: number, quizTitle: string, quizSynopsis: string) {
  if (quizTitle === '' || quizSynopsis === '') {
    throw httpError(400, 'empty string');
  }
  for (const quiz of Quiz) {
    if (quiz.quizId === quizId) {
      quiz.quizTitle = quizTitle;
      quiz.quizSynopsis = quizSynopsis;
      return {};
    }
  }
  throw httpError(400, 'invalid quizId'); 
}

function ValidQuiz(quizId: number) {
  for (const q of Quiz) {
    if (quizId === q.quizId) {
      return true;
    }
  }
  return false;
}

export function quizRemove(quizId: number) {
  if (!ValidQuiz(quizId)) {
    throw httpError(400, 'invalid quizId');
  }
  Quiz = Quiz.filter(data => data.quizId !== quizId);
  return {};
}

export function quizzesList() {
  const ret = [];
  for (const quiz of Quiz) {
    ret.push({
      quizId: quiz.quizId,
      quizTitle: quiz.quizTitle,
    })
  }
  return {quizzes: ret};
}

export function questionAdd(quizId: number, questionString: string, questionType: string, answers: answers[]) {
  if (questionString === '') {
    throw httpError(400, 'empty string');
  }
  if (questionType !== 'single' && questionType !== 'multiple') {
    throw httpError(400, 'invalid questionType');
  }
  if (questionType === 'single') {
    const correctAns = answers.filter(data => data.isCorrect === true);
    if (correctAns.length !== 1) {
      throw httpError(400, 'not exactly 1 correct answer with single type');
    }
  }
  let flag = 0;
  for (const answer of answers) {
    if (answer.answerString === '') {
      throw httpError(400, 'empty string');
    }
    if (answer.isCorrect === true) {
      flag = 1;
    }
  }
  if (flag === 0) {
    throw httpError(400, 'no correct answers');
  }
  let newId = count_question + 1;
  count_question++;
  const ques = {
    questionId: newId,
    questionString: questionString, 
    questionType: questionType,
    answers: answers
  }
  Question.push(ques);
  for (const quiz of Quiz) {
    if (quiz.quizId === quizId) {
      
      quiz.questions.push(ques);
      return {questionId: newId};
    }
  }
  throw httpError(400, 'invalid quizId'); 
}

export function questionEdit(questionId: number, questionString: string, questionType: string, answers: answers[]) {
  if (questionString === '') {
    throw httpError(400, 'empty string');
  }
  if (questionType !== 'single' && questionType !== 'multiple') {
    throw httpError(400, 'invalid questionType');
  }
  if (questionType === 'single') {
    const correctAns = answers.filter(data => data.isCorrect === true);
    if (correctAns.length !== 1) {
      throw httpError(400, 'not exactly 1 correct answer with single type');
    }
  }
  let flag = 0;
  for (const answer of answers) {
    if (answer.answerString === '') {
      throw httpError(400, 'empty string');
    }
    if (answer.isCorrect === true) {
      flag = 1;
    }
  }
  if (flag === 0) {
    throw httpError(400, 'no correct answers');
  }
  for (const ques of Question) {
    if (ques.questionId === questionId) {
      ques.questionString = questionString;
      ques.questionType = questionType;
      ques.answers = answers;
      return {};
    }
  }
  throw httpError(400, 'invalid questionId'); 
}

export function questionRemove(questionId: number) {

  for (const q of Quiz) {
    for (let start = 0; start < q.questions.length; start++) {
      if (q.questions[start].questionId === questionId) {
        q.questions.splice(start, 1);
      }
    }
  }
  for (let i = 0; i < Question.length; i++) {
    if (Question[i].questionId === questionId) {
      Question.splice(i, 1);
      return {};
    }
  }
  throw httpError(400, 'invalid questionId'); 
}

export function clear() {
  Quiz = [];
  Question = [];
  return {};
}