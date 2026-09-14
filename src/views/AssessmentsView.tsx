import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Assessment, AssessmentQuestion, AssessmentSubmission, Course } from '../types';
import { 
  ClipboardCheck, 
  Clock, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Send,
  Plus,
  Trash2,
  Edit3,
  Eye,
  RotateCcw,
  Search,
  Filter,
  X,
  FileText,
  UserCheck,
  Check,
  Calendar
} from 'lucide-react';

export const AssessmentsView: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Record<string, AssessmentSubmission>>({});
  const [allSubmissions, setAllSubmissions] = useState<AssessmentSubmission[]>([]);
  
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submissionResult, setSubmissionResult] = useState<AssessmentSubmission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filtering & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [viewingSubmission, setViewingSubmission] = useState<AssessmentSubmission | null>(null);
  
  // Notification / Alert toast
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State for Creating / Editing Assessment
  const [formData, setFormData] = useState({
    title: '',
    courseId: '',
    description: '',
    type: 'Quiz' as 'Quiz' | 'Practical_Assignment' | 'Final_Project',
    durationMinutes: 60,
    totalPoints: 100,
    passPercentage: 75,
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  });

  const [formQuestions, setFormQuestions] = useState<AssessmentQuestion[]>([
    {
      id: 'q1',
      prompt: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      points: 50
    },
    {
      id: 'q2',
      prompt: '',
      type: 'open_ended',
      rubricCriteria: 'Evaluates architectural clarity and operational depth.',
      points: 50
    }
  ]);

  const canManageAssessments = hasRole(['trainer', 'admin', 'super_admin']);
  const canDeleteAssessments = hasRole(['admin', 'super_admin']);

  const loadData = async () => {
    try {
      const headers = { 'x-user-email': user?.email || '' };
      
      const [asmRes, crsRes] = await Promise.all([
        fetch('/api/assessments', { headers }),
        fetch('/api/courses', { headers })
      ]);

      if (asmRes.ok) {
        const data = await asmRes.json();
        setAssessments(data.assessments || []);
      }

      if (crsRes.ok) {
        const data = await crsRes.json();
        setCourses(data.courses || []);
        if (data.courses?.length > 0 && !formData.courseId) {
          setFormData(prev => ({ ...prev, courseId: data.courses[0].id }));
        }
      }

      // Fetch user's submissions
      if (user?.role === 'learner') {
        const subRes = await fetch('/api/assessments/submissions/my', { headers });
        if (subRes.ok) {
          const subData = await subRes.json();
          const map: Record<string, AssessmentSubmission> = {};
          (subData.submissions || []).forEach((s: AssessmentSubmission) => {
            map[s.assessmentId] = s;
          });
          setMySubmissions(map);
        }
      } else if (canManageAssessments) {
        const subRes = await fetch('/api/assessments/submissions/all', { headers });
        if (subRes.ok) {
          const subData = await subRes.json();
          setAllSubmissions(subData.submissions || []);
        }
      }
    } catch (err) {
      console.error('Failed to load assessments data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4500);
  };

  // Start exam
  const handleStart = (a: Assessment) => {
    setActiveAssessment(a);
    setAnswers({});
    setSubmissionResult(null);
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitTest = async () => {
    if (!activeAssessment || !user) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/assessments/${activeAssessment.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email
        },
        body: JSON.stringify({ answers })
      });
      
      const data = await res.json();
      if (res.ok) {
        setSubmissionResult(data.submission);
        showAlert('success', 'Assessment completed and saved successfully!');
        // Refresh submissions
        loadData();
      } else {
        showAlert('error', data.error || 'Failed to submit assessment');
      }
    } catch (err: any) {
      showAlert('error', err.message || 'Submission error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open modal to create
  const handleOpenCreateModal = () => {
    setEditingAssessment(null);
    setFormData({
      title: '',
      courseId: courses[0]?.id || '',
      description: '',
      type: 'Quiz',
      durationMinutes: 60,
      totalPoints: 100,
      passPercentage: 75,
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
    });
    setFormQuestions([
      {
        id: `q_${Date.now()}_1`,
        prompt: '',
        type: 'multiple_choice',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctOptionIndex: 0,
        points: 50
      },
      {
        id: `q_${Date.now()}_2`,
        prompt: '',
        type: 'open_ended',
        rubricCriteria: 'Assesses technical depth and architectural reasoning.',
        points: 50
      }
    ]);
    setIsCreateModalOpen(true);
  };

  // Open modal to edit
  const handleOpenEditModal = (a: Assessment) => {
    setEditingAssessment(a);
    setFormData({
      title: a.title,
      courseId: a.courseId,
      description: a.description,
      type: a.type,
      durationMinutes: a.durationMinutes,
      totalPoints: a.totalPoints,
      passPercentage: a.passPercentage,
      dueDate: a.dueDate ? a.dueDate.split('T')[0] : ''
    });
    setFormQuestions(a.questions.map(q => ({ ...q })));
    setIsCreateModalOpen(true);
  };

  // Save assessment (Create or Update)
  const handleSaveAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showAlert('error', 'Assessment title is required');
      return;
    }
    if (!formData.courseId) {
      showAlert('error', 'Please assign a course to this assessment');
      return;
    }

    const calculatedPoints = formQuestions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
    const finalPoints = calculatedPoints > 0 ? calculatedPoints : formData.totalPoints;

    const payload = {
      ...formData,
      totalPoints: finalPoints,
      questions: formQuestions
    };

    try {
      const url = editingAssessment ? `/api/assessments/${editingAssessment.id}` : '/api/assessments';
      const method = editingAssessment ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        showAlert('success', editingAssessment ? 'Assessment updated successfully' : 'Assessment created successfully');
        setIsCreateModalOpen(false);
        loadData();
      } else {
        showAlert('error', data.error || 'Failed to save assessment');
      }
    } catch (err: any) {
      showAlert('error', err.message || 'Operation failed');
    }
  };

  // Delete assessment
  const handleDeleteAssessment = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the assessment "${title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/assessments/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-email': user?.email || '' }
      });

      if (res.ok) {
        showAlert('success', `Deleted "${title}" successfully`);
        loadData();
      } else {
        const data = await res.json();
        showAlert('error', data.error || 'Failed to delete assessment');
      }
    } catch (err: any) {
      showAlert('error', err.message || 'Delete operation failed');
    }
  };

  // Form question handlers
  const handleAddQuestion = (type: 'multiple_choice' | 'open_ended') => {
    const newQ: AssessmentQuestion = type === 'multiple_choice' ? {
      id: `q_${Date.now()}`,
      prompt: '',
      type: 'multiple_choice',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctOptionIndex: 0,
      points: 25
    } : {
      id: `q_${Date.now()}`,
      prompt: '',
      type: 'open_ended',
      rubricCriteria: 'Evaluates architectural clarity and operational depth.',
      points: 25
    };
    setFormQuestions(prev => [...prev, newQ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (formQuestions.length <= 1) {
      showAlert('error', 'Assessment must have at least one question');
      return;
    }
    setFormQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateQuestion = (index: number, updates: Partial<AssessmentQuestion>) => {
    setFormQuestions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  // Filtered Assessments
  const filteredAssessments = useMemo(() => {
    return assessments.filter(a => {
      const matchesSearch = 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = selectedType === 'All' || a.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [assessments, searchQuery, selectedType]);

  return (
    <div className="space-y-6">
      {/* Toast Alert Banner */}
      {alert && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-lg transition-all ${
          alert.type === 'success' 
            ? 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-950/80 border border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {alert.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{alert.message}</span>
          </div>
          <button onClick={() => setAlert(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <ClipboardCheck className="w-7 h-7 text-emerald-400" />
            Assessments & Examinations
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Standardized technical examinations, practical architecture reviews, and verified skill evaluations.
          </p>
        </div>

        {canManageAssessments && (
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assessment</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar (Only shown when not taking active exam) */}
      {!activeAssessment && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search assessments, topics, or courses..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
            {(['All', 'Quiz', 'Practical_Assignment', 'Final_Project'] as const).map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedType === type
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* If Active Assessment in progress */}
      {activeAssessment ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {activeAssessment.type.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-500">ID: {activeAssessment.id}</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1.5">{activeAssessment.title}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{activeAssessment.courseTitle}</p>
            </div>
            <div className="text-left sm:text-right flex sm:flex-col justify-between items-center sm:items-end gap-1">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock className="w-3.5 h-3.5" />
                {activeAssessment.durationMinutes} Minutes Allotted
              </div>
              <div className="text-[11px] text-slate-400">Pass benchmark: <strong className="text-emerald-400">{activeAssessment.passPercentage}%</strong></div>
            </div>
          </div>

          {/* Submission Feedback Result */}
          {submissionResult ? (
            <div className="p-8 bg-slate-950 border border-emerald-500/30 rounded-2xl text-center space-y-4 max-w-xl mx-auto shadow-xl">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-4 ring-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Assessment Submitted Successfully</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {submissionResult.status === 'graded' 
                    ? `Grading finalized! You achieved ${submissionResult.score} out of ${submissionResult.totalPoints} points (${Math.round(((submissionResult.score || 0) / submissionResult.totalPoints) * 100)}%).` 
                    : 'Your submission contains practical architecture questions that have been routed to certified trainers for manual rubric scoring.'}
                </p>
              </div>

              {submissionResult.score !== undefined && (
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl max-w-md mx-auto flex items-center justify-around">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Score Achieved</div>
                    <div className="text-xl font-extrabold text-white mt-0.5">{submissionResult.score} / {submissionResult.totalPoints}</div>
                  </div>
                  <div className="h-8 w-px bg-slate-800" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Result</div>
                    <div className={`text-base font-bold mt-0.5 ${
                      ((submissionResult.score / submissionResult.totalPoints) * 100) >= activeAssessment.passPercentage 
                        ? 'text-emerald-400' 
                        : 'text-amber-400'
                    }`}>
                      {((submissionResult.score / submissionResult.totalPoints) * 100) >= activeAssessment.passPercentage ? 'Passed' : 'Needs Review'}
                    </div>
                  </div>
                </div>
              )}

              {submissionResult.feedback && (
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 max-w-md mx-auto text-left">
                  <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    Evaluation Feedback:
                  </div>
                  <p className="text-slate-400">{submissionResult.feedback}</p>
                </div>
              )}

              <div className="pt-3 flex justify-center gap-3">
                <button
                  onClick={() => setActiveAssessment(null)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all shadow"
                >
                  Return to Assessments
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  Please read each question carefully and provide technical, precise responses. Multiple-choice questions will be automatically graded immediately upon submission; open-ended questions will be reviewed against the rubric by certified enterprise trainers.
                </p>
              </div>

              {activeAssessment.questions.map((q, idx) => (
                <div key={q.id} className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-bold text-slate-100">
                      Question {idx + 1}: {q.prompt}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-mono shrink-0 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                      {q.points} Points
                    </span>
                  </div>

                  {q.type === 'multiple_choice' && q.options && (
                    <div className="space-y-2 mt-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = answers[q.id] === optIdx;
                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectOption(q.id, optIdx)}
                            className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center gap-3 ${
                              isSelected
                                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-200 font-medium'
                                : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'
                            }`}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                            </div>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {q.type === 'open_ended' && (
                    <div className="space-y-1.5 mt-2">
                      <textarea
                        rows={4}
                        placeholder="Write your technical explanation and architectural solution here..."
                        value={answers[q.id] || ''}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
                      />
                      {q.rubricCriteria && (
                        <p className="text-[10px] text-slate-500 italic">
                          Rubric Criteria: {q.rubricCriteria}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={() => setActiveAssessment(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-all"
                >
                  Cancel & Exit
                </button>
                <button
                  onClick={handleSubmitTest}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Evaluating & Submitting...' : 'Submit Assessment for Grading'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Assessment Cards Grid */
        <div>
          {filteredAssessments.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
              <ClipboardCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Assessments Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {searchQuery ? 'No assessments matched your query. Try resetting your search filters.' : 'There are currently no active assessments for your enrolled tracks.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAssessments.map(a => {
                const sub = mySubmissions[a.id];
                const isCompleted = !!sub;
                const submissionCount = allSubmissions.filter(s => s.assessmentId === a.id).length;

                return (
                  <div key={a.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition-all rounded-2xl p-6 flex flex-col justify-between shadow-lg relative group">
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            {a.type.replace('_', ' ')}
                          </span>
                          {isCompleted && (
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                              sub.status === 'graded' 
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}>
                              {sub.status === 'graded' ? `Graded: ${sub.score}/${sub.totalPoints}` : 'Pending Review'}
                            </span>
                          )}
                        </div>

                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" /> {a.durationMinutes} mins
                        </span>
                      </div>

                      {/* Title & Course */}
                      <h3 className="text-base font-bold text-white mt-2.5 group-hover:text-emerald-300 transition-colors">{a.title}</h3>
                      <div className="text-xs text-slate-400 mt-1 font-medium">{a.courseTitle}</div>
                      <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">{a.description}</p>
                      
                      {/* Benchmarks */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <span>Total Points: <strong className="text-slate-200">{a.totalPoints}</strong></span>
                        <span>Pass Benchmark: <strong className="text-emerald-400">{a.passPercentage}%</strong></span>
                      </div>

                      {/* Trainer stats */}
                      {canManageAssessments && (
                        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                          <span>Submissions: <strong className="text-slate-300">{submissionCount}</strong></span>
                          <span>Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">
                          {a.questions.length} Questions
                        </span>
                        
                        {/* Admin / Trainer edit & delete buttons */}
                        {canManageAssessments && (
                          <button
                            onClick={() => handleOpenEditModal(a)}
                            title="Edit Assessment"
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all ml-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canDeleteAssessments && (
                          <button
                            onClick={() => handleDeleteAssessment(a.id, a.title)}
                            title="Delete Assessment"
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {isCompleted && (
                          <button
                            onClick={() => setViewingSubmission(sub)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            <span>View Review</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleStart(a)}
                          className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow ${
                            isCompleted 
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white' 
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'
                          }`}
                        >
                          {isCompleted ? (
                            <>
                              <RotateCcw className="w-3 h-3" />
                              <span>Retake</span>
                            </>
                          ) : (
                            <>
                              <span>Begin Exam</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Submission Review Modal */}
      {viewingSubmission && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Submission Review</h3>
                <p className="text-xs text-slate-400">{viewingSubmission.assessmentTitle}</p>
              </div>
              <button 
                onClick={() => setViewingSubmission(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500">Learner:</span>
                  <div className="font-semibold text-white mt-0.5">{viewingSubmission.userName}</div>
                </div>
                <div>
                  <span className="text-slate-500">Status:</span>
                  <div className={`font-bold uppercase mt-0.5 ${
                    viewingSubmission.status === 'graded' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {viewingSubmission.status}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Submitted At:</span>
                  <div className="text-slate-300 mt-0.5">{new Date(viewingSubmission.submittedAt).toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-slate-500">Score Achieved:</span>
                  <div className="font-bold text-white mt-0.5">
                    {viewingSubmission.score !== undefined ? `${viewingSubmission.score} / ${viewingSubmission.totalPoints}` : 'Pending Evaluation'}
                  </div>
                </div>
              </div>

              {viewingSubmission.feedback && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl">
                  <div className="font-semibold text-emerald-300 mb-1 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    Trainer Feedback:
                  </div>
                  <p className="text-slate-300 leading-relaxed">{viewingSubmission.feedback}</p>
                </div>
              )}

              <div>
                <span className="text-slate-400 font-semibold block mb-2">Recorded Answers:</span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {Object.entries(viewingSubmission.answers).map(([key, val]) => (
                    <div key={key} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">{key}</span>
                      <p className="text-slate-300 mt-0.5">
                        {typeof val === 'number' ? `Selected Option Index: ${val}` : String(val)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setViewingSubmission(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-all"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Assessment Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingAssessment ? 'Edit Assessment' : 'Create New Assessment'}
                </h3>
                <p className="text-xs text-slate-400">
                  Configure questions, duration, grading rubric, and pass benchmarks.
                </p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAssessment} className="space-y-4 text-xs">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Assessment Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed Systems Architecture Examination"
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Associated Course *</label>
                  <select
                    value={formData.courseId}
                    onChange={e => setFormData(prev => ({ ...prev, courseId: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Assessment Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Quiz">Quiz</option>
                    <option value="Practical_Assignment">Practical Assignment</option>
                    <option value="Final_Project">Final Project</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Provide context and examination instructions..."
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min={5}
                    max={360}
                    value={formData.durationMinutes}
                    onChange={e => setFormData(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Pass Benchmark (%)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={formData.passPercentage}
                    onChange={e => setFormData(prev => ({ ...prev, passPercentage: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Questions Builder */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white">Questions & Scoring Rubric</h4>
                    <p className="text-[11px] text-slate-500">Add multiple-choice or practical open-ended questions.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('multiple_choice')}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Multiple Choice
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('open_ended')}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Open Ended
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {formQuestions.map((q, idx) => (
                    <div key={q.id || idx} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-300">Question {idx + 1} ({q.type.replace('_', ' ')})</span>
                        <div className="flex items-center gap-2">
                          <label className="text-slate-500 text-[11px]">Points:</label>
                          <input
                            type="number"
                            min={1}
                            value={q.points}
                            onChange={e => handleUpdateQuestion(idx, { points: Number(e.target.value) })}
                            className="w-16 px-2 py-1 bg-slate-900 border border-slate-800 rounded text-white text-center"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(idx)}
                            className="p-1 text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="Enter the question prompt..."
                        value={q.prompt}
                        onChange={e => handleUpdateQuestion(idx, { prompt: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                      />

                      {q.type === 'multiple_choice' && q.options && (
                        <div className="space-y-2 pt-1">
                          <span className="text-[11px] text-slate-500">Options (Select the radio button for the correct answer):</span>
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct_${idx}`}
                                checked={q.correctOptionIndex === oIdx}
                                onChange={() => handleUpdateQuestion(idx, { correctOptionIndex: oIdx })}
                                className="text-emerald-600 focus:ring-0"
                              />
                              <input
                                type="text"
                                placeholder={`Option ${oIdx + 1}`}
                                value={opt}
                                onChange={e => {
                                  const newOptions = [...(q.options || [])];
                                  newOptions[oIdx] = e.target.value;
                                  handleUpdateQuestion(idx, { options: newOptions });
                                }}
                                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-white text-xs"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {q.type === 'open_ended' && (
                        <div>
                          <label className="text-[11px] text-slate-500 block mb-1">Grading Rubric Criteria:</label>
                          <input
                            type="text"
                            placeholder="e.g. Evaluates error handling and idempotency"
                            value={q.rubricCriteria || ''}
                            onChange={e => handleUpdateQuestion(idx, { rubricCriteria: e.target.value })}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-white text-xs"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-900/30"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingAssessment ? 'Update Assessment' : 'Publish Assessment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
