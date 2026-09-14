import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Course } from '../types';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Clock, 
  Star, 
  Layers, 
  Check, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface CoursesViewProps {
  onAskAi: (courseId: string) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({ onAskAi }) => {
  const { user, role, hasRole } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // New course form
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCategory, setNewCategory] = useState('Cloud Engineering');
  const [newLevel, setNewLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Executive'>('Intermediate');
  const [newDuration, setNewDuration] = useState(30);
  const [newDescription, setNewDescription] = useState('');

  const loadCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCode) return;

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({
          title: newTitle,
          code: newCode,
          category: newCategory,
          level: newLevel,
          durationHours: newDuration,
          description: newDescription,
          modules: [
            {
              id: `mod_${Date.now()}`,
              title: 'Module 1: Foundations & Architecture',
              description: 'Initial foundational curriculum overview.',
              order: 1,
              lessons: [
                {
                  id: `les_${Date.now()}_1`,
                  title: 'Core Concepts & Principles',
                  description: 'Detailed introduction to core concepts.',
                  durationMinutes: 45,
                  content: 'Comprehensive lesson content exploring fundamentals.',
                  order: 1
                }
              ]
            }
          ]
        })
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewTitle('');
        setNewCode('');
        setNewDescription('');
        loadCourses();
      }
    } catch (e) {
      console.error('Failed to create course:', e);
    }
  };

  const categories = ['All', 'Cloud Engineering', 'Artificial Intelligence', 'Security & Compliance'];

  const filtered = courses.filter(c => {
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesQuery = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const canCreate = hasRole(['trainer', 'admin', 'super_admin']);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Curriculum & Course Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise capacity curricula, structured module blueprints, and accredited syllabi.
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            Author New Course
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search catalog by title, code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((course) => {
          const isExpanded = expandedCourseId === course.id;
          const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);

          return (
            <div
              key={course.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col hover:border-slate-700 transition-all shadow-lg"
            >
              <div className="h-40 relative overflow-hidden bg-slate-950">
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur border border-slate-800 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold text-emerald-400">
                  {course.code}
                </div>
                <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur border border-slate-800 px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-200">
                  {course.level}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                    <span>{course.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" /> {course.rating}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white line-clamp-1">{course.title}</h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{course.description}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {course.durationHours} Hours
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      {course.modules.length} Modules ({totalLessons} Lessons)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                      className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center justify-center gap-1 transition-all"
                    >
                      <span>{isExpanded ? 'Hide Syllabus' : 'View Syllabus'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    <button
                      onClick={() => onAskAi(course.id)}
                      title="Ask AI Learning Assistant about this course"
                      className="p-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 rounded-lg text-xs transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Modules List */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3 animate-in fade-in">
                    <div className="text-xs font-bold text-slate-200">Modules & Lessons:</div>
                    {course.modules.map(m => (
                      <div key={m.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800/60 text-xs">
                        <div className="font-semibold text-emerald-300">{m.title}</div>
                        <ul className="mt-2 space-y-1 text-slate-400">
                          {m.lessons.map(l => (
                            <li key={l.id} className="flex items-center justify-between text-[11px]">
                              <span>{l.title}</span>
                              <span className="text-slate-500">{l.durationMinutes}m</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Author Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Author Enterprise Course</h3>
            <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Consensus & Raft Implementations"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    placeholder="CAP-DIS-405"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    min="5"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Cloud Engineering">Cloud Engineering</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Security & Compliance">Security & Compliance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Level</label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Syllabus Overview</label>
                <textarea
                  rows={3}
                  placeholder="Describe learning goals, practical labs, and architecture prerequisites..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
