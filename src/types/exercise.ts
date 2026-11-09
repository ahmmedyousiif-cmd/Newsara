/** Schema for data-driven Multiple Choice engine items. */
export type MultipleChoiceOption = {
  id: string;
  text: string;
};

export type MultipleChoiceItem = {
  id: string;
  grammarRule: string;
  prompt: string;
  arabicHint: string;
  options: MultipleChoiceOption[];
  correctId: string;
  explanation: string;
};

export type LessonInfo = {
  stage: string;
  exerciseNumber: number;
  totalExercises: number;
  lessonTitle: string;
};

export type PedagogicalGuide = {
  title: string;
  objective: string;
  rationale: string;
};

export type MultipleChoiceExercise = {
  id: string;
  engine: "multiple-choice";
  lessonInfo: LessonInfo;
  pedagogicalGuide: PedagogicalGuide;
  item: MultipleChoiceItem;
};
