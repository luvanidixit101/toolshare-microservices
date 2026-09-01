import { Link } from 'react-router-dom';
import {
  Search, Wrench, Zap, Hammer, Leaf, Building2, Car, Sparkles, Plug, Droplet,
  ArrowRight, CheckCircle2, Users, ShieldCheck, IndianRupee, Star, Quote,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { CATEGORIES, mockTools } from '@/services/mockData';
import type { Tool } from '@/types';
import ToolCard from '@/components/tools/ToolCard';
import StarRating from '@/components/common/StarRating';
import { useAuth } from '@/context/AuthContext';

const categoryIcons: Record<string, typeof Zap> = {
  'Power Tools': Zap,
  'Hand Tools': Hammer,
  'Garden Tools': Leaf,
  'Construction': Building2,
  'Automotive': Car,
  'Cleaning': Sparkles,
  'Electrical': Plug,
  'Plumbing': Droplet,
};

const testimonials = [
  { name: 'Sarah J.', role: 'DIY Homeowner', avatar: 'https://i.pravatar.cc/100?img=47', rating: 5, text: 'I saved over ₹25,000 renting tools instead of buying. The community here is amazing and everyone is so helpful.' },
  { name: 'Mike T.', role: 'Weekend Warrior', avatar: 'https://i.pravatar.cc/100?img=33', rating: 5, text: 'Made ₹1,50,000 last year lending out my tools. They just sit in my garage anyway — might as well earn from them.' },
  { name: 'Lisa K.', role: 'Professional Contractor', avatar: 'https://i.pravatar.cc/100?img=45', rating: 4, text: 'When I need a specialty tool for a one-off job, ToolShare is the first place I look. Fast, easy, reliable.' },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [featured, setFeatured] = useState<Tool[]>([]);

  useEffect(() => {
    setFeatured(mockTools.slice(0, 6));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (location) params.set('location', location);
    window.location.href = `/tools?${params.toString()}`;
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Share Tools.<br />Save Money.<br />Build Together.
            </h1>
            <p className="text-lg text-primary-100 mt-6 max-w-xl">
              The peer-to-peer marketplace where neighbors share tools, save money, and build something great together.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link to="/tools" className="btn-accent text-base px-6 py-3">
                Browse Tools <ArrowRight size={18} />
              </Link>
              <Link to={isAuthenticated ? '/tools/add' : '/auth/register'} className="btn bg-white text-primary-700 hover:bg-primary-50 text-base px-6 py-3">
                List Your Tool
              </Link>
            </div>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mt-12 bg-white rounded-2xl shadow-2xl p-4 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tool name"
                  className="input pl-10 border-0 bg-gray-50"
                />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input border-0 bg-gray-50"
              >
                <option value="">All categories</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                  className="input border-0 bg-gray-50 flex-1"
                />
                <button type="submit" className="btn-primary px-6">Search</button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Popular Categories</h2>
          <p className="text-gray-500 mt-2">Find the right tool for any job</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = categoryIcons[cat] || Wrench;
            return (
              <Link
                key={cat}
                to={`/tools?category=${encodeURIComponent(cat)}`}
                className="group card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center mb-3 transition-colors">
                  <Icon className="text-primary-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{cat}</h3>
                <p className="text-sm text-gray-400 mt-1">Browse tools</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured tools */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Tools</h2>
              <p className="text-gray-500 mt-2">Top-rated tools available near you</p>
            </div>
            <Link to="/tools" className="hidden sm:flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-sm">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
          </div>
          <div className="sm:hidden mt-6 text-center">
            <Link to="/tools" className="btn-secondary">View all tools</Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">How ToolShare Works</h2>
          <p className="text-gray-500 mt-2">Renting and sharing tools in four simple steps</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: 1, title: 'Find a Tool', desc: 'Search and filter through thousands of tools in your area.', icon: Search },
            { step: 2, title: 'Book It', desc: 'Request a booking for the dates you need. Owners respond fast.', icon: CheckCircle2 },
            { step: 3, title: 'Use It', desc: 'Pick up the tool, get a quick walkthrough, and get to work.', icon: Wrench },
            { step: 4, title: 'Return It', desc: 'Return the tool in good condition and leave a review.', icon: ArrowRight },
          ].map((s) => (
            <div key={s.step} className="relative text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg">
                <s.icon size={28} />
              </div>
              <div className="text-sm font-bold text-primary-600 mb-1">Step {s.step}</div>
              <h3 className="font-semibold text-gray-900 text-lg">{s.title}</h3>
              <p className="text-sm text-gray-500 mt-2">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-6">Benefits for Renters</h2>
              <ul className="space-y-4">
                {[
                  { icon: IndianRupee, title: 'Save Money', desc: 'Rent tools for a fraction of the purchase price. No storage needed.' },
                  { icon: Search, title: 'Find Any Tool', desc: 'Access specialty and professional tools you only need once.' },
                  { icon: ShieldCheck, title: 'Safe & Secure', desc: 'Every rental is covered. Verified users and secure deposits.' },
                ].map((b) => (
                  <li key={b.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
                      <b.icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{b.title}</h3>
                      <p className="text-gray-400 text-sm mt-1">{b.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-6">Benefits for Owners</h2>
              <ul className="space-y-4">
                {[
                  { icon: IndianRupee, title: 'Earn Extra Income', desc: 'Turn idle tools into a steady stream of passive income.' },
                  { icon: Users, title: 'Build Community', desc: 'Connect with makers and DIYers in your neighborhood.' },
                  { icon: ShieldCheck, title: 'Your Tools Protected', desc: 'Security deposits and insurance options keep your tools safe.' },
                ].map((b) => (
                  <li key={b.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent-500 flex items-center justify-center shrink-0">
                      <b.icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{b.title}</h3>
                      <p className="text-gray-400 text-sm mt-1">{b.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">What Our Community Says</h2>
          <p className="text-gray-500 mt-2">Real stories from real ToolShare members</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="card p-6">
              <Quote className="text-primary-200" size={32} />
              <p className="text-gray-700 mt-3 leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-100">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
                <div className="ml-auto">
                  <StarRating value={t.rating} size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="relative rounded-2xl bg-gradient-to-r from-primary-600 to-primary-800 overflow-hidden px-6 py-14 text-center">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          <div className="relative">
            <Star className="text-accent-400 mx-auto mb-4" size={40} />
            <h2 className="text-3xl font-bold text-white">Have tools sitting unused?</h2>
            <p className="text-primary-100 text-lg mt-3 max-w-xl mx-auto">
              List your tool and start earning. Join thousands of owners making money from tools they already own.
            </p>
            <Link to={isAuthenticated ? '/tools/add' : '/auth/register'} className="btn-accent text-base px-8 py-3 mt-6 inline-flex">
              List Your Tool <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
