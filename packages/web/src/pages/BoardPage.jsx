import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { boardsApi } from '../api/boards';
import { listsApi } from '../api/lists';
import { cardsApi } from '../api/cards';
import { labelsApi } from '../api/labels';
import { useSocket } from '../contexts/SocketContext';
import Navbar from '../components/Navbar';
import ListColumn from '../components/ListColumn';
import CardModal from '../components/CardModal';
import toast from 'react-hot-toast';

const BoardPage = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { joinBoard, leaveBoard } = useSocket();
  const [showCreateList, setShowCreateList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    joinBoard(boardId);
    return () => leaveBoard(boardId);
  }, [boardId, joinBoard, leaveBoard]);

  const { data: board, isLoading: boardLoading } = useQuery({
    queryKey: ['board', boardId],
    queryFn: async () => {
      const response = await boardsApi.getById(boardId);
      return response.data;
    },
  });

  const { data: listsData, isLoading: listsLoading } = useQuery({
    queryKey: ['lists', boardId],
    queryFn: async () => {
      const [listsRes, cardsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/lists?boardId=${boardId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }),
        fetch(`${import.meta.env.VITE_API_URL}/cards?boardId=${boardId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }),
      ]);

      const lists = await listsRes.json();
      const cards = await cardsRes.json();

      setLists(lists.sort((a, b) => a.order - b.order));
      setCards(cards);

      return { lists, cards };
    },
  });

  const { data: labels } = useQuery({
    queryKey: ['labels', boardId],
    queryFn: async () => {
      const response = await labelsApi.list(boardId);
      return response.data;
    },
  });

  const createListMutation = useMutation({
    mutationFn: listsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['lists', boardId]);
      setShowCreateList(false);
      setNewListName('');
      toast.success('List created');
    },
  });

  const moveCardMutation = useMutation({
    mutationFn: ({ cardId, listId, order }) => cardsApi.move(cardId, { listId, order }),
    onSuccess: () => {
      queryClient.invalidateQueries(['lists', boardId]);
    },
    onError: () => {
      queryClient.invalidateQueries(['lists', boardId]);
      toast.error('Failed to move card');
    },
  });

  const handleCreateList = e => {
    e.preventDefault();
    createListMutation.mutate({ boardId, name: newListName });
  };

  const handleDragEnd = result => {
    if (!result.destination) return;

    const { source, destination, draggableId, type } = result;

    if (type === 'list') {
      const newLists = Array.from(lists);
      const [removed] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, removed);

      const updatedLists = newLists.map((list, index) => ({
        ...list,
        order: (index + 1) * 1024,
      }));

      setLists(updatedLists);

      updatedLists.forEach(list => {
        listsApi.reorder(list._id, list.order);
      });
      return;
    }

    if (type === 'card') {
      const sourceListId = source.droppableId;
      const destListId = destination.droppableId;

      const newCards = Array.from(cards);
      const cardToMove = newCards.find(c => c._id === draggableId);

      if (!cardToMove) return;

      const sourceCards = newCards
        .filter(c => c.listId === sourceListId)
        .sort((a, b) => a.order - b.order);

      const destCards =
        sourceListId === destListId
          ? sourceCards
          : newCards.filter(c => c.listId === destListId).sort((a, b) => a.order - b.order);

      if (sourceListId === destListId) {
        sourceCards.splice(source.index, 1);
        sourceCards.splice(destination.index, 0, cardToMove);

        const updatedCards = newCards.map(card => {
          const idx = sourceCards.findIndex(c => c._id === card._id);
          if (idx !== -1) {
            return { ...card, order: (idx + 1) * 1024 };
          }
          return card;
        });

        setCards(updatedCards);
      } else {
        cardToMove.listId = destListId;
        destCards.splice(destination.index, 0, cardToMove);

        const updatedCards = newCards.map(card => {
          if (card._id === cardToMove._id) {
            return { ...card, listId: destListId, order: (destination.index + 1) * 1024 };
          }
          const idx = destCards.findIndex(c => c._id === card._id);
          if (idx !== -1) {
            return { ...card, order: (idx + 1) * 1024 };
          }
          return card;
        });

        setCards(updatedCards);
      }

      const newOrder = (destination.index + 1) * 1024;
      moveCardMutation.mutate({
        cardId: draggableId,
        listId: destListId,
        order: newOrder,
      });
    }
  };

  if (boardLoading || listsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="container mx-auto px-4 py-4">
        <div className="mb-4">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{board?.name}</h1>
          {board?.description && <p className="text-sm opacity-70 mt-2">{board.description}</p>}
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="board" type="list" direction="horizontal">
            {provided => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex gap-4 overflow-x-auto pb-4"
              >
                {lists.map((list, index) => (
                  <ListColumn
                    key={list._id}
                    list={list}
                    index={index}
                    cards={cards.filter(c => c.listId === list._id).sort((a, b) => a.order - b.order)}
                    onCardClick={setSelectedCard}
                    boardId={boardId}
                    labels={labels || []}
                  />
                ))}
                {provided.placeholder}

                <div className="min-w-[300px]">
                  {showCreateList ? (
                    <form onSubmit={handleCreateList} className="bg-base-100 p-4 rounded-lg">
                      <input
                        type="text"
                        placeholder="List name"
                        className="input input-bordered w-full mb-2"
                        value={newListName}
                        onChange={e => setNewListName(e.target.value)}
                        autoFocus
                        required
                      />
                      <div className="flex gap-2">
                        <button type="submit" className="btn btn-primary btn-sm">
                          Add List
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            setShowCreateList(false);
                            setNewListName('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      className="btn btn-ghost w-full justify-start"
                      onClick={() => setShowCreateList(true)}
                    >
                      + Add another list
                    </button>
                  )}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          boardId={boardId}
          labels={labels || []}
        />
      )}
    </div>
  );
};

export default BoardPage;
