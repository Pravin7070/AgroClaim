import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import IconWrapper from '../components/IconWrapper';
import Button from '../components/Button';
import AgroLogo from '../components/AgroLogo';
import LanguageSelector from '../components/LanguageSelector';
import {
    LuSprout,
    LuTrendingUp,
    LuShieldCheck,
    LuArrowRight,
    LuZap,
    LuBarChart3,
    LuGlobe,
    LuHeart,
    LuWheat,
    LuBanknote,
    LuLeaf
} from 'react-icons/lu';

import TypingAnimation from '../components/TypingAnimation';

export default function Home() {
    const { t } = useTranslation();
    const words = ['Online Farming', 'Crop Protection', 'Quick Payments', 'Smart Analysis'];
    const carouselImages = [
        'https://t3.ftcdn.net/jpg/04/32/15/18/240_F_432151892_oQ3YQDo2LYZPILlEMnlo55PjjgiUwnQb.jpg',
        'https://t4.ftcdn.net/jpg/05/95/55/89/240_F_595558921_z1JnF4ieH75XlWoDPuh1Os97QkPnb4dx.jpg',
        'https://t4.ftcdn.net/jpg/04/42/11/53/240_F_442115393_umFt4eV1asDjcvpG4g7hylxuw7nCD8Oo.jpg'
    ];

    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        if (carouselImages.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
        }, 5000); // 5s per slide

        return () => clearInterval(interval);
    }, [carouselImages.length]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header (navbar + hero) */}
            <header className="relative bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 overflow-hidden">
                {/* Floating Icons Removed */}
                <div className="absolute inset-0 pointer-events-none" />

                {/* Navigation */}
                <nav className="relative z-20 pt-4 pb-3">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="flex justify-between items-center bg-emerald-50/90 backdrop-blur-md border border-emerald-200 px-4 py-3 rounded-3xl shadow-lg">
                            <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.location.reload()}>
                                <AgroLogo className="w-12 h-12 text-emerald-600" />
                                <div className="hidden sm:block">
                                    <h1 className="text-2xl font-black text-emerald-900 tracking-tight leading-none">{t('app_name')}</h1>
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">{t('tagline')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <LanguageSelector />
                                <Link to="/login" className="text-sm font-black text-emerald-700 hover:text-emerald-900 transition-colors">
                                    {t('home.login')}
                                </Link>
                                <Link to="/auth-selection">
                                    <Button
                                        variant="farmer"
                                        className="py-2.5 px-6 !rounded-xl bg-emerald-500 hover:bg-emerald-600 border border-emerald-400/70 text-white"
                                        icon={LuZap}
                                    >
                                        {t('home.join_now')}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section with background carousel */}
                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-16 md:pb-24">
                    <div className="mt-8 md:mt-10 relative rounded-[40px] overflow-hidden shadow-2xl">
                        {/* Background carousel */}
                        <div className="absolute inset-0">
                            {carouselImages.map((src, idx) => (
                                <img
                                    key={src}
                                    src={src}
                                    alt={`Farm background ${idx + 1}`}
                                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100' : 'opacity-0'
                                        }`}
                                />
                            ))}
                            <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-[2px]" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 px-6 md:px-16 py-16 md:py-24 text-center text-white">
                            <div className="inline-flex items-center gap-2 bg-emerald-100/90 border border-emerald-200 px-4 py-2 rounded-2xl mb-8 mx-auto">
                                <LuShieldCheck className="text-emerald-700 w-4 h-4" />
                                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.2em]">
                                    {t('home.safe_and_secure')}
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tighter">
                                {t('home.smart')} <br />
                                <span className="bg-gradient-to-r from-emerald-300 to-green-200 bg-clip-text text-transparent">
                                    <TypingAnimation words={words} />
                                </span>{' '}
                                <br />
                                {t('home.is_here')}
                            </h1>
                            <p className="text-lg md:text-xl text-slate-100/90 font-medium max-w-2xl mx-auto leading-relaxed mb-10">
                                {t('home.intro_text')}
                            </p>
                            <div className="flex flex-wrap justify-center gap-6">
                                <Link to="/auth-selection">
                                    <Button
                                        variant="farmer"
                                        className="py-4 px-10 text-lg shadow-xl hover:scale-105 active:scale-95 transition-all bg-emerald-500 hover:bg-emerald-600 border border-emerald-300/70"
                                        icon={LuArrowRight}
                                    >
                                        {t('home.start_now')}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32 pt-24">
                    {[
                        { title: t('home.benefits.live_updates_title'), icon: <LuTrendingUp />, desc: t('home.benefits.live_updates_desc') },
                        { title: t('home.benefits.green_farming_title'), icon: <LuSprout />, desc: t('home.benefits.green_farming_desc') },
                        { title: t('home.benefits.smart_reports_title'), icon: <LuBarChart3 />, desc: t('home.benefits.smart_reports_desc') },
                        { title: t('home.benefits.easy_market_title'), icon: <LuGlobe />, desc: t('home.benefits.easy_market_desc') }
                    ].map((feature, idx) => (
                        <div key={idx} className="card-glass p-8 group hover:scale-[1.02] transition-all duration-500 border-white/40">
                            <IconWrapper color="text-emerald-600" bgColor="bg-emerald-50" size="w-14 h-14 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                                {feature.icon}
                            </IconWrapper>
                            <h3 className="text-xl font-black text-gray-900 mb-4">{feature.title}</h3>
                            <p className="text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Testimonials Section */}
                <section className="mb-32 relative">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100 mb-4">
                            <LuHeart className="text-emerald-600 w-4 h-4" />
                            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Trust from the Soil</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">What Our Farmers Say</h2>
                        <p className="text-gray-500 font-medium text-lg italic">Real stories from farmers who trusted AgroClaim</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Ranganathan Murugan",
                                village: "Thanjavur, Tamil Nadu",
                                portrait: "https://t4.ftcdn.net/jpg/01/23/70/89/240_F_123708977_X8lHoZ3iSb6rRjsmFb2mxGNp2dngJrjh.jpg",
                                content: "AgroClaim changed my life. After the flood, I submitted photos and got AI approval in minutes. The compensation reached my bank account faster than ever before!",
                                icon: <LuLeaf className="text-emerald-500" />
                            },
                            {
                                name: "Suresh Kumar",
                                village: "Villupuram, Tamil Nadu",
                                portrait: "https://t3.ftcdn.net/jpg/06/24/61/44/240_F_624614412_1RNNAFcENaEac1xwwNmjNa8iAT7iAyhv.jpg",
                                content: "The AI analysis is amazing. It correctly identified the pest damage on my cotton crop and suggested the right compensation. Very transparent and helpful service.",
                                icon: <LuWheat className="text-amber-500" />
                            },
                            {
                                name: "Lakshmi Narayanan",
                                village: "Tiruppur, Tamil Nadu",
                                portrait: "https://t4.ftcdn.net/jpg/14/68/45/03/240_F_1468450396_TDhWtBlj9Sryt5qhqlmC8DFqYpkv1v4J.jpg", // Using provided second image for third card as requested with different content
                                content: "I was worried about my claim process, but AgroClaim's shield system made it so easy. I can track everything like an Amazon order! Highly recommended for every farmer.",
                                icon: <LuShieldCheck className="text-blue-500" />
                            }
                        ].map((t, i) => (
                            <div key={i} className="card-glass p-8 relative group hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-500 border-white/50 overflow-hidden">
                                {/* Subtle decorative gradient */}
                                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br from-emerald-500/5 to-brown-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-emerald-500 blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                                        <img
                                            src={t.portrait}
                                            alt={t.name}
                                            className="w-16 h-16 rounded-2xl object-cover relative z-10 border-2 border-white shadow-md grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-900 group-hover:text-emerald-700 transition-colors">{t.name}</h4>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.village}</p>
                                    </div>
                                </div>

                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className="text-amber-400 text-sm">⭐</span>
                                    ))}
                                </div>

                                <p className="text-gray-600 font-medium leading-relaxed mb-6 italic relative z-10">
                                    "{t.content}"
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-100 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                                            {t.icon}
                                        </div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Verified Farmer</span>
                                    </div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Final Call */}
                <div className="rounded-[40px] overflow-hidden relative group shadow-2xl shadow-blue-200 mb-24 h-[500px]">
                    <img
                        src="https://t4.ftcdn.net/jpg/04/45/69/65/240_F_445696583_kN8UnRh8CJVYZJv2Qy6cFyyXnez7qqqD.jpg"
                        alt="Farm"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
                    <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white p-12">
                        <LuZap className="w-20 h-20 mb-8 text-yellow-400 animate-pulse" />
                        <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">{t('home.ready_to_protect')}</h2>
                        <p className="text-xl md:text-2xl text-white/90 font-medium mb-12 max-w-2xl mx-auto">
                            {t('home.grow_better')}
                        </p>
                        <Link to="/auth-selection">
                            <Button variant="farmer" className="bg-emerald-500 text-white hover:bg-emerald-600 border border-emerald-400/50 py-8 px-16 text-2xl !rounded-[30px] shadow-2xl transform transition-transform hover:scale-105 active:scale-95" icon={LuArrowRight}>
                                {t('home.start_today')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Navigation */}
            <footer className="relative z-10 border-t border-gray-100 bg-white pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-4 mb-6">
                                <AgroLogo className="w-12 h-12 text-emerald-600" />
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none">{t('app_name')}</h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{t('tagline')}</p>
                                </div>
                            </div>
                            <p className="text-gray-500 font-medium max-w-sm leading-relaxed">
                                {t('home.footer_desc')}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6">{t('home.main_links')}</h3>
                            <ul className="space-y-4">
                                <li><Link to="/" className="text-sm font-bold text-gray-400 hover:text-farmer-600 transition-colors">{t('home.nav.home')}</Link></li>
                                <li><Link to="/about" className="text-sm font-bold text-gray-400 hover:text-farmer-600 transition-colors">{t('home.nav.about')}</Link></li>
                                <li><Link to="/services" className="text-sm font-bold text-gray-400 hover:text-farmer-600 transition-colors">{t('home.nav.services')}</Link></li>
                                <li><Link to="/contact" className="text-sm font-bold text-gray-400 hover:text-farmer-600 transition-colors">{t('home.nav.contact')}</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6">{t('home.tools')}</h3>
                            <ul className="space-y-4">
                                <li><Link to="/login" className="text-sm font-bold text-gray-400 hover:text-farmer-600 transition-colors">{t('home.nav.farmer_login')}</Link></li>
                                <li><Link to="/login" className="text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors">{t('home.nav.officer_login')}</Link></li>
                                <li><Link to="/login" className="text-sm font-bold text-gray-400 hover:text-farmer-600 transition-colors">{t('home.nav.claim_money')}</Link></li>
                                <li><Link to="/login" className="text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors">{t('home.nav.money_help')}</Link></li>
                                <li><Link to="/login" className="text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors">{t('home.nav.growth_logs')}</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2 text-gray-300 font-bold text-[10px] uppercase tracking-[0.3em]">
                            {t('home.made_with_love')} <LuHeart className="text-red-500 animate-pulse inline" /> {t('home.for_farmers')}
                        </div>
                        <div className="text-gray-400 font-medium text-xs">
                            © 2026 {t('app_name')}. {t('home.all_rights')}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
