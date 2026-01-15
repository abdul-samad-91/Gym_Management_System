import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Upload } from 'lucide-react';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'Male',
    phone: '',
    // email: '',
    specialization: [],
    experience: 0,
    salary: '',
    photo: null, // store backend URL here
  });

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

  // Handle photo selection & upload
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview locally
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Store the actual File object for upload
    setFormData((prev) => ({ ...prev, photo: file }));

    // Upload to backend
    // const uploadData = new FormData();
    // uploadData.append('photo', file);

    // try {
    //   const res = await api.post('/trainer/upload', uploadData);
    //   const photoUrl = res.data.photoUrl;
    //   setFormData((prev) => ({ ...prev, photo: photoUrl }));
    // } catch (err) {
    //   console.log(err)
    //   toast.error('Failed to upload photo');
    // }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     if (editingTrainer) {
  //       await api.put(`/trainers/${editingTrainer._id}`, formData);
  //       toast.success('Trainer updated successfully');
  //     } else {
  //       await api.post('/trainers', formData);
  //       toast.success('Trainer added successfully');
  //     }
  //     setShowModal(false);
  //     resetForm();
  //     fetchTrainers();
  //   } catch (error) {
  //     toast.error(error.response?.data?.message || 'Failed to save trainer');
  //   }
  // };


// handle submit new code with photo upload to backend
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const submitData = new FormData();

    // Append all fields
    submitData.append("fullName", formData.fullName);
    submitData.append("gender", formData.gender);
    submitData.append("phone", formData.phone);
    submitData.append("experience", formData.experience);
    submitData.append("salary", formData.salary || "");
    submitData.append("price", formData.price || "");

    formData.specialization.forEach((spec) =>
      submitData.append("specialization[]", spec)
    );

    // Append image file
    if (formData.photo instanceof File) {
      submitData.append("photo", formData.photo);
    }

    // Config for multipart/form-data
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    };

    if (editingTrainer) {
      await api.put(`/trainers/${editingTrainer._id}`, submitData, config);
      toast.success("Trainer updated successfully");
    } else {
      await api.post("/trainers", submitData, config);
      toast.success("Trainer added successfully");
    }

    setShowModal(false);
    resetForm();
    fetchTrainers();
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to save trainer");
  }
};

// handle submit end  code with photo upload to backend


// Handle Edit old code 
  // const handleEdit = (trainer) => {
  //   setEditingTrainer(trainer);
  //   setFormData({
  //     fullName: trainer.fullName,
  //     gender: trainer.gender,
  //     phone: trainer.phone,
  //     price: trainer.price || 0,
  //     email: trainer.email || '',
  //     specialization: trainer.specialization,
  //     experience: trainer.experience,
  //     salary: trainer.salary,
  //     photo: trainer.photo || null,
  //   });
  //   setPhotoPreview(trainer.photo || null);
  //   setShowModal(true);
  // };


  // Handle Edit new code with photo upload to backend
const handleEdit = (trainer) => {
  setEditingTrainer(trainer);
  setFormData({
    fullName: trainer.fullName,
    gender: trainer.gender,
    phone: trainer.phone,
    specialization: trainer.specialization,
    experience: trainer.experience,
    salary: trainer.salary,
    price: trainer.price,
    photo: null, // IMPORTANT
  });
  setPhotoPreview(trainer.photo || null);
  setShowModal(true);
};

  // Handle Edit end 




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
      photo: null,
    });
    setPhotoPreview(null);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
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
                src={trainer.photo ? trainer.photo : '/default-avatar.png'}
                alt={trainer.fullName}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{trainer.fullName}</h3>
                    <p className="text-sm text-gray-500">{trainer.trainerId}</p>
                    <p className="text-sm text-gray-600 mt-1">{trainer.experience} years exp.</p>
                    {/* <p className="text-sm text-gray-600 mt-1"> ${trainer.price} per session</p> */}
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
                      {trainer.assignedMembers?.length || 0} members
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
          {/* Full Name */}
         <div className='grid grid-cols-2 gap-4'>
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
         </div>

          {/* Gender & Experience */}
          <div className="grid grid-cols-2 gap-4">
            {/* <div>
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
            </div> */}
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

             {/* Phone */}
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
          </div>


<div className='grid grid-cols-2 gap-4'>

{/* Trainer Price  */}
<div>
  <label className="label">Price Per Session*</label>
  <input
    type="number"
    min="0"
    value={formData.price || ''}
    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
    className="input"
    required
  />
</div>
{/* Trainer Price  */}


          {/* Upload Photo */}
          <div className="flex items-center justify-center   ">
            <img
              src={photoPreview || '/default-avatar.png'}
              // alt="Preview"
              className="w-24 h-24 rounded-full object-cover"
            />
            <label className="btn btn-secondary cursor-pointer flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Choose File
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          </div>

          </div>

          {/* Specialization */}
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

          {/* Modal Actions */}
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
