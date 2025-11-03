import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '../api/notifications';

const Navbar = () => {
  const { user, logout } = useAuth();

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await notificationsApi.list();
      return response.data;
    },
    refetchInterval: 30000,
  });

  const unreadCount = notifications?.filter(n => !n.readAt).length || 0;

  return (
    <div className="navbar bg-base-100 shadow-lg">
      <div className="flex-1">
        <a href="/orgs" className="btn btn-ghost normal-case text-xl">
          Taskboard
        </a>
      </div>
      <div className="flex-none gap-2">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle">
            <div className="indicator">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {unreadCount > 0 && <span className="badge badge-xs badge-primary indicator-item">{unreadCount}</span>}
            </div>
          </label>
          <ul
            tabIndex={0}
            className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-80 max-h-96 overflow-y-auto"
          >
            {notifications && notifications.length > 0 ? (
              notifications.map(notification => (
                <li key={notification._id}>
                  <a className={notification.readAt ? 'opacity-50' : ''}>
                    <div>
                      <div className="font-bold">{notification.type}</div>
                      <div className="text-xs opacity-70">
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </a>
                </li>
              ))
            ) : (
              <li>
                <span className="text-sm opacity-70">No notifications</span>
              </li>
            )}
          </ul>
        </div>

        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar placeholder">
            <div className="bg-neutral-focus text-neutral-content rounded-full w-10">
              <span className="text-xl">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
          </label>
          <ul
            tabIndex={0}
            className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
          >
            <li className="menu-title">
              <span>{user?.name}</span>
              <span className="text-xs opacity-70">{user?.email}</span>
            </li>
            <li>
              <a onClick={logout}>Logout</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
