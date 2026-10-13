import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import {
  CheckSquare,
  Plus,
  Flame,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  X,
  Edit,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  User,
  Sparkles,
  Tag,
  ListTodo,
  Columns,
  Trophy,
  AlertCircle,
  SlidersHorizontal,
  CornerDownLeft,
} from 'lucide-react';

const TEAM_MEMBERS = {
  emmanuel: {
    label: 'Emmanuel',
    role: 'Founder & Tech Lead',
    color: '#0E7490',
    bg: '#F0FDFA',
    border: '#CCFBF1',
    avatarBg: 'linear-gradient(135deg, #0E7490 0%, #06B6D4 100%)',
    initial: 'E',
  },
  juan_pablo: {
    label: 'Juan Pablo',
    role: 'Co-Founder & Growth',
    color: '#1D4ED8',
    bg: '#EFF6FF',
    border: '#DBEAFE',
    avatarBg: 'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)',
    initial: 'JP',
  },
  curiel: {
    label: 'Curiel',
    role: 'Co-Founder & Operations',
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    avatarBg: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
    initial: 'C',
  },
  all: {
    label: 'Equipo Conjunto',
    role: 'Todos los Fundadores',
    color: '#047857',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    avatarBg: 'linear-gradient(135deg, #047857 0%, #10B981 100%)',
    initial: 'HX',
  },
};

const PRIORITY_CONFIG = {
  urgent: {
    label: 'Urgente 🔥',
    bg: '#FEF2F2',
    color: '#DC2626',
    border: '#FECACA',
    badgeBg: 'rgba(239, 68, 68, 0.1)',
  },
  high: {
    label: 'Alta',
    bg: '#FFF7ED',
    color: '#C2410C',
    border: '#FFEDD5',
    badgeBg: 'rgba(249, 115, 22, 0.1)',
  },
  medium: {
    label: 'Media',
    bg: '#EFF6FF',
    color: '#1D4ED8',
    border: '#DBEAFE',
    badgeBg: 'rgba(59, 130, 246, 0.1)',
  },
  low: {
    label: 'Baja',
    bg: '#F9FAFB',
    color: '#4B5563',
    border: '#E5E7EB',
    badgeBg: 'rgba(107, 114, 128, 0.1)',
  },
};

