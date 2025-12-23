import { useState } from 'react';
import { FileText, Download, Calendar, Users, DollarSign, TrendingUp } from 'lucide-react';
import api from '../utils/api';
import { formatDate, formatCurrency, exportToCSV } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Reports() {
  const [reportType, setReportType] = useState('members');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    setLoading(true);
    try {
      let response;
      const params = { startDate, endDate };

      switch (reportType) {
        case 'members':
          response = await api.get('/reports/members', { params });
          break;
        case 'attendance':
          response = await api.get('/reports/attendance', { params });
          break;
        case 'financial':
          response = await api.get('/reports/financial', { params });
          break;
        case 'plans':
          response = await api.get('/reports/plans');
          break;
        case 'trainers':
          response = await api.get('/reports/trainers');
          break;
        default:
          break;
      }

      if (response?.data.success) {
        setReportData(response.data.data);
        toast.success('Report generated successfully');
      }
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!reportData) {
      toast.error('No data to export');
      return;
    }

    let exportData = [];
    
    switch (reportType) {
      case 'members':
        exportData = reportData.members.map((m) => ({
          ID: m.memberId,
          Name: m.fullName,
          Phone: m.phone,
          Email: m.email || 'N/A',
          Status: m.membershipStatus,
          'Join Date': formatDate(m.joinDate),
          Plan: m.currentPlan?.planName || 'N/A',
        }));
        break;
      case 'attendance':
        exportData = reportData.attendance.map((a) => ({
          'Member ID': a.member.memberId,
          Name: a.member.fullName,
          Date: formatDate(a.date),
          'Check-in': new Date(a.checkInTime).toLocaleTimeString(),
          'Check-out': a.checkOutTime ? new Date(a.checkOutTime).toLocaleTimeString() : 'N/A',
          Type: a.attendanceType,
        }));
        break;
      case 'financial':
        exportData = reportData.payments.map((p) => ({
          'Receipt No': p.receiptNumber,
          'Member ID': p.member.memberId,
          Name: p.member.fullName,
          Plan: p.plan.planName,
          Amount: p.finalAmount,
          Method: p.paymentMethod,
          Date: formatDate(p.paymentDate),
          Status: p.paymentStatus,
        }));
        break;
      default:
        break;
    }

    exportToCSV(exportData, `${reportType}_report`);
    toast.success('Report exported successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Generate and export various reports</p>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { id: 'members', label: 'Members', icon: Users },
          { id: 'attendance', label: 'Attendance', icon: TrendingUp },
          { id: 'financial', label: 'Financial', icon: DollarSign },
          { id: 'plans', label: 'Plans', icon: FileText },
          { id: 'trainers', label: 'Trainers', icon: Users },
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => setReportType(type.id)}
            className={`card p-4 text-center hover:shadow-md transition-shadow ${
              reportType === type.id ? 'border-2 border-primary-500' : ''
            }`}
          >
            <type.icon className="w-8 h-8 mx-auto mb-2 text-primary-600" />
            <p className="font-medium text-gray-900">{type.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Report Results */}
      {reportData && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Report Results</h2>
            <button onClick={handleExport} className="btn btn-secondary">
              <Download className="w-5 h-5 mr-2" />
              Export
            </button>
          </div>

          {/* Members Report */}
          {reportType === 'members' && reportData.members && (
            <div>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Members</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.statistics.totalMembers}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {reportData.statistics.byStatus.active}
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Expired</p>
                  <p className="text-2xl font-bold text-red-600">
                    {reportData.statistics.byStatus.expired}
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">On Hold</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {reportData.statistics.byStatus.onHold}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Report */}
          {reportType === 'attendance' && reportData.attendance && (
            <div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Attendance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.statistics.totalAttendance}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Unique Members</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {reportData.statistics.uniqueMembers}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Avg per Day</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {reportData.statistics.averagePerDay}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Financial Report */}
          {reportType === 'financial' && reportData.payments && (
            <div>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(reportData.statistics.totalRevenue)}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {reportData.statistics.totalTransactions}
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Discount</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(reportData.statistics.totalDiscount)}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Avg Transaction</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(reportData.statistics.averageTransaction)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Plan Report */}
          {reportType === 'plans' && reportData && (
            <div className="space-y-3">
              {reportData.map((planStat) => (
                <div key={planStat.plan.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{planStat.plan.name}</h3>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(planStat.plan.price)} - {planStat.plan.duration.value}{' '}
                        {planStat.plan.duration.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Active Members</p>
                      <p className="text-2xl font-bold text-primary-600">
                        {planStat.activeMembers}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(planStat.totalRevenue)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Trainer Report */}
          {reportType === 'trainers' && reportData && (
            <div className="space-y-3">
              {reportData.map((trainerStat) => (
                <div key={trainerStat.trainer.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{trainerStat.trainer.name}</h3>
                      <p className="text-sm text-gray-600">
                        {trainerStat.trainer.specialization.join(', ')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {trainerStat.trainer.experience} years experience
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Assigned Members</p>
                      <p className="text-2xl font-bold text-primary-600">
                        {trainerStat.totalAssignedMembers}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Active Members</p>
                      <p className="text-lg font-bold text-green-600">
                        {trainerStat.activeMembers}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

