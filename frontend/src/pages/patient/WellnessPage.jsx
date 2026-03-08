import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { analyzeWellness } from '../../services/api';

const gradients = [
  'from-purple-900 via-indigo-900 to-blue-900',
  'from-indigo-900 via-blue-900 to-cyan-900',
  'from-blue-900 via-purple-900 to-pink-900',
  'from-violet-900 via-purple-900 to-indigo-900',
  'from-pink-900 via-purple-900 to-blue-900',
];

const moodEmojis = ['😰', '😟', '😕', '😐', '🙂', '😊', '😄', '😁', '🥰', '🌟'];

export default function WellnessPage() {
  const { user } = useAuth();
  const { wellnessQuestions, wellnessSubmissions, submitWellness } = useData();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Check for existing submission today
  const todayStr = new Date().toLocaleDateString();
  const todaysSubmission = wellnessSubmissions.find(s => {
    const subDate = new Date(s.timestamp).toLocaleDateString();
    return subDate === todayStr && s.patientId === user?.id;
  });

  const alreadyDoneToday = !!todaysSubmission && !isEditing;

  const totalQuestions = wellnessQuestions.length;
  const currentQuestion = wellnessQuestions[currentIndex];
  const gradientIndex = currentIndex % gradients.length;

  useEffect(() => {
    if (isEditing && todaysSubmission) {
      setAnswers(todaysSubmission.answers || {});
      setCurrentIndex(0);
      setSubmitted(false);
      setAiFeedback(null);
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

  const handleSubmit = async () => {
    // Submit to Supabase
    submitWellness(user?.id || 'p1', user?.name || 'Patient', answers);
    setSubmitted(true);
    setAnalyzing(true);

    // Build Q&A pairs for Gemini
    const questionsAndAnswers = Object.entries(answers).map(([qId, answer]) => {
      const q = wellnessQuestions.find(wq => String(wq.id) === String(qId));
      return { question: q?.question || qId, answer };
    });

    // Call Gemini analysis
    try {
      const result = await analyzeWellness({
        patientName: user?.name || 'Patient',
        questionsAndAnswers,
      });
      setAiFeedback(result);
    } catch (err) {
      console.error('AI analysis failed:', err);
      setAiFeedback({
        feedback: 'Thank you for completing your check-in today! Your responses have been recorded.',
        mood_score: 5,
        alert_caretaker: false,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const isLastQuestion = currentIndex === totalQuestions - 1;
  const allAnswered = Object.keys(answers).length === totalQuestions;

  // Already completed today
  if (alreadyDoneToday) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900">
        <div className="text-center px-8 max-w-lg animate-in">
          <div className="text-7xl mb-6">✅</div>
          <h1 className="text-4xl font-bold text-white mb-3">Already Completed</h1>
          <p className="text-xl text-white/60 mb-8 font-light">
            You've already done your wellness check-in today.
          </p>

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
            <button onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full border border-white/20 transition-all">
              ← Back to Dashboard
            </button>
            <button onClick={() => setIsEditing(true)}
              className="px-8 py-3 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-full border border-white/20 transition-all">
              ✏️ Edit Responses
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Submitted — show AI feedback
  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900">
        <div className="text-center px-8 max-w-lg animate-in">
          {analyzing ? (
            <>
              <div className="text-7xl mb-6 animate-pulse">🧠</div>
              <h1 className="text-4xl font-bold text-white mb-4">Analyzing...</h1>
              <p className="text-xl text-white/60 font-light">Our AI is reviewing your responses</p>
            </>
          ) : (
            <>
              {/* Mood emoji */}
              <div className="text-8xl mb-6">
                {moodEmojis[Math.min(Math.max((aiFeedback?.mood_score || 5) - 1, 0), 9)]}
              </div>

              <h1 className="text-4xl font-bold text-white mb-4">All Done!</h1>

              {/* AI Feedback */}
              {aiFeedback?.feedback && (
                <div className="glass rounded-2xl p-6 mb-6 text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">✨</span>
                    <span className="text-sm font-semibold text-white/60 uppercase tracking-wide">AI Health Insight</span>
                  </div>
                  <p className="text-lg text-white/90 leading-relaxed">{aiFeedback.feedback}</p>
                </div>
              )}

              {/* Mood score bar */}
              {aiFeedback?.mood_score && (
                <div className="glass rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/50">Wellness Score</span>
                    <span className="text-lg font-bold text-white">{aiFeedback.mood_score}/10</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        aiFeedback.mood_score >= 7 ? 'bg-emerald-400' :
                        aiFeedback.mood_score >= 4 ? 'bg-amber-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${aiFeedback.mood_score * 10}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Alert notice */}
              {aiFeedback?.alert_caretaker && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 mb-6 text-left">
                  <p className="text-sm text-amber-400 font-medium">
                    🔔 Your caretaker has been notified: {aiFeedback.alert_reason}
                  </p>
                </div>
              )}

              <button onClick={() => navigate('/dashboard')}
                className="px-10 py-4 bg-white/15 hover:bg-white/25 text-white text-lg font-semibold rounded-full border border-white/20 transition-all">
                Back to Dashboard →
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // No questions
  if (totalQuestions === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <div className="text-center px-8 animate-in">
          <div className="text-7xl mb-6">❤️</div>
          <h1 className="text-4xl font-bold text-white mb-3">No Questions Yet</h1>
          <p className="text-xl text-white/60 mb-8">Your caretaker hasn't set up wellness questions yet.</p>
          <button onClick={() => navigate('/dashboard')}
            className="px-8 py-3 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-full border border-white/20 transition-all">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Questionnaire
  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br ${gradients[gradientIndex]} transition-all duration-700 ease-in-out`}>
      <button onClick={() => navigate('/dashboard')}
        className="absolute top-6 right-6 text-white/40 hover:text-white text-sm font-medium px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
        ✕ Close
      </button>

      <div className="absolute top-6 left-6 right-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-white/50 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${((currentIndex + (answers[currentQuestion?.id] ? 1 : 0)) / totalQuestions) * 100}%` }} />
      </div>

      <div className="absolute top-14 left-6 text-white/30 text-sm font-medium">
        {currentIndex + 1} of {totalQuestions}{isEditing && ' (Editing)'}
      </div>

      <div className={`text-center px-8 max-w-3xl transition-all duration-500 ${transitioning ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-16">
          {currentQuestion?.question}
        </h1>

        <div className="flex flex-wrap justify-center gap-4">
          {currentQuestion?.options.map(opt => (
            <button key={opt} onClick={() => handleAnswer(opt)}
              className={`px-8 sm:px-12 py-5 sm:py-6 rounded-2xl text-xl sm:text-2xl font-semibold transition-all duration-300 ${
                answers[currentQuestion.id] === opt
                  ? 'bg-white text-gray-900 shadow-2xl scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/10 hover:border-white/30 hover:scale-105'
              }`}
              aria-pressed={answers[currentQuestion?.id] === opt}>
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="absolute bottom-10 flex items-center gap-4">
        {currentIndex > 0 && (
          <button onClick={() => setCurrentIndex(prev => prev - 1)}
            className="px-6 py-3 text-white/50 hover:text-white font-medium transition-all">
            ← Previous
          </button>
        )}
        {isLastQuestion && allAnswered && (
          <button onClick={handleSubmit}
            className="px-10 py-4 bg-white text-gray-900 text-lg font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-0.5">
            {isEditing ? 'Update Check-In ✓' : 'Submit Check-In ✓'}
          </button>
        )}
      </div>

      <div className="absolute bottom-4 flex gap-2">
        {wellnessQuestions.map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full transition-all ${
            i === currentIndex ? 'bg-white w-6' : i < currentIndex ? 'bg-white/50' : 'bg-white/20'
          }`} />
        ))}
      </div>
    </div>
  );
}
