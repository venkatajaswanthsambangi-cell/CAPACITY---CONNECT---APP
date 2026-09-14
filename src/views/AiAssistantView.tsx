import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Course, AiChatMessage } from '../types';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Lock, 
  HelpCircle, 
  BookOpen, 
  RotateCcw,
  CheckCircle2, 
  AlertCircle,
  Trash2,
  Check,
  X
} from 'lucide-react';

interface AiAssistantViewProps {
  initialCourseId?: string;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({ initialCourseId }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId || '');
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAiEnabled, setIsAiEnabled] = useState<boolean | null>(null);

  // Practice Quiz
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<any[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadSettingsAndHistory = async () => {
    try {
      const headers = { 'x-user-email': user?.email || '' };
      const [cRes, hRes, sRes] = await Promise.all([
        fetch('/api/courses', { headers }),
        fetch('/api/ai/assistant/history', { headers }),
        fetch('/api/settings', { headers })
      ]);

      if (cRes.ok) {
        const d = await cRes.json();
        setCourses(d.courses || []);
      }

      if (sRes.ok) {
        const s = await sRes.json();
        setIsAiEnabled(s.settings?.aiAssistantEnabled !== false);
      }

      if (hRes.ok) {
        const d = await hRes.json();
        if (d.messages?.length > 0) {
          setMessages(d.messages);
        } else {
          setMessages([
            {
              id: 'init_welcome',
              role: 'assistant',
              content: `Hello ${user?.name || 'Learner'}! I am the **CAPACITY CONNECT Learning & Productivity Assistant** powered by Gemini.

I can assist you with:
- **Concept Explanations**: Deep dives into cloud architecture, distributed systems, consensus algorithms, and enterprise AI.
- **Syllabus Deep Dives**: Explaining requirements and key takeaways for any enrolled course.
- **Self-Assessment**: Generating practice quiz questions to test your knowledge before exams.

*(Note: As an educational tutor, I have strict security boundaries: no administrative permissions, no database write access, and no capability to alter roles or grades.)*

How can I assist your learning today?`,
              timestamp: new Date().toISOString()
            }
          ]);
        }
      }
    } catch (e) {
      console.error('Failed to load AI data:', e);
    }
  };

  useEffect(() => {
    loadSettingsAndHistory();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isTyping || !user) return;

    const userText = inputText.trim();
    setInputText('');

    const optimisticMsg: AiChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
      contextCourseId: selectedCourseId || undefined
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email
        },
        body: JSON.stringify({
          message: userText,
          contextCourseId: selectedCourseId || undefined,
          history: messages.slice(-4)
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [
          ...prev,
          {
            id: data.messageId || `msg_asst_${Date.now()}`,
            role: 'assistant',
            content: data.reply,
            timestamp: data.timestamp || new Date().toISOString()
          }
        ]);
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'AI request failed');
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          role: 'assistant',
          content: `I encountered an issue: ${err.message || 'Unable to connect to model service'}. Please try again shortly.`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your AI tutoring conversation history?')) return;

    try {
      const res = await fetch('/api/ai/assistant/clear-history', {
        method: 'POST',
        headers: { 'x-user-email': user?.email || '' }
      });
      if (res.ok) {
        setMessages([
          {
            id: `msg_reset_${Date.now()}`,
            role: 'assistant',
            content: 'Conversation history cleared. How can I assist your study session?',
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const generatePracticeQuiz = async () => {
    setQuizLoading(true);
    setQuizModalOpen(true);
    setUserAnswers({});
    try {
      const activeCourse = courses.find(c => c.id === selectedCourseId);
      const topic = activeCourse ? `${activeCourse.title} (${activeCourse.code})` : 'Enterprise Cloud Governance & Security';

      const res = await fetch('/api/ai/assistant/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({ topic })
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedQuiz(data.quiz || []);
      }
    } finally {
      setQuizLoading(false);
    }
  };

  if (isAiEnabled === false) {
    return (
      <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">AI Learning Tutor Temporarily Disabled</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          The AI Assistant has been switched off in System Settings by an administrator. Please reach out to system governance to reactivate automated tutoring capabilities.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Top Banner with Strict Security Boundary Notice */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white">AI Learning & Productivity Assistant</h1>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono font-semibold">
                Gemini 2.5 Flash
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Strictly Sandboxed: Educational Tutor Only • No Admin Privileges • No DB Write Access</span>
            </div>
          </div>
        </div>

        {/* Course Context Switcher & Actions */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
          >
            <option value="">General Enterprise Learning</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>Context: {c.title}</option>
            ))}
          </select>

          <button
            onClick={generatePracticeQuiz}
            className="px-3.5 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Generate Quiz</span>
          </button>

          <button
            onClick={handleClearHistory}
            title="Clear Chat History"
            className="p-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-xl transition-all shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-4 shadow-inner">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                isUser ? 'bg-emerald-600 text-white' : 'bg-purple-600 text-white'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-100 rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                {m.content}
                <div className="text-[10px] text-slate-500 mt-2 text-right">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 text-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
              <span>Formulating learning response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs shrink-0">
        <span className="text-slate-500 text-[11px] font-medium shrink-0">Quick prompts:</span>
        <button
          onClick={() => setInputText('Explain the difference between 2-Phase Commit and the Raft consensus protocol.')}
          className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-[11px] whitespace-nowrap transition-colors"
        >
          2-Phase Commit vs Raft
        </button>
        <button
          onClick={() => setInputText('Summarize the top 3 best practices for Zero-Trust cloud network segmentation.')}
          className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-[11px] whitespace-nowrap transition-colors"
        >
          Zero-Trust Segmentation
        </button>
        <button
          onClick={() => setInputText('Give me a 5-step study guide to pass the Enterprise Cloud Architecture certification.')}
          className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-[11px] whitespace-nowrap transition-colors"
        >
          Certification Study Plan
        </button>
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2 shrink-0">
        <input
          type="text"
          placeholder="Ask a technical question, request syllabus explanations, or study rubrics..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isTyping}
          className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isTyping}
          className="px-5 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow"
        >
          <Send className="w-4 h-4" />
          <span>Ask Tutor</span>
        </button>
      </form>

      {/* Generated Quiz Modal */}
      {quizModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-base font-bold text-white">AI Practice Quiz & Self-Study Checkpoint</h3>
              </div>
              <button onClick={() => setQuizModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {quizLoading ? (
              <div className="p-12 text-center text-xs text-slate-400">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Generating practice assessment questions...
              </div>
            ) : (
              <div className="space-y-4">
                {generatedQuiz.map((q, idx) => {
                  const selectedOpt = userAnswers[idx];
                  const hasAnswered = selectedOpt !== undefined;
                  const isCorrect = selectedOpt === q.answer;

                  return (
                    <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs">
                      <div className="font-bold text-white leading-relaxed">
                        Q{idx + 1}: {q.question}
                      </div>

                      <div className="space-y-1.5">
                        {q.options.map((opt: string, optIdx: number) => {
                          const isOptionSelected = selectedOpt === optIdx;
                          const isOptionCorrect = optIdx === q.answer;

                          let btnStyle = 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700';
                          if (hasAnswered) {
                            if (isOptionCorrect) {
                              btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                            } else if (isOptionSelected && !isOptionCorrect) {
                              btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
                            } else {
                              btnStyle = 'bg-slate-900/40 border-slate-800/60 text-slate-500 opacity-60';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => {
                                if (!hasAnswered) {
                                  setUserAnswers(prev => ({ ...prev, [idx]: optIdx }));
                                }
                              }}
                              className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {hasAnswered && isOptionCorrect && <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
                            </button>
                          );
                        })}
                      </div>

                      {hasAnswered && q.explanation && (
                        <div className={`p-3 rounded-xl border text-[11px] leading-relaxed ${
                          isCorrect ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}>
                          <div className="font-bold mb-0.5">{isCorrect ? 'Correct!' : 'Review Feedback:'}</div>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setQuizModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Done Reviewing
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
