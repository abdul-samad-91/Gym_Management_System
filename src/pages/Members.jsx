import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Download } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';
import { formatDate, getStatusColor, exportToCSV } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchMembers();
  }, [statusFilter]);

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
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-600">Manage your gym members</p>
        </div>
        <Link to="/members/add" className="btn btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Member</span>
        </Link>
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
          <button onClick={handleSearch} className="btn btn-primary">
            <Filter className="w-5 h-5" />
          </button>
          <button onClick={handleExport} className="btn btn-secondary">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <Link
            key={member._id}
            to={`/members/${member._id}`}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start space-x-4">
              {/* <img
                src={member.photo || '/default-avatar.png'}
                alt={member.fullName}
                className="w-16 h-16 rounded-full object-cover"
              /> */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.fullName}</h3>
                    <p className="text-sm text-gray-500">{member.memberId}</p>
                  </div>
                  <span className={`badge ${getStatusColor(member.membershipStatus)}`}>
                    {member.membershipStatus}
                  </span>
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <p className="text-gray-600">📞 {member.phone}</p>
                  {member.email && <p className="text-gray-600">✉️ {member.email}</p>}
                  {member.currentPlan && (
                    <p className="text-gray-600">💳 {member.currentPlan.planName}</p>
                  )}
                  {member.planEndDate && (
                    <p className="text-gray-600">
                      📅 Expires: {formatDate(member.planEndDate)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Link>
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

