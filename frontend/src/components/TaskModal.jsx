import { useState } from 'react';
import { X } from 'lucide-react';

export default function TaskModal({ drains, workers, initialDrain, onClose, onSave }) {
  const [form, setForm] = useState({ drainId: initialDrain?.id || drains[0]?.id || '', title: initialDrain ? `Inspect ${initialDrain.id}` : '', description: initialDrain?.action || '', priority: initialDrain?.risk === 'High' ? 'High' : 'Medium', assignedWorker: workers[0] || '', dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10) });
  const [error, setError] = useState('');
  const change = (e) => setForm((old) => ({ ...old, [e.target.name]: e.target.value }));
  function submit(e) {
    e.preventDefault();
    const drain = drains.find((d) => d.id === form.drainId);
    if (!drain || !form.title.trim() || !form.dueDate) { setError('Select a drain and complete the required fields.'); return; }
    onSave({ ...form, id: `TASK-${Date.now().toString().slice(-6)}`, location: drain.location, status: 'Pending', createdAt: new Date().toISOString(), resolutionNote: '' });
    onClose();
  }
  return <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
      <div className="modal-header"><div><div className="eyebrow">MAINTENANCE WORKFLOW</div><h2 id="task-modal-title">Create maintenance task</h2></div><button className="icon-button" onClick={onClose} aria-label="Close modal"><X size={19} /></button></div>
      <form onSubmit={submit} className="modal-form">
        <label>Drain<select name="drainId" value={form.drainId} onChange={change}>{drains.map((d) => <option key={d.id} value={d.id}>{d.id} — {d.location}</option>)}</select></label>
        <label>Task title<input required name="title" value={form.title} onChange={change} placeholder="e.g. Inspect suspected blockage" /></label>
        <label>Issue / work description<textarea name="description" value={form.description} onChange={change} rows="3" placeholder="Describe the work to be performed" /></label>
        <div className="form-two"><label>Priority<select name="priority" value={form.priority} onChange={change}><option>High</option><option>Medium</option><option>Low</option></select></label><label>Assigned worker<select name="assignedWorker" value={form.assignedWorker} onChange={change}>{workers.map((w) => <option key={w}>{w}</option>)}</select></label></div>
        <label>Due date<input type="date" required name="dueDate" value={form.dueDate} onChange={change} /></label>
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary">Create task</button></div>
      </form>
    </section>
  </div>;
}
