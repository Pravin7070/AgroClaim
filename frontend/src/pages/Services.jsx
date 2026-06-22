import { Link } from 'react-router-dom';
import { LuArrowLeft, LuShieldCheck, LuBrain, LuWallet, LuBarChart3, LuBell, LuLock } from 'react-icons/lu';
import AgroLogo from '../components/AgroLogo';

export default function Services() {
  const services = [
    {
      icon: LuShieldCheck,
      title: 'Claim Management',
      description: 'Submit and track crop damage claims with ease. Get real-time updates on your claim status.'
    },
    {
      icon: LuBrain,
      title: 'AI Analysis',
      description: 'Automatic crop damage assessment using advanced AI vision models for accurate evaluation.'
    },
    {
      icon: LuWallet,
      title: 'Digital Wallet',
      description: 'Secure digital wallet for receiving compensation and managing your funds efficiently.'
    },
    {
      icon: LuBarChart3,
      title: 'Analytics Dashboard',
      description: 'Comprehensive analytics and insights for officers to make informed decisions.'
    },
    {
      icon: LuBell,
      title: 'Real-time Notifications',
      description: 'Instant notifications for all claim events and status updates via Socket.io.'
    },
    {
      icon: LuLock,
      title: 'Secure Platform',
      description: 'Bank-grade security with JWT authentication, encryption, and data protection.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-xl bg-white/90">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <AgroLogo className="w-10 h-10 text-emerald-600" />
            <span className="text-xl font-black text-gray-900">AgroClaim</span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-emerald-600 transition-colors">
            <LuArrowLeft /> Back to Home
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mb-6">
            <LuBarChart3 className="text-blue-600" />
            <span className="text-xs font-black text-blue-700 uppercase tracking-widest">Our Services</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-6">What We Offer</h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            We design and develop digital tools that solve real problems. Our work includes modern web applications, smooth user experiences, and efficient backend systems.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <div key={idx} className="card-glass p-8 hover:scale-105 transition-transform duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <service.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">{service.title}</h3>
              <p className="text-gray-600 leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 card-glass p-12 text-center bg-gradient-to-br from-emerald-50 to-blue-50">
          <h2 className="text-3xl font-black text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-gray-600 mb-8">Join thousands of farmers already using AgroClaim</p>
          <Link to="/auth-selection" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors">
            Start Now
          </Link>
        </div>
      </div>
    </div>
  );
}
