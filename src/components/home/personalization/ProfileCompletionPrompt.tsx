import React, { useMemo } from 'react';
import { useUserProfile } from '@/hooks/profile/useUserProfile';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserCircle, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ProfileCompletionPrompt = () => {
  const { profile } = useUserProfile();
  const navigate = useNavigate();

  const missingFields = useMemo(() => {
    if (!profile) return [];
    
    const fields = [];
    if (!profile.role) fields.push({ label: 'Role', field: 'role' });
    if (!profile.industry) fields.push({ label: 'Industry', field: 'industry' });
    if (!profile.function) fields.push({ label: 'Function', field: 'function' });
    if (!profile.goals_short_term) fields.push({ label: 'Short-term Goals', field: 'goals_short_term' });
    if (!profile.goals_long_term) fields.push({ label: 'Long-term Goals', field: 'goals_long_term' });
    
    return fields;
  }, [profile]);

  const completionPercentage = useMemo(() => {
    if (!profile) return 0;
    const totalFields = 5;
    const completedFields = totalFields - missingFields.length;
    return Math.round((completedFields / totalFields) * 100);
  }, [profile, missingFields.length]);

  if (missingFields.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-brand-gold/10 via-brand-pink/10 to-brand-purple/10 rounded-2xl p-6 md:p-8 border-2 border-brand-gold/20 mb-8"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-brand-gold/20 rounded-xl">
          <UserCircle className="w-6 h-6 text-brand-gold" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-[#0b0c18] mb-2">
            Complete Your Profile
          </h3>
          <p className="text-sm text-[#0b0c18]/70 font-light mb-4">
            Help us personalize your learning experience. The more we know about you, the better we can tailor content to your needs.
          </p>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#0b0c18]">Profile Completion</span>
              <span className="text-sm font-bold text-brand-gold">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-brand-gold to-brand-pink h-2 rounded-full transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="text-sm font-medium text-[#0b0c18]/70 mb-2">
              Missing information:
            </div>
            {missingFields.slice(0, 3).map((field) => (
              <div key={field.field} className="flex items-center gap-2 text-sm text-[#0b0c18]/60">
                <Sparkles className="w-3 h-3 text-brand-gold" />
                <span>{field.label}</span>
              </div>
            ))}
            {missingFields.length > 3 && (
              <div className="text-xs text-[#0b0c18]/50">
                +{missingFields.length - 3} more
              </div>
            )}
          </div>

          <Button
            onClick={() => navigate('/profile')}
            className="brand-gradient text-white rounded-full px-6 py-2 text-sm font-medium group"
          >
            Complete Profile
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

