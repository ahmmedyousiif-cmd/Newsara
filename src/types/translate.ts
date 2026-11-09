export type TranslateTextItem = {
  id: string;
  mode: "text-input";
  promptAr: string;
  /** Canonical English answer (shown on typo / error). */
  answer: string;
  /** Extra accepted spellings (optional). */
  acceptedAnswers?: string[];
};

export type TranslateWordBankItem = {
  id: string;
  mode: "word-bank";
  promptAr: string;
  /** Correct sequence of bank chips (by text). */
  answerWords: string[];
  /** All chips shown in the bank (includes distractors). */
  bank: string[];
};

export type TranslateVerticalOption = {
  id: string;
  text: string;
};

/** Single-select MCQ with vertical option buttons. */
export type TranslateVerticalChoiceItem = {
  id: string;
  mode: "vertical-choice";
  promptAr: string;
  options: TranslateVerticalOption[];
  correctId: string;
};

export type TranslateItem =
  | TranslateTextItem
  | TranslateWordBankItem
  | TranslateVerticalChoiceItem;

export type TranslateActivity = {
  id: string;
  engine: "translate-word";
  instruction: string;
  items: TranslateItem[];
};

export type InteractionState =
  | "IDLE"
  | "VALIDATING"
  | "SUCCESS"
  | "TYPO"
  | "ERROR";
