import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cardsApi } from '../api/cards';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const CardModal = ({ card, onClose, boardId, labels }) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [dueDate, setDueDate] = useState(
    card.dueDate ? format(new Date(card.dueDate), 'yyyy-MM-dd') : ''
  );
  const [selectedLabels, setSelectedLabels] = useState(card.labels || []);
  const [checklist, setChecklist] = useState(card.checklist || []);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const queryClient = useQueryClient();

  const updateCardMutation = useMutation({
    mutationFn: data => cardsApi.update(card._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['lists', boardId]);
      toast.success('Card updated');
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: () => cardsApi.delete(card._id),
    onSuccess: () => {
      queryClient.invalidateQueries(['lists', boardId]);
      toast.success('Card deleted');
      onClose();
    },
  });

  const handleSave = () => {
    updateCardMutation.mutate({
      title,
      description,
      dueDate: dueDate || null,
      labels: selectedLabels,
      checklist,
    });
  };

  const toggleLabel = labelId => {
    setSelectedLabels(prev =>
      prev.includes(labelId) ? prev.filter(id => id !== labelId) : [...prev, labelId]
    );
  };

  const addChecklistItem = e => {
    e.preventDefault();
    if (!newChecklistItem.trim()) return;
    
    const newItem = {
      id: Date.now().toString(),
      text: newChecklistItem,
      done: false,
    };
    setChecklist([...checklist, newItem]);
    setNewChecklistItem('');
  };

  const toggleChecklistItem = itemId => {
    setChecklist(prev =>
      prev.map(item => (item.id === itemId ? { ...item, done: !item.done } : item))
    );
  };

  const removeChecklistItem = itemId => {
    setChecklist(prev => prev.filter(item => item.id !== itemId));
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl">
        <div className="flex justify-between items-start mb-4">
          <input
            type="text"
            className="input input-bordered flex-1 mr-4 text-xl font-bold"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="label">
              <span className="label-text font-bold">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full h-32"
              placeholder="Add a description..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-bold">Due Date</span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-bold">Labels</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {labels.map(label => (
                <button
                  key={label._id}
                  className={`badge badge-lg cursor-pointer ${
                    selectedLabels.includes(label._id) ? 'ring-2 ring-primary' : ''
                  }`}
                  style={{ backgroundColor: label.color, color: '#fff' }}
                  onClick={() => toggleLabel(label._id)}
                >
                  {label.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-bold">Checklist</span>
            </label>
            <div className="space-y-2">
              {checklist.map(item => (
                <div key={item.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={item.done}
                    onChange={() => toggleChecklistItem(item.id)}
                  />
                  <span className={item.done ? 'line-through opacity-50' : ''}>{item.text}</span>
                  <button
                    className="btn btn-ghost btn-xs ml-auto"
                    onClick={() => removeChecklistItem(item.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={addChecklistItem} className="mt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input input-bordered input-sm flex-1"
                  placeholder="Add checklist item..."
                  value={newChecklistItem}
                  onChange={e => setNewChecklistItem(e.target.value)}
                />
                <button type="submit" className="btn btn-sm btn-primary">
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="modal-action">
          <button
            className="btn btn-error btn-sm"
            onClick={() => deleteCardMutation.mutate()}
          >
            Delete Card
          </button>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={updateCardMutation.isPending}
          >
            {updateCardMutation.isPending ? (
              <span className="loading loading-spinner"></span>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardModal;