const STATUS_COLUMNS = [
  { id: 'todo', title: 'Por Hacer', color: '#4B5563', bg: '#F9FAFB', border: '#E5E7EB' },
  { id: 'in_progress', title: 'En Progreso', color: '#1D4ED8', bg: '#EFF6FF', border: '#DBEAFE' },
  { id: 'review', title: 'En Revisión', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  { id: 'done', title: 'Completadas', color: '#047857', bg: '#ECFDF5', border: '#A7F3D0' },
];

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [assignedFilter, setAssignedFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Quick capture state
  const [quickTitle, setQuickTitle] = useState('');
  const [quickAssignee, setQuickAssignee] = useState('emmanuel');
  const [quickPriority, setQuickPriority] = useState('medium');
  const [quickCategory, setQuickCategory] = useState('Comercial');
  const [quickSubmitting, setQuickSubmitting] = useState(false);

  // Full Task Modal state
  const [showModal, setShowModal] = useState(false);
  const [closingModal, setClosingModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [formError, setFormError] = useState('');

  // Checklist item helper in modal
  const [newChecklistText, setNewChecklistText] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: 'emmanuel',
    priority: 'medium',
    status: 'todo',
    category: 'Comercial',
    dueDate: '',
    checklist: [],
  });

  const fetchTasks = async () => {
    try {
      const res = await api.get('/admin/tasks');
      setTasks(res.data || []);
    } catch (err) {
      console.error('Error al cargar tareas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Quick Task Creation
  const handleQuickCreate = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    setQuickSubmitting(true);
    try {
      const res = await api.post('/admin/tasks', {
        title: quickTitle.trim(),
        assignedTo: quickAssignee,
        priority: quickPriority,
        category: quickCategory,
        status: 'todo',
        checklist: [],
      });
      setTasks((prev) => [res.data, ...prev]);
      setQuickTitle('');
      showToast('⚡ Tarea agregada exitosamente');
    } catch (err) {
      console.error('Error al crear tarea rápida:', err);
    } finally {
      setQuickSubmitting(false);
    }
  };

  // Open Edit / Create Full Modal
  const openCreateModal = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      assignedTo: assignedFilter !== 'all' ? assignedFilter : 'emmanuel',
      priority: 'medium',
      status: 'todo',
      category: 'Comercial',
      dueDate: '',
      checklist: [],
    });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      assignedTo: task.assignedTo || 'emmanuel',
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      category: task.category || 'Comercial',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      checklist: Array.isArray(task.checklist) ? task.checklist : [],
    });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setClosingModal(false);
      setEditingTask(null);
      setNewChecklistText('');
    }, 200);
  };

  // Handle Full Form Save
  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('El título de la tarea es requerido.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        assignedTo: formData.assignedTo,
        priority: formData.priority,
        status: formData.status,
        category: formData.category.trim() || 'General',
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        checklist: formData.checklist,
      };

      if (editingTask) {
        const res = await api.put(`/admin/tasks/${editingTask.id}`, payload);
        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? res.data : t)));
        showToast('Tarea actualizada correctamente');
      } else {
        const res = await api.post('/admin/tasks', payload);
        setTasks((prev) => [res.data, ...prev]);
        showToast('Tarea creada correctamente');
      }
      closeModal();
    } catch (err) {
      console.error('Error al guardar tarea:', err);
      setFormError(err.response?.data?.error || 'Error al guardar tarea.');
    } finally {
      setSubmitting(false);
    }
  };

  // Fast Status Change (Next / Prev column)
  const handleMoveStatus = async (task, direction) => {
    const order = ['todo', 'in_progress', 'review', 'done'];
    const currentIndex = order.indexOf(task.status);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0 || nextIndex >= order.length) return;

    const nextStatus = order[nextIndex];

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );

    try {
      const res = await api.put(`/admin/tasks/${task.id}`, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? res.data : t)));
    } catch (err) {
      console.error('Error al cambiar status:', err);
      fetchTasks();
    }
  };

  // Fast toggle Done / Todo
  const handleToggleDone = async (task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await api.put(`/admin/tasks/${task.id}`, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? res.data : t)));
      if (newStatus === 'done') {
        showToast('🎉 ¡Tarea completada!');
      }
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      fetchTasks();
    }
  };

  // Fast Reassign
  const handleQuickReassign = async (task, newAssignee) => {
    if (task.assignedTo === newAssignee) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, assignedTo: newAssignee } : t))
    );

    try {
      const res = await api.put(`/admin/tasks/${task.id}`, { assignedTo: newAssignee });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? res.data : t)));
      showToast(`Tarea reasignada a ${TEAM_MEMBERS[newAssignee]?.label}`);
    } catch (err) {
      console.error('Error al reasignar:', err);
      fetchTasks();
    }
  };

  // Fast Toggle Checklist Item on card
  const handleToggleChecklistItem = async (task, itemIndex) => {
    const currentList = Array.isArray(task.checklist) ? [...task.checklist] : [];
    if (!currentList[itemIndex]) return;

    currentList[itemIndex].done = !currentList[itemIndex].done;

    // Optimistic
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, checklist: currentList } : t))
    );

    try {
      const res = await api.put(`/admin/tasks/${task.id}`, { checklist: currentList });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? res.data : t)));
    } catch (err) {
      console.error('Error al actualizar checklist:', err);
      fetchTasks();
    }
  };

  // Delete Task
  const handleDeleteTask = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta tarea?')) return;
    try {
      await api.delete(`/admin/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      showToast('Tarea eliminada.');
    } catch (err) {
      console.error('Error al eliminar tarea:', err);
    }
  };

  // Checklist Helpers in Modal
  const addChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    const newItem = {
      id: Date.now().toString(),
      text: newChecklistText.trim(),
      done: false,
    };
    setFormData((prev) => ({
      ...prev,
      checklist: [...prev.checklist, newItem],
    }));
    setNewChecklistText('');
  };

  const removeChecklistItem = (idx) => {
    setFormData((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((_, i) => i !== idx),
    }));
  };

  // Founder Statistics & Gamification
  const founderStats = useMemo(() => {
    const members = ['emmanuel', 'juan_pablo', 'curiel'];
    const stats = {};

    members.forEach((m) => {
      const memberTasks = tasks.filter((t) => t.assignedTo === m);
      const total = memberTasks.length;
      const done = memberTasks.filter((t) => t.status === 'done').length;
      const pending = total - done;
      const urgent = memberTasks.filter((t) => t.status !== 'done' && t.priority === 'urgent').length;
      const percent = total > 0 ? Math.round((done / total) * 100) : 0;

      stats[m] = {
        total,
        done,
        pending,
        urgent,
        percent,
      };
    });

    return stats;
  }, [tasks]);

  // Categories list
  const availableCategories = useMemo(() => {
    const set = new Set(['Comercial', 'Desarrollo', 'Operaciones', 'Clientes', 'Estrategia']);
    tasks.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [tasks]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (assignedFilter !== 'all' && t.assignedTo !== assignedFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = t.title?.toLowerCase().includes(query);
        const matchesDesc = t.description?.toLowerCase().includes(query);
        const matchesCat = t.category?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }
      return true;
    });
  }, [tasks, assignedFilter, priorityFilter, categoryFilter, searchTerm]);

  return (
    <Layout>
      <div
        className="fade-in-up"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          marginTop: '-12px',
          paddingBottom: '60px',
        }}
      >
        {/* Toast Notification */}
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 20px',
              background: '#111827',
              color: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
              fontSize: '13.5px',
              fontWeight: 600,
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <Sparkles size={16} color="#00C4CC" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ── HEADER & ACCIÓN PRINCIPAL ────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #00C4CC 0%, #0099A8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 12px rgba(0, 196, 204, 0.3)',
                }}
              >
                <CheckSquare size={18} />
              </div>
              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#111827',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                Tareas Core HummingX
              </h1>
            </div>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
              Gestor colaborativo y ágil para los fundadores (Emmanuel, Juan Pablo & Curiel).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* View Mode Toggle */}
            <div
              style={{
                display: 'inline-flex',
                background: '#F3F4F6',
                padding: '3px',
                borderRadius: '10px',
                border: '1px solid #E5E7EB',
              }}
            >
              <button
                onClick={() => setViewMode('kanban')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  background: viewMode === 'kanban' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'kanban' ? '#111827' : '#6B7280',
                  fontWeight: 600,
                  fontSize: '12.5px',
                  boxShadow: viewMode === 'kanban' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Columns size={14} />
                Kanban
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  background: viewMode === 'list' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'list' ? '#111827' : '#6B7280',
                  fontWeight: 600,
                  fontSize: '12.5px',
                  boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <ListTodo size={14} />
                Lista
              </button>
            </div>

            <button
              onClick={openCreateModal}
              className="btn-accent"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '13.5px',
                boxShadow: '0 4px 14px rgba(0, 196, 204, 0.25)',
              }}
            >
              <Plus size={16} />
              Nueva Tarea Completa
            </button>
          </div>
        </div>

        {/* ── BARRA DE CAPTURA RÁPIDA (LINEAR / SUPERHUMAN STYLE) ────────── */}
        <form
          onSubmit={handleQuickCreate}
          className="card"
          style={{
            padding: '14px 18px',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 300px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669',
                flexShrink: 0,
              }}
            >
              <Plus size={16} />
            </div>
            <input
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="Captura rápida: ej. 'Cerrar contrato con Tahara Café y programar kickoff' (Presiona Enter)..."
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                fontWeight: 500,
                color: '#111827',
                background: 'transparent',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Quick Assignee */}
            <select
              value={quickAssignee}
              onChange={(e) => setQuickAssignee(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                background: '#F9FAFB',
                fontSize: '12.5px',
                fontWeight: 600,
                color: TEAM_MEMBERS[quickAssignee]?.color || '#374151',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="emmanuel">👤 Emmanuel</option>
              <option value="juan_pablo">👤 Juan Pablo</option>
              <option value="curiel">👤 Curiel</option>
              <option value="all">👥 Todos</option>
            </select>

            {/* Quick Priority */}
            <select
              value={quickPriority}
              onChange={(e) => setQuickPriority(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                background: '#F9FAFB',
                fontSize: '12.5px',
                fontWeight: 600,
                color: PRIORITY_CONFIG[quickPriority]?.color || '#374151',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="urgent">🔥 Urgente</option>
              <option value="high">🔺 Alta</option>
              <option value="medium">🔹 Media</option>
              <option value="low">▫️ Baja</option>
            </select>

            {/* Quick Category */}
            <select
              value={quickCategory}
              onChange={(e) => setQuickCategory(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                background: '#F9FAFB',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#4B5563',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="Comercial">💼 Comercial</option>
              <option value="Desarrollo">💻 Desarrollo</option>
              <option value="Operaciones">⚙️ Operaciones</option>
              <option value="Clientes">🤝 Clientes</option>
              <option value="Estrategia">🎯 Estrategia</option>
            </select>

            <button
              type="submit"
              disabled={quickSubmitting || !quickTitle.trim()}
              className="btn-accent"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 600,
                opacity: !quickTitle.trim() ? 0.6 : 1,
                cursor: !quickTitle.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              <CornerDownLeft size={13} />
              Agregar
            </button>
          </div>
        </form>

        {/* ── SCOREBOARD GAMIFICADO DE FUNDADORES ─────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '14px',
          }}
        >
          {['emmanuel', 'juan_pablo', 'curiel'].map((memberKey) => {
            const member = TEAM_MEMBERS[memberKey];
            const stats = founderStats[memberKey] || { total: 0, done: 0, pending: 0, urgent: 0, percent: 0 };
            const isSelected = assignedFilter === memberKey;

            return (
              <div
                key={memberKey}
                onClick={() => setAssignedFilter(isSelected ? 'all' : memberKey)}
                className="card"
                style={{
                  padding: '18px 20px',
                  borderRadius: '16px',
                  border: isSelected ? `2px solid ${member.color}` : '1px solid #E5E7EB',
                  background: isSelected ? member.bg : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isSelected
                    ? `0 8px 24px -4px ${member.color}25`
                    : '0 2px 8px rgba(0,0,0,0.03)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: member.avatarBg,
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '15px',
                        boxShadow: `0 4px 12px ${member.color}30`,
                      }}
                    >
                      {member.initial}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                        {member.label}
                      </h4>
                      <span style={{ fontSize: '11.5px', color: '#6B7280', fontWeight: 500 }}>
                        {member.role}
                      </span>
                    </div>
                  </div>

                  {stats.urgent > 0 && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '9999px',
                        background: '#FEF2F2',
                        border: '1px solid #FECACA',
                        color: '#DC2626',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      <Flame size={12} /> {stats.urgent}
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                  <div style={{ padding: '8px 10px', background: isSelected ? '#FFFFFF' : '#F9FAFB', borderRadius: '10px', textAlign: 'center', border: '1px solid #F3F4F6' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#111827', display: 'block' }}>
                      {stats.total}
                    </span>
                    <span style={{ fontSize: '10.5px', color: '#6B7280', fontWeight: 600 }}>Total</span>
                  </div>
                  <div style={{ padding: '8px 10px', background: isSelected ? '#FFFFFF' : '#FFFBEB', borderRadius: '10px', textAlign: 'center', border: '1px solid #FEF3C7' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#B45309', display: 'block' }}>
                      {stats.pending}
                    </span>
                    <span style={{ fontSize: '10.5px', color: '#92400E', fontWeight: 600 }}>Pendientes</span>
                  </div>
                  <div style={{ padding: '8px 10px', background: isSelected ? '#FFFFFF' : '#ECFDF5', borderRadius: '10px', textAlign: 'center', border: '1px solid #A7F3D0' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#047857', display: 'block' }}>
                      {stats.done}
                    </span>
                    <span style={{ fontSize: '10.5px', color: '#065F46', fontWeight: 600 }}>Hechas</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>Tasa de avance</span>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: member.color }}>{stats.percent}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: isSelected ? '#E2E8F0' : '#F1F5F9', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${stats.percent}%`,
                        height: '100%',
                        background: member.avatarBg,
                        borderRadius: '9999px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── BARRA DE FILTROS & BÚSQUEDA ─────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 260px' }}>
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '340px',
              }}
            >
              <Search
                size={16}
                color="#9CA3AF"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder="Buscar por título, categoría o nota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                  background: '#FFFFFF',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            {assignedFilter !== 'all' && (
              <button
                onClick={() => setAssignedFilter('all')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  background: '#F3F4F6',
                  border: '1px solid #E5E7EB',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#4B5563',
                  cursor: 'pointer',
                }}
              >
                Filtro: {TEAM_MEMBERS[assignedFilter]?.label}
                <X size={12} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid #E5E7EB',
                background: '#FFFFFF',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#374151',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">Todas las Prioridades</option>
              <option value="urgent">🔥 Urgente</option>
              <option value="high">🔺 Alta</option>
              <option value="medium">🔹 Media</option>
              <option value="low">▫️ Baja</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid #E5E7EB',
                background: '#FFFFFF',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#374151',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">Todas las Categorías</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── CONTENIDO PRINCIPAL: KANBAN vs LISTA ───────────────────────── */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#6B7280' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: '14px', fontWeight: 500 }}>Cargando tablero de tareas Core...</p>
          </div>
        ) : viewMode === 'kanban' ? (
          /* ── KANBAN BOARD ──────────────────────────────────────────────── */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(280px, 1fr))',
              gap: '16px',
              overflowX: 'auto',
              paddingBottom: '16px',
              alignItems: 'start',
            }}
          >
            {STATUS_COLUMNS.map((col) => {
              const colTasks = filteredTasks.filter((t) => t.status === col.id);

              return (
                <div
                  key={col.id}
                  style={{
                    background: '#F8FAFC',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '480px',
                  }}
                >
                  {/* Column Header */}
                  <div
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#FFFFFF',
                      borderTopLeftRadius: '16px',
                      borderTopRightRadius: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '9px',
                          height: '9px',
                          borderRadius: '50%',
                          background: col.color,
                        }}
                      />
                      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                        {col.title}
                      </h3>
                    </div>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: '#F1F5F9',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        color: '#64748B',
                      }}
                    >
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Column Tasks */}
                  <div
                    style={{
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      flex: 1,
                    }}
                  >
                    {colTasks.length === 0 ? (
                      <div
                        style={{
                          padding: '30px 16px',
                          textAlign: 'center',
                          color: '#94A3B8',
                          fontSize: '12.5px',
                          border: '1px dashed #CBD5E1',
                          borderRadius: '12px',
                          margin: '8px 0',
                        }}
                      >
                        Sin tareas en esta etapa
                      </div>
                    ) : (
                      colTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onEdit={() => openEditModal(task)}
                          onDelete={() => handleDeleteTask(task.id)}
                          onMove={handleMoveStatus}
                          onToggleDone={handleToggleDone}
                          onQuickReassign={handleQuickReassign}
                          onToggleChecklistItem={handleToggleChecklistItem}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── LIST VIEW ─────────────────────────────────────────────────── */
          <div
            className="card"
            style={{
              padding: '0',
              borderRadius: '16px',
              border: '1px solid #E5E7EB',
              background: '#FFFFFF',
              overflow: 'hidden',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#6B7280', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '12px 16px', width: '40px' }}></th>
                    <th style={{ padding: '12px 16px' }}>Tarea</th>
                    <th style={{ padding: '12px 16px' }}>Asignado</th>
                    <th style={{ padding: '12px 16px' }}>Prioridad</th>
                    <th style={{ padding: '12px 16px' }}>Categoría</th>
                    <th style={{ padding: '12px 16px' }}>Estado</th>
                    <th style={{ padding: '12px 16px' }}>Fecha Límite</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                        No se encontraron tareas con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((task) => {
                      const member = TEAM_MEMBERS[task.assignedTo] || TEAM_MEMBERS.all;
                      const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                      const isDone = task.status === 'done';

                      return (
                        <tr
                          key={task.id}
                          style={{
                            borderBottom: '1px solid #F3F4F6',
                            transition: 'background 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <td style={{ padding: '12px 16px' }}>
                            <button
                              onClick={() => handleToggleDone(task)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: isDone ? '#10B981' : '#D1D5DB',
                                display: 'flex',
                                alignItems: 'center',
                                padding: 0,
                              }}
                            >
                              {isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                            </button>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span
                                style={{
                                  fontWeight: 600,
                                  color: isDone ? '#9CA3AF' : '#111827',
                                  textDecoration: isDone ? 'line-through' : 'none',
                                }}
                              >
                                {task.title}
                              </span>
                              {task.description && (
                                <span style={{ fontSize: '11.5px', color: '#6B7280', marginTop: '2px' }}>
                                  {task.description.length > 70
                                    ? `${task.description.substring(0, 70)}...`
                                    : task.description}
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: member.bg,
                                color: member.color,
                                border: `1px solid ${member.border}`,
                                fontSize: '11.5px',
                                fontWeight: 700,
                              }}
                            >
                              {member.label}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: priority.bg,
                                color: priority.color,
                                border: `1px solid ${priority.border}`,
                                fontSize: '11.5px',
                                fontWeight: 700,
                              }}
                            >
                              {priority.label}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: '#F3F4F6',
                                color: '#4B5563',
                                fontSize: '11.5px',
                                fontWeight: 600,
                              }}
                            >
                              {task.category || 'General'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <select
                              value={task.status}
                              onChange={(e) => {
                                const newSt = e.target.value;
                                api.put(`/admin/tasks/${task.id}`, { status: newSt }).then(() => fetchTasks());
                              }}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: '1px solid #E5E7EB',
                                fontSize: '12px',
                                fontWeight: 600,
                                background: '#FFFFFF',
                                cursor: 'pointer',
                              }}
                            >
                              <option value="todo">Por Hacer</option>
                              <option value="in_progress">En Progreso</option>
                              <option value="review">En Revisión</option>
                              <option value="done">Completada</option>
                            </select>
                          </td>
                          <td style={{ padding: '12px 16px', color: '#6B7280', fontSize: '12px' }}>
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString('es-MX') : '—'}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                onClick={() => openEditModal(task)}
                                style={{
                                  padding: '5px',
                                  borderRadius: '6px',
                                  border: '1px solid #E5E7EB',
                                  background: '#FFFFFF',
                                  cursor: 'pointer',
                                  color: '#4B5563',
                                }}
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                style={{
                                  padding: '5px',
                                  borderRadius: '6px',
                                  border: '1px solid #FEE2E2',
                                  background: '#FEF2F2',
                                  cursor: 'pointer',
                                  color: '#DC2626',
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── MODAL DETALLADO DE TAREA (CREAR / EDITAR) ───────────────────── */}
        {showModal &&
          createPortal(
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 10000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                background: 'rgba(17, 24, 39, 0.65)',
                backdropFilter: 'blur(6px)',
                animation: closingModal ? 'fadeOut 0.2s ease forwards' : 'fadeIn 0.2s ease forwards',
              }}
              onClick={closeModal}
            >
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  width: '100%',
                  maxWidth: '580px',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  border: '1px solid #E5E7EB',
                  animation: closingModal ? 'scaleDown 0.2s ease forwards' : 'scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div
                  style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: '#F0FDFA',
                        border: '1px solid #CCFBF1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0E7490',
                      }}
                    >
                      <CheckSquare size={18} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#111827' }}>
                        {editingTask ? 'Editar Tarea' : 'Nueva Tarea Core'}
                      </h3>
                      <span style={{ fontSize: '12px', color: '#6B7280' }}>
                        Asigna y coordina actividades clave del equipo
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9CA3AF',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '8px',
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleSaveTask} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {formError && (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: '#FEF2F2',
                        border: '1px solid #FECACA',
                        color: '#DC2626',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <AlertCircle size={16} />
                      {formError}
                    </div>
                  )}

                  {/* Title */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Título de la Tarea *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="ej. Enviar propuesta técnica v2.0 a Tahara Café"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #D1D5DB',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Descripción o Notas
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detalles sobre lo requerido, acuerdos o especificaciones..."
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #D1D5DB',
                        fontSize: '13.5px',
                        outline: 'none',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Row: Assigned & Priority */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                        Responsable
                      </label>
                      <select
                        value={formData.assignedTo}
                        onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #D1D5DB',
                          fontSize: '13.5px',
                          background: '#FFFFFF',
                          outline: 'none',
                        }}
                      >
                        <option value="emmanuel">👤 Emmanuel</option>
                        <option value="juan_pablo">👤 Juan Pablo</option>
                        <option value="curiel">👤 Curiel</option>
                        <option value="all">👥 Todos (Equipo)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                        Prioridad
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #D1D5DB',
                          fontSize: '13.5px',
                          background: '#FFFFFF',
                          outline: 'none',
                        }}
                      >
                        <option value="urgent">🔥 Urgente</option>
                        <option value="high">🔺 Alta</option>
                        <option value="medium">🔹 Media</option>
                        <option value="low">▫️ Baja</option>
                      </select>
                    </div>
                  </div>

                  {/* Row: Status & Category */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                        Estado
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #D1D5DB',
                          fontSize: '13.5px',
                          background: '#FFFFFF',
                          outline: 'none',
                        }}
                      >
                        <option value="todo">Por Hacer</option>
                        <option value="in_progress">En Progreso</option>
                        <option value="review">En Revisión</option>
                        <option value="done">Completada</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                        Categoría
                      </label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="ej. Comercial, Dev, Finanzas"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #D1D5DB',
                          fontSize: '13.5px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Fecha Límite (Opcional)
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #D1D5DB',
                        fontSize: '13.5px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Interactive Checklist section */}
                  <div style={{ paddingTop: '8px', borderTop: '1px solid #F3F4F6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                        Checklist de Sub-Tareas
                      </label>
                      <span style={{ fontSize: '11px', color: '#6B7280' }}>
                        {formData.checklist.length} items
                      </span>
                    </div>

                    {/* Add Item form */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <input
                        type="text"
                        value={newChecklistText}
                        onChange={(e) => setNewChecklistText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addChecklistItem();
                          }
                        }}
                        placeholder="Agregar sub-tarea y presionar Enter..."
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #D1D5DB',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                      />
                      <button
                        type="button"
                        onClick={addChecklistItem}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: '1px solid #E5E7EB',
                          background: '#F9FAFB',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        + Agregar
                      </button>
                    </div>

                    {/* Items List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                      {formData.checklist.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            background: '#F9FAFB',
                            border: '1px solid #F3F4F6',
                          }}
                        >
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}>
                            <input
                              type="checkbox"
                              checked={item.done}
                              onChange={(e) => {
                                const updated = [...formData.checklist];
                                updated[idx].done = e.target.checked;
                                setFormData({ ...formData, checklist: updated });
                              }}
                            />
                            <span
                              style={{
                                fontSize: '13px',
                                color: item.done ? '#9CA3AF' : '#111827',
                                textDecoration: item.done ? 'line-through' : 'none',
                              }}
                            >
                              {item.text}
                            </span>
                          </label>
                          <button
                            type="button"
                            onClick={() => removeChecklistItem(idx)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#EF4444',
                              cursor: 'pointer',
                              padding: '2px',
                            }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '10px',
                      paddingTop: '12px',
                      borderTop: '1px solid #F3F4F6',
                    }}
                  >
                    <button
                      type="button"
                      onClick={closeModal}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '10px',
                        border: '1px solid #E5E7EB',
                        background: '#FFFFFF',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        color: '#4B5563',
                        cursor: 'pointer',
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-accent"
                      style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        fontSize: '13.5px',
                        fontWeight: 600,
                      }}
                    >
                      {submitting ? 'Guardando...' : editingTask ? 'Actualizar Tarea' : 'Crear Tarea'}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )}
      </div>
    </Layout>
  );
}

// ── TASK CARD COMPONENT (KANBAN) ──────────────────────────────────────────
function TaskCard({
  task,
  onEdit,
  onDelete,
  onMove,
  onToggleDone,
  onQuickReassign,
  onToggleChecklistItem,
}) {
  const [showChecklist, setShowChecklist] = useState(false);
  const member = TEAM_MEMBERS[task.assignedTo] || TEAM_MEMBERS.all;
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const isDone = task.status === 'done';

  const checklistItems = Array.isArray(task.checklist) ? task.checklist : [];
  const totalItems = checklistItems.length;
  const completedItems = checklistItems.filter((i) => i.done).length;
  const checklistPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Format Due date
  const isOverdue =
    task.dueDate &&
    !isDone &&
    new Date(task.dueDate).setHours(23, 59, 59) < new Date().getTime();

  return (
    <div
      className="card"
      style={{
        padding: '14px 16px',
        borderRadius: '14px',
        border: isDone ? '1px solid #E5E7EB' : priority.label.includes('🔥') ? '1px solid #FECACA' : '1px solid #E2E8F0',
        background: isDone ? '#FAFAFA' : '#FFFFFF',
        boxShadow: priority.label.includes('🔥') && !isDone
          ? '0 4px 14px rgba(239, 68, 68, 0.08)'
          : '0 2px 6px rgba(0,0,0,0.03)',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        position: 'relative',
      }}
    >
      {/* Top Badges: Category & Priority */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: '6px',
            background: '#F1F5F9',
            color: '#475569',
            letterSpacing: '0.02em',
          }}
        >
          {task.category || 'General'}
        </span>

        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '9999px',
            background: priority.bg,
            color: priority.color,
            border: `1px solid ${priority.border}`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          {priority.label}
        </span>
      </div>

      {/* Task Title & Fast Done toggle */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <button
          onClick={() => onToggleDone(task)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            marginTop: '2px',
            cursor: 'pointer',
            color: isDone ? '#10B981' : '#CBD5E1',
            flexShrink: 0,
            transition: 'color 0.15s ease',
          }}
          title={isDone ? 'Marcar pendiente' : 'Marcar completada'}
        >
          {isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
        </button>

        <span
          onClick={onEdit}
          style={{
            fontSize: '13.5px',
            fontWeight: 600,
            color: isDone ? '#94A3B8' : '#1E293B',
            textDecoration: isDone ? 'line-through' : 'none',
            lineHeight: 1.35,
            cursor: 'pointer',
            flex: 1,
          }}
        >
          {task.title}
        </span>
      </div>

      {/* Description if present */}
      {task.description && (
        <p
          style={{
            margin: 0,
            fontSize: '12px',
            color: '#64748B',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {task.description}
        </p>
      )}

      {/* Sub-tasks checklist preview */}
      {totalItems > 0 && (
        <div style={{ background: '#F8FAFC', padding: '8px 10px', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
          <div
            onClick={() => setShowChecklist(!showChecklist)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>
              Checklist: {completedItems}/{totalItems}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: checklistPercent === 100 ? '#10B981' : '#64748B' }}>
              {checklistPercent}%
            </span>
          </div>

          <div style={{ width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '9999px', margin: '6px 0 0', overflow: 'hidden' }}>
            <div
              style={{
                width: `${checklistPercent}%`,
                height: '100%',
                background: checklistPercent === 100 ? '#10B981' : '#00C4CC',
                borderRadius: '9999px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          {showChecklist && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #E2E8F0' }}>
              {checklistItems.map((item, idx) => (
                <label
                  key={item.id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11.5px',
                    color: item.done ? '#94A3B8' : '#334155',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => onToggleChecklistItem(task, idx)}
                  />
                  <span style={{ textDecoration: item.done ? 'line-through' : 'none' }}>{item.text}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer: Assignee & Due Date & Column Steppers */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '8px',
          borderTop: '1px solid #F1F5F9',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        {/* Assignee Avatar Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            title={`Asignada a ${member.label}`}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '8px',
              background: member.avatarBg,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '10.5px',
            }}
          >
            {member.initial}
          </div>

          {task.dueDate && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '11px',
                fontWeight: 600,
                color: isOverdue ? '#DC2626' : '#64748B',
                background: isOverdue ? '#FEF2F2' : 'transparent',
                padding: isOverdue ? '1px 5px' : '0',
                borderRadius: '4px',
              }}
            >
              <Calendar size={12} />
              {new Date(task.dueDate).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        {/* Stepper buttons (Move status) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          {task.status !== 'todo' && (
            <button
              onClick={() => onMove(task, 'prev')}
              title="Mover a etapa anterior"
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <ChevronLeft size={13} />
            </button>
          )}

          {task.status !== 'done' && (
            <button
              onClick={() => onMove(task, 'next')}
              title="Avanzar etapa"
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <ChevronRight size={13} />
            </button>
          )}

          <button
            onClick={onEdit}
            title="Editar detalles"
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <Edit size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
