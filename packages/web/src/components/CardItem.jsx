import { Draggable } from '@hello-pangea/dnd';
import { format } from 'date-fns';

const CardItem = ({ card, index, onClick, labels }) => {
  const cardLabels = labels.filter(label => card.labels?.includes(label._id));
  const checkedItems = card.checklist?.filter(item => item.done).length || 0;
  const totalItems = card.checklist?.length || 0;
  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

  return (
    <Draggable draggableId={card._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`card bg-base-200 shadow cursor-pointer hover:shadow-lg transition-shadow ${
            snapshot.isDragging ? 'rotate-2 shadow-xl' : ''
          }`}
          onClick={() => onClick(card)}
        >
          <div className="card-body p-3">
            {cardLabels.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {cardLabels.map(label => (
                  <div
                    key={label._id}
                    className="badge badge-sm"
                    style={{ backgroundColor: label.color, color: '#fff' }}
                  >
                    {label.name}
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm font-medium">{card.title}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {card.dueDate && (
                <div
                  className={`badge badge-sm ${
                    isOverdue ? 'badge-error' : 'badge-ghost'
                  }`}
                >
                  {format(new Date(card.dueDate), 'MMM d')}
                </div>
              )}
              {totalItems > 0 && (
                <div className="badge badge-sm badge-ghost">
                  ✓ {checkedItems}/{totalItems}
                </div>
              )}
              {card.description && (
                <div className="badge badge-sm badge-ghost">📝</div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default CardItem;
