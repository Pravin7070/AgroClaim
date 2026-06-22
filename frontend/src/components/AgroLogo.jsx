import { LuSprout } from 'react-icons/lu';

const AgroLogo = ({ className = "w-12 h-12" }) => {
    return (
        <div className={`${className} flex items-center justify-center bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-200/50`}>
            <LuSprout className="text-white w-2/3 h-2/3" />
        </div>
    );
};

export default AgroLogo;
