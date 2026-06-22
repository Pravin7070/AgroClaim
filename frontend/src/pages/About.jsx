import { Link } from 'react-router-dom';
import { LuArrowLeft, LuUsers, LuTarget, LuHeart } from 'react-icons/lu';
import AgroLogo from '../components/AgroLogo';

export default function About() {
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

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full mb-6">
            <LuUsers className="text-emerald-600" />
            <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">About Us</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-6">Who We Are</h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            We are a team focused on building simple, reliable, and user-friendly solutions. Our goal is to create products that make everyday tasks easier and more efficient. We believe in quality, transparency, and continuous improvement.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="card-glass p-8">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
              <LuTarget className="w-7 h-7 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To empower farmers with technology that simplifies compensation claims and ensures they receive timely support when they need it most.
            </p>
          </div>

          <div className="card-glass p-8">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
              <LuHeart className="w-7 h-7 text-blue-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-4">Our Values</h2>
            <p className="text-gray-600 leading-relaxed">
              Transparency, efficiency, and farmer-first approach guide everything we do. We're committed to eliminating bureaucratic delays.
            </p>
          </div>
        </div>

        <div className="card-glass p-12 text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-6">Our Work</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            We design and develop digital tools that solve real problems. Our work includes modern web applications, smooth user experiences, and efficient backend systems. Every project is built with attention to detail and long-term value.
          </p>
          <Link to="/services" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors">
            View Our Services
          </Link>
        </div>
      </div>
    </div>
  );
}
