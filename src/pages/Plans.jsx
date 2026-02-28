import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, TrendingUp , Pencil} from 'lucide-react';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';
// import dollar  from '../../public/dollar.svg';
import pakistaniRupee  from '/pakistan-rupee-icon 1.svg';
import icon4  from '/icon4.svg';
import icon5  from '/icon5.svg';
import { Check } from 'lucide-react';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [planMemberCounts, setPlanMemberCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activePlans: 0,
    totalSubscribers: 0,
    monthlyRevenue: 0,
    topPerformingPlan: 'N/A',
    leastPerformingPlan: 'N/A',
    expiringSubscriptions: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    planName: '',
    duration: { value: 1, unit: 'months' },
    price: '',
    accessType: ['Gym'],
    description: '',
    features: [''],
  });

  // Access type options: label shown to user, value sent to backend (must match enum)
  // Match backend enum: ['Gym', 'Classes', 'Personal Training', 'Spa', 'Swimming']
  const ACCESS_OPTIONS = [
    { label: 'Gym access (6 AM - 10 PM)', value: 'Gym' },
    { label: 'Group fitness classes', value: 'Classes' },
    { label: 'Personal training', value: 'Personal Training' },
    { label: 'Spa access', value: 'Spa' },
    { label: 'Swimming pool', value: 'Swimming' },
  ];

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/plans');
      if (response.data.success) {
        const plansData = response.data.data;
        setPlans(plansData);

        // Fetch members to compute counts per plan
        try {
          const memRes = await api.get('/members?limit=10000');
          if (memRes.data.success) {
            const members = memRes.data.data;
            const counts = {};
            members.forEach((m) => {
              const pid = m.currentPlan?._id || null;
              if (pid) counts[pid] = (counts[pid] || 0) + 1;
            });
            setPlanMemberCounts(counts);
            calculateStats(plansData, members);
          }
        } catch (err) {
          // ignore member count errors
        }
      }
    } catch (error) {
      toast.error('Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (plansData, members) => {
    // Active Plans (isActive === true)
    const activePlans = plansData.filter((p) => p.isActive).length;

    // Total Subscribers (members with Active status)
    const totalSubscribers = members.filter((m) => m.membershipStatus === 'Active').length;

    // Monthly Revenue (sum of all active member plan prices)
    const monthlyRevenue = members
      .filter((m) => m.membershipStatus === 'Active' && m.currentPlan?.price)
      .reduce((sum, m) => sum + (m.currentPlan.price || 0), 0);

    // Top and Least Performing Plans (by subscriber count)
    const planCounts = {};
    members.forEach((m) => {
      const planId = m.currentPlan?._id;
      if (planId) planCounts[planId] = (planCounts[planId] || 0) + 1;
    });

    let topPlan = 'N/A';
    let leastPlan = 'N/A';
    let maxCount = 0;
    let minCount = Infinity;

    plansData.forEach((plan) => {
      const count = planCounts[plan._id] || 0;
      if (count > maxCount) {
        maxCount = count;
        topPlan = plan.planName;
      }
      if (count < minCount && plansData.length > 0) {
        minCount = count;
        leastPlan = plan.planName;
      }
    });

    // Expiring Subscriptions (members expiring in next 7 days)
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const expiringSubscriptions = members.filter((m) => {
      if (!m.planEndDate) return false;
      const endDate = new Date(m.planEndDate);
      return endDate >= today && endDate <= sevenDaysFromNow;
    }).length;

    setStats({
      activePlans,
      totalSubscribers,
      monthlyRevenue,
      topPerformingPlan: topPlan,
      leastPerformingPlan: leastPlan,
      expiringSubscriptions,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        features: formData.features.filter((f) => f.trim() !== ''),
      };

      if (editingPlan) {
        await api.put(`/plans/${editingPlan._id}`, data);
        toast.success('Plan updated successfully');
      } else {
        await api.post('/plans', data);
        toast.success('Plan created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchPlans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save plan');
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      planName: plan.planName,
      duration: plan.duration,
      price: plan.price,
      accessType: plan.accessType,
      description: plan.description || '',
      features: plan.features.length > 0 ? plan.features : [''],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await api.delete(`/plans/${id}`);
        toast.success('Plan deleted successfully');
        fetchPlans();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete plan');
      }
    }
  };

  const resetForm = () => {
    setEditingPlan(null);
    setFormData({
      planName: '',
      duration: { value: 1, unit: 'months' },
      price: '',
      accessType: ['Gym'],
      description: '',
      features: [''],
    });
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ''],
    }));
  };

  const removeFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const updateFeature = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? value : f)),
    }));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Membership Plans</h1>
          <p className="text-gray-600 mt-1">Manage your gym membership plans</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Plan</span>
        </button>
      </div>



