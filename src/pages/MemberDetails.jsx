import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import api from '../utils/api';
import { formatDate, formatCurrency, getStatusColor, calculateAge } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function MemberDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);

  useEffect(() => {
    fetchMemberDetails();
  }, [id]);

  const fetchMemberDetails = async () => {
    try {
      const response = await api.get(`/members/${id}`);
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch member details');
    } finally {
      setLoading(false);
    }
    
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/members/${id}`);
      toast.success('Member deleted successfully');
      navigate('/members');
    } catch (error) {
      toast.error('Failed to delete member');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!data) return <div>Member not found</div>;

  const { member, attendanceHistory, paymentHistory } = data;
  // console.log(data)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/members')} className="btn btn-secondary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Member Details</h1>
            <p className="text-gray-600">{member.memberId}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link to={`/members/edit/${id}`} className="btn btn-secondary">
            <Edit className="w-5 h-5 mr-2" />
            Edit
          </Link>
          <button onClick={() => setShowDeleteModal(true)} className="btn btn-danger">
            <Trash2 className="w-5 h-5 mr-2" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card lg:col-span-1 space-y-6">
          <div className="flex items-center space-x-3 ">

          {/* Avatar with initials gradient */}
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-green-500 
                          flex items-center justify-center text-white font-semibold text-lg ">
            {member.fullName?.charAt(0)}
            {member.fullName?.split(" ")[1]?.charAt(0)}
          </div>

          <div className='flex flex-col gap-1 '>
            <h3 className="font-semibold text-gray-900 text-lg">
              {member.fullName}
            </h3>
            <p className="text-sm text-gray-500">{member.memberId}</p>
            <span className={`badge ${getStatusColor(member.membershipStatus)} text-lg`}>
              {member.membershipStatus}
            </span>
          </div>
          </div>

          <div className="mt-6 space-y-3  ml-10">
            <div className="flex items-center space-x-2 text-gray-700" >
              <Phone className="w-5 h-5" />
              <span>{member.phone}</span>
            </div>
            {member.email && (
              <div className="flex items-center space-x-2 text-gray-700">
                <Mail className="w-5 h-5" />
                <span>{member.email}</span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-gray-700">
              <User className="w-5 h-5" />
              <span>
                {member.gender}, {calculateAge(member.dateOfBirth)} years
              </span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700">
              <Calendar className="w-5 h-5" />
              <span>Joined: {formatDate(member.joinDate)}</span>
            </div>
          </div>

          {member.emergencyContact && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Emergency Contact</h3>
              <p className="text-sm text-gray-700">{member.emergencyContact.name}</p>
              <p className="text-sm text-gray-600">{member.emergencyContact.phone}</p>
              <p className="text-sm text-gray-600">{member.emergencyContact.relation}</p>
            </div>
          )}
        </div>

        {/* Details & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Membership Info */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Membership Information</h3>
              <button onClick={() => setShowRenewModal(true)} className="btn btn-primary btn-sm">
                Renew
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Current Plan</p>
                <p className="font-medium text-gray-900">
                  {member.currentPlan?.planName || 'No Plan'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Plan Price</p>
                <p className="font-medium text-gray-900">
                  {member.currentPlan ? formatCurrency(member.currentPlan.price) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-medium text-gray-900">{formatDate(member.planStartDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">End Date</p>
                <p className="font-medium text-gray-900">{formatDate(member.planEndDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trainer Price</p>
                <p className="font-medium text-gray-900">
                  {member.assignedTrainer?.price
                    ? formatCurrency(member.assignedTrainer.price)
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>


          {/* Attendance History */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance History</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {attendanceHistory.map((attendance) => (
                <div
                  key={attendance._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{formatDate(attendance.date)}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(attendance.checkInTime).toLocaleTimeString()}
                      {attendance.checkOutTime &&
                        ` - ${new Date(attendance.checkOutTime).toLocaleTimeString()}`}
                    </p>
                  </div>
                  <span className="badge badge-success">{attendance.attendanceType}</span>
                </div>
              ))}
              {attendanceHistory.length === 0 && (
                <p className="text-center text-gray-500 py-4">No attendance records</p>
              )}
            </div>
          </div>

          {/* Payment History */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {paymentHistory.map((payment) => (
                <div
                  key={payment._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{payment.plan.planName}</p>
                    <p className="text-sm text-gray-600">{formatDate(payment.paymentDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(payment.finalAmount)}
                    </p>
                    <span className={`badge ${getStatusColor(payment.paymentStatus)}`}>
                      {payment.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
              {paymentHistory.length === 0 && (
                <p className="text-center text-gray-500 py-4">No payment records</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Member"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-gray-900">
                Are you sure you want to delete this member? This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button onClick={() => setShowDeleteModal(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleDelete} className="btn btn-danger">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

