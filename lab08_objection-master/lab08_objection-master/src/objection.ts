export enum Objection {
  /**
  * By default, enum are integers 0, 1, 2, ...
  * However, we can also give them string values
  */
  ARGUMENTATIVE = 'argumentative',
  COMPOUND = 'compound',
  HEARSAY = 'hearsay',
  LEADING = 'leading',
  NON_RESPONSIVE = 'non-responsive',
  RELEVANCE = 'relevance',
  SPECULATION = 'speculation',
}

export enum ExaminationType {
  /**
    * It is also possible to specify a "start" number.
    *
    * Below would assign CROSS = 1, DIRECT = 2, the next
    * would be 3, etc.
    */
  CROSS = 1,
  DIRECT,
}

// Helper function - feel free to remove / modify.
function isArgumentative(question: string) {
  return !question.endsWith('?');
}

function isCompound(question: string) {
  const count = question.split('?').length - 1;
  if (count > 1) {
    return true;
  } else {
    return false;
  }
}

function isLeading(question: string) {
  const prefixes = ['why did you', 'do you agree'];
  const suffixes = ['right?', 'correct?'];
  if (prefixes.some(prefix => question.startsWith(prefix)) || suffixes.some(suffix => question.endsWith(suffix))) {
    return true;
  } else {
    return false;
  }
}

function isHearsay(testimony: string) {
  if (testimony.includes('heard from') || testimony.includes('told me')) {
    return true;
  } else {
    return false;
  }
}

function isNonResponsive(question: string, testimony: string) {
  const regex = /[^a-zA-Z0-9 ]/g;
  const q = question.replace(regex, '');
  const t = testimony.replace(regex, '');
  const qArr = q.split(' ');
  for (const word of qArr) {
    if (t.includes(word)) {
      return false;
    }
  }
  return true;
}

function isRelevace(question: string, testimony: string) {
  if (testimony.length > 2 * question.length) {
    return true;
  } else {
    return false;
  }
}

function isSpeculation(examinationType: ExaminationType, question: string, testimony: string) {
  if (examinationType === ExaminationType.DIRECT) {
    return testimony.includes('think');
  } else {
    return question.includes('think');
  }
}

/**
 * Feel free to modify the function below as you see fit,
 * so long as you satisfy the specification.
 */
export function getObjections(
  question: string,
  testimony: string,
  examinationType: ExaminationType
): Set<Objection> {
  // TODO: error handling
  if (question === '') {
    throw new Error('The question is an empty string');
  }
  if (testimony === '') {
    throw new Error('The testimony is an empty string');
  }
  // Convert given question and testimony to lowercase
  question = question.toLowerCase();
  testimony = testimony.toLowerCase();

  const objections = new Set<Objection>();

  if (examinationType === ExaminationType.CROSS) {
    if (isArgumentative(question)) {
      objections.add(Objection.ARGUMENTATIVE);
    }

    // TODO
  } else {
    // Type is ExaminationType.DIRECT
    if (isLeading(question)) {
      objections.add(Objection.LEADING);
    }
  }
  if (isHearsay(testimony)) {
    objections.add(Objection.HEARSAY);
  }

  if (isCompound(question)) {
    objections.add(Objection.COMPOUND);
  }

  if (isNonResponsive(question, testimony)) {
    objections.add(Objection.NON_RESPONSIVE);
  }
  // TODO
  if (isRelevace(question, testimony)) {
    objections.add(Objection.RELEVANCE);
  }
  if (isSpeculation(examinationType, question, testimony)) {
    objections.add(Objection.SPECULATION);
  }
  return objections;
}
