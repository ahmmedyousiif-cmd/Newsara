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

export type TranslateItem = TranslateTextItem | TranslateWordBankItem;

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
