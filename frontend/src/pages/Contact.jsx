import { Link } from 'react-router-dom';
import { LuArrowLeft, LuMail, LuPhone, LuMapPin, LuSend } from 'react-icons/lu';
import AgroLogo from '../components/AgroLogo';
import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

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

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full mb-6">
            <LuMail className="text-purple-600" />
            <span className="text-xs font-black text-purple-700 uppercase tracking-widest">Contact Us</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-6">Get In Touch</h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Have questions or need support? We are here to help. Reach out to us anytime through email or our contact form, and we will get back to you as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="card-glass p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <LuMail className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 mb-2">Email Us</h3>
                  <p className="text-gray-600">support@agroclaim.com</p>
                  <p className="text-gray-600">info@agroclaim.com</p>
                </div>
              </div>
            </div>

            <div className="card-glass p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <LuPhone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 mb-2">Call Us</h3>
                  <p className="text-gray-600">+91 1800-XXX-XXXX (Toll Free)</p>
                  <p className="text-gray-600">Mon-Fri: 9AM - 6PM IST</p>
                </div>
              </div>
            </div>

            <div className="card-glass p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <LuMapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 mb-2">Visit Us</h3>
                  <p className="text-gray-600">AgroClaim Headquarters</p>
                  <p className="text-gray-600">New Delhi, India</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card-glass p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Send a Message</h2>
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LuSend className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-600">We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    className="input-field"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                  <textarea
                    required
                    rows={5}
                    className="input-field"
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                  <LuSend /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
