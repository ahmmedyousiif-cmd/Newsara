export type MeaningOption = {
  id: string;
  text: string;
};

/** English word shown, learner picks the Arabic meaning. */
export type WordMeaningItem = {
  id: string;
  promptEn: string;
  options: MeaningOption[];
  correctId: string;
};

export type WordMeaningActivity = {
  id: string;
  engine: "word-meaning";
  instruction: string;
  items: WordMeaningItem[];
};
