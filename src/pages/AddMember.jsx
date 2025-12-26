import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function AddMember() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [trainers, setTrainers] = useState([]); // <-- For trainer dropdown
  const [plans, setPlans] = useState([]); // <-- For plan dropdown
  // const [trainerPrices, setTrainerPrices] = useState([]); // <-- For trainer price dropdown
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'Male',
    dateOfBirth: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    assignedTrainer: '', // <-- New field for trainer assignment
    currentPlan: '', // <-- New field for plan assignment
  });

  useEffect(() => {
    fetchTrainers(); // fetch trainers for dropdown
    fetchPlans(); // fetch plans for dropdown
    if (isEdit) fetchMember();
  }, [id]);

  const fetchTrainers = async () => {
    try {
      const response = await api.get('/trainers');
      if (response.data.success) {
        setTrainers(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch trainers');
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await api.get('/plans', { params: { isActive: true } });
      if (response.data.success) {
        setPlans(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch plans');
    }
  };

  const fetchMember = async () => {
    try {
      const response = await api.get(`/members/${id}`);
      if (response.data.success) {
        const member = response.data.data.member;
        setFormData({
          fullName: member.fullName,
          gender: member.gender,
          dateOfBirth: member.dateOfBirth.split('T')[0],
          phone: member.phone,
          email: member.email || '',
          address: member.address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
          },
          assignedTrainer: member.assignedTrainer?._id || '', // <-- Populate assigned trainer if editing
          currentPlan: member.currentPlan?._id || '', // <-- Populate plan if editing
        });
      }
    } catch (error) {
      toast.error('Failed to fetch member details');
    }
  };



  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Send as JSON since photo upload is currently disabled
      const submitData = { ...formData };

      if (isEdit) {
        await api.put(`/members/${id}`, submitData);
        toast.success('Member updated successfully');
      } else {
        // to add new member
        await api.post('/members', submitData);
        toast.success('Member added successfully');
      }
      navigate('/members');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate('/members')} className="btn btn-secondary">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Member' : 'Add New Member'}
          </h1>
          <p className="text-gray-600">Fill in the member information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
         {/* Photo Upload */}
        {/* <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Photo</h2>
          <div className="flex items-center space-x-4">
            <img
              src={photoPreview || '/default-avatar.png'}
              alt="Preview"
              className="w-24 h-24 rounded-full object-cover"
            />
            <label className="btn btn-secondary cursor-pointer">
              <Upload className="w-5 h-5 mr-2" />
              Upload Photo
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          </div>
        </div> */}


        {/* Personal Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="input"
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
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            {/* Trainer Assignment */}
            <div>
              <label className="label">Assign Trainer</label>
              <select
                name="assignedTrainer"
                value={formData.assignedTrainer}
                onChange={handleChange}
                className="input"
              >
                <option value="">-- Select Trainer --</option>
                {trainers.map((trainer) => (
                  <option key={trainer._id} value={trainer._id}>
                    {trainer.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* Plan Assignment */}
            <div>
              <label className="label">Assign Plan</label>
              <select
                name="currentPlan"
                value={formData.currentPlan}
                onChange={handleChange}
                className="input"
              >
                <option value="">-- Select Plan --</option>
                {plans.map((plan) => (
                  <option key={plan._id} value={plan._id}>
                    {plan.planName} • {plan.duration.value} {plan.duration.unit} • ${plan.price}
                  </option>
                ))}
              </select>
            </div>

 {/* Trainer Price  */}
            {/* <div>
              <label className="label">Select Trainer Price</label>
              <select
                name="assignedTrainerPrice"
                value={formData.assignedTrainerPrice}
                onChange={handleChange}
                className="input"
              >
                <option value="">-- Select Trainer Price --</option>
                {trainerPrices.map((trainerPrice) => (
                  <option key={trainerPrice._id} value={trainerPrice._id}>
                    {trainerPrice.price}
                  </option>
                ))}
              </select>
            </div> */}

        {/* Trainer Price  */}

          </div>
        </div>
       


        {/* Address */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Street</label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="label">City</label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="label">State</label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="label">ZIP Code</label>
              <input
                type="text"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>
        </div>


{/* Emergency Contact */}
        {/* <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Name</label>
              <input
                type="text"
                name="emergencyContact.name"
                value={formData.emergencyContact.name}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                type="tel"
                name="emergencyContact.phone"
                value={formData.emergencyContact.phone}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="label">Relation</label>
              <input
                type="text"
                name="emergencyContact.relation"
                value={formData.emergencyContact.relation}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Spouse, Parent"
              />
            </div>
          </div>
        </div> */}

        {/* Medical Notes */}
        {/* <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Medical Notes</h2>
          <textarea
            name="medicalNotes"
            value={formData.medicalNotes}
            onChange={handleChange}
            className="input"
            rows="4"
            placeholder="Any medical conditions, injuries, or notes..."
          ></textarea>
        </div> */}




{/* Submit  */}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate('/members')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            <Save className="w-5 h-5 mr-2" />
            {loading ? 'Saving...' : isEdit ? 'Update Member' : 'Add Member'}
          </button>
        </div>
      </form>
    </div>
  );
}
