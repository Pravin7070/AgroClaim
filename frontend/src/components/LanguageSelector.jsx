import { useTranslation } from 'react-i18next';
import { LuGlobe } from 'react-icons/lu';

const LanguageSelector = () => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ta' : 'en';
        i18n.changeLanguage(newLang);
        // Update document lang attribute for proper font rendering
        document.documentElement.lang = newLang;
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 bg-white shadow-sm hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md transition-all duration-300 group shrink-0"
            aria-label="Toggle Language"
        >
            <LuGlobe className={`w-5 h-5 transition-colors duration-300 ${i18n.language === 'ta' ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-600'}`} />
            <span className="text-sm font-black text-gray-900 min-w-[60px] text-center">
                {i18n.language === 'en' ? 'தமிழ்' : 'English'}
            </span>
        </button>
    );
};

export default LanguageSelector;
