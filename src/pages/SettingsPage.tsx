import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth';
import { useEdnaMembership } from '@/hooks/auth/useEdnaMembership';
import { useUserProfile } from '@/hooks/profile/useUserProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { MainNav } from '@/components/navigation';
import { User, Brain, Save, Mail, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/ui/use-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checkMembershipAndRedirect, loading: membershipLoading } = useEdnaMembership();
  const { profile, loading: profileLoading, updateProfile } = useUserProfile();

  // Account settings state
  const [email, setEmail] = useState(user?.email || '');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [timezone, setTimezone] = useState('UTC');

  // Learning preferences state
  const [learningStyle, setLearningStyle] = useState('');
  const [preferredPace, setPreferredPace] = useState('');
  const [contentComplexity, setContentComplexity] = useState('');
  const [learningGoals, setLearningGoals] = useState('');
  const [preferredFormat, setPreferredFormat] = useState<string[]>([]);
  const [dailyLearningTime, setDailyLearningTime] = useState(30);
  const [preferredTimes, setPreferredTimes] = useState<string[]>([]);
  const [notifications, setNotifications] = useState({
    dailyReminders: true,
    weeklyProgress: true,
    newFeatures: false
  });
  const [saving, setSaving] = useState(false);

  // Load profile data when it's available
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setTimezone(profile.timezone || 'UTC');
      setLearningStyle(profile.learning_style || '');
      setPreferredPace(profile.preferred_pace || '');
      setContentComplexity(profile.content_complexity || '');
      setLearningGoals(profile.learning_goals || '');
      setPreferredFormat((profile.preferred_formats as string[]) || []);
      setDailyLearningTime(profile.daily_learning_time_minutes || 30);
      setPreferredTimes((profile.preferred_learning_times as string[]) || []);
      setNotifications(profile.notification_preferences as any || {
        dailyReminders: true,
        weeklyProgress: true,
        newFeatures: false
      });
    }
  }, [profile]);

  const handleFormatChange = (format: string, checked: boolean) => {
    if (checked) {
      setPreferredFormat([...preferredFormat, format]);
    } else {
      setPreferredFormat(preferredFormat.filter(f => f !== format));
    }
  };

  const handleTimeChange = (time: string, checked: boolean) => {
    if (checked) {
      setPreferredTimes([...preferredTimes, time]);
    } else {
      setPreferredTimes(preferredTimes.filter(t => t !== time));
    }
  };

  const handleEdnaLearnClick = (e: React.MouseEvent) => {
    e.preventDefault();
    checkMembershipAndRedirect();
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      await updateProfile({
        display_name: displayName,
        bio: bio,
        timezone: timezone,
        learning_style: learningStyle as any,
        preferred_pace: preferredPace as any,
        content_complexity: contentComplexity as any,
        learning_goals: learningGoals,
        preferred_formats: preferredFormat,
        daily_learning_time_minutes: dailyLearningTime,
        preferred_learning_times: preferredTimes,
        notification_preferences: notifications,
      });

      toast({
        title: 'Settings saved',
        description: 'Your preferences have been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error saving settings',
        description: 'There was a problem saving your preferences. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    navigate('/sign-in');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account and customize your learning experience.
          </p>
        </div>

        <div className="grid gap-8">
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>Account Settings</CardTitle>
              </div>
              <CardDescription>
                Manage your account information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">
                    Email cannot be changed. Contact support if you need to update it.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    placeholder="Enter your display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      <SelectItem value="Asia/Singapore">Singapore</SelectItem>
                      <SelectItem value="Australia/Sydney">Sydney</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Notification Preferences
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="dailyReminders"
                      checked={notifications.dailyReminders}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, dailyReminders: checked as boolean }))
                      }
                    />
                    <Label htmlFor="dailyReminders">Daily learning reminders</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="weeklyProgress"
                      checked={notifications.weeklyProgress}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, weeklyProgress: checked as boolean }))
                      }
                    />
                    <Label htmlFor="weeklyProgress">Weekly progress reports</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newFeatures"
                      checked={notifications.newFeatures}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, newFeatures: checked as boolean }))
                      }
                    />
                    <Label htmlFor="newFeatures">New feature announcements</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* EDNA Ecosystem */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Enterprise DNA Ecosystem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 justify-between">
                <div>
                  <h4 className="font-medium">EDNA Learn</h4>
                  <p className="text-sm text-muted-foreground">Access our learning platform and courses</p>
                </div>
                <Button variant="outline" onClick={handleEdnaLearnClick} disabled={membershipLoading} className="w-full sm:w-auto">
                  {membershipLoading ? "Checking..." : "Open EDNA Learn"}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Learning Preferences */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                <CardTitle>Learning Preferences</CardTitle>
              </div>
              <CardDescription>
                Customize your learning experience to match your style and goals.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="learningStyle">Learning Style</Label>
                  <Select value={learningStyle} onValueChange={setLearningStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your learning style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visual">Visual (diagrams, charts, images)</SelectItem>
                      <SelectItem value="auditory">Auditory (audio, discussions)</SelectItem>
                      <SelectItem value="kinesthetic">Kinesthetic (hands-on, practice)</SelectItem>
                      <SelectItem value="reading">Reading/Writing (text-based)</SelectItem>
                      <SelectItem value="multimodal">Multimodal (combination)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="preferredPace">Preferred Learning Pace</Label>
                  <Select value={preferredPace} onValueChange={setPreferredPace}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your pace" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Slow & Thorough</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="fast">Fast & Efficient</SelectItem>
                      <SelectItem value="adaptive">Adaptive (varies by topic)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contentComplexity">Preferred Content Complexity</Label>
                <Select value={contentComplexity} onValueChange={setContentComplexity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select complexity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (basics and fundamentals)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (practical applications)</SelectItem>
                    <SelectItem value="advanced">Advanced (complex concepts)</SelectItem>
                    <SelectItem value="expert">Expert (cutting-edge topics)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="learningGoals">Learning Goals</Label>
                <Textarea
                  id="learningGoals"
                  placeholder="Describe what you want to achieve with LearnFlow..."
                  value={learningGoals}
                  onChange={(e) => setLearningGoals(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <Label>Preferred Content Formats</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Interactive tutorials',
                    'Video content',
                    'Written articles',
                    'Code examples',
                    'Quizzes & assessments',
                    'Case studies',
                    'Infographics',
                    'Audio content'
                  ].map((format) => (
                    <div key={format} className="flex items-center space-x-2">
                      <Checkbox
                        id={format}
                        checked={preferredFormat.includes(format)}
                        onCheckedChange={(checked) => handleFormatChange(format, checked as boolean)}
                      />
                      <Label htmlFor={format} className="text-sm">{format}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dailyLearningTime">Daily Learning Goal (minutes)</Label>
                <Input
                  id="dailyLearningTime"
                  type="number"
                  min="5"
                  max="480"
                  value={dailyLearningTime}
                  onChange={(e) => setDailyLearningTime(parseInt(e.target.value) || 30)}
                />
                <p className="text-sm text-muted-foreground">
                  How many minutes per day do you want to dedicate to learning?
                </p>
              </div>

              <div className="space-y-3">
                <Label>Preferred Learning Times</Label>
                <p className="text-sm text-muted-foreground">
                  When do you prefer to learn? (Select all that apply)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['Morning', 'Afternoon', 'Evening'].map((time) => (
                    <div key={time} className="flex items-center space-x-2">
                      <Checkbox
                        id={time}
                        checked={preferredTimes.includes(time)}
                        onCheckedChange={(checked) => handleTimeChange(time, checked as boolean)}
                      />
                      <Label htmlFor={time} className="text-sm">{time}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              className="flex items-center gap-2"
              disabled={saving || profileLoading}
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}