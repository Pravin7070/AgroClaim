import { useState, useEffect } from 'react';
import { farmerAPI } from '../../services/api';
import { Spinner } from '../../components/Loading';
import IconWrapper from '../../components/IconWrapper';
import {
  LuWallet,
  LuArrowUpRight,
  LuArrowDownLeft,
  LuBanknote,
  LuHistory,
  LuBuilding,
  LuCheckCircle2,
  LuAlertTriangle,
  LuClock,
  LuInbox,
  LuSmartphone
} from 'react-icons/lu';

export default function FarmerWallet() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank'); // 'bank' or 'upi'
  const [identity, setIdentity] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const { data } = await farmerAPI.getWallet();
      if (data.success) {
        setWallet(data.wallet);
      }
    } catch (error) {
      console.error('Failed to get info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGPayWithdrawal = async (amount) => {
    setWithdrawing(true);
    setError('');
    setSuccess('');
    
    try {
      // Simulate GPay processing (2-3s)
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const { data } = await farmerAPI.withdraw({ amount, method: 'upi', identity, provider: 'gpay' });
      if (data.success) {
        setWallet(data.wallet);
        setWithdrawAmount('');
        setIdentity('');
        setSuccess(`✅ ₹${amount.toLocaleString()} sent to GPay (${identity})`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'GPay withdrawal failed');
    } finally {
      setWithdrawing(false);
    }
  };

  const handlePhonePeWithdrawal = async (amount) => {
    setWithdrawing(true);
    setError('');
    setSuccess('');
    
    try {
      // Simulate PhonePe processing (2-3s)
      await new Promise(resolve => setTimeout(resolve, 2800));
      
      const { data } = await farmerAPI.withdraw({ amount, method: 'upi', identity, provider: 'phonepe' });
      if (data.success) {
        setWallet(data.wallet);
        setWithdrawAmount('');
        setIdentity('');
        setSuccess(`✅ ₹${amount.toLocaleString()} sent to PhonePe (${identity})`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'PhonePe withdrawal failed');
    } finally {
      setWithdrawing(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const amount = parseFloat(withdrawAmount);
    if (amount <= 0) {
      setError('Please enter a correct amount');
      return;
    }

    if (amount > wallet.balance) {
      setError('You do not have enough money in your wallet');
      return;
    }

    if (!identity) {
      setError(`Please enter your ${withdrawMethod === 'bank' ? 'Bank Account' : 'UPI ID'}`);
      return;
    }

    setWithdrawing(true);
    try {
      const { data } = await farmerAPI.withdraw({ amount, method: withdrawMethod, identity });
      if (data.success) {
        setWallet(data.wallet);
        setWithdrawAmount('');
        setIdentity('');
        setSuccess(`Success! ₹${amount.toLocaleString()} sent to your ${withdrawMethod.toUpperCase()}.`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Withdraw failed. Try again.');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Spinner size="lg" color="farmer" /></div>;

  return (
    <div className="p-6 md:p-8 animate-fade-in-up pb-20 font-sans">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          My Money
          <IconWrapper color="text-amber-500" bgColor="bg-amber-50" size="w-10 h-10 border border-amber-100">
            <LuWallet />
          </IconWrapper>
        </h1>
        <p className="text-gray-500 font-medium mt-1">Manage your cash and see your farm payments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Balance Hero */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-gradient-to-br from-farmer-600 to-emerald-700 p-8 md:p-12 rounded-[2.5rem] text-white overflow-hidden relative shadow-2xl shadow-farmer-200/50">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-[100px]" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-black/10 rounded-full blur-[60px]" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/30">
                  Your Balance
                </span>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <p className="text-farmer-100 font-bold uppercase tracking-widest text-xs mb-3">Money you can take out</p>
              <div className="flex items-baseline gap-4 mb-10">
                <span className="text-6xl md:text-8xl font-black tracking-tight font-mono">
                  ₹{wallet?.balance?.toLocaleString() || '0'}
                </span>
                <span className="text-2xl font-bold opacity-60">INR</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-10 border-t border-white/20">
                <div>
                  <p className="text-farmer-200 text-[10px] font-black uppercase tracking-widest mb-1">Total Paid to You</p>
                  <p className="text-xl font-black">₹{wallet?.transactions?.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-farmer-200 text-[10px] font-black uppercase tracking-widest mb-1">Total Taken Out</p>
                  <p className="text-xl font-black">₹{wallet?.transactions?.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</p>
                </div>
                <div className="hidden md:block">
                  <p className="text-farmer-200 text-[10px] font-black uppercase tracking-widest mb-1">Status</p>
                  <p className="text-xl font-black flex items-center gap-2">
                    Active <LuCheckCircle2 size={18} className="text-emerald-400" />
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History Card */}
          <div className="card-glass p-8">
            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <IconWrapper color="text-indigo-600" bgColor="bg-indigo-50" size="w-10 h-10">
                <LuHistory />
              </IconWrapper>
              Money History
            </h3>

            <div className="space-y-4">
              {wallet?.transactions?.slice().reverse().map((txn, idx) => (
                <div key={idx} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 hover:border-farmer-200 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm ${txn.type === 'credit'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                      {txn.type === 'credit' ? <LuArrowDownLeft /> : <LuArrowUpRight />}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-sm">{txn.description}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                        {new Date(txn.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-black font-mono ${txn.type === 'credit' ? 'text-emerald-600' : 'text-gray-900'}`}>
                      {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Left: ₹{txn.balanceAfter?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {(!wallet?.transactions || wallet.transactions.length === 0) && (
                <div className="text-center py-16 text-gray-400">
                  <LuInbox size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-bold uppercase tracking-widest text-xs">No money records yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-8">
          {/* Withdraw Panel */}
          <div className="card-glass p-8 shadow-xl border-white/60">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <IconWrapper color="text-emerald-600" bgColor="bg-emerald-50" size="w-10 h-10">
                <LuBanknote />
              </IconWrapper>
              Withdraw Money
            </h3>

            <form onSubmit={handleWithdraw} className="space-y-6">
              {/* Method Selection */}
              <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setWithdrawMethod('bank')}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${withdrawMethod === 'bank' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
                >
                  To Bank
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawMethod('upi')}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${withdrawMethod === 'upi' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
                >
                  To UPI
                </button>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                  How much to take out (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400 group-focus-within:text-farmer-600">₹</span>
                  <input
                    type="number"
                    required
                    className="input-field pl-10 font-mono font-black text-lg"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    max={wallet?.balance}
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                  {withdrawMethod === 'bank' ? 'Bank Account Number' : 'UPI ID'} <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-farmer-600">
                    {withdrawMethod === 'bank' ? <LuBuilding size={16} /> : <LuSmartphone size={16} />}
                  </span>
                  <input
                    type="text"
                    required
                    className="input-field pl-10 font-bold text-sm"
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                    placeholder={withdrawMethod === 'bank' ? "Enter Account Number" : "name@upi"}
                  />
                </div>
              </div>

              {withdrawMethod === 'upi' && (
                <div className="flex items-center justify-center gap-4 py-2 border-y border-gray-50">
                  <button
                    type="button"
                    onClick={() => withdrawAmount && identity && handleGPayWithdrawal(parseFloat(withdrawAmount))}
                    disabled={!withdrawAmount || !identity || withdrawing}
                    className="flex flex-col items-center gap-1 grayscale hover:grayscale-0 cursor-pointer transition-all border p-2 rounded-xl border-gray-100 hover:border-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="h-6" />
                    <span className="text-[8px] font-bold text-gray-400">Quick Pay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => withdrawAmount && identity && handlePhonePeWithdrawal(parseFloat(withdrawAmount))}
                    disabled={!withdrawAmount || !identity || withdrawing}
                    className="flex flex-col items-center gap-1 grayscale hover:grayscale-0 cursor-pointer transition-all border p-2 rounded-xl border-gray-100 hover:border-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="h-6" />
                    <span className="text-[8px] font-bold text-gray-400">Quick Pay</span>
                  </button>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 animate-shake font-bold text-[10px] uppercase tracking-wider">
                  <LuAlertTriangle className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl flex items-center gap-3 animate-fade-in font-bold text-[10px] uppercase tracking-wider">
                  <LuCheckCircle2 className="flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={withdrawing || !withdrawAmount}
                className="btn-farmer w-full py-4 text-sm font-black uppercase tracking-widest shadow-lg shadow-farmer-200/50 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {withdrawing ? <Spinner size="sm" color="white" /> : <LuArrowUpRight />}
                Get Money
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
