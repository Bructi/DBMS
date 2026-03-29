import { useEffect, useState } from "react";
import { Trophy, TrendingUp, User as UserIcon } from "lucide-react";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    fetch("http://localhost:5000/api/leaderboard", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setLeaders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-blue-600">Loading Rankings...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-10 pb-20 px-6 font-sans">
      <div className="max-w-3xl mx-auto">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-800 flex items-center justify-center gap-3 mb-3">
            <Trophy className="text-amber-500 w-10 h-10" /> Top Investors
          </h1>
          <p className="text-slate-500 font-medium">Global ranking based on Total Net Worth (Wallet Balance + Active Portfolio)</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {leaders.map((user, index) => (
            <div 
              key={user.id} 
              className={`flex items-center justify-between p-6 border-b border-slate-100 last:border-b-0 transition-colors ${index === 0 ? 'bg-amber-50/30' : index === 1 ? 'bg-slate-50/50' : index === 2 ? 'bg-rose-50/30' : 'bg-white hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-5">
                
                {/* Rank Badge */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${index === 0 ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : index === 1 ? 'bg-slate-400 text-white shadow-md' : index === 2 ? 'bg-rose-400 text-white shadow-md' : 'bg-slate-100 text-slate-500'}`}>
                  {index + 1}
                </div>
                
                {/* Avatar */}
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm bg-slate-100 flex items-center justify-center shrink-0">
                  {user.profile_picture ? (
                    <img src={user.profile_picture} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-6 h-6 text-slate-400" />
                  )}
                </div>

                {/* User Info */}
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{user.full_name || user.username}</h3>
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-blue-500" /> Active Assets: ₹{Number(user.total_invested).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Net Worth */}
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Net Worth</p>
                <h2 className={`text-2xl font-black ${index === 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                  ₹{Number(user.net_worth).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </h2>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}