import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

const gradients = [
  'from-purple-900 via-indigo-900 to-blue-900',
  'from-indigo-900 via-blue-900 to-cyan-900',
  'from-blue-900 via-purple-900 to-pink-900',
  'from-violet-900 via-purple-900 to-indigo-900',
  'from-pink-900 via-purple-900 to-blue-900',
];

export default function WellnessPage() {
  const { user } = useAuth();
  const { wellnessQuestions, wellnessSubmissions, submitWellness } = useData();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Check for existing submission today
  const todayStr = new Date().toLocaleDateString();
  const todaysSubmission = wellnessSubmissions.find(s => {
    const subDate = new Date(s.timestamp).toLocaleDateString();
    return subDate === todayStr && s.patientId === user?.id;
  });

  // If already submitted today and not editing, show the "already done" screen
  const alreadyDoneToday = !!todaysSubmission && !isEditing;

  const totalQuestions = wellnessQuestions.length;
  const currentQuestion = wellnessQuestions[currentIndex];
  const gradientIndex = currentIndex % gradients.length;

  // Pre-fill answers if editing a previous submission
  useEffect(() => {
    if (isEditing && todaysSubmission) {
      setAnswers(todaysSubmission.answers || {});
      setCurrentIndex(0);
      setSubmitted(false);
    }
  }, [isEditing]);

  const handleAnswer = (answer) => {
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);

    setTransitioning(true);
    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(prev => prev + 1);
      }
      setTransitioning(false);
    }, 600);
  };

  const handleSubmit = () => {
    submitWellness(user?.id || 'p1', user?.name || 'Patient', answers);
    setSubmitted(true);
    // Auto-close after 2 seconds
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const isLastQuestion = currentIndex === totalQuestions - 1;
  const allAnswered = Object.keys(answers).length === totalQuestions;

  // Already completed today — show summary with edit option
  if (alreadyDoneToday) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900">
        <div className="text-center px-8 max-w-lg animate-in">
          <div className="text-7xl mb-6">✅</div>
          <h1 className="text-4xl font-bold text-white mb-3">Already Completed</h1>
          <p className="text-xl text-white/60 mb-8 font-light">
            You've already done your wellness check-in today.
          </p>

          {/* Show today's answers */}
          <div className="glass rounded-2xl p-5 mb-8 text-left">
            {Object.entries(todaysSubmission.answers).map(([qId, answer]) => {
              const q = wellnessQuestions.find(wq => String(wq.id) === String(qId));
              return (
                <div key={qId} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-sm text-white/50 truncate mr-3">{q?.question || qId}</span>
                  <span className="text-sm font-semibold text-white whitespace-nowrap">{answer}</span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full border border-white/20 transition-all"
            >
              ← Back to Dashboard
            </button>
            <button
              onClick={() => { setIsEditing(true); }}
              className="px-8 py-3 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-full border border-white/20 transition-all"
            >
              ✏️ Edit Responses
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Just submitted — show success then auto-close
  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900">
        <div className="text-center px-8 animate-in">
          <div className="text-8xl mb-8">✅</div>
          <h1 className="text-5xl font-bold text-white mb-4">All Done!</h1>
          <p className="text-2xl text-white/70 mb-6 font-light">
            Your responses have been sent to your caretaker.
          </p>
          <p className="text-white/40 text-sm">Returning to dashboard…</p>
        </div>
      </div>
    );
  }

  // No questions configured
  if (totalQuestions === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <div className="text-center px-8 animate-in">
          <div className="text-7xl mb-6">❤️</div>
          <h1 className="text-4xl font-bold text-white mb-3">No Questions Yet</h1>
          <p className="text-xl text-white/60 mb-8">Your caretaker hasn't set up wellness questions yet.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-full border border-white/20 transition-all"
          >
            ← Back to Dashboard
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
      <button
        onClick={() => navigate('/dashboard')}
        className="absolute top-6 right-6 text-white/40 hover:text-white text-sm font-medium px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
      >
        ✕ Close
      </button>

      {/* Progress bar */}
      <div className="absolute top-6 left-6 right-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-white/50 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${((currentIndex + (answers[currentQuestion?.id] ? 1 : 0)) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question counter */}
      <div className="absolute top-14 left-6 text-white/30 text-sm font-medium">
        {currentIndex + 1} of {totalQuestions}{isEditing && ' (Editing)'}
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
            {isEditing ? 'Update Check-In ✓' : 'Submit Check-In ✓'}
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
