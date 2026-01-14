import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Download, Calendar } from 'lucide-react';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';
import { formatDate, formatTime, exportToCSV } from '../utils/helpers';
import toast from 'react-hot-toast';
import checkin from "../../public/checkin.svg"
import checkout from "../../public/checkout.svg"
import {UserCheck} from 'lucide-react'

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    fetchTodayAttendance();
  }, [selectedDate]);

  const fetchTodayAttendance = async () => {
    try {
      const response = await api.get('/attendance/today');
      if (response.data.success) {
        setAttendance(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const searchMembers = async (term) => {
    if (term.length < 2) {
      setMembers([]);
      return;
    }
    try {
      const response = await api.get(`/members?search=${term}`);
      if (response.data.success) {
        setMembers(response.data.data.filter((m) => m.membershipStatus === 'Active'));
      }
    } catch (error) {
      toast.error('Failed to search members');
    }
  };

  const handleCheckIn = async (memberId) => {
    try {
      const response = await api.post('/attendance/checkin', {
        memberId,
        attendanceType: 'Manual',
      });
      if (response.data.success) {
        toast.success('Check-in successful');
        setShowCheckInModal(false);
        setSearchTerm('');
        setSelectedMember(null);
        fetchTodayAttendance();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async (attendanceId) => {
    try {
      const response = await api.post('/attendance/checkout', { attendanceId });
      if (response.data.success) {
        toast.success('Check-out successful');
        fetchTodayAttendance();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-out failed');
    }
  };

  const handleExport = () => {
    const exportData = attendance.map((att) => ({
      'Member ID': att.member.memberId,
      Name: att.member.fullName,
      'Check-in': formatTime(att.checkInTime),
      'Check-out': att.checkOutTime ? formatTime(att.checkOutTime) : 'Not checked out',
      Type: att.attendanceType,
      Status: att.status,
    }));
    exportToCSV(exportData, `attendance_${selectedDate}`);
    toast.success('Attendance exported successfully');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-normal text-gray-900">Attendance Management</h1>
          <p className="text-gray-600">Track daily member check-ins and check-outs</p>
        </div>
        <button
          onClick={() => setShowCheckInModal(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          {/* <CheckCircle className="w-5 h-5" /> */}
          <img src={checkin} alt="Mark checkin button" />
          <span className='font-normal'>Mark Check-in</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-sm text-gray-600">Today's Attendance</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{attendance.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Checked Out</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {attendance.filter((a) => a.checkOutTime).length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Currently In</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {attendance.filter((a) => !a.checkOutTime).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">

        <div className="flex  space-x-4 justify-between items-center">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-normal text-gray-900">Attendance Records</h2>
            <p className='text-gray-600'>View and manage today's attendance</p>
          </div>
          <div className="flex items-center space-x-2">
            {/* <Calendar className="w-5 h-5 text-gray-500" /> */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input"
            />
            <button onClick={handleExport} className="btn btn-secondary ml-auto flex items-center">
            <Download className="w-5 h-5 mr-2" />
            Export
          </button>
          </div>
          
        </div>
      </div>

      {/* Attendance List */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance Records</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  Member
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                Check-in Time
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  Check-out Time
                </th>
                {/* <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                 Durations
                </th> */}
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((att) => (
                <tr key={att._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3 ">
                      {/* <img
                        src={att.member.photo || '/default-avatar.png'}
                        // alt={att.member.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      /> */}
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-green-500 
                          flex items-center justify-center text-white font-semibold text-lg">
                        {att.member.fullName?.charAt(0)}
                        {att.member.fullName?.split(" ")[1]?.charAt(0)}
                      </div>

                      <div>
                        <p className="font-medium text-gray-900">{att.member.fullName}</p>
                        <p className="text-sm text-gray-500">{att.member.memberId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700 flex gap-1"> <UserCheck  className='text-green-400'/> {formatTime(att.checkInTime)}</td>
                  <td className="py-3 px-4 text-gray-700">
                    {att.checkOutTime ? formatTime(att.checkOutTime) : '__'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="badge badge-info">{att.attendanceType}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`badge ${
                        att.checkOutTime ? 'badge-gray' : 'badge-success'
                      }`}
                    >
                      {att.checkOutTime ? 'Checked Out' : 'Present'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {!att.checkOutTime && (
                      <button
                        onClick={() => handleCheckOut(att._id)}
                        className="btn btn-sm btn-secondary"
                      >
                        Check Out
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {attendance.length === 0 && (
            <div className="text-center py-8 text-gray-500">No attendance records for today</div>
          )}
        </div>
      </div>

      {/* Check-in Modal */}
      <Modal
        isOpen={showCheckInModal}
        onClose={() => {
          setShowCheckInModal(false);
          setSearchTerm('');
          setSelectedMember(null);
        }}
        title="Mark Check-in"
        size="md"
      >
        <p className='mb-5'>Select a member to checkIn</p>
        <hr />

        <div className="space-y-4 ">
        
          <div>
            <label className="label mt-5 mb-3">Search Member</label>
            
            <div className="relative ">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  searchMembers(e.target.value);
                }}
                className="input pl-10"
                placeholder="Search by name, ID, or phone..."
              />
            </div>
            <div>
              <div>
              <label className="label mt-5 mb-3">Or Select Member</label>
              <select
                value={selectedMember?._id || ''}
                onChange={(e) => {
                  const member = members.find(m => m._id === e.target.value);
                  if (member) setSelectedMember(member);
                }}
                className="input w-full"
              >
                <option value="">Select a Member</option>
                {members.length > 0 && members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.fullName} - {member.memberId}
                  </option>
                ))}
              </select>
            </div>
            </div>
          </div>

          {/* Search Results */}
          {members.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {members.map((member) => (
                <div
                  key={member._id}
                  onClick={() => setSelectedMember(member)}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    selectedMember?._id === member._id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {/* <img
                      src={member.photo || '/default-avatar.png'}
                      alt={member.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    /> */}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{member.fullName}</p>
                      <p className="text-sm text-gray-500">{member.memberId}</p>
                      <p className="text-sm text-gray-500">{member.phone}</p>
                    </div>
                    {member.currentPlan && (
                      <span className="badge badge-success">{member.currentPlan.planName}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between space-x-2 pt-4">
            <button
              onClick={() => {
                setShowCheckInModal(false);
                setSearchTerm('');
                setSelectedMember(null);
              }}
              className="btn btn-secondary w-1/2"
            >
              Cancel
            </button>
            <button
              onClick={() => selectedMember && handleCheckIn(selectedMember._id)}
              disabled={!selectedMember}
              className="btn btn-primary w-1/2"
            >
              {/* <CheckCircle className="w-5 h-5 mr-2 " /> */}
              Check In
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

