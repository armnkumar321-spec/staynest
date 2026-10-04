import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../../api/client.js';
import { STAY_TYPES } from '../../utils/format.js';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const ALLOWED_EXT_REGEX = /\.(jpg|jpeg|png|webp)$/i;

const empty = {
  title: '',
  description: '',
  type: 'homestay',
  city: '',
  state: '',
  address: '',
  pricePerNight: '',
  maxGuests: 2,
  bedrooms: 1,
  amenities: '',
  imageUrl: '',
};

export default function ListingForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/listings/${id}`).then(({ data }) => {
      const mainImage = data.images && data.images[0] ? data.images[0] : '';
      setForm({
        ...empty,
        ...data,
        amenities: Array.isArray(data.amenities) ? data.amenities.join(', ') : '',
        imageUrl: mainImage,
      });
      setPreviewUrl(mainImage);
    });
  }, [id, isEdit]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validateFile = (file) => {
    if (!file) return 'No file selected.';
    const isValidType = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXT_REGEX.test(file.name);
    if (!isValidType) {
      return 'Invalid file type. Only JPG, PNG, and WebP images are allowed.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds maximum limit of 2 MB.';
    }
    return null;
  };

  const handleFileUpload = async (file) => {
    setError('');
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const { data } = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data && data.url) {
        setForm((prev) => ({ ...prev, imageUrl: data.url }));
        setPreviewUrl(data.url);
      }
    } catch (err) {
      setError(getErrorMessage(err));
      // Revert preview if upload failed and no prior URL
      if (!form.imageUrl) {
        setPreviewUrl('');
      } else {
        setPreviewUrl(form.imageUrl);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, imageUrl: '' }));
    setPreviewUrl('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const { title, description, type, city, state, address, imageUrl, amenities } = form;
    const payload = {
      title,
      description,
      type,
      city,
      state,
      address,
      pricePerNight: Number(form.pricePerNight),
      maxGuests: Number(form.maxGuests),
      bedrooms: Number(form.bedrooms),
      amenities: amenities.split(',').map((a) => a.trim()).filter(Boolean),
    };
    if (imageUrl) payload.images = [imageUrl];

    try {
      if (isEdit) await api.put(`/listings/${id}`, payload);
      else await api.post('/listings', payload);
      navigate('/host');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const currentImage = previewUrl || form.imageUrl;

  return (
    <form className="card form wide" onSubmit={submit}>
      <h1>{isEdit ? 'Edit listing' : 'Create a new listing'}</h1>
      <input required placeholder="Title" value={form.title} onChange={set('title')} />
      <textarea required placeholder="Describe your place" value={form.description} onChange={set('description')} />
      <div className="row">
        <select value={form.type} onChange={set('type')}>
          {STAY_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <input required type="number" min="0" placeholder="Price per night (₹)" value={form.pricePerNight} onChange={set('pricePerNight')} />
      </div>
      <div className="row">
        <input required placeholder="City" value={form.city} onChange={set('city')} />
        <input required placeholder="State" value={form.state} onChange={set('state')} />
      </div>
      <input required placeholder="Address" value={form.address} onChange={set('address')} />
      <div className="row">
        <label className="grow">Max guests
          <input type="number" min="1" value={form.maxGuests} onChange={set('maxGuests')} />
        </label>
        <label className="grow">Bedrooms
          <input type="number" min="0" value={form.bedrooms} onChange={set('bedrooms')} />
        </label>
      </div>
      <input placeholder="Amenities (comma separated: WiFi, AC, Parking)" value={form.amenities} onChange={set('amenities')} />

      <div className="form-group">
        <label>Listing Image</label>
        {currentImage ? (
          <div className="upload-preview">
            <img src={currentImage} alt="Listing preview" />
            <div className="upload-preview-overlay">
              <span className="small muted">
                {uploading ? 'Uploading to Cloudinary...' : 'Image ready'}
              </span>
              <div className="upload-preview-actions">
                <button
                  type="button"
                  className="btn btn-ghost small"
                  onClick={handleRemoveImage}
                  disabled={uploading}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`dropzone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <div className="dropzone-icon">📷</div>
            <div className="dropzone-text">
              {uploading ? 'Uploading image...' : 'Drag & drop image here, or click to browse'}
            </div>
            <div className="dropzone-subtext">
              Supports JPG, PNG, WebP (Max 2 MB)
            </div>
          </div>
        )}

        <input
          style={{ marginTop: '8px' }}
          placeholder="Or enter Image URL manually (optional)"
          value={form.imageUrl}
          onChange={(e) => {
            set('imageUrl')(e);
            setPreviewUrl(e.target.value);
          }}
        />
      </div>

      {error && <p className="error">{error}</p>}
      <button className="btn" disabled={uploading}>
        {uploading ? 'Uploading image...' : isEdit ? 'Save changes' : 'Publish listing'}
      </button>
    </form>
  );
}
