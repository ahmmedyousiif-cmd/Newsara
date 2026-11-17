export type SentenceBuildItem = {
  id: string;
  prompt: string;
  sentenceType: string;
  bank: string[];
  answer: string[];
  spoken: string;
};

export type SentenceBuildActivity = {
  id: string;
  lessonName: string;
  items: SentenceBuildItem[];
};
