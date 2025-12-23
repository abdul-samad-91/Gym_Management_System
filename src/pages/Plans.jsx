import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, TrendingUp } from 'lucide-react';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/plans');
      if (response.data.success) {
        setPlans(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch plans');
    } finally {
      setLoading(false);
    }
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
          <p className="text-gray-600">Manage your gym membership plans</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Plan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan._id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{plan.planName}</h3>
                <p className="text-sm text-gray-600">
                  {plan.duration.value} {plan.duration.unit}
                </p>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEdit(plan)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(plan._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-3xl font-bold text-primary-600">
                {formatCurrency(plan.price)}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">{plan.description}</p>
              <div className="flex flex-wrap gap-2">
                {plan.accessType.map((access) => (
                  <span key={access} className="badge badge-info">
                    {access}
                  </span>
                ))}
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
        title={editingPlan ? 'Edit Plan' : 'Add New Plan'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Plan Name *</label>
            <input
              type="text"
              value={formData.planName}
              onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
              className="input"
              required
            />
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

          <div>
            <label className="label">Access Type *</label>
            <div className="space-y-2">
              {['Gym', 'Classes', 'Personal Training', 'Spa', 'Swimming'].map((type) => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.accessType.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          accessType: [...formData.accessType, type],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          accessType: formData.accessType.filter((t) => t !== type),
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
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
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingPlan ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

