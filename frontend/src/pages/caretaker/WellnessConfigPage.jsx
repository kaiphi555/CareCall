import { useState } from 'react';
import { useData } from '../../context/DataContext';

export default function WellnessConfigPage() {
  const { wellnessQuestions, addWellnessQuestion, removeWellnessQuestion, wellnessSubmissions } = useData();
  const [showForm, setShowForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newOptions.trim()) return;
    const options = newOptions.split(',').map(o => o.trim()).filter(Boolean);
    addWellnessQuestion(newQuestion.trim(), options);
    setNewQuestion('');
    setNewOptions('');
    setShowForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-in">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">❤️ Wellness Config</h1>
          <p className="text-white/50">Customize the wellness check-in questions your patients see</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/20"
        >
          {showForm ? '✕ Cancel' : '+ Add Question'}
        </button>
      </header>

      {/* Add question form */}
      {showForm && (
        <div className="glass rounded-2xl p-6 mb-8 animate-in">
          <h3 className="text-lg font-semibold text-white mb-4">New Wellness Question</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Question</label>
              <input
                type="text"
                value={newQuestion}
                onChange={e => setNewQuestion(e.target.value)}
                placeholder="e.g. Have you been drinking enough water?"
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 outline-none focus:border-purple-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Answer Options <span className="text-white/30">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={newOptions}
                onChange={e => setNewOptions(e.target.value)}
                placeholder="e.g. Yes, A little, No"
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 outline-none focus:border-purple-500 transition-all"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-semibold rounded-xl shadow-lg transition-all"
            >
              Add Question
            </button>
          </form>
        </div>
      )}

      {/* Current questions */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-4">Active Questions ({wellnessQuestions.length})</h2>
        <div className="space-y-3">
          {wellnessQuestions.map((q, idx) => (
            <div key={q.id} className="glass rounded-2xl p-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-400 flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div>
                  <p className="font-semibold text-white text-lg">{q.question}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {q.options.map(opt => (
                      <span key={opt} className="px-3 py-1 bg-white/5 rounded-full text-sm text-white/50 border border-white/5">
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeWellnessQuestion(q.id)}
                className="text-white/30 hover:text-red-400 transition-all text-sm font-medium px-3 py-1.5 hover:bg-red-500/10 rounded-lg flex-shrink-0"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Recent submissions */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Recent Submissions</h2>
        {wellnessSubmissions.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-white/30">No wellness submissions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {wellnessSubmissions.map(sub => (
              <div key={sub.id} className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-white">{sub.patientName}</p>
                  <p className="text-sm text-white/40">{sub.timestamp}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(sub.answers).map(([qId, answer]) => {
                    const q = wellnessQuestions.find(wq => wq.id === qId);
                    const isConcerning = ['Not well', 'No', 'A little dizzy', 'Yes, uncomfortable'].includes(answer);
                    return (
                      <div key={qId} className={`px-3 py-2 rounded-xl text-sm ${
                        isConcerning ? 'bg-red-500/10 border border-red-500/20' : 'bg-white/5'
                      }`}>
                        <p className="text-white/40 text-xs">{q?.question || qId}</p>
                        <p className={`font-medium ${isConcerning ? 'text-red-400' : 'text-white'}`}>{answer}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
