import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { boardsApi } from '../api/boards';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const BoardsPage = () => {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [boardDescription, setBoardDescription] = useState('');

  const { data: boards, isLoading } = useQuery({
    queryKey: ['boards', orgId],
    queryFn: async () => {
      const response = await boardsApi.list(orgId);
      return response.data;
    },
  });

  const createBoardMutation = useMutation({
    mutationFn: boardsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['boards', orgId]);
      setShowCreateModal(false);
      setBoardName('');
      setBoardDescription('');
      toast.success('Board created');
    },
    onError: error => {
      toast.error(error.response?.data?.error || 'Failed to create board');
    },
  });

  const handleCreateBoard = e => {
    e.preventDefault();
    createBoardMutation.mutate({
      orgId,
      name: boardName,
      description: boardDescription,
    });
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <button className="btn btn-ghost btn-sm mb-2" onClick={() => navigate('/orgs')}>
              ← Back to Organizations
            </button>
            <h1 className="text-3xl font-bold">Boards</h1>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            Create Board
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards?.map(board => (
              <div
                key={board._id}
                className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
                onClick={() => navigate(`/boards/${board._id}`)}
              >
                <div className="card-body">
                  <h2 className="card-title">{board.name}</h2>
                  {board.description && <p className="text-sm opacity-70">{board.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">Create Board</h3>
              <form onSubmit={handleCreateBoard}>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Board Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="My Board"
                    className="input input-bordered"
                    value={boardName}
                    onChange={e => setBoardName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text">Description (optional)</span>
                  </label>
                  <textarea
                    placeholder="Board description"
                    className="textarea textarea-bordered"
                    value={boardDescription}
                    onChange={e => setBoardDescription(e.target.value)}
                  />
                </div>
                <div className="modal-action">
                  <button type="button" className="btn" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={createBoardMutation.isPending}
                  >
                    {createBoardMutation.isPending ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      'Create'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardsPage;
