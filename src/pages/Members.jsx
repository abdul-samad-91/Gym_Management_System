import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Download, Users, UserCheck, TrendingUp, AlertCircle, UserX } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';
import { formatDate, getStatusColor, exportToCSV } from '../utils/helpers';
import toast from 'react-hot-toast';
import phone from '../../public/phone.svg';
import premium from '../../public/premium.svg';
import expires from '../../public/expires.svg';


export default function Members() {
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchStats();
    fetchMembers();
  }, [statusFilter]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await api.get('/members', { params });
      if (response.data.success) {
        setMembers(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchMembers();
  };

  const handleExport = () => {
    const exportData = members.map(member => ({
      ID: member.memberId,
      Name: member.fullName,
      Phone: member.phone,
      Email: member.email || 'N/A',
      Status: member.membershipStatus,
      'Join Date': formatDate(member.joinDate),
      'Plan End Date': formatDate(member.planEndDate),
    }));
    exportToCSV(exportData, 'members');
    toast.success('Members exported successfully');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Members Management</h1>
          <p className="text-gray-600">Manage and track all gym members</p>
        </div>
        <Link to="/members/add" className="btn btn-primary flex items-center space-x-2 bg-blue-700 py-3">
          <Plus className="w-5 h-5" />
          <span>Add Member</span>
        </Link>
      </div>

<div>
  

 
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

  {/* Total Members */}
  <div className="card border border-l-4 border-l-[#D339F6] border-[#D339F6]">
    <div>
      <div  className='flex items-center justify-between flex-col'>
        <p className="text-sm text-blue-600 font-medium">Total Members</p>
        <p className="text-3xl font-bold text-blue-900 mt-1">
          {stats?.members?.total || 0}
        </p>
      </div>
    </div>
  </div>

  {/* Active Members */}
  <div className="card  border border-l-4 border-l-[#00A63E] border-[#00A63E] ">
    <div >
      <div className='flex items-center justify-between flex-col'>
        <p className="text-sm text-green-600 font-medium">Active Members</p>
        <p className="text-3xl font-bold text-green-900 mt-1">
          {stats?.members?.active || 0}
        </p>
      </div>
    </div>
  </div>

  {/* New This Month */}
  <div className="card border border-l-4 border-l-[#155DFC] border-[#155DFC] ">
    <div>
      <div className='flex items-center justify-between flex-col'>
        <p className="text-sm text-purple-600 font-medium">New This Month</p>
        <p className="text-3xl font-bold text-purple-900 mt-1">
          {stats?.members?.newThisMonth || 0}
        </p>
      </div>
    </div>
  </div>

  {/* Expiring Soon */}
  <div className="card border border-l-4 border-l-[#0096DC] border-[#0096DC] ">
    <div>
      <div className='flex items-center justify-between flex-col'>
        <p className="text-sm text-orange-600 font-medium">Expiring Soon</p>
        <p className="text-3xl font-bold text-orange-900 mt-1">
          {stats?.alerts?.expiringMemberships || 0}
        </p>
      </div>
    </div>
  </div>

  {/* Expired */}
  <div className="card border border-l-4 border-[#FF4444] border-l-[#FF4444]">
    <div >
      <div className='flex items-center justify-between flex-col'>
        <p className="text-sm text-red-600 font-medium">Expired</p>
        <p className="text-3xl font-bold text-red-900 mt-1">
          {stats?.members?.expired || 0}
        </p>
      </div>
    </div>
  </div>
  <div className="card border border-l-4 border-[#F4AF00] border-l-[#F4AF00]">
    <div >
      <div className='flex items-center justify-between flex-col'>
        <p className="text-sm text-red-600 font-medium">Renewal this month</p>
        <p className="text-3xl font-bold text-red-900 mt-1">
          {stats?.members?.renewalThisMonth || 0}
        </p>
      </div>
    </div>
  </div>

</div>

</div>


      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="input pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input md:w-48"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
            <option value="On Hold">On Hold</option>
            <option value="Inactive">Inactive</option>
          </select>
         {/*filters plans */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input md:w-48"
          >
            <option value="All">All Plans</option>
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
            <option value="On Hold">On Hold</option>
          </select>
          {/* <button onClick={handleSearch} className="btn btn-primary">
            <Filter className="w-5 h-5" />
          </button>
          <button onClick={handleExport} className="btn btn-secondary">
            <Download className="w-5 h-5" />
          </button> */}
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {members.map((member) => (
    <div
      key={member._id}
      className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition p-5"
    >
      {/* Top Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">

          {/* Avatar with initials gradient */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-green-500 
                          flex items-center justify-center text-white font-semibold text-lg">
            {member.fullName?.charAt(0)}
            {member.fullName?.split(" ")[1]?.charAt(0)}
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {member.fullName}
            </h3>
            <p className="text-sm text-gray-500">{member.memberId}</p>
          </div>
        </div>

        {/* Status badge */}
        <span
          className={`px-3 py-1 text-sm rounded-full ${
            member.membershipStatus === "Active"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {member.membershipStatus}
        </span>
      </div>

      {/* Info Section */}
      <div className="mt-4 space-y-3 border rounded-xl p-4">

        {/* Phone */}
        <div className="flex items-center space-x-2 text-gray-700">
          <span><img src={phone} alt="Phone Icon" className="w-5 h-5" /></span>
          <span>{member.phone || "No phone provided"}</span>
        </div>

        {/* Plan */}
        <div className="flex items-center space-x-2 text-gray-700">
          <span><img src={premium} alt="Plan Icon" className="w-5 h-5" /></span>
          <span>
            {member.currentPlan?.planName
              ? `${member.currentPlan.planName} Plan`
              : "No plan assigned"}
          </span>
        </div>

        {/* Expiry */}
        <div className="flex items-center space-x-2 text-gray-700">
          <span><img src={expires} alt="Expiry Icon" className="w-5 h-5" /></span>
          <span>
            Expires:{" "}
            {member.planEndDate
              ? formatDate(member.planEndDate)
              : "N/A"}
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-4 flex items-center gap-3">
        <button className="flex-1 rounded-xl border py-2">
          Edit
        </button>

        <Link
          to={`/members/${member._id}`}
          className="flex-1 text-center rounded-xl py-2 bg-blue-50 text-blue-600"
        >
          View Details
        </Link>
      </div>
    </div>
  ))}
</div>


      {members.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">No members found</p>
        </div>
      )}
    </div>
  );
}

