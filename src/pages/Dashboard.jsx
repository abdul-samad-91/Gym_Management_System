import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, TrendingUp, AlertCircle, User } from 'lucide-react';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';
import { formatCurrency, formatDate, getStatusColor } from '../utils/helpers';
import toast from 'react-hot-toast';
import { MoveRight } from 'lucide-react';
import user from "/Public/user.svg"
import Icon from "/Public/Icon.svg"
import PakistaniRupee from "/Public/pakistan-rupee-icon 1.svg"
import Clock from "/Public/Clock.svg"




export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [allPayments, setAllPayments] = useState([]);

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

  const handleMarkAsPaid = async (paymentId) => {
    try {
      await api.patch(`/members/payments/${paymentId}`, {
        paymentStatus: 'Paid'
      });
      toast.success('Payment marked as paid');
      fetchDashboardStats(); // Refresh the data
      if (showAllPayments) {
        fetchAllPayments(); // Refresh all payments if viewing all
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update payment status');
    }
  };

  const fetchAllPayments = async () => {
    try {
      const response = await api.get('/members/payments/all');
      if (response.data.success) {
        setAllPayments(response.data.data.filter(payment => payment.member !== null));
      }
    } catch (error) {
      toast.error('Failed to fetch all payments');
    }
  };

  const handleViewAll = () => {
    setShowAllPayments(true);
    fetchAllPayments();
  };

  const handleViewLess = () => {
    setShowAllPayments(false);
  };

  if (loading) return <LoadingSpinner />;
  if (!stats) return <div>No data available</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your gym today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 ">

        <StatCard
          title="Total Members"
          value={stats.members.total}
          icon={() => <img src={user} alt="User Icon" className="w-6 h-6" />}
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
          icon={() => <img src={Icon} alt="User Icon" className="w-6 h-6" />}
          color="blue"
        />
        {/* <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats.revenue.monthly)}
          // icon={DollarSign}
          color="purple"
        /> */}
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats.revenue.monthly)}
          icon={() => <img src={PakistaniRupee} alt="PKR Icon" className="w-6 h-6" />}
          color="purple"
        />
        {/* <StatCard
          title="Pending Amount"
          value={formatCurrency(stats.pending?.total || 0)}
          icon={() => <img src={Clock} alt="Clock Icon" className="w-6 h-6" />}
          color="orange"
        /> */}
        <StatCard
          title="Expiry Soon"
          value={stats.alerts.expiringMemberships}
          icon={() => <img src={Clock} alt="PKR Icon" className="w-6 h-6" />}
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
  {/* Header */}
  <div className="p-4 border-b flex items-center justify-between">
    <div>
      <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
      <p className="text-sm text-gray-600">Latest member actions</p>
    </div>

    <Link
      to="/members"
      className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
    >
      View All Activity
      <MoveRight size={18} />
    </Link>
  </div>

  {/* Activity List */}
  <div className="p-4 space-y-3">
    {(stats.recentMembers ?? []).map((member) => {
      const planColors = {
        Basic: { bg: "bg-blue-100", text: "text-blue-700"},
        Premium: { bg: "bg-orange-100", text: "text-orange-700" },
        Standard: { bg: "bg-green-100", text: "text-green-500" },
      };
      
      const planName = member.currentPlan?.planName || 'No Plan';
      const colors = planColors[planName] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
      
      return (
      <div
        key={member._id}
        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-green-500 
                          flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
          {member.fullName ? (
            <>
              {member.fullName.charAt(0)}{member.fullName.split(' ')[1]?.charAt(0) || ''}
            </>
          ) : (
            '??'
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <p className="font-medium text-gray-900">{member.fullName}</p>
          <div className='flex gap-2 items-center'>
            <p className="text-xs text-gray-500">
              ID: {member.memberId}
            </p>
            <span className={`px-2 py-0.5 text-xs rounded-full font-medium border ${colors.bg} ${colors.text} `}>
              {planName}
            </span>
          </div>
        </div>

        {/* Status pill */}
        <span
          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
            member.membershipStatus
          )}`}
        >
          {member.membershipStatus}
        </span>
        
      </div>
    );
    })}
  </div>
</div>


        {/* Plan Distribution */}
        {/* <div className="card">
         <div className='mb-2 border-b-2  p-4 '> <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan Distribution</h2>
          <h4 className='p'>Member distribution across plans</h4></div>
         
          <div className="space-y-3  p-4">
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
      </div> */}


        <div className="card  flex flex-col ">
          {/* Header */}
          <div className="p-4 border-b flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-gray-900">Plan Distribution</h2>
            <p className="text-sm text-gray-600">Member distribution across plans</p>
          </div>

          {/* Plans */}
         <div className='flex flex-col justify-between h-full'>
           <div className="p-4 space-y-5 ">

            {(stats.planDistribution ?? []).map((plan) => {
              const percent =
                stats?.members?.total
                  ? (plan.count / stats.members.total) * 100
                  : 0;

              const planColors = {
                Basic: "bg-blue-600",
                Premium: "bg-orange-500",
                Standard: "bg-green-500",
              };


              return (
                <div key={plan._id} className="space-y-1.5 ">

                  {/* Label + Count */}
                  <div className="flex justify-between text-sm ">
                    <span className="text-gray-700">{plan.planName}</span>
                    <span className="font-medium text-gray-900">
                      {plan.count} members
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 h-2 rounded-full">
                    <div
                      className={`${planColors[plan.planName] || "bg-primary-600"} h-2 rounded-full`}
                      style={{ width: `${percent}%` }}
                    />

                  </div>

                  {/* Percentage */}
                  <p className="text-xs text-gray-500 text-right">{percent.toFixed(1)}%</p>
                </div>
              );
            })}
            {/* Footer Total */}

          </div>
          <div className="px-4 py-3 border-t text-sm font-semibold flex justify-between">
            Total Active Members: <span>{stats.members.total}</span>
          </div>
         </div>
        </div>
      </div>


      {/* Recent Payments */}
      <div className="flex flex-col p-3 ">
        <div className='flex items-center justify-between bg-white border border-gray-200 p-4 rounded-t-lg'>
          <div className=" mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
             <p className="mt-1">Latest Membership Payments</p>
                 </div>
         <div>
           {!showAllPayments ? (
             <h2 
               onClick={handleViewAll}
               className="text-sm text-primary-600 hover:text-primary-700 cursor-pointer"
             >
               View All
             </h2>
           ) : (
             <h2 
               onClick={handleViewLess}
               className="text-sm text-primary-600 hover:text-primary-700 cursor-pointer"
             >
               View Less
             </h2>
           )}
        </div>
        </div>
      
        <div className="overflow-x-auto">
                    {((showAllPayments ? allPayments : stats.recentPayments) ?? []).length > 0 ? (
          <table className="w-full bg-[#E5E7EB] border border-gray-400 ">
            <thead>
              <tr className="border-b border-gray-200 ">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                 Payment Id
                </th>
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
                  Remaining
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {(showAllPayments ? allPayments : stats.recentPayments ?? []).filter(payment => payment.member !== null).map((payment) => {
                const memberName = payment.member?.fullName || 'Member removed';
                const memberId = payment.member?.memberId || '—';
                const planName = payment.plan?.planName || 'Plan removed';
                const receipt = payment.receiptNumber || payment._id;
                return (
                  <tr key={payment._id} className="border-b bg-white">
                    <td className="py-3 px-4 text-gray-700">{receipt}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{memberName}</p>
                        <p className="text-sm text-gray-500">{memberId}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{planName}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {formatCurrency(payment.finalAmount)}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {formatCurrency(
                        payment.paymentStatus === 'Paid' ? 0 : 
                        payment.paymentStatus === 'Pending' ? payment.finalAmount :
                        payment.paymentStatus === 'Partial' ? payment.finalAmount :
                        0
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {formatDate(payment.paymentDate)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${getStatusColor(payment.paymentStatus)}`}>
                        {payment.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {(payment.paymentStatus === 'Pending' || payment.paymentStatus === 'Partial') && (
                        <button
                          onClick={() => handleMarkAsPaid(payment._id)}
                          className="btn btn-sm btn-primary"
                        >
                          Mark as Paid
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <p className="text-sm">No recent payments found</p>
                    </div>
                  )}
        </div>
      </div>
    </div>
  );
}

