import { Package, TrendingUp, DollarSign, Clock } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, trend }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-stone-500 text-sm font-medium">{label}</p>
                <h3 className="text-2xl font-serif font-bold text-brand-dark mt-2">{value}</h3>
            </div>
            <div className="p-2 bg-brand-mint/50 rounded-lg text-green-800">
                <Icon size={20} />
            </div>
        </div>
        <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
            <TrendingUp size={14} className="mr-1" />
            <span>{trend}</span>
            <span className="text-stone-400 ml-1">vs last month</span>
        </div>
    </div>
);

const Dashboard = () => {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-brand-dark">Dashboard</h1>
                <p className="text-stone-500 mt-2">Welcome back, here's what's happening today.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard icon={Package} label="Total Designs" value="124" trend="+12%" />
                <StatCard icon={DollarSign} label="Avg. Cost" value="$2.45" trend="-5%" />
                <StatCard icon={Clock} label="Pending Reviews" value="8" trend="+2" />
                <StatCard icon={TrendingUp} label="Efficiency" value="94%" trend="+1%" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-stone-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-serif font-bold text-brand-dark">Recent Designs</h2>
                        <button className="text-sm text-brand-gold font-medium hover:text-brand-dark transition-colors">View All</button>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 hover:bg-stone-50 rounded-lg transition-colors border border-transparent hover:border-stone-100 group cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-brand-pink/30 rounded-lg flex items-center justify-center text-brand-dark group-hover:bg-brand-pink transition-colors">
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-brand-dark group-hover:text-brand-gold transition-colors">Truffle Box Collection {i}</h4>
                                        <p className="text-xs text-stone-500">Created 2 hours ago</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-brand-cream text-brand-dark text-xs font-medium rounded-full border border-stone-100">
                                    Draft
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-brand-dark text-white rounded-xl shadow-sm p-6 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-brand-gold/10 rounded-full -mr-10 -mt-10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-pink/10 rounded-full -ml-10 -mb-10 blur-3xl"></div>

                    <div className="relative z-10">
                        <h2 className="text-xl font-serif font-bold mb-4">Trend Analysis</h2>
                        <p className="text-stone-300 text-sm mb-6 leading-relaxed">
                            Minimalist designs with <span className="text-brand-gold">gold foil accents</span> are trending up by 45% this season. Consider updating the Truffle Collection.
                        </p>
                    </div>

                    <button className="w-full py-3 bg-brand-gold text-brand-dark font-medium rounded-lg hover:bg-white transition-colors relative z-10 shadow-lg shadow-brand-gold/20">
                        View Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
