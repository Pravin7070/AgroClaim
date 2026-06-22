import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { farmerAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import IconWrapper from '../../components/IconWrapper';
import { LuFileText, LuCheckCircle2, LuChevronRight, LuUpload, LuLoader2, LuList, LuX } from 'react-icons/lu';
import Button from '../../components/Button';
import { motion, AnimatePresence } from 'framer-motion';

const SCHEMES_LIST = [
    {
        id: 'pm-kisan',
        name: 'PM-KISAN',
        fullName: 'Pradhan Mantri Kisan Samman Nidhi',
        type: 'Central',
        category: 'Income Support',
        description: 'Direct income support of ₹6,000 per year in three installments to all landholding farmer families.',
        benefits: '₹2,000 every 4 months',
        eligibility: 'All landholding farmers'
    },
    {
        id: 'pmfby',
        name: 'PMFBY',
        fullName: 'Pradhan Mantri Fasal Bima Yojana',
        type: 'Central',
        category: 'Insurance',
        description: 'Crop insurance scheme for farmers against non-preventable natural risks.',
        benefits: 'Financial support for crop loss',
        eligibility: 'All farmers growing notified crops'
    },
    {
        id: 'pmksy',
        name: 'PMKSY',
        fullName: 'PM Krishi Sinchai Yojana',
        type: 'Central',
        category: 'Irrigation',
        description: 'Increasing access to water on farm and expanding cultivable area under assured irrigation.',
        benefits: 'Subsidy for micro-irrigation systems',
        eligibility: 'Commercial & cereal crop growers'
    },
    {
        id: 'tn-ifs',
        name: 'TN IFS',
        fullName: 'Tamil Nadu Integrated Farming System',
        type: 'State',
        category: 'Innovation',
        description: 'Promoting diverse farming systems to increase income and nutritional security in Tamil Nadu.',
        benefits: 'Subsidy up to ₹30,000 for various components',
        eligibility: 'Small and marginal farmers of TN'
    },
    {
        id: 'tn-solar',
        name: 'TN Solar Pump',
        fullName: 'TN Chief Minister Solar Pump Scheme',
        type: 'State',
        category: 'Energy',
        description: 'Provision of solar-powered pump sets with 70% subsidy for farmers in Tamil Nadu.',
        benefits: '70% subsidy on solar pump sets',
        eligibility: 'Farmers having valid electricity connection'
    }
];

const SCHEME_DOCUMENTS = {
    'pm-kisan': [
        { id: 'aadhaar_file', label: 'Aadhaar Card Copy', type: 'file', required: true },
        { id: 'land_extract', label: 'Land Extract (Patta/Chitta)', type: 'file', required: true },
        { id: 'bank_passbook', label: 'Bank Passbook Front Page', type: 'file', required: true },
        { id: 'self_declaration', label: 'Self-Declaration Form', type: 'file', required: true },
        { id: 'address_proof', label: 'Voter ID/Address Proof', type: 'file', required: true }
    ],
    'pmfby': [
        { id: 'aadhaar_file', label: 'Aadhaar Card Copy', type: 'file', required: true },
        { id: 'land_records', label: 'Land Ownership Records', type: 'file', required: true },
        { id: 'sowing_cert', label: 'Village Officer Sowing Cert.', type: 'file', required: true },
        { id: 'bank_statement', label: '3-Month Bank Statement', type: 'file', required: true },
        { id: 'damage_report', label: 'Signed Damage Report', type: 'file', required: true }
    ],
    'pmksy': [
        { id: 'aadhaar_file', label: 'Aadhaar Card Copy', type: 'file', required: true },
        { id: 'land_cert', label: 'Land Measurement Cert.', type: 'file', required: true },
        { id: 'water_license', label: 'Water Source/Well License', type: 'file', required: true },
        { id: 'project_plan', label: 'Irrigation System Plan', type: 'file', required: true },
        { id: 'soil_health', label: 'Soil Health Card', type: 'file', required: true }
    ],
    'tn-ifs': [
        { id: 'aadhaar_file', label: 'Aadhaar Card Copy', type: 'file', required: true },
        { id: 'tn_farmer_id', label: 'TN Farmer ID (e-Chitta)', type: 'file', required: true },
        { id: 'farming_plan', label: 'Integrated Farming Plan', type: 'file', required: true },
        { id: 'income_cert', label: 'Income Certificate', type: 'file', required: true },
        { id: 'training_cert', label: 'Training Completion Cert.', type: 'file', required: true }
    ],
    'tn-solar': [
        { id: 'aadhaar_file', label: 'Aadhaar Card Copy', type: 'file', required: true },
        { id: 'land_patta', label: 'Land Patta Document', type: 'file', required: true },
        { id: 'eb_noc', label: 'Electricity Board NOC', type: 'file', required: true },
        { id: 'solar_proposal', label: 'Solar Pump Technical Plan', type: 'file', required: true },
        { id: 'pwd_permit', label: 'PWD Water Permit', type: 'file', required: true }
    ]
};

export default function Schemes() {
    const navigate = useNavigate();
    const toast = useToast();
    const [selectedScheme, setSelectedScheme] = useState(null);
    const [showApplyForm, setShowApplyForm] = useState(false);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        addressLine: '',
        district: '',
        taluka: '',
        village: '',
        aadhaar: '',
        bankAccount: ''
    });
    const [documentFiles, setDocumentFiles] = useState({});
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (docId, file) => {
        if (file && file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, [docId]: 'Max file size is 5MB' }));
            return;
        }
        setDocumentFiles(prev => ({ ...prev, [docId]: file }));
        setErrors(prev => ({ ...prev, [docId]: '' }));
    };

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'Name is required';
        if (!formData.phone.match(/^[0-9]{10}$/)) newErrors.phone = 'Valid 10-digit phone required';
        if (!formData.addressLine.trim()) newErrors.addressLine = 'Address is required';
        if (!formData.district.trim()) newErrors.district = 'District is required';
        if (!formData.taluka.trim()) newErrors.taluka = 'Taluka is required';
        if (!formData.village.trim()) newErrors.village = 'Village is required';
        if (!formData.aadhaar.match(/^[0-9]{12}$/)) newErrors.aadhaar = 'Valid 12-digit Aadhaar required';
        if (!formData.bankAccount.match(/^[0-9]{9,18}$/)) newErrors.bankAccount = 'Valid Bank Account required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};
        const docs = SCHEME_DOCUMENTS[selectedScheme.id];
        docs.forEach(doc => {
            if (!documentFiles[doc.id]) {
                newErrors[doc.id] = `${doc.label} is required`;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep1()) setStep(2);
    };

    const handleApply = async (e) => {
        e.preventDefault();

        if (!validateStep2()) return;

        setLoading(true);

        try {
            const submitData = new FormData();
            submitData.append('schemeName', selectedScheme.name);
            submitData.append('schemeType', selectedScheme.type);
            submitData.append('category', selectedScheme.category);

            // Map document files
            const docs = SCHEME_DOCUMENTS[selectedScheme.id];
            docs.forEach(doc => {
                if (documentFiles[doc.id]) {
                    submitData.append('documents', documentFiles[doc.id]);
                }
            });

            submitData.append('applicationData', JSON.stringify(formData));

            await farmerAPI.applyScheme(submitData);
            setSuccess(true);
            toast.success(`Application for ${selectedScheme.name} submitted successfully!`);
            setTimeout(() => {
                navigate('/farmer/schemes/my-applications');
            }, 2000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to apply. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setShowApplyForm(false);
        setStep(1);
        setFormData({
            fullName: '',
            phone: '',
            addressLine: '',
            district: '',
            taluka: '',
            village: '',
            aadhaar: '',
            bankAccount: ''
        });
        setDocumentFiles({});
        setErrors({});
    };

    if (success) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-fade-in">
                <IconWrapper color="text-green-500" bgColor="bg-green-50" size="w-24 h-24 mb-6 shadow-glow-green animate-float">
                    <LuCheckCircle2 className="w-12 h-12" />
                </IconWrapper>
                <h1 className="text-4xl font-black text-gray-900 mb-2">Application Sent!</h1>
                <p className="text-gray-500 font-medium">Your application for {selectedScheme.name} is being reviewed.</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 animate-fade-in-up pb-20 font-sans">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Agriculture Schemes</h1>
                        <p className="text-gray-500 font-medium mt-1 text-sm md:text-base">Explore and apply for Central & State government support.</p>
                    </div>
                    <Button variant="farmer" onClick={() => navigate('/farmer/schemes/my-applications')} className="flex items-center gap-2">
                        <LuList /> My Applications
                    </Button>
                </header>

                <AnimatePresence mode="wait">
                    {!showApplyForm ? (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {SCHEMES_LIST.map((scheme) => (
                                <div
                                    key={scheme.id}
                                    className="card-glass p-6 cursor-pointer transition-all hover:shadow-2xl group border-white/40"
                                    onClick={() => {
                                        setSelectedScheme(scheme);
                                        setShowApplyForm(true);
                                    }}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${scheme.type === 'Central' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                            {scheme.type}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-400">{scheme.category}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                                        {scheme.fullName}
                                    </h3>
                                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-6">
                                        {scheme.description}
                                    </p>
                                    <Button variant="farmer" className="w-full">
                                        Apply Now <LuChevronRight />
                                    </Button>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="max-w-4xl mx-auto"
                        >
                            <button
                                onClick={resetForm}
                                className="text-emerald-600 font-black mb-6 flex items-center gap-1 hover:gap-2 transition-all"
                            >
                                ← Back to List
                            </button>

                            <div className="card-glass overflow-hidden border-white/60 shadow-2xl">
                                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-white relative">
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-80 mb-2">
                                            Step {step} of 2 • {step === 1 ? 'Basic Details' : 'Document Evidence'}
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-black mb-2">{selectedScheme.fullName}</h2>
                                        <p className="opacity-90 font-medium text-sm leading-relaxed max-w-2xl">{selectedScheme.description}</p>
                                    </div>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                                </div>

                                <div className="p-8">
                                    {step === 1 ? (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                                    <input name="fullName" value={formData.fullName} onChange={handleInputChange} className="input-field w-full" placeholder="As per Aadhaar" />
                                                    {errors.fullName && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.fullName}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                                    <input name="phone" value={formData.phone} onChange={handleInputChange} className="input-field w-full" placeholder="10-digit mobile" />
                                                    {errors.phone && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.phone}</p>}
                                                </div>
                                                <div className="md:col-span-2 space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Address Line</label>
                                                    <input name="addressLine" value={formData.addressLine} onChange={handleInputChange} className="input-field w-full" placeholder="House/Street/Area" />
                                                    {errors.addressLine && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.addressLine}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">District</label>
                                                    <input name="district" value={formData.district} onChange={handleInputChange} className="input-field w-full" placeholder="Your district" />
                                                    {errors.district && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.district}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Taluka</label>
                                                    <input name="taluka" value={formData.taluka} onChange={handleInputChange} className="input-field w-full" placeholder="Your taluka" />
                                                    {errors.taluka && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.taluka}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Village</label>
                                                    <input name="village" value={formData.village} onChange={handleInputChange} className="input-field w-full" placeholder="Your village" />
                                                    {errors.village && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.village}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Aadhaar Number</label>
                                                    <input name="aadhaar" value={formData.aadhaar} onChange={handleInputChange} className="input-field w-full" placeholder="12-digit number" />
                                                    {errors.aadhaar && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.aadhaar}</p>}
                                                </div>
                                                <div className="md:col-span-2 space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bank Account Number</label>
                                                    <input name="bankAccount" value={formData.bankAccount} onChange={handleInputChange} className="input-field w-full" placeholder="Account for subsidy transfer" />
                                                    {errors.bankAccount && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.bankAccount}</p>}
                                                </div>
                                            </div>
                                            <Button variant="farmer" onClick={handleNext} className="w-full py-5 text-lg mt-8">
                                                Next: Upload Documents <LuChevronRight />
                                            </Button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleApply} className="space-y-8">
                                            <div className="space-y-6">
                                                {SCHEME_DOCUMENTS[selectedScheme.id].map((doc) => (
                                                    <div key={doc.id} className="space-y-2">
                                                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                            {doc.label} <span className="text-red-500">*</span>
                                                        </label>
                                                        <div className={`border-2 border-dashed rounded-2xl p-4 transition-all ${documentFiles[doc.id] ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-200 bg-gray-50/50 hover:border-emerald-300'}`}>
                                                            <input
                                                                type="file"
                                                                id={doc.id}
                                                                className="hidden"
                                                                accept="image/*,.pdf"
                                                                onChange={(e) => handleFileChange(doc.id, e.target.files[0])}
                                                            />
                                                            <label htmlFor={doc.id} className="cursor-pointer flex items-center gap-4">
                                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 ${documentFiles[doc.id] ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-white border-emerald-100 text-emerald-500'}`}>
                                                                    {documentFiles[doc.id] ? <LuCheckCircle2 size={24} /> : <LuUpload size={24} />}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-black text-gray-900">
                                                                        {documentFiles[doc.id] ? documentFiles[doc.id].name : 'Tap to select document'}
                                                                    </p>
                                                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                                        Required: JPG, PNG or PDF (Max 5MB)
                                                                    </p>
                                                                </div>
                                                            </label>
                                                        </div>
                                                        {errors[doc.id] && <p className="text-[10px] text-red-500 font-bold ml-1">{errors[doc.id]}</p>}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex flex-col md:flex-row gap-4 pt-6">
                                                <Button variant="farmer" type="submit" className="flex-1 py-5 text-lg" loading={loading} disabled={loading}>
                                                    {loading ? 'Submitting Application...' : '🔒 Finalize & Submit'}
                                                </Button>
                                                <button type="button" onClick={() => setStep(1)} className="px-8 py-5 font-black text-gray-500 hover:text-gray-900 transition-colors uppercase text-xs tracking-widest">
                                                    Go Back
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

