'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';
import { FaArrowRight, FaClock, FaCheckCircle, FaExclamationTriangle, FaUser, FaCheck, FaTimes } from 'react-icons/fa';
import { validateParticipantForExam, getExamQuestions, submitExamResult, Question } from './exam-actions';

export default function BitcoinExamPage() {
  const [step, setStep] = useState<'login' | 'quiz' | 'result'>('login');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [sessionYear, setSessionYear] = useState(new Date().getFullYear());
  const [participantId, setParticipantId] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [startTime, setStartTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState(21 * 60); // 21 minutes en secondes
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scoreData, setScoreData] = useState<{total: number, attendance: number, exam: number} | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmitQuiz = async () => {
    if (loading) return;
    setLoading(true);
    
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct_option_index) correctCount++;
    });

    const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
    // On passe les 'answers' à la fonction de sauvegarde
    const result = await submitExamResult(participantId, correctCount, durationSeconds, answers);
    
    if (result.success) {
      setScoreData({
        total: result.totalScore!,
        attendance: result.attendancePoints!,
        exam: result.examPoints!
      });
      setStep('result');
    } else {
      alert('Erreur: ' + result.error);
    }
    setLoading(false);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!city) {
      setError('Veuillez sélectionner votre ville.');
      setLoading(false);
      return;
    }
    
    const result = await validateParticipantForExam(email, city, sessionYear);
    if (result.success) {
      setParticipantId(result.participantId!);
      
      // CAS DÉJÀ FINI
      if (result.alreadyFinished) {
        const quizData = await getExamQuestions(); // On récupère quand même les questions pour la revue
        if (quizData.success) {
          setQuestions(quizData.questions || []);
          setAnswers(result.existingResult.answers || {});
          
          // Plus précis : on recalcule les points d'examen à partir des réponses et questions
          let examPoints = 0;
          (quizData.questions || []).forEach((q: any, idx: number) => {
            if (result.existingResult.answers?.[idx] === q.correct_option_index) examPoints += 4;
          });

          setScoreData({
            total: result.existingResult.score,
            attendance: result.existingResult.score - examPoints,
            exam: examPoints
          });

          setStep('result');
        }
      } else {
        // CAS NOUVEAU
        const quizData = await getExamQuestions();
        if (quizData.success && quizData.questions && quizData.questions.length > 0) {
          setQuestions(quizData.questions);
          setStep('quiz');
          setStartTime(Date.now());
        } else {
          setError('Aucune question disponible.');
        }
      }
    } else {
      setError(result.error || 'Erreur d\'identification.');
    }
    setLoading(false);
  };

  // Gestion du timer
  useEffect(() => {
    if (step === 'quiz' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (step === 'login') {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 bg-[#0F172A50] border border-white/10 shadow-glass">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#53CB6010] rounded-full flex items-center justify-center text-[#53CB60] text-3xl mx-auto mb-4"><FaUser /></div>
            <h1 className="text-3xl font-black text-white tracking-tight">Identification</h1>
            <p className="text-gray-400 mt-2">Accédez à votre session d'examen</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Adresse E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-4 text-white focus:border-[#53CB60] transition-colors outline-none"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Ville</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-4 text-white focus:border-[#53CB60] transition-colors outline-none"
                required
              >
                <option value="">Sélectionnez votre ville</option>
                <option value="Cotonou">Cotonou</option>
                <option value="Porto Novo">Porto Novo</option>
                <option value="Abomey-Calavi">Abomey-Calavi</option>
                <option value="Parakou">Parakou</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Session</label>
              <select
                value={sessionYear}
                onChange={(e) => setSessionYear(Number(e.target.value))}
                className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-4 text-white focus:border-[#53CB60] transition-colors outline-none"
                required
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
              </select>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-sm text-gray-400">
              <p>📌 21 questions</p>
              <p>⏱️ 21 minutes</p>
              <p>🎯 Score sur 100 points</p>
            </div>
            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-3 text-sm"><FaExclamationTriangle />{error}</div>}
            <Button variant="primary" size="lg" className="w-full py-4 font-bold rounded-full" type="submit" disabled={loading}>
              {loading ? 'Vérification...' : 'Lancer le Chrono'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  if (step === 'quiz') {
    const q = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-[#020617] p-4 md:p-8 flex flex-col items-center">
        <div className="max-w-3xl w-full">
          <div className="flex justify-between items-center mb-4 text-gray-400 text-sm font-bold">
            <span className="bg-white/5 px-4 py-2 rounded-full">Question {currentQuestionIndex + 1} / {questions.length}</span>
            <div className={`flex items-center gap-2 px-6 py-2 rounded-full border transition-colors ${timeLeft < 60 ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' : 'bg-[#53CB6010] border-[#53CB6030] text-[#53CB60]'}`}>
              <FaClock /> {formatTime(timeLeft)}
            </div>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full mb-12 overflow-hidden shadow-inner">
            <div className="h-full bg-[#53CB60] transition-all duration-300 shadow-[0_0_15px_#53CB60]" style={{ width: `${progress}%` }} />
          </div>
          <Card className="p-10 bg-[#0F172A50] border border-white/10 mb-8 backdrop-blur-sm relative">
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-brand-green text-[#020617] rounded-xl flex items-center justify-center font-black text-xl shadow-glow rotate-[-10deg]">
              {currentQuestionIndex + 1}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-10 leading-tight">{q.question_text}</h2>
            <div className="grid grid-cols-1 gap-4">
              {q.options.map((option, idx) => (
                <button key={idx} onClick={() => setAnswers({ ...answers, [currentQuestionIndex]: idx })}
                  className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center gap-5 group ${answers[currentQuestionIndex] === idx ? 'bg-[#53CB6010] border-[#53CB60] text-[#53CB60] shadow-glow' : 'bg-[#020617] border-white/5 text-gray-400 hover:border-white/20'}`}>
                  <span className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-black flex-shrink-0 transition-all ${answers[currentQuestionIndex] === idx ? 'border-[#53CB60] bg-[#53CB60] text-[#020617]' : 'border-current group-hover:scale-110'}`}>{String.fromCharCode(65 + idx)}</span>
                  <span className="text-lg font-medium">{option}</span>
                </button>
              ))}
            </div>
          </Card>
          <div className="flex justify-end gap-4">
            <Button variant="primary" size="lg" onClick={nextQuestion} disabled={answers[currentQuestionIndex] === undefined || loading} className="px-14 py-5 rounded-full font-black shadow-glow group">
              {currentQuestionIndex === questions.length - 1 ? 'Terminer & Voir Score' : 'Suivant'} <FaArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'result' && scoreData) {
    return (
      <div className="min-h-screen bg-[#020617] p-8 md:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Main Score Card */}
          <Card className="p-12 bg-[#0F172A50] border border-white/10 text-center mb-12 relative overflow-hidden backdrop-blur-xl">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#53CB6008] blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full" />
             <div className="w-24 h-24 bg-[#53CB6010] rounded-full flex items-center justify-center text-[#53CB60] text-6xl mx-auto mb-8 animate-bounce shadow-glow"><FaCheckCircle /></div>
             <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">Félicitations !</h1>
             <p className="text-xl text-gray-400 mb-10">Votre évaluation est terminée. Voici le détail de votre performance.</p>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
               <div className="bg-[#020617] p-6 rounded-3xl border border-white/5">
                 <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Présence</div>
                 <div className="text-3xl font-black text-white">{scoreData.attendance} <span className="text-sm text-gray-600">/ 16</span></div>
               </div>
               <div className="bg-[#020617] p-6 rounded-3xl border border-white/5">
                 <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Examen QCM</div>
                 <div className="text-3xl font-black text-white">{scoreData.exam} <span className="text-sm text-gray-600">/ 84</span></div>
               </div>
               <div className="bg-brand-green/10 p-6 rounded-3xl border border-brand-green/20 ring-2 ring-brand-green/20">
                 <div className="text-xs font-black text-brand-green uppercase tracking-widest mb-2">Total Final</div>
                 <div className="text-5xl font-black text-brand-green">{scoreData.total} <span className="text-sm text-gray-500">/ 100</span></div>
               </div>
             </div>

             <Button variant="ghost" className="text-gray-500 hover:text-white" onClick={() => document.getElementById('review')?.scrollIntoView({behavior:'smooth'})}>
               Revoir les réponses <FaArrowRight className="ml-2 rotate-90" />
             </Button>
          </Card>

          {/* Review Section */}
          <div id="review" className="space-y-8 animate-fade-in pt-12 border-t border-white/5">
            <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-4">
              <span className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl text-[#53CB60]">?</span>
              Revue des Questions
            </h2>
            
            {questions.map((q, idx) => {
              const userAnswer = answers[idx];
              const isCorrect = userAnswer === q.correct_option_index;
              
              return (
                <div key={idx} className={`p-8 rounded-3xl border transition-all ${isCorrect ? 'bg-[#53CB6005] border-[#53CB6010]' : 'bg-red-500/05 border-red-500/10'}`}>
                  <div className="flex items-start gap-4 mb-6">
                    <span className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold ${isCorrect ? 'bg-[#53CB60] text-[#020617]' : 'bg-red-500 text-white'}`}>
                      {idx + 1}
                    </span>
                    <h3 className="text-xl font-bold text-white leading-snug">{q.question_text}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-12">
                    {q.options.map((opt, oIdx) => {
                      const isCorrectOption = oIdx === q.correct_option_index;
                      const isUserChoice = oIdx === userAnswer;
                      
                      return (
                        <div key={oIdx} className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm border ${
                          isCorrectOption ? 'bg-[#53CB6010] border-[#53CB6030] text-[#53CB60]' : 
                          isUserChoice ? 'bg-red-500/10 border-red-500/30 text-red-400' : 
                          'bg-[#020617] border-white/5 text-gray-500'
                        }`}>
                          <span className="flex items-center gap-3">
                            <span className="font-bold">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                          </span>
                          {isCorrectOption && <FaCheck className="text-xs" />}
                          {!isCorrectOption && isUserChoice && <FaTimes className="text-xs" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="py-20 text-center">
            <Button variant="primary" size="lg" className="px-12 py-5 rounded-full font-black shadow-glow" onClick={() => window.location.href = 'https://bitcoinbenin.org'}>
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
