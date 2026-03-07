import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { mockPatient } from '../../data/mockData';

const gradients = [
  'from-purple-900 via-indigo-900 to-blue-900',
  'from-indigo-900 via-blue-900 to-cyan-900',
  'from-blue-900 via-purple-900 to-pink-900',
  'from-violet-900 via-purple-900 to-indigo-900',
  'from-pink-900 via-purple-900 to-blue-900',
];

export default function WellnessPage() {
  const { wellnessQuestions, submitWellness } = useData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const totalQuestions = wellnessQuestions.length;
  const currentQuestion = wellnessQuestions[currentIndex];
  const gradientIndex = currentIndex % gradients.length;

  const handleAnswer = (answer) => {
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);

    // Auto-advance after short delay
    setTransitioning(true);
    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(prev => prev + 1);
      }
      setTransitioning(false);
    }, 600);
  };

  const handleSubmit = () => {
    submitWellness(mockPatient.id, mockPatient.name, answers);
    setSubmitted(true);
  };

  const isLastQuestion = currentIndex === totalQuestions - 1;
  const allAnswered = Object.keys(answers).length === totalQuestions;

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900">
        <div className="text-center px-8 animate-in">
          <div className="text-8xl mb-8">✅</div>
          <h1 className="text-5xl font-bold text-white mb-4">All Done!</h1>
          <p className="text-2xl text-white/70 mb-10 font-light">
            Your responses have been sent to your caretaker.
          </p>
          <button
            onClick={() => { setAnswers({}); setCurrentIndex(0); setSubmitted(false); }}
            className="px-8 py-4 bg-white/15 hover:bg-white/25 text-white text-lg font-semibold rounded-full border border-white/20 transition-all"
          >
            Start a New Check-In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br ${gradients[gradientIndex]} transition-all duration-700 ease-in-out`}
    >
      {/* Close button */}
      <a
        href="/dashboard"
        className="absolute top-6 right-6 text-white/40 hover:text-white text-sm no-underline font-medium px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
      >
        ✕ Close
      </a>

      {/* Progress bar */}
      <div className="absolute top-6 left-6 right-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-white/50 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${((currentIndex + (answers[currentQuestion?.id] ? 1 : 0)) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question counter */}
      <div className="absolute top-14 left-6 text-white/30 text-sm font-medium">
        {currentIndex + 1} of {totalQuestions}
      </div>

      {/* Question */}
      <div
        className={`text-center px-8 max-w-3xl transition-all duration-500 ${
          transitioning ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'
        }`}
      >
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-16">
          {currentQuestion?.question}
        </h1>

        {/* Answer buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          {currentQuestion?.options.map(opt => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              className={`px-8 sm:px-12 py-5 sm:py-6 rounded-2xl text-xl sm:text-2xl font-semibold transition-all duration-300 ${
                answers[currentQuestion.id] === opt
                  ? 'bg-white text-gray-900 shadow-2xl scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/10 hover:border-white/30 hover:scale-105'
              }`}
              aria-pressed={answers[currentQuestion?.id] === opt}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-10 flex items-center gap-4">
        {currentIndex > 0 && (
          <button
            onClick={() => setCurrentIndex(prev => prev - 1)}
            className="px-6 py-3 text-white/50 hover:text-white font-medium transition-all"
          >
            ← Previous
          </button>
        )}
        {isLastQuestion && allAnswered && (
          <button
            onClick={handleSubmit}
            className="px-10 py-4 bg-white text-gray-900 text-lg font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-0.5"
          >
            Submit Check-In ✓
          </button>
        )}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-4 flex gap-2">
        {wellnessQuestions.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentIndex ? 'bg-white w-6' : i < currentIndex ? 'bg-white/50' : 'bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
