import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { Check, X, Award, HelpCircle, ArrowRight, RotateCcw, AlertCircle, Sparkles } from 'lucide-react';

interface QuizEngineProps {
  questions: QuizQuestion[];
  subjectName: string;
  topicName: string;
  isAiGenerated: boolean;
  onGenerateAiQuiz: () => void;
  loadingAiQuiz: boolean;
  onCompletedQuiz: (score: number) => void;
}

export default function QuizEngine({
  questions,
  subjectName,
  topicName,
  isAiGenerated,
  onGenerateAiQuiz,
  loadingAiQuiz,
  onCompletedQuiz
}: QuizEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [score, setScore] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [answersState, setAnswersState] = useState<{ [key: number]: { selectedIndex: number; correct: boolean } }>({});

  const handleSelectAnswer = (optionIndex: number) => {
    if (selectedAnswerIndex !== null) return; // Prevent double trigger
    
    setSelectedAnswerIndex(optionIndex);
    const isCorrect = optionIndex === currentQuestion.correctAnswerIndex;
    
    setAnswersState({
      ...answersState,
      [currentIndex]: { selectedIndex: optionIndex, correct: isCorrect }
    });

    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedAnswerIndex(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setHasCompleted(true);
      onCompletedQuiz(score);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedAnswerIndex(null);
    setScore(0);
    setHasCompleted(false);
    setAnswersState({});
  };

  if (questions.length === 0) {
    return (
      <div id="quiz-empty-box" className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/10">
        <HelpCircle className="mx-auto h-12 w-12 text-slate-600 stroke-[1.5]" />
        <h4 className="mt-4 font-display font-semibold text-white">No questions loaded</h4>
        <p className="mt-2 text-sm text-slate-400">Select another curriculum topic factsheet to load offline prep questions!</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isQuestionAnswered = selectedAnswerIndex !== null;

  return (
    <div id="quiz-workspace" className="max-w-2xl mx-auto rounded-3xl border border-indigo-500/30 bg-[#1E293B] p-6 shadow-2xl relative overflow-hidden">
      
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 h-48 w-48 -translate-y-24 translate-x-12 rounded-full bg-indigo-500/5 blur-3xl" />

      {/* 1. Normal Active Quiz Phase */}
      {!hasCompleted ? (
        <div id="quiz-active-block" className="space-y-6">
          {/* Header Progress info */}
          <div className="flex items-center justify-between border-b border-sidebar-700/60 border-slate-700/60 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Practice Session &middot; {subjectName}
              </span>
              <h4 className="font-display font-extrabold text-white text-lg mt-0.5 truncate max-w-sm">
                Topic: {topicName}
              </h4>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs font-semibold text-indigo-400">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <div className="h-1.5 w-24 bg-slate-950 rounded-full overflow-hidden mt-1.5">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300" 
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* AI Banner flag */}
          {isAiGenerated && (
            <div className="flex items-center gap-1.5 rounded-lg bg-teal-500/10 px-3 py-1.5 text-xs text-teal-400 font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Generated in Realtime by ScholarStep AI Tutor</span>
            </div>
          )}

          {/* Question text */}
          <div id="quiz-question-box" className="p-4 rounded-xl bg-slate-950/80 border border-[#334155]">
            <p className="text-slate-100 font-medium leading-relaxed">
              {currentQuestion.question}
            </p>
          </div>

          {/* Option cards - with 48px+ touch area constraints */}
          <div id="quiz-options-list" className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedAnswerIndex === idx;
              const isCorrectAnswer = currentQuestion.correctAnswerIndex === idx;
              
              let cardStyle = "border-[#334155] bg-slate-950/45 hover:bg-slate-950/80 text-slate-300 cursor-pointer";
              let badge = null;

              if (isQuestionAnswered) {
                if (isCorrectAnswer) {
                  // highlight emerald green if it is the correct response
                  cardStyle = "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
                  badge = <div className="h-5 w-5 flex items-center justify-center rounded-full bg-emerald-500 text-slate-100"><Check className="h-3 w-3 stroke-[3]" /></div>;
                } else if (isSelected) {
                  // crimson red if user clicked this incorrect answer
                  cardStyle = "border-rose-500/40 bg-rose-500/10 text-rose-300";
                  badge = <div className="h-5 w-5 flex items-center justify-center rounded-full bg-rose-500 text-slate-100"><X className="h-3 w-3 stroke-[3]" /></div>;
                } else {
                  cardStyle = "border-[#334155] bg-slate-950/10 opacity-50 text-slate-500";
                }
              }

              return (
                <button
                  key={idx}
                  id={`quiz-option-card-${idx}`}
                  disabled={isQuestionAnswered}
                  onClick={() => handleSelectAnswer(idx)}
                  className={`w-full flex items-center justify-between p-4 min-h-[52px] rounded-xl border text-left text-sm transition-all duration-200 outline-none ${cardStyle}`}
                >
                  <span className="font-medium pr-3">{option}</span>
                  {badge || <span className="text-[11px] font-mono text-slate-500">Option {idx + 1}</span>}
                </button>
              );
            })}
          </div>

          {/* Corrections explanation card */}
          {isQuestionAnswered && (
            <div id="quiz-explanation-box" className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 animate-fade-in space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                <AlertCircle className="h-4 w-4" />
                <span>EXPLANATION SHEET</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* Footer action trigger */}
          {isQuestionAnswered && (
            <button
              id="quiz-next-button"
              onClick={handleNext}
              className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 text-xs transition-colors shadow shadow-indigo-600/10"
            >
              <span>{currentIndex === questions.length - 1 ? "Finish & Compute Grade" : "Proceed to Next Question"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

        </div>
      ) : (
        /* 2. Results Scoring Recap Phase */
        <div id="quiz-recap-block" className="text-center space-y-6 py-6 animate-fade-in">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 animate-bounce">
            <Award className="h-10 w-10 stroke-[1.5]" />
          </div>

          <div>
            <h4 className="font-display font-extrabold text-2xl text-white">Quiz Session Completed!</h4>
            <p className="mt-1 text-sm text-slate-400">
              Your grade has been stored in your cumulative study records.
            </p>
          </div>

          {/* Grade banner circle */}
          <div className="mx-auto h-32 w-32 flex flex-col items-center justify-center rounded-full border-4 border-indigo-500 bg-indigo-950/25 p-1">
            <span className="text-3xl font-extrabold text-white">{score} / {questions.length}</span>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">CORRECT</span>
          </div>

          {/* Performance review */}
          <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-950 border border-[#334155]">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">GRADE REPORT</span>
            <p className="mt-1 text-sm text-slate-300">
              {score === questions.length 
                ? "Phenomenal! Sir Isaac Newton and Einstein are extremely proud of your flawless scientific prowess!" 
                : score >= Math.ceil(questions.length / 2)
                ? "Well done, young scholar! You possess a solid hold on this subject. Keep exploring standard factsheets."
                : "A valuable effort. Review your factsheet formulas, ask the Scholar Copilot for analogies, and try again!"}
            </p>
          </div>

          {/* CTA controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              id="quiz-retry-button"
              onClick={handleReset}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#334155] hover:bg-slate-700 text-slate-200 font-bold py-2.5 text-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Retry This Topic Quiz</span>
            </button>

            <button
              id="quiz-dynamic-ai-launch"
              disabled={loadingAiQuiz}
              onClick={onGenerateAiQuiz}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800/55 text-white font-bold py-2.5 text-xs transition-colors shadow-lg shadow-teal-600/10 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>{loadingAiQuiz ? "Synthesizing AI Quiz..." : "Load Custom AI Quiz"}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
