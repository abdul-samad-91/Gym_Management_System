import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Download, Users, UserCheck, TrendingUp, AlertCircle, UserX } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import api from '../utils/api';
import { formatDate, getStatusColor, exportToCSV } from '../utils/helpers';
import toast from 'react-hot-toast';
import phone from '../../phone.svg';
import premium from '../../premium.svg';
import expires from '../../expires.svg';


export default function Members() {
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');
  const [membersTotal, setMembersTotal] = useState(0);
  const [searchParams] = useSearchParams();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [addFormData, setAddFormData] = useState({
    fullName: '',
    gender: 'Male',
    dateOfBirth: '',
    phone: '',
    email: '',
    address: { city: '', state: '', zipCode: '' },
    assignedTrainer: '',
    currentPlan: '',
    planPrice: 0,
    trainerPrice: 0,
    payment: {
      months: 1,
      amount: 0,
      fullPayment: 0,
      remaining: 0,
      paymentMethod: 'Cash',
      paymentStatus: 'Paid'
    }
  });

  // Fetch plans on component mount
  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    fetchStats();
    fetchMembers();
  }, [statusFilter, planFilter]);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/plans', { params: { isActive: true } });
      if (response.data.success) {
        setPlans(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

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
      const params = { limit: 1000 }; // Get all members, not just paginated
      if (statusFilter !== 'All') params.status = statusFilter;
      if (planFilter !== 'All') params.currentPlan = planFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await api.get('/members', { params });
      if (response.data.success) {
        setMembers(response.data.data);
        setMembersTotal(response.data.total);
      }
    } catch (error) {
      toast.error('Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = async () => {
    setIsAddOpen(true);
    try {
      const trainersRes = await api.get('/trainers');
      if (trainersRes.data.success) setTrainers(trainersRes.data.data);
    } catch (error) {
      toast.error('Failed to load form data');
    }
  };

  const closeAddModal = () => {
    setIsAddOpen(false);
    setAddFormData({
      fullName: '',
      gender: 'Male',
      dateOfBirth: '',
      phone: '',
      email: '',
      address: { city: '', state: '', zipCode: '' },
      assignedTrainer: '',
      currentPlan: '',
      planPrice: 0,
      trainerPrice: 0,
      payment: {
        months: 1,
        amount: 0,
        fullPayment: 0,
        remaining: 0,
        paymentMethod: 'Cash',
        paymentStatus: 'Paid'
      }
    });
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    if (name === 'assignedTrainer') {
      const trainer = trainers.find((t) => t._id === value);
      const trainerPrice = trainer?.price || 0;
      setAddFormData((prev) => {
        // Get the base plan price (without trainer price)
        const basePlanPrice = prev.planPrice || 0;
        const updatedAmount = basePlanPrice + trainerPrice;
        const months = parseFloat(prev.payment.months) || 1;
        const totalDue = months * updatedAmount;
        const paidAmount = parseFloat(prev.payment.fullPayment) || 0;
        return {
          ...prev,
          assignedTrainer: value,
          trainerPrice: trainerPrice,
          payment: {
            ...prev.payment,
            amount: updatedAmount,
            remaining: Math.max(0, totalDue - paidAmount),
          },
        };
      });
    } else if (name === 'currentPlan') {
      const plan = plans.find((p) => p._id === value);
      const planPrice = plan?.price ?? 0;
      setAddFormData((prev) => {
        const months = parseFloat(prev.payment.months) || 1;
        const trainerPrice = prev.trainerPrice || 0;
        const updatedAmount = planPrice + trainerPrice;
        const totalDue = months * updatedAmount;
        const paidAmount = parseFloat(prev.payment.fullPayment) || 0;
        return {
          ...prev,
          currentPlan: value,
          planPrice: planPrice,
          payment: {
            ...prev.payment,
            amount: updatedAmount,
            remaining: Math.max(0, totalDue - paidAmount),
          },
        };
      });
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setAddFormData((prev) => {
        const updated = {
          ...prev,
          [parent]: { ...prev[parent], [child]: value },
        };
        
        // Auto-calculate payment amounts when payment fields change
        if (parent === 'payment') {
          const months = parseFloat(updated.payment.months) || 0;
          const amount = parseFloat(updated.payment.amount) || 0;
          const fullPaymentInput = parseFloat(updated.payment.fullPayment) || 0;
          
          // Calculate remaining when months or amount changes
          if (child === 'months' || child === 'amount') {
            const totalDue = months * amount;
            // remaining = total due - amount already paid
            updated.payment.remaining = Math.max(0, totalDue - fullPaymentInput);
          }
          // Calculate remaining when full payment is explicitly entered by user
          else if (child === 'fullPayment') {
            // remaining = total due - amount paid
            updated.payment.remaining = Math.max(0, (months * amount) - fullPaymentInput);
          }
        }
        
        return updated;
      });
    } else {
      setAddFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      // Convert empty strings to null for optional fields
      const submitData = {
        ...addFormData,
        assignedTrainer: addFormData.assignedTrainer || null,
        email: addFormData.email || null,
      };
      
      await api.post('/members', submitData);
      toast.success('Member added successfully');
      closeAddModal();
      // Reset filters to show all members including the newly added one
      setStatusFilter('All');
      setPlanFilter('All');
      setSearchTerm('');
      fetchMembers();
      fetchStats(); // Also refresh stats
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    } finally {
      setAddLoading(false);
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
        <button
          onClick={openAddModal}
          className="btn btn-primary flex items-center space-x-2 bg-blue-700 py-3"
        >
          <Plus className="w-5 h-5" />
          <span>Add Member</span>
        </button>
      </div>

      <div>



        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

          {/* Total Members */}
          <div className="card border border-l-4 border-l-[#D339F6] border-[#D339F6]">
            <div>
              <div className='flex items-center justify-between flex-col'>
                <p className="text-sm text-blue-600 font-medium">Total Members</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {membersTotal || stats?.members?.total || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Active Members */}
          <div className="card  border border-l-4 border-l-[#00A63E] border-[#00A63E] ">
            <div >
              <div className='flex items-center justify-between flex-col'>
                <p className="text-sm text-green-600 font-medium">Active Members</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
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
                <p className="text-2xl font-bold text-purple-900 mt-1">
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
                <p className="text-2xl font-bold text-orange-900 mt-1">
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
                <p className="text-2xl font-bold text-red-900 mt-1">
                  {stats?.members?.expired || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="card border border-l-4 border-[#F4AF00] border-l-[#F4AF00]">
            <div >
              <div className='flex items-center justify-between flex-col'>
                <p className="text-sm text-red-600 font-medium">Renewal this month</p>
                <p className="text-2xl font-bold text-red-900 mt-1">
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
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="input md:w-48"
          >
            <option value="All">All Plans</option>
            {plans.map((plan) => (
              <option key={plan._id} value={plan._id}>
                {plan.planName}
              </option>
            ))}
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
                className={`px-3 py-1 text-sm rounded-full ${member.membershipStatus === "Active"
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
              <Link
                to={`/members/edit/${member._id}`}
                className="flex-1 text-center rounded-xl border py-2 hover:bg-gray-50"
              >
                Edit
              </Link>

              <Link
                to={`/members/${member._id}`}
                className="flex-1 text-center rounded-xl py-2 bg-blue-50 text-blue-600 hover:bg-blue-100"
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

      {/* Add Member Modal */}
      <Modal isOpen={isAddOpen} onClose={closeAddModal} title="Add New Member" size="xl">
        <div className='py-1 flex flex-col '>
          <h2 className='text-lg  font-normal'>Personal Information</h2>
          <p className='text-sm font-normal text-gray-500 mb-2'> Basic Member Details</p>
        </div>
        <hr />

        <form onSubmit={handleAddSubmit} className="space-y-6 mt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={addFormData.fullName}
                onChange={handleAddChange}
                placeholder='Enter Your Name'
                className="input bg-[#F3F4F6]"
                required
              />
            </div>
            <div>
              <label className="label">Gender *</label>
              <select
                name="gender"
                value={addFormData.gender}
                onChange={handleAddChange}
                className="input bg-[#F3F4F6]"
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                value={addFormData.dateOfBirth}
                onChange={handleAddChange}
                className="input bg-[#F3F4F6]"
                required
              />
            </div>
            <div>
              <label className="label">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={addFormData.phone}
                onChange={handleAddChange}
                placeholder='Enter Phone Number'
                className="input bg-[#F3F4F6]"
                required
              />
            </div>

          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              name="email"
              value={addFormData.email}
              onChange={handleAddChange}
              placeholder='Enter your email'
              className="input bg-[#F3F4F6]"
            />
          </div>

          <div>
            <h2 className='text-lg font-normal'>Membership Details </h2>
            <p className='text-sm font-normal text-gray-500 mb-1'>Plan and Payment Information</p>
          <hr />
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>

            <div>
              <label className="label">Assign Trainer (Optional)</label>
              <select
                name="assignedTrainer"
                value={addFormData.assignedTrainer}
                onChange={handleAddChange}
                className="input bg-[#F3F4F6]"
              >
                <option value="">Select Trainer </option>
                {trainers.map((trainer) => (
                  <option key={trainer._id} value={trainer._id}>
                    {trainer.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Membership Plan</label>
              <select
                name="currentPlan"
                value={addFormData.currentPlan}
                onChange={handleAddChange}
                className="input bg-[#F3F4F6]"
              >
                <option value="">Select Plan </option>
                {plans.map((plan) => (
                  <option key={plan._id} value={plan._id}>
                    {plan.planName} {plan.duration.value} {plan.duration.unit} Rs {plan.price}
                  </option>
                ))}
              </select>
            </div>
          </div>


   <div>
     <h2 className='text-lg font-normal mb-1'>Payment Details</h2>
     <p className='text-sm font-normal text-gray-500 mb-1'>Enter payment information</p>
     <hr />
   </div>
   
   <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
       <div>
         <label className="label">Number of Months *</label>
         <input
           type="number"
           name="payment.months"
           value={addFormData.payment.months}
           onChange={handleAddChange}
           placeholder='Enter number of months'
           className="input bg-[#F3F4F6]"
           min="1"
           required
         />
       </div>
       <div>
         <label className="label">Amount per Month *</label>
         <input
           type="number"
           name="payment.amount"
          //  Add the trainer price if assigned trainer to member
           value={addFormData.payment.amount}
           onChange={handleAddChange}
           placeholder='Enter monthly amount'
           className="input bg-[#F3F4F6]"
           min="0"
           required
         />
       </div>
       <div>
         <label className="label">Full Payment Amount</label>
         <input
           type="number"
           name="payment.fullPayment"
           value={addFormData.payment.fullPayment === 0 ? '' : addFormData.payment.fullPayment}
           onChange={handleAddChange}
           placeholder='Auto-calculated or enter amount'
           className="input bg-[#F3F4F6]"
           min="0"
         />
         <p className="text-xs text-gray-500 mt-1">Total: Rs {addFormData.payment.months * addFormData.payment.amount}</p>
       </div>
       <div>
         <label className="label">Remaining Amount</label>
         <input
           type="number"
           name="payment.remaining"
           value={addFormData.payment.remaining}
           className="input bg-[#F3F4F6]"
           readOnly
           disabled
         />
         <p className="text-xs text-gray-500 mt-1">Auto-calculated</p>
       </div>
       <div>
         <label className="label">Payment Method</label>
         <select
           name="payment.paymentMethod"
           value={addFormData.payment.paymentMethod}
           onChange={handleAddChange}
           className="input bg-[#F3F4F6]"
         >
           <option value="Cash">Cash</option>
           <option value="Card">Card</option>
           <option value="UPI">UPI</option>
           <option value="Bank Transfer">Bank Transfer</option>
           <option value="Cheque">Cheque</option>
         </select>
       </div>
       <div>
         <label className="label">Payment Status</label>
         <select
           name="payment.paymentStatus"
           value={addFormData.payment.paymentStatus}
           onChange={handleAddChange}
           className="input bg-[#F3F4F6]"
         >
           <option value="Paid">Paid</option>
           <option value="Pending">Pending</option>
           <option value="Partial">Partial</option>
         </select>
       </div>
     </div>

   <div>
     <h2 className='text-lg font-normal mb-1'>Addresses </h2>
     <hr />
   </div>
<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
<div>
            <label className="label">City</label>
            <input
              type="text"
              name="address.city"
              value={addFormData.address.city}
              onChange={handleAddChange}
              placeholder='Enter your city Name'
              className="input bg-[#F3F4F6]"
            />
          </div>
          <div>
            <label className="label">State</label>
            <input
              type="text"
              name="address.state"
              value={addFormData.address.state}
              onChange={handleAddChange}
              placeholder='Enter Your State Name'
              className="input bg-[#F3F4F6]"
            />
          </div>
</div>
          
          <div>
            <label className="label">ZIP Code</label>
            <input
              type="text"
              name="address.zipCode"
              value={addFormData.address.zipCode}
              onChange={handleAddChange}
              className="input bg-[#F3F4F6]"
            />
          </div>


          <div className="flex justify-end space-x-2 ">
            <button type="button" onClick={closeAddModal} className="btn bg-white border border-gray-300 w-1/2">
              Cancel
            </button>
            <button type="submit" disabled={addLoading} className="btn btn-primary w-1/2 ">
              {addLoading ? 'Saving...' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

