export type MeaningOption = {
  id: string;
  text: string;
};

/** English word shown, learner picks the Arabic meaning. */
export type WordMeaningChoiceItem = {
  id: string;
  mode: "choice";
  promptEn: string;
  options: MeaningOption[];
  correctId: string;
};

/** English word shown, learner types the Arabic meaning. */
export type WordMeaningTypeItem = {
  id: string;
  mode: "type";
  promptEn: string;
  answerAr: string;
};

export type WordMeaningItem = WordMeaningChoiceItem | WordMeaningTypeItem;

/** Arabic word shown, learner types the English translation. */
export type DictationItem = {
  id: string;
  promptAr: string;
  answerEn: string;
};

export type WordMeaningActivity = {
  id: string;
  engine: "word-meaning";
  instruction: string;
  items: WordMeaningItem[];
};
