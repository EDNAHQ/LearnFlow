import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { MainNav } from '@/components/navigation';
import { Loader2 } from 'lucide-react';

const AdminGenerateTopics = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const generateTopics = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('Invoking generate-daily-community-topics...');
      const { data, error } = await supabase.functions.invoke('generate-daily-community-topics', {
        body: {}
      });

      if (error) {
        console.error('Function error:', error);
        throw error;
      }

      console.log('Function response:', data);
      setResult(data);
      
      if (data?.success) {
        toast({
          title: "Topics generated!",
          description: `Created ${data?.pathsCreated || 0} new learning paths. Check the community page!`,
        });

        // Redirect to community after delay
        setTimeout(() => {
          window.location.href = '/community';
        }, 3000);
      } else {
        toast({
          title: "Generation completed",
          description: data?.error || "Check results below",
        });
      }
    } catch (error: any) {
      console.error('Error generating topics:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate topics",
        variant: "destructive"
      });
      setResult({ error: error.message, success: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Generate Community Topics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              This will generate up to 10 new learning paths for the community area using AI.
            </p>
            
            <Button 
              onClick={generateTopics} 
              disabled={loading}
              className="brand-gradient text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Topics Now'
              )}
            </Button>

            {result && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Result:</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminGenerateTopics;

