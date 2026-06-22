import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { farmerAPI } from '../../services/api';
import { LuArrowRight, LuCheckCircle2, LuUpload, LuAlertCircle, LuX, LuFileVideo, LuLayoutGrid, LuSmartphone, LuShieldAlert } from 'react-icons/lu';
import Button from '../../components/Button';
import IconWrapper from '../../components/IconWrapper';
import { formatCropLabel, formatDamageLabel } from '../../utils/emojiMaps';
import { useRef } from 'react';

const CROP_OPTIONS = [
  'wheat', 'rice', 'cotton', 'sugarcane', 'maize', 'bajra', 'jowar',
  'soybean', 'groundnut', 'potato', 'onion', 'tomato'
];

export default function SubmitClaim() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    crop: '',
    acres: '',
    damageInfo: {
      type: '',
      description: '',
      dateOccurred: ''
    },
    location: {
      village: '',
      district: ''
    },
    images: [],
    video: null,
    keyframes: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractingKeyframes, setExtractingKeyframes] = useState(false);
  const [submittedClaim, setSubmittedClaim] = useState(null);
  const videoRef = useRef(null);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 10) {
      setError('You can upload a maximum of 10 photos.');
      return;
    }
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
    setError('');
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setError('Video file is too large (max 50MB).');
      return;
    }

    setExtractingKeyframes(true);
    setFormData(prev => ({ ...prev, video: file, keyframes: [] }));

    // Create temporary URL for extraction
    const videoUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.src = videoUrl;
    video.muted = true;
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      const duration = video.duration;
      if (duration < 10 || duration > 25) {
        setError('Video must be between 10-20 seconds.');
        setFormData(prev => ({ ...prev, video: null }));
        setExtractingKeyframes(false);
        return;
      }

      // Extract 3 keyframes
      const times = [1, duration / 2, duration - 1];
      const frames = [];
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      let currentFrame = 0;

      const captureFrame = () => {
        if (currentFrame >= times.length) {
          setFormData(prev => ({ ...prev, keyframes: frames }));
          setExtractingKeyframes(false);
          URL.revokeObjectURL(videoUrl);
          return;
        }

        video.currentTime = times[currentFrame];
      };

      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push(canvas.toDataURL('image/jpeg', 0.7));
        currentFrame++;
        captureFrame();
      };

      captureFrame();
    };
  };

  useEffect(() => {
    if (location.state?.claim) {
      const { claim } = location.state;
      setFormData({
        crop: claim.crop || '',
        acres: claim.acres || '',
        damageInfo: {
          type: claim.damageInfo?.type || '',
          description: claim.damageInfo?.description || '',
          dateOccurred: claim.damageInfo?.dateOccurred ? new Date(claim.damageInfo.dateOccurred).toISOString().split('T')[0] : ''
        },
        location: {
          village: claim.location?.village || '',
          district: claim.location?.district || ''
        },
        images: []
      });
    }
  }, [location.state]);

  const handleSubmit = async () => {
    if (formData.images.length < 1) {
      setError('Please upload at least 1 high-quality damage photo for forensic analysis.');
      return;
    }
    if (!formData.crop || !formData.acres) {
      setError('Please fill in crop type and land size.');
      return;
    }
    if (!formData.damageInfo.type || !formData.damageInfo.dateOccurred || !formData.damageInfo.description) {
      setError('Please fill in all damage information fields.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const dataToSend = new FormData();
      dataToSend.append('crop', formData.crop);
      dataToSend.append('acres', formData.acres);
      dataToSend.append('damageInfo', JSON.stringify(formData.damageInfo));
      dataToSend.append('location', JSON.stringify(formData.location));

      // Images
      formData.images.forEach(image => {
        dataToSend.append('images', image);
      });

      // Video and Keyframes
      if (formData.video) {
        dataToSend.append('video', formData.video);
        dataToSend.append('keyframes', JSON.stringify(formData.keyframes));
      }

      const { data } = await farmerAPI.submitClaim(dataToSend);
      if (data.success) {
        setSubmittedClaim(data.claim);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submittedClaim) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-12 animate-fade-in pb-20 font-sans">
        <div className="max-w-3xl mx-auto">
          <div className="card-glass p-8 md:p-12 text-center mb-8 border-emerald-100 shadow-2xl shadow-emerald-200/20">
            <IconWrapper color="text-white" bgColor="bg-gradient-to-br from-emerald-500 to-green-600" size="w-20 h-20 mb-6 mx-auto shadow-glow-green animate-float">
              <LuCheckCircle2 className="w-10 h-10" />
            </IconWrapper>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
              Claim Submitted
            </h1>
            <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Your claim <span className="text-emerald-600 font-bold">#{submittedClaim._id.slice(-8).toUpperCase()}</span> has been sent. An officer will review it shortly.
            </p>
          </div>

          <div className="space-y-6">
            <div className="card-glass p-6 border-white/60">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Submission Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Status</span>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase">Submitted</span>
                </div>
              </div>
            </div>

            <Button variant="farmer" className="w-full !rounded-2xl py-4 flex items-center justify-center gap-2 shadow-xl" onClick={() => navigate('/farmer/dashboard')}>
              Back to Home <LuArrowRight />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 animate-fade-in-up font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">File Damage Claim</h1>
            <p className="text-gray-500 font-medium mt-1">Upload photos and enter crop and disaster details.</p>
          </div>
          <button onClick={() => navigate('/farmer/dashboard')} className="text-gray-400 hover:text-gray-600 transition-colors font-bold">
            Cancel
          </button>
        </div>

        <div className="card-glass p-8">
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Crop Type <span className="text-red-500">*</span></label>
                <select
                  required
                  className="input-field"
                  value={formData.crop}
                  onChange={e => setFormData({ ...formData, crop: e.target.value })}
                >
                  <option value="">Select Crop</option>
                  {CROP_OPTIONS.map(c => (
                    <option key={c} value={c}>{formatCropLabel(c)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Land Size (Acres) <span className="text-red-500">*</span></label>
                <input
                  type="number" required min="0.01" step="0.01" className="input-field" placeholder="e.g. 5.5"
                  value={formData.acres}
                  onChange={e => setFormData({ ...formData, acres: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Location Details</label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  className="input-field" placeholder="Village"
                  value={formData.location.village}
                  onChange={e => setFormData({ ...formData, location: { ...formData.location, village: e.target.value } })}
                />
                <input
                  className="input-field" placeholder="District"
                  value={formData.location.district}
                  onChange={e => setFormData({ ...formData, location: { ...formData.location, district: e.target.value } })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Damage Type <span className="text-red-500">*</span></label>
                <select
                  required
                  className="input-field"
                  value={formData.damageInfo.type}
                  onChange={e => setFormData({ ...formData, damageInfo: { ...formData.damageInfo, type: e.target.value } })}
                >
                  <option value="">Select Type</option>
                  <option value="flood">{formatDamageLabel('flood')}</option>
                  <option value="drought">{formatDamageLabel('drought')}</option>
                  <option value="pest">{formatDamageLabel('pest')} Attack</option>
                  <option value="disease">{formatDamageLabel('disease')}</option>
                  <option value="storm">{formatDamageLabel('storm')}</option>
                  <option value="hail">{formatDamageLabel('hail')}</option>
                  <option value="fire">{formatDamageLabel('fire')}</option>
                  <option value="other">{formatDamageLabel('other')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Date of Damage <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="input-field"
                  value={formData.damageInfo.dateOccurred}
                  onChange={e => setFormData({ ...formData, damageInfo: { ...formData.damageInfo, dateOccurred: e.target.value } })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Damage Description <span className="text-red-500">*</span></label>
              <textarea
                required
                minLength="20"
                className="input-field min-h-[100px]" placeholder="Describe what happened to your crop..."
                value={formData.damageInfo.description}
                onChange={e => setFormData({ ...formData, damageInfo: { ...formData.damageInfo, description: e.target.value } })}
              />
            </div>

            <div className="space-y-6">
              <label className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
                <LuLayoutGrid size={16} className="text-emerald-600" />
                Evidence Package (1-10 Photos) <span className="text-red-500">*</span>
              </label>

              <label
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                  if (formData.images.length + files.length > 10) {
                    setError('Max 10 photos allowed.');
                    return;
                  }
                  setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
                }}
                className="aspect-square border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all group"
              >
                <LuUpload className="text-gray-400 group-hover:text-emerald-500 transition-colors" size={24} />
                <span className="text-[10px] font-black text-gray-400 mt-2 uppercase text-center px-2">Drag or Drop Photo</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>

              {formData.images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-3xl overflow-hidden border-2 border-white shadow-md group">
                  <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" alt="preview" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <LuX size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-gray-100">
            <label className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
              <LuFileVideo size={16} className="text-blue-500" />
              Video Evidence (10-20s Optional)
            </label>

            {!formData.video ? (
              <label className="w-full h-32 border-2 border-dashed border-gray-100 rounded-4xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50/50 hover:border-blue-200 transition-all group">
                <LuFileVideo className="text-gray-300 group-hover:text-blue-500 mb-2" size={32} />
                <p className="text-xs font-bold text-gray-400">Click to upload video evidence</p>
                <p className="text-[10px] text-gray-300 uppercase mt-1">MP4, MOV up to 50MB</p>
                <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
              </label>
            ) : (
              <div className="card-premium p-4 flex items-center gap-6 border-blue-100 bg-blue-50/30">
                <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center text-white relative overflow-hidden">
                  <LuFileVideo size={32} />
                  {extractingKeyframes && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-black text-gray-900 text-sm truncate">{formData.video.name}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{(formData.video.size / (1024 * 1024)).toFixed(2)} MB • {formData.keyframes.length} frames extracted</p>
                </div>
                <button onClick={() => setFormData(prev => ({ ...prev, video: null, keyframes: [] }))} className="p-3 bg-white text-gray-400 hover:text-red-500 rounded-xl border border-gray-100 transition-colors">
                  <LuX size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Readiness Summary */}
          <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-4xl border border-emerald-100/50 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center">
                <span className={`text-xl ${formData.images.length >= 1 ? 'grayscale-0' : 'grayscale text-gray-400'}`}>📸</span>
                <span className="text-[8px] font-black uppercase mt-1">Photos {formData.images.length}/1</span>
              </div>
              <div className="flex flex-col items-center">
                <span className={`text-xl ${formData.video ? 'grayscale-0' : 'grayscale text-gray-400'}`}>🎥</span>
                <span className="text-[8px] font-black uppercase mt-1">Video {formData.video ? '1' : '0'}/1</span>
              </div>
            </div>

            {formData.images.length >= 1 ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl shadow-sm border border-emerald-200 animate-bounce-subtle">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Ready to Analyze</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-2xl border border-red-100">
                <LuShieldAlert className="text-red-500" size={12} />
                <span className="text-[10px] font-black text-red-700 uppercase tracking-widest">Need 1+ Photo</span>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm font-bold">
              <LuAlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <Button
            variant="farmer"
            disabled={loading || formData.images.length < 1 || extractingKeyframes}
            onClick={handleSubmit}
            className="w-full py-5 text-lg shadow-2xl shadow-emerald-200"
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Syncing Digital Evidence...
              </span>
            ) : 'Submit Claim Package'}
          </Button>
        </div>
      </div>
    </div>
  );
}
