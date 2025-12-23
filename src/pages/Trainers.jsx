import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'Male',
    phone: '',
    email: '',
    specialization: [],
    experience: 0,
    salary: '',
  });

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const response = await api.get('/trainers');
      if (response.data.success) {
        setTrainers(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch trainers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTrainer) {
        await api.put(`/trainers/${editingTrainer._id}`, formData);
        toast.success('Trainer updated successfully');
      } else {
        await api.post('/trainers', formData);
        toast.success('Trainer added successfully');
      }
      setShowModal(false);
      resetForm();
      fetchTrainers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save trainer');
    }
  };

  const handleEdit = (trainer) => {
    setEditingTrainer(trainer);
    setFormData({
      fullName: trainer.fullName,
      gender: trainer.gender,
      phone: trainer.phone,
      email: trainer.email || '',
      specialization: trainer.specialization,
      experience: trainer.experience,
      salary: trainer.salary,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trainer?')) {
      try {
        await api.delete(`/trainers/${id}`);
        toast.success('Trainer deleted successfully');
        fetchTrainers();
      } catch (error) {
        toast.error('Failed to delete trainer');
      }
    }
  };

  const resetForm = () => {
    setEditingTrainer(null);
    setFormData({
      fullName: '',
      gender: 'Male',
      phone: '',
      email: '',
      specialization: [],
      experience: 0,
      salary: '',
    });
  };

  const specializationOptions = [
    'Yoga',
    'Cardio',
    'Strength Training',
    'CrossFit',
    'Pilates',
    'Zumba',
    'Martial Arts',
    'Swimming',
    'Personal Training',
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trainers</h1>
          <p className="text-gray-600">Manage your gym trainers</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Trainer</span>
        </button>
      </div>

      {/* Trainers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.map((trainer) => (
          <div key={trainer._id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start space-x-4">
              <img
                src={trainer.photo || '/default-avatar.png'}
                alt={trainer.fullName}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{trainer.fullName}</h3>
                    <p className="text-sm text-gray-500">{trainer.trainerId}</p>
                    <p className="text-sm text-gray-600 mt-1">{trainer.experience} years exp.</p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(trainer)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(trainer._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-gray-600">📞 {trainer.phone}</p>
                  {trainer.email && <p className="text-sm text-gray-600">✉️ {trainer.email}</p>}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {trainer.specialization.map((spec) => (
                      <span key={spec} className="badge badge-info text-xs">
                        {spec}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-200">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {trainer.assignedMembers.length} members
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {trainers.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">No trainers found</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="input"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="input"
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Experience (years) *</label>
              <input
                type="number"
                min="0"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Phone Number *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">Salary</label>
            <input
              type="number"
              min="0"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">Specialization *</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {specializationOptions.map((spec) => (
                <label key={spec} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.specialization.includes(spec)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          specialization: [...formData.specialization, spec],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          specialization: formData.specialization.filter((s) => s !== spec),
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{spec}</span>
                </label>
              ))}
            </div>
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
              {editingTrainer ? 'Update Trainer' : 'Add Trainer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

