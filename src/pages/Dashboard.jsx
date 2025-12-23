import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, UserX, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';
import { formatCurrency, formatDate, getStatusColor } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!stats) return <div>No data available</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your gym management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Members"
          value={stats.members.total}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Active Members"
          value={stats.members.active}
          icon={UserCheck}
          color="green"
        />
        <StatCard
          title="Today's Attendance"
          value={stats.attendance.today}
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats.revenue.monthly)}
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* Expiring Memberships Alert */}
      {stats.alerts.expiringMemberships > 0 && (
        <div className="card bg-orange-50 border-orange-200">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-orange-600" />
            <div>
              <h3 className="font-semibold text-orange-900">
                {stats.alerts.expiringMemberships} Memberships Expiring Soon
              </h3>
              <p className="text-sm text-orange-700">
                Review and renew memberships expiring in the next 7 days
              </p>
            </div>
            <Link
              to="/members?filter=expiring"
              className="ml-auto btn btn-sm bg-orange-600 text-white hover:bg-orange-700"
            >
              View
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Members */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Members</h2>
            <Link to="/members" className="text-sm text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentMembers.map((member) => (
              <div key={member._id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <img
                  src={member.photo || '/default-avatar.png'}
                  alt={member.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{member.fullName}</p>
                  <p className="text-sm text-gray-500">{member.memberId}</p>
                </div>
                <span className={`badge ${getStatusColor(member.membershipStatus)}`}>
                  {member.membershipStatus}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan Distribution</h2>
          <div className="space-y-3">
            {stats.planDistribution.map((plan) => (
              <div key={plan._id} className="flex items-center justify-between">
                <span className="text-gray-700">{plan.planName}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{
                        width: `${(plan.count / stats.members.active) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{plan.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
          <Link to="/reports" className="text-sm text-primary-600 hover:text-primary-700">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  Member
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  Plan
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.recentPayments.map((payment) => (
                <tr key={payment._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{payment.member.fullName}</p>
                      <p className="text-sm text-gray-500">{payment.member.memberId}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{payment.plan.planName}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {formatCurrency(payment.finalAmount)}
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {formatDate(payment.paymentDate)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${getStatusColor(payment.paymentStatus)}`}>
                      {payment.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