<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

  {/* Card 1 */}
  <div className="card border border-l-4 border-l-[#D339F6] border-[#D339F6] p-4">
    <div className="flex items-center flex-col justify-between gap-2">
    <p className="text-sm text-gray-500 mt-2 font-normal">Active Plans</p>
      <p className="text-xl font-semibold text-blue-900">{stats.activePlans}</p>
    </div>
  </div>

  {/* Card 2 */}
  <div className="card border border-l-4 border-l-[#00A63E] border-[#00A63E] p-4">
    <div className="flex items-center flex-col justify-between gap-2">
    <p className="text-sm text-gray-500 mt-2 font-normal">Total Subscribers</p>
      <p className="text-xl font-semibold text-blue-900">{stats.totalSubscribers}</p>
    </div>
  </div>

  {/* Card 3 */}
  <div className="card border border-l-4 border-l-[#155DFC] border-[#155DFC] p-4">
    <div className="flex items-center flex-col justify-between gap-2">
    <p className="text-sm text-gray-500 mt-2 font-normal">Monthly Revenue</p>
      <p className="text-xl font-semibold text-blue-900">{formatCurrency(stats.monthlyRevenue)}</p>
    </div>
  </div>

  {/* Card 4 */}
  <div className="card border border-l-4 border-l-[#0096DC] border-[#0096DC] p-4">
    <div className="flex items-center justify-between flex-col gap-2">
    <p className="text-sm text-gray-500 mt-2 font-normal">Top Performing Plan</p>
      <p className="text-xl font-semibold text-blue-900">{stats.topPerformingPlan}</p>
    </div>
  </div>

  {/* Card 5 */}
  <div className="card border border-l-4 border-l-[#FF4444] border-[#FF4444] p-4">
    <div className="flex items-center justify-between flex-col gap-2">
    <p className="text-sm text-gray-500 mt-2 font-normal">Least Performing Plan</p>
      <p className="text-xl font-semibold text-blue-900">{stats.leastPerformingPlan}</p>
    </div>
  </div>

  {/* Card 6 */}
  <div className="card border border-l-4 border-l-[#F4AF00] border-[#F4AF00] p-4 ">
    <div className="flex items-center justify-between flex-col gap-2">
    <p className="text-sm text-gray-500 mt-2 font-normal">Expiring Subscriptions</p>
      <p className="text-xl font-semibold text-blue-900">{stats.expiringSubscriptions}</p>
    </div>
  </div>

</div>




      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          // fd;lfhfldashjafjadsf;da
          <div key={plan._id} className="card hover:shadow-lg transition-shadow ">
           <div className='w-12 bg-gray-200 items center justify-center flex p-2 rounded-md mb-4'>
             <img src= {pakistaniRupee}  alt="" className='rounded-sm w-7 '/>
           </div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-normal text-gray-600">{plan.planName}</h3>
                <p className="text-2xl font-semibold text-gray-600">
                 <span>{plan.price}</span>  <sub className='text-xl text-gray-500'>/ {plan.duration.unit}</sub>
                 {/* {plan.duration.value} */}
                </p>
              </div>
  
              {/* Buttons moved to card footer for consistent placement */}
            </div>
