import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { useUserProfile } from '@/hooks/profile/useUserProfile';
import { useUserLearningProfile } from '@/hooks/personalization/useUserLearningProfile';
import { useProjects } from '@/hooks/projects/useProjects';
import { MainNav } from '@/components/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Edit2, 
  Save, 
  X, 
  User, 
  Briefcase, 
  Target, 
  TrendingUp, 
  Clock, 
  Zap, 
  BookOpen,
  Award,
  Flame,
  BarChart3,
  Brain,
  Code,
  Database,
  Bot,
  Settings,
  Calendar,
  Headphones,
  Eye,
  FileText,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/ui/use-toast';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useUserProfile();
  const { profile: learningProfile, isLoading: learningProfileLoading } = useUserLearningProfile({ enabled: !!user });
  const { projects, loading: projectsLoading } = useProjects();
  const { toast } = useToast();
  
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const [skillValue, setSkillValue] = useState<number>(0);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/sign-in?returnTo=/profile');
    }
  }, [user, authLoading, navigate]);

  const isLoading = authLoading || profileLoading || (user && learningProfileLoading) || projectsLoading;

  if (!user && !authLoading) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <MainNav />
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-brand-purple/20 border-t-brand-purple animate-spin"></div>
        </div>
      </div>
    );
  }

  const handleStartEdit = (field: string, currentValue: string | null) => {
    setEditingField(field);
    setEditValue(currentValue || '');
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleSave = async (field: string) => {
    if (!profile) return;
    
    setSaving(true);
    try {
      await updateProfile({ [field]: editValue || null });
      toast({
        title: "Profile updated",
        description: "Your information has been saved.",
      });
      setEditingField(null);
      setEditValue('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSkill = async (field: string) => {
    if (!profile) return;
    
    setSaving(true);
    try {
      await updateProfile({ [field]: skillValue || null });
      toast({
        title: "Skill updated",
        description: "Your skill level has been saved.",
      });
      setEditingSkill(null);
      setSkillValue(0);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update skill. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStartEditSkill = (field: string, currentValue: number | null | undefined) => {
    setEditingSkill(field);
    setSkillValue(currentValue || 0);
  };

  const getSkillLevel = (skill: number | null | undefined): string => {
    if (!skill) return 'Not set';
    if (skill <= 1) return 'Beginner';
    if (skill <= 2) return 'Novice';
    if (skill <= 3) return 'Intermediate';
    if (skill <= 4) return 'Advanced';
    return 'Expert';
  };

  const getExperienceLabel = (level: string | null | undefined): string => {
    if (!level) return 'Not set';
    const labels: Record<string, string> = {
      beginner: 'Beginner',
      competent: 'Competent',
      builder: 'Builder',
    };
    return labels[level] || level;
  };

  return (
    <div className="min-h-screen bg-white">
      <MainNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-purple via-brand-pink to-brand-gold p-8 md:p-12 text-white">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-2">
                    {profile?.display_name || user?.email?.split('@')[0] || 'Your'} LearnFlow Profile
                  </h1>
                  <p className="text-white/90 text-lg">
                    Everything we know about your learning journey
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  {learningProfile && (
                    <>
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 text-center">
                        <div className="text-3xl font-bold">{learningProfile.currentStreakDays}</div>
                        <div className="text-sm text-white/90">Day Streak</div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 text-center">
                        <div className="text-3xl font-bold">
                          {Math.round(learningProfile.totalLearningTimeMinutes / 60)}
                        </div>
                        <div className="text-sm text-white/90">Hours Learned</div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 text-center">
                        <div className="text-3xl font-bold">{projects?.length || 0}</div>
                        <div className="text-sm text-white/90">Projects</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <ProfileSection
              title="Basic Information"
              icon={User}
              editingField={editingField}
              onStartEdit={handleStartEdit}
              onCancelEdit={handleCancelEdit}
              onSave={handleSave}
              editValue={editValue}
              setEditValue={setEditValue}
              saving={saving}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EditableField
                  label="Role"
                  value={profile?.role}
                  field="role"
                  editingField={editingField}
                  onStartEdit={handleStartEdit}
                  onCancelEdit={handleCancelEdit}
                  onSave={handleSave}
                  editValue={editValue}
                  setEditValue={setEditValue}
                  saving={saving}
                />
                <EditableField
                  label="Industry"
                  value={profile?.industry}
                  field="industry"
                  editingField={editingField}
                  onStartEdit={handleStartEdit}
                  onCancelEdit={handleCancelEdit}
                  onSave={handleSave}
                  editValue={editValue}
                  setEditValue={setEditValue}
                  saving={saving}
                />
                <EditableField
                  label="Function"
                  value={profile?.function}
                  field="function"
                  editingField={editingField}
                  onStartEdit={handleStartEdit}
                  onCancelEdit={handleCancelEdit}
                  onSave={handleSave}
                  editValue={editValue}
                  setEditValue={setEditValue}
                  saving={saving}
                />
                <EditableSelectField
                  label="Experience Level"
                  value={profile?.experience_level}
                  field="experience_level"
                  options={[
                    { value: 'beginner', label: 'Beginner' },
                    { value: 'competent', label: 'Competent' },
                    { value: 'builder', label: 'Builder' },
                  ]}
                  editingField={editingField}
                  onStartEdit={handleStartEdit}
                  onCancelEdit={handleCancelEdit}
                  onSave={handleSave}
                  editValue={editValue}
                  setEditValue={setEditValue}
                  saving={saving}
                />
              </div>
            </ProfileSection>

            {/* Skills */}
            <ProfileSection
              title="Skills"
              icon={BarChart3}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EditableSkillCard
                  icon={Database}
                  label="Data"
                  skill={profile?.skill_data}
                  field="skill_data"
                  color="brand-purple"
                  editingSkill={editingSkill}
                  onStartEdit={handleStartEditSkill}
                  onCancelEdit={() => setEditingSkill(null)}
                  onSave={handleSaveSkill}
                  skillValue={skillValue}
                  setSkillValue={setSkillValue}
                  saving={saving}
                />
                <EditableSkillCard
                  icon={Code}
                  label="Apps"
                  skill={profile?.skill_apps}
                  field="skill_apps"
                  color="brand-pink"
                  editingSkill={editingSkill}
                  onStartEdit={handleStartEditSkill}
                  onCancelEdit={() => setEditingSkill(null)}
                  onSave={handleSaveSkill}
                  skillValue={skillValue}
                  setSkillValue={setSkillValue}
                  saving={saving}
                />
                <EditableSkillCard
                  icon={Settings}
                  label="Automation"
                  skill={profile?.skill_automation}
                  field="skill_automation"
                  color="brand-gold"
                  editingSkill={editingSkill}
                  onStartEdit={handleStartEditSkill}
                  onCancelEdit={() => setEditingSkill(null)}
                  onSave={handleSaveSkill}
                  skillValue={skillValue}
                  setSkillValue={setSkillValue}
                  saving={saving}
                />
                <EditableSkillCard
                  icon={Bot}
                  label="AI Reasoning"
                  skill={profile?.skill_ai_reasoning}
                  field="skill_ai_reasoning"
                  color="brand-purple"
                  editingSkill={editingSkill}
                  onStartEdit={handleStartEditSkill}
                  onCancelEdit={() => setEditingSkill(null)}
                  onSave={handleSaveSkill}
                  skillValue={skillValue}
                  setSkillValue={setSkillValue}
                  saving={saving}
                />
              </div>
            </ProfileSection>

            {/* Goals */}
            <ProfileSection
              title="Goals"
              icon={Target}
              editingField={editingField}
              onStartEdit={handleStartEdit}
              onCancelEdit={handleCancelEdit}
              onSave={handleSave}
              editValue={editValue}
              setEditValue={setEditValue}
              saving={saving}
            >
              <div className="space-y-6">
                <EditableTextareaField
                  label="Short-term Goals"
                  value={profile?.goals_short_term}
                  field="goals_short_term"
                  editingField={editingField}
                  onStartEdit={handleStartEdit}
                  onCancelEdit={handleCancelEdit}
                  onSave={handleSave}
                  editValue={editValue}
                  setEditValue={setEditValue}
                  saving={saving}
                />
                <EditableTextareaField
                  label="Long-term Goals"
                  value={profile?.goals_long_term}
                  field="goals_long_term"
                  editingField={editingField}
                  onStartEdit={handleStartEdit}
                  onCancelEdit={handleCancelEdit}
                  onSave={handleSave}
                  editValue={editValue}
                  setEditValue={setEditValue}
                  saving={saving}
                />
                <EditableTextareaField
                  label="Immediate Challenge"
                  value={profile?.immediate_challenge}
                  field="immediate_challenge"
                  editingField={editingField}
                  onStartEdit={handleStartEdit}
                  onCancelEdit={handleCancelEdit}
                  onSave={handleSave}
                  editValue={editValue}
                  setEditValue={setEditValue}
                  saving={saving}
                />
              </div>
            </ProfileSection>

            {/* Content Preferences */}
            <ProfileSection
              title="Content Preferences"
              icon={Sparkles}
              editingField={editingField}
              onStartEdit={handleStartEdit}
              onCancelEdit={handleCancelEdit}
              onSave={handleSave}
              editValue={editValue}
              setEditValue={setEditValue}
              saving={saving}
            >
              <div className="space-y-6">
                <p className="text-sm text-gray-600 mb-4">
                  Set your default content preferences. These will be used when creating new projects unless you override them.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EditableSelectField
                    label="Writing Style"
                    value={profile?.default_content_style}
                    field="default_content_style"
                    options={[
                      { value: 'conversational', label: 'Conversational' },
                      { value: 'formal', label: 'Formal' },
                      { value: 'technical', label: 'Technical' },
                      { value: 'storytelling', label: 'Storytelling' },
                      { value: 'practical', label: 'Practical' },
                    ]}
                    editingField={editingField}
                    onStartEdit={handleStartEdit}
                    onCancelEdit={handleCancelEdit}
                    onSave={handleSave}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    saving={saving}
                  />
                  <EditableSelectField
                    label="Content Length"
                    value={profile?.default_content_length}
                    field="default_content_length"
                    options={[
                      { value: 'brief', label: 'Brief (300-400 words)' },
                      { value: 'standard', label: 'Standard (600-700 words)' },
                      { value: 'detailed', label: 'Detailed (800-1000 words)' },
                      { value: 'comprehensive', label: 'Comprehensive (1000+ words)' },
                    ]}
                    editingField={editingField}
                    onStartEdit={handleStartEdit}
                    onCancelEdit={handleCancelEdit}
                    onSave={handleSave}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    saving={saving}
                  />
                  <EditableSelectField
                    label="Complexity Level"
                    value={profile?.default_content_complexity || profile?.content_complexity}
                    field="default_content_complexity"
                    options={[
                      { value: 'simplified', label: 'Simplified' },
                      { value: 'balanced', label: 'Balanced' },
                      { value: 'advanced', label: 'Advanced' },
                      { value: 'expert', label: 'Expert' },
                    ]}
                    editingField={editingField}
                    onStartEdit={handleStartEdit}
                    onCancelEdit={handleCancelEdit}
                    onSave={handleSave}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    saving={saving}
                  />
                  <EditableSelectField
                    label="Preferred Examples"
                    value={profile?.default_preferred_examples}
                    field="default_preferred_examples"
                    options={[
                      { value: 'real-world', label: 'Real-World' },
                      { value: 'theoretical', label: 'Theoretical' },
                      { value: 'code-focused', label: 'Code-Focused' },
                      { value: 'business-focused', label: 'Business-Focused' },
                      { value: 'mixed', label: 'Mixed' },
                    ]}
                    editingField={editingField}
                    onStartEdit={handleStartEdit}
                    onCancelEdit={handleCancelEdit}
                    onSave={handleSave}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    saving={saving}
                  />
                  <EditableSelectField
                    label="Learning Approach"
                    value={profile?.default_learning_approach}
                    field="default_learning_approach"
                    options={[
                      { value: 'hands-on', label: 'Hands-On' },
                      { value: 'conceptual', label: 'Conceptual' },
                      { value: 'visual', label: 'Visual' },
                      { value: 'analytical', label: 'Analytical' },
                      { value: 'balanced', label: 'Balanced' },
                    ]}
                    editingField={editingField}
                    onStartEdit={handleStartEdit}
                    onCancelEdit={handleCancelEdit}
                    onSave={handleSave}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    saving={saving}
                  />
                </div>
              </div>
            </ProfileSection>

            {/* Learning Preferences */}
            <ProfileSection
              title="Learning Preferences"
              icon={Brain}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Learning Style</label>
                  <Badge className="bg-brand-pink/10 text-brand-pink border-brand-pink/20">
                    {profile?.learning_style || 'Not set'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Preferred Pace</label>
                  <Badge className="bg-brand-gold/10 text-brand-gold border-brand-gold/20">
                    {profile?.preferred_pace || 'Not set'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Content Complexity</label>
                  <Badge className="bg-brand-purple/10 text-brand-purple border-brand-purple/20">
                    {profile?.content_complexity || 'Not set'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Daily Learning Time</label>
                  <div className="text-2xl font-bold text-brand-purple">
                    {profile?.daily_learning_time_minutes || 0} min
                  </div>
                </div>
              </div>
              
              {learningProfile && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-500 mb-4">Format Preferences</h4>
                  <div className="flex flex-wrap gap-4">
                    {learningProfile.prefersAudio && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-brand-purple/10 rounded-lg">
                        <Headphones className="w-4 h-4 text-brand-purple" />
                        <span className="text-sm font-medium text-brand-purple">Audio</span>
                      </div>
                    )}
                    {learningProfile.prefersVisual && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-brand-pink/10 rounded-lg">
                        <Eye className="w-4 h-4 text-brand-pink" />
                        <span className="text-sm font-medium text-brand-pink">Visual</span>
                      </div>
                    )}
                    {learningProfile.prefersText && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-brand-gold/10 rounded-lg">
                        <FileText className="w-4 h-4 text-brand-gold" />
                        <span className="text-sm font-medium text-brand-gold">Text</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </ProfileSection>

            {/* Learning Statistics */}
            {learningProfile && (
              <ProfileSection
                title="Learning Statistics"
                icon={TrendingUp}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <StatCard
                    icon={Flame}
                    label="Current Streak"
                    value={`${learningProfile.currentStreakDays} days`}
                    color="brand-pink"
                  />
                  <StatCard
                    icon={Award}
                    label="Longest Streak"
                    value={`${learningProfile.longestStreakDays} days`}
                    color="brand-gold"
                  />
                  <StatCard
                    icon={Clock}
                    label="Total Learning Time"
                    value={`${Math.round(learningProfile.totalLearningTimeMinutes / 60)} hours`}
                    color="brand-purple"
                  />
                  <StatCard
                    icon={Calendar}
                    label="Daily Average"
                    value={`${Math.round(learningProfile.dailyAverageMinutes)} min`}
                    color="brand-pink"
                  />
                  <StatCard
                    icon={Zap}
                    label="Learning Velocity"
                    value={learningProfile.learningVelocity}
                    color="brand-gold"
                  />
                  <StatCard
                    icon={BarChart3}
                    label="Average Success Rate"
                    value={`${Math.round(learningProfile.avgSuccessRate)}%`}
                    color="brand-purple"
                  />
                </div>
              </ProfileSection>
            )}

            {/* Learning Insights */}
            {learningProfile && (
              <ProfileSection
                title="Learning Insights"
                icon={Sparkles}
              >
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Optimal Session Length</span>
                      <span className="text-sm font-bold text-brand-purple">
                        {learningProfile.optimalSessionLength} minutes
                      </span>
                    </div>
                    <Progress 
                      value={(learningProfile.optimalSessionLength / 60) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Preferred Difficulty</span>
                      <span className="text-sm font-bold text-brand-pink">
                        {learningProfile.preferredDifficulty.toFixed(1)} / 5
                      </span>
                    </div>
                    <Progress 
                      value={(learningProfile.preferredDifficulty / 5) * 100} 
                      className="h-2"
                    />
                  </div>

                  {learningProfile.mostEngagedTopics.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-3 block">Most Engaged Topics</label>
                      <div className="flex flex-wrap gap-2">
                        {learningProfile.mostEngagedTopics.map((topic, idx) => (
                          <Badge key={idx} className="bg-brand-purple/10 text-brand-purple border-brand-purple/20">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {learningProfile.conceptsNeedingRemediation.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-3 block">Concepts Needing Review</label>
                      <div className="flex flex-wrap gap-2">
                        {learningProfile.conceptsNeedingRemediation.map((concept, idx) => (
                          <Badge key={idx} className="bg-brand-gold/10 text-brand-gold border-brand-gold/20">
                            {concept}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ProfileSection>
            )}

            {/* Current Tools */}
            {profile?.current_tools && profile.current_tools.length > 0 && (
              <ProfileSection
                title="Current Tools"
                icon={Briefcase}
              >
                <div className="flex flex-wrap gap-2">
                  {profile.current_tools.map((tool, idx) => (
                    <Badge key={idx} className="bg-gray-100 text-gray-700 border-gray-200">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </ProfileSection>
            )}
          </div>

          {/* Right Column - Quick Stats & Projects */}
          <div className="space-y-8">
            {/* Quick Stats Card */}
            <Card className="p-6 bg-gradient-to-br from-brand-purple/5 to-brand-pink/5 border-brand-purple/20">
              <h3 className="text-lg font-bold mb-4 text-gray-900">Quick Stats</h3>
              <div className="space-y-4">
                {profile?.total_steps_completed && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Steps Completed</div>
                    <div className="text-2xl font-bold text-brand-purple">{profile.total_steps_completed}</div>
                  </div>
                )}
                {profile?.total_paths_completed && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Paths Completed</div>
                    <div className="text-2xl font-bold text-brand-pink">{profile.total_paths_completed}</div>
                  </div>
                )}
                {learningProfile && (
                  <>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Hint Usage Rate</div>
                      <div className="text-2xl font-bold text-brand-gold">
                        {Math.round(learningProfile.hintUsageRate * 100)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Example Usage Rate</div>
                      <div className="text-2xl font-bold text-brand-purple">
                        {Math.round(learningProfile.exampleUsageRate * 100)}%
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Recent Projects */}
            {projects && projects.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 text-gray-900">Recent Projects</h3>
                <div className="space-y-4">
                  {projects.slice(0, 5).map((project) => (
                    <div key={project.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="font-medium text-gray-900 mb-1">{project.topic}</div>
                      {project.progress !== undefined && (
                        <div className="mt-2">
                          <Progress value={project.progress} className="h-1.5" />
                          <div className="text-xs text-gray-500 mt-1">{project.progress}% complete</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProfileSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  editingField?: string | null;
  onStartEdit?: (field: string, value: string | null) => void;
  onCancelEdit?: () => void;
  onSave?: (field: string) => void;
  editValue?: string;
  setEditValue?: (value: string) => void;
  saving?: boolean;
}

function ProfileSection({ 
  title, 
  icon: Icon, 
  children,
  editingField,
  onStartEdit,
  onCancelEdit,
  onSave,
  editValue,
  setEditValue,
  saving
}: ProfileSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-6 border-gray-200 hover:border-brand-purple/30 transition-colors">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-brand-purple/10 rounded-lg">
            <Icon className="w-5 h-5 text-brand-purple" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        </div>
        {children}
      </Card>
    </motion.div>
  );
}

interface EditableFieldProps {
  label: string;
  value: string | null | undefined;
  field: string;
  editingField: string | null;
  onStartEdit: (field: string, value: string | null) => void;
  onCancelEdit: () => void;
  onSave: (field: string) => void;
  editValue: string;
  setEditValue: (value: string) => void;
  saving: boolean;
}

function EditableField({
  label,
  value,
  field,
  editingField,
  onStartEdit,
  onCancelEdit,
  onSave,
  editValue,
  setEditValue,
  saving
}: EditableFieldProps) {
  const isEditing = editingField === field;

  return (
    <div>
      <label className="text-sm font-medium text-gray-500 mb-2 block">{label}</label>
      {isEditing ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
            autoFocus
          />
          <Button
            size="sm"
            onClick={() => onSave(field)}
            disabled={saving}
            className="bg-brand-purple hover:bg-brand-purple/90"
          >
            <Save className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onCancelEdit}
            disabled={saving}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className={cn(
            "text-gray-900",
            !value && "text-gray-400 italic"
          )}>
            {value || 'Not set'}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onStartEdit(field, value || null)}
            className="text-brand-purple hover:text-brand-purple/80"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
      )}
    </div>
  );
}

interface EditableTextareaFieldProps {
  label: string;
  value: string | null | undefined;
  field: string;
  editingField: string | null;
  onStartEdit: (field: string, value: string | null) => void;
  onCancelEdit: () => void;
  onSave: (field: string) => void;
  editValue: string;
  setEditValue: (value: string) => void;
  saving: boolean;
}

function EditableTextareaField({
  label,
  value,
  field,
  editingField,
  onStartEdit,
  onCancelEdit,
  onSave,
  editValue,
  setEditValue,
  saving
}: EditableTextareaFieldProps) {
  const isEditing = editingField === field;

  return (
    <div>
      <label className="text-sm font-medium text-gray-500 mb-2 block">{label}</label>
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple resize-none"
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onSave(field)}
              disabled={saving}
              className="bg-brand-purple hover:bg-brand-purple/90"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onCancelEdit}
              disabled={saving}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between">
          <div className={cn(
            "text-gray-900 whitespace-pre-wrap flex-1",
            !value && "text-gray-400 italic"
          )}>
            {value || 'Not set'}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onStartEdit(field, value || null)}
            className="text-brand-purple hover:text-brand-purple/80 ml-4 flex-shrink-0"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
      )}
    </div>
  );
}

interface EditableSelectFieldProps {
  label: string;
  value: string | null | undefined;
  field: string;
  options: Array<{ value: string; label: string }>;
  editingField: string | null;
  onStartEdit: (field: string, value: string | null) => void;
  onCancelEdit: () => void;
  onSave: (field: string) => void;
  editValue: string;
  setEditValue: (value: string) => void;
  saving: boolean;
}

function EditableSelectField({
  label,
  value,
  field,
  options,
  editingField,
  onStartEdit,
  onCancelEdit,
  onSave,
  editValue,
  setEditValue,
  saving
}: EditableSelectFieldProps) {
  const isEditing = editingField === field;

  return (
    <div>
      <label className="text-sm font-medium text-gray-500 mb-2 block">{label}</label>
      {isEditing ? (
        <div className="flex gap-2">
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
            autoFocus
          >
            <option value="">Not set</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            onClick={() => onSave(field)}
            disabled={saving}
            className="bg-brand-purple hover:bg-brand-purple/90"
          >
            <Save className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onCancelEdit}
            disabled={saving}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className={cn(
            "text-gray-900",
            !value && "text-gray-400 italic"
          )}>
            {value ? options.find(o => o.value === value)?.label || value : 'Not set'}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onStartEdit(field, value || null)}
            className="text-brand-purple hover:text-brand-purple/80"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
      )}
    </div>
  );
}

interface EditableSkillCardProps {
  icon: React.ElementType;
  label: string;
  skill: number | null | undefined;
  field: string;
  color: 'brand-purple' | 'brand-pink' | 'brand-gold';
  editingSkill: string | null;
  onStartEdit: (field: string, value: number | null | undefined) => void;
  onCancelEdit: () => void;
  onSave: (field: string) => void;
  skillValue: number;
  setSkillValue: (value: number) => void;
  saving: boolean;
}

function EditableSkillCard({ 
  icon: Icon, 
  label, 
  skill, 
  field,
  color,
  editingSkill,
  onStartEdit,
  onCancelEdit,
  onSave,
  skillValue,
  setSkillValue,
  saving
}: EditableSkillCardProps) {
  const colorClasses = {
    'brand-purple': 'bg-brand-purple/10 text-brand-purple border-brand-purple/20',
    'brand-pink': 'bg-brand-pink/10 text-brand-pink border-brand-pink/20',
    'brand-gold': 'bg-brand-gold/10 text-brand-gold border-brand-gold/20',
  };

  const level = skill ? Math.round((skill / 5) * 100) : 0;
  const isEditing = editingSkill === field;

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("p-2 rounded-lg", colorClasses[color])}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-700">{label}</div>
          {isEditing ? (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={skillValue}
                onChange={(e) => setSkillValue(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs text-gray-500 w-8">{skillValue}/5</span>
            </div>
          ) : (
            <div className="text-xs text-gray-500">
              {skill ? `${skill}/5` : 'Not set'}
            </div>
          )}
        </div>
        {!isEditing && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onStartEdit(field, skill)}
            className="text-brand-purple hover:text-brand-purple/80"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
        )}
      </div>
      {isEditing ? (
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            onClick={() => onSave(field)}
            disabled={saving}
            className="bg-brand-purple hover:bg-brand-purple/90 flex-1"
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onCancelEdit}
            disabled={saving}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        skill && (
          <Progress value={level} className="h-2" />
        )
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: 'brand-purple' | 'brand-pink' | 'brand-gold';
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    'brand-purple': 'text-brand-purple bg-brand-purple/10',
    'brand-pink': 'text-brand-pink bg-brand-pink/10',
    'brand-gold': 'text-brand-gold bg-brand-gold/10',
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", colorClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-500 mb-1">{label}</div>
          <div className="text-xl font-bold text-gray-900">{value}</div>
        </div>
      </div>
    </div>
  );
}

