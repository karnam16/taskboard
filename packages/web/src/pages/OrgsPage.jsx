import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { orgsApi } from '../api/orgs';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const OrgsPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [orgName, setOrgName] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: orgs, isLoading } = useQuery({
    queryKey: ['orgs'],
    queryFn: async () => {
      const response = await orgsApi.list();
      return response.data;
    },
  });

  const createOrgMutation = useMutation({
    mutationFn: orgsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['orgs']);
      setShowCreateModal(false);
      setOrgName('');
      toast.success('Organization created');
    },
    onError: error => {
      toast.error(error.response?.data?.error || 'Failed to create organization');
    },
  });

  const handleCreateOrg = e => {
    e.preventDefault();
    createOrgMutation.mutate({ name: orgName });
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Organizations</h1>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            Create Organization
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orgs?.map(org => (
              <div
                key={org._id}
                className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
                onClick={() => navigate(`/orgs/${org._id}/boards`)}
              >
                <div className="card-body">
                  <h2 className="card-title">{org.name}</h2>
                  <div className="badge badge-secondary">{org.role}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">Create Organization</h3>
              <form onSubmit={handleCreateOrg}>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Organization Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="My Organization"
                    className="input input-bordered"
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    required
                  />
                </div>
                <div className="modal-action">
                  <button type="button" className="btn" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={createOrgMutation.isPending}
                  >
                    {createOrgMutation.isPending ? (
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

export default OrgsPage;
