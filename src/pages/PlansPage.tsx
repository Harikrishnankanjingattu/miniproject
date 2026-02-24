import { motion } from 'framer-motion';
import { db, auth } from '../lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { CheckCircle, Zap } from 'lucide-react';

interface Props {
  userProfile: any;
  setUserProfile: (fn: (prev: any) => any) => void;
}

const PlansPage = ({ userProfile, setUserProfile }: Props) => {
  const plans = [
    { id: 'trial', name: 'Trial', price: 'Free', credits: 10, features: ['Basic Lead Gen', '1 Campaign', 'Email Support'], highlight: false },
    { id: 'monthly', name: 'Professional', price: '₹2,000/mo', credits: 500, features: ['Unlimited Leads', '5 Campaigns', 'Priority Support'], highlight: true },
    { id: 'annual', name: 'Enterprise', price: '₹10,000/yr', credits: 3000, features: ['All Features', 'Unlimited Campaigns', '24/7 Support'], highlight: false },
  ];

  const handleSelect = async (plan: any) => {
    if (plan.id === 'trial' && userProfile.plan === 'trial') { alert('Already on Trial.'); return; }
    try {
      const userRef = doc(db, 'users', auth.currentUser!.uid);
      await updateDoc(userRef, { plan: plan.id, credits: increment(plan.credits) });
      setUserProfile((prev: any) => ({ ...prev, plan: plan.id, credits: (prev.credits || 0) + plan.credits }));
      alert(`Upgraded to ${plan.name}!`);
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Zap size={24} className="text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold font-display text-foreground mb-2">Choose Your Plan</h1>
          <p className="text-muted-foreground mb-10">Unlock more credits and scale your automation.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card p-6 flex flex-col ${plan.highlight ? 'border-primary/50 ring-1 ring-primary/20' : ''}`}
            >
              {plan.highlight && (
                <span className="self-start text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full mb-3">Popular</span>
              )}
              <h3 className="text-lg font-display font-semibold text-foreground">{plan.name}</h3>
              <p className="text-2xl font-bold font-display text-primary mt-2 mb-1">{plan.price}</p>
              <p className="text-xs text-emerald-400 font-semibold mb-4">{plan.credits} Credits</p>

              <ul className="space-y-2 text-left flex-1 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle size={14} className="text-primary shrink-0" /> {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelect(plan)}
                disabled={plan.id === userProfile.plan}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  plan.id === userProfile.plan
                    ? 'bg-secondary text-muted-foreground cursor-default'
                    : plan.highlight ? 'btn-gamma' : 'btn-gamma-outline'
                }`}
              >
                {plan.id === userProfile.plan ? 'Current Plan' : 'Select'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlansPage;
