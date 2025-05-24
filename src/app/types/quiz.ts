export interface Question {
  id: string;
  question: string;
  options: string[];
}

export interface QuizStartResponse {
  quiz: { questions: Question[] };
  token: string;
}
