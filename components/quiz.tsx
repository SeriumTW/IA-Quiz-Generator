import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  RefreshCw,
  FileText,
  Loader2,
} from "lucide-react";
import QuizScore from "./score";
import QuizReview from "./quiz-overview";
import { Question } from "@/lib/schemas";

type QuizProps = {
  questions: Question[];
  clearPDF: () => void;
  title: string;
  regenerateQuiz?: () => void;
  isGenerating?: boolean;
};

const QuestionCard: React.FC<{
  question: Question;
  selectedAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
  isSubmitted: boolean;
  showCorrectAnswer: boolean;
}> = ({ question, selectedAnswer, onSelectAnswer, showCorrectAnswer }) => {
  const answerLabels = ["A", "B", "C", "D"];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold leading-tight">
        {question.question}
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {question.options.map((option, index) => (
          <Button
            key={index}
            variant={
              selectedAnswer === answerLabels[index] ? "secondary" : "outline"
            }
            className={`h-auto py-6 px-4 justify-start text-left whitespace-normal ${
              showCorrectAnswer && answerLabels[index] === question.answer
                ? "bg-green-100 border-green-300 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300"
                : showCorrectAnswer &&
                    selectedAnswer === answerLabels[index] &&
                    selectedAnswer !== question.answer
                  ? "bg-red-100 border-red-300 text-red-700 dark:bg-red-900 dark:border-red-700 dark:text-red-300"
                  : selectedAnswer === answerLabels[index] 
                    ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300' 
                    : 'border-blue-200 dark:border-blue-800'
            }`}
            onClick={() => onSelectAnswer(answerLabels[index])}
          >
            <span className="text-lg font-medium mr-4 shrink-0">
              {answerLabels[index]}
            </span>
            <span className="flex-grow">{option}</span>
            {(showCorrectAnswer && answerLabels[index] === question.answer) ||
              (selectedAnswer === answerLabels[index] && (
                <Check className="ml-2 shrink-0 text-white" size={20} />
              ))}
            {showCorrectAnswer &&
              selectedAnswer === answerLabels[index] &&
              selectedAnswer !== question.answer && (
                <X className="ml-2 shrink-0 text-white" size={20} />
              )}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default function Quiz({
  questions,
  clearPDF,
  title = "Quiz",
  regenerateQuiz = () => {},
  isGenerating = false,
}: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(
    Array(questions.length).fill(null),
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minuti in secondi

  // Timer per il progresso delle domande
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress((currentQuestionIndex / questions.length) * 100);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentQuestionIndex, questions.length]);
  
  // Timer di 30 minuti
  useEffect(() => {
    if (isSubmitted) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isSubmitted]);

  const handleSelectAnswer = (answer: string) => {
    if (!isSubmitted) {
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = answer;
      setAnswers(newAnswers);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    const correctAnswers = questions.reduce((acc, question, index) => {
      return acc + (question.answer === answers[index] ? 1 : 0);
    }, 0);
    setScore(correctAnswers);
  };

  const handleReset = () => {
    setAnswers(Array(questions.length).fill(null));
    setIsSubmitted(false);
    setScore(null);
    setCurrentQuestionIndex(0);
    setProgress(0);
    setTimeRemaining(30 * 60); // Reset del timer a 30 minuti
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-blue-950 dark:to-gray-900 text-foreground">
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-700 dark:text-blue-400">
          {title}
        </h1>
        <div className="relative">
          {!isSubmitted && <Progress value={progress} className="h-1 mb-8" />}
          <div className="min-h-[400px]">
            {" "}
            {/* Prevent layout shift */}
            <AnimatePresence mode="wait">
              <motion.div
                key={isSubmitted ? "results" : currentQuestionIndex}
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {!isSubmitted ? (
                  <div className="space-y-8">
                    <QuestionCard
                      question={currentQuestion}
                      selectedAnswer={answers[currentQuestionIndex]}
                      onSelectAnswer={handleSelectAnswer}
                      isSubmitted={isSubmitted}
                      showCorrectAnswer={false}
                    />
                    <div className="flex justify-between items-center pt-4">
                      <Button
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/50"
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" /> Precedente
                      </Button>
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-medium">
                          {currentQuestionIndex + 1} / {questions.length}
                        </span>
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">
                          Tempo: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <Button
                        onClick={handleNextQuestion}
                        disabled={answers[currentQuestionIndex] === null}
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/50"
                      >
                        {currentQuestionIndex === questions.length - 1
                          ? "Invia"
                          : "Successiva"}{" "}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <QuizScore
                      correctAnswers={score ?? 0}
                      totalQuestions={questions.length}
                    />
                    <div className="space-y-12">
                      <QuizReview questions={questions} userAnswers={answers} />
                    </div>
                    <div className="flex justify-center space-x-4 pt-4">
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300 w-full dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-300 dark:border-blue-700"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" /> Riavvia Quiz
                      </Button>
                      <Button
                        onClick={clearPDF}
                        className="bg-blue-600 hover:bg-blue-700 text-white w-full dark:bg-blue-700 dark:hover:bg-blue-600"
                      >
                        <FileText className="mr-2 h-4 w-4" /> Prova un altro PDF
                      </Button>
                    </div>
                    <div className="flex justify-center pt-4">
                      <Button
                        onClick={(e) => {
                          if (isGenerating) {
                            e.preventDefault();
                            e.stopPropagation();
                            return;
                          }
                          regenerateQuiz();
                        }}
                        className={`bg-green-600 hover:bg-green-700 text-white w-full dark:bg-green-700 dark:hover:bg-green-600 ${
                          isGenerating ? 'pointer-events-none cursor-not-allowed opacity-70' : ''
                        }`}
                        disabled={isGenerating}
                        style={{ pointerEvents: isGenerating ? 'none' : 'auto' }}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generazione in corso...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" /> Nuovo quiz con lo stesso PDF
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
