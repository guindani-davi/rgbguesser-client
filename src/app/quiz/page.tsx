"use client"; // Necessário por usar hooks

import { useState, useEffect } from "react";
import { Question, QuizStartResponse } from "../types/quiz";
import styles from "./Quiz.module.css";

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startQuiz = async () => {
      try {
        const response = await fetch(
          "https://rgbguesser-server-git-poc-davis-projects-2734e407.vercel.app/api/quiz/start",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quizId: "1" }),
          }
        );

        if (!response.ok) throw new Error("Falha ao carregar quiz");

        const data: QuizStartResponse = await response.json();
        setQuestions(data.quiz.questions);
        setToken(data.token);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    startQuiz();
  }, []);

  const handleAnswer = async (answer: string) => {
    if (!token || !questions[currentQuestionIndex]) return;

    setSelectedAnswer(answer);
    try {
      const response = await fetch(
        "https://rgbguesser-server-git-poc-davis-projects-2734e407.vercel.app/api/quiz/check",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: questions[currentQuestionIndex].id,
            answer,
            token,
          }),
        }
      );

      if (!response.ok) throw new Error("Erro na verificação");

      const result = await response.json();
      setFeedback(result.isCorrect ? "correct" : "wrong");

      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
          setFeedback(null);
          setSelectedAnswer(null);
        } else {
          alert("Quiz concluído!");
        }
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro na resposta");
    }
  };

  if (loading) return <div className={styles.loading}>Carregando...</div>;
  if (error) return <div className={styles.error}>Erro: {error}</div>;
  if (!questions.length) return <div>Nenhuma pergunta encontrada</div>;

  console.log(questions);
  const currentQuestion = questions[currentQuestionIndex];
  console.log(currentQuestion);

  return (
    <div className={styles.container}>
      <div className={styles.progress}>
        Pergunta {currentQuestionIndex + 1} de {questions.length}
      </div>

      <div className={styles.questionCard}>
        <h2 className={styles.questionText}>{currentQuestion.question}</h2>

        <div className={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={!!feedback}
              className={`${styles.optionButton} ${
                selectedAnswer === option ? styles.selected : ""
              } ${
                feedback && selectedAnswer === option
                  ? feedback === "correct"
                    ? styles.correct
                    : styles.wrong
                  : ""
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {feedback && (
          <div
            className={`${styles.feedback} ${
              feedback === "correct"
                ? styles.feedbackCorrect
                : styles.feedbackWrong
            }`}
          >
            {feedback === "correct" ? "✓ Correto!" : "✗ Incorreto"}
          </div>
        )}
      </div>
    </div>
  );
}
