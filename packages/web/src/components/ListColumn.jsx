import { useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listsApi } from '../api/lists';
import { cardsApi } from '../api/cards';
import CardItem from './CardItem';
import toast from 'react-hot-toast';

const ListColumn = ({ list, index, cards, onCardClick, boardId, labels }) => {
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [listTitle, setListTitle] = useState(list.name);
  const queryClient = useQueryClient();

  const createCardMutation = useMutation({
    mutationFn: cardsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['lists', boardId]);
      setShowAddCard(false);
      setNewCardTitle('');
      toast.success('Card created');
    },
  });

  const updateListMutation = useMutation({
    mutationFn: data => listsApi.update(list._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['lists', boardId]);
      setIsEditingTitle(false);
      toast.success('List updated');
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: () => listsApi.delete(list._id),
    onSuccess: () => {
      queryClient.invalidateQueries(['lists', boardId]);
      toast.success('List deleted');
    },
  });

  const handleAddCard = e => {
    e.preventDefault();
    createCardMutation.mutate({
      boardId,
      listId: list._id,
      title: newCardTitle,
    });
  };

  const handleUpdateTitle = () => {
    if (listTitle !== list.name) {
      updateListMutation.mutate({ name: listTitle });
    } else {
      setIsEditingTitle(false);
    }
  };

  return (
    <Draggable draggableId={list._id} index={index}>
      {provided => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="bg-base-100 rounded-lg p-4 min-w-[300px] max-w-[300px] flex flex-col max-h-[calc(100vh-250px)]"
        >
          <div {...provided.dragHandleProps} className="mb-4">
            <div className="flex justify-between items-center">
              {isEditingTitle ? (
                <input
                  type="text"
                  className="input input-bordered input-sm flex-1"
                  value={listTitle}
                  onChange={e => setListTitle(e.target.value)}
                  onBlur={handleUpdateTitle}
                  onKeyDown={e => e.key === 'Enter' && handleUpdateTitle()}
                  autoFocus
                />
              ) : (
                <h3
                  className="font-bold text-lg cursor-pointer"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {list.name}
                </h3>
              )}
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-xs">
                  ⋯
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                >
                  <li>
                    <a onClick={() => setIsEditingTitle(true)}>Rename</a>
                  </li>
                  <li>
                    <a onClick={() => deleteListMutation.mutate()} className="text-error">
                      Delete
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <Droppable droppableId={list._id} type="card">
            {provided => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex-1 overflow-y-auto space-y-2 mb-2"
              >
                {cards.map((card, index) => (
                  <CardItem
                    key={card._id}
                    card={card}
                    index={index}
                    onClick={() => onCardClick(card)}
                    labels={labels}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {showAddCard ? (
            <form onSubmit={handleAddCard} className="mt-2">
              <textarea
                placeholder="Enter card title..."
                className="textarea textarea-bordered w-full mb-2"
                value={newCardTitle}
                onChange={e => setNewCardTitle(e.target.value)}
                autoFocus
                required
              />
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm">
                  Add Card
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setShowAddCard(false);
                    setNewCardTitle('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button className="btn btn-ghost btn-sm w-full" onClick={() => setShowAddCard(true)}>
              + Add a card
            </button>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default ListColumn;