<hr />
<div className=' flex items-center py-5 gap-3'>
  

  <div className='flex  gap-3 '>

    <div className='w-14 bg-slate-50 flex items-center justify-center rounded-lg p-3'>
      <img src={icon4} alt="" className='w-6 '/>
      </div>
    <div>
      <p>Members</p>
      <h3>{planMemberCounts[plan._id] || 0}</h3>
    </div>
  </div>

  <div  className='flex  gap-3 '>
    <div className='w-14 bg-slate-50 flex items-center justify-center rounded-lg p-3'>
      <img src={icon5} alt="" className='w-6' />
      </div>
    <div><p>Duration</p>
      <h3>{plan.duration.value} {plan.duration.unit}</h3>
    </div>
  </div>
</div>

<hr />
            {/* <div className="mb-4 mt-2">
              <span className="text-3xl font-bold text-primary-600">
                {formatCurrency(plan.price)}
              </span>
            </div> */}

                <div className="space-y-2 mb-4 p-4 ">
                  <p className='text-sm text-gray-500 mb-3'>Features included:</p>
                  <p className="text-sm text-gray-600">{plan.description}</p>

                  <div className="space-y-2">
                    {plan.accessType?.map((access) => {
                      const opt = ACCESS_OPTIONS.find((o) => o.value === access);
                      const label = opt ? opt.label : access;
                      return (
                        <div key={access} className="flex items-center gap-2 text-sm text-gray-700">
                          <Check className="w-6 h-6 text-green-600 bg-gray-200 rounded-full p-1" />
                          <span>{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>


            {plan.features && plan.features.length > 0 && (
              <ul className="space-y-1 text-sm text-gray-700">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                                        {feature}
                  </li>
                ))}
              </ul>
            )}

            <div className="flex justify-between space-x-1 mt-4">
              <button
                onClick={() => handleEdit(plan)}
                className="p-2 text-xl hover:bg-gray-100 rounded-lg flex items-center gap-2 bg-gray-300 w-1/2 justify-center"
              >
               <Pencil /> <span>Edit</span> 
              </button>
              <button
                onClick={() => handleDelete(plan._id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 w-1/2 justify-center bg-gray-300 text-xl"
              >
                <span>Delete</span><Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingPlan ? 'Edit Plan' : 'Create New Plan'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* <div>
            <label className="label">Plan Name *</label>
            <input
              type="text"
              value={formData.planName}
              onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
              className="input"
              required
            />
          </div> */}
          
          {/* Change the input into Dropdown the input code comment above */}
          <div className=' grid grid-cols-2 gap-4'>
 <div>
   <label className="label">Plan Name *</label>
  <select
    value={formData.planName}
    onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
    className="input"
    required
  >
    <option value="">Select Plan</option>
    <option value="Basic">Basic Plan</option>
    {/* <option value="Medium">Medium</option> */}
    <option value="Standard">Standard Plan</option>
    <option value="Premium">Premium Plan</option>
  </select>
 </div>
<div>
            <label className="label">Price *</label>
            <input
              type="number"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="input"
              required
            />
          </div>
</div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Duration *</label>
              <input
                type="number"
                min="1"
                value={formData.duration.value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: { ...formData.duration, value: parseInt(e.target.value) },
                  })
                }
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Unit *</label>
              <select
                value={formData.duration.unit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: { ...formData.duration, unit: e.target.value },
                  })
                }
                className="input"
              >
                <option value="days">Days</option>
                <option value="months">Months</option>
              </select>
            </div>
          </div>



  <div>
            <label className="label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows="3"
            ></textarea>
          </div>



          <div>
            <label className="label">Access Type *</label>
            <div className="space-y-2">
              {ACCESS_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.accessType.includes(opt.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          accessType: [...formData.accessType, opt.value],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          accessType: formData.accessType.filter((t) => t !== opt.value),
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* <div>
            <label className="label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows="3"
            ></textarea>
          </div> */}

          {/* <div>
            <label className="label">Features</label>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  className="input"
                  placeholder="Feature description"
                />
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="btn btn-danger"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={addFeature} className="btn btn-secondary btn-sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Feature
            </button>
          </div> */}

          <div className="flex justify-between space-x-2 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="btn btn-secondary w-1/2"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary w-1/2">
              {editingPlan ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}






