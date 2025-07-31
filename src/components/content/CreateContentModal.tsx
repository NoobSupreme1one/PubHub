import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CalendarIcon, 
  ImageIcon, 
  LinkIcon, 
  Loader2, 
  Globe, 
  Facebook, 
  Linkedin, 
  Twitter, 
  Instagram,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/sonner';

interface CreateContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  maxLength: number;
  selected: boolean;
}

export function CreateContentModal({ open, onOpenChange }: CreateContentModalProps) {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  
  const [platforms, setPlatforms] = useState<Platform[]>([
    {
      id: 'blog',
      name: 'Company Blog',
      icon: <Globe className="h-4 w-4" />,
      color: '#1976D2',
      maxLength: 5000,
      selected: false
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: <Facebook className="h-4 w-4" />,
      color: '#1877F2',
      maxLength: 63206,
      selected: false
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: <Linkedin className="h-4 w-4" />,
      color: '#0A66C2',
      maxLength: 3000,
      selected: false
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      icon: <Twitter className="h-4 w-4" />,
      color: '#000000',
      maxLength: 280,
      selected: false
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: <Instagram className="h-4 w-4" />,
      color: '#E4405F',
      maxLength: 2200,
      selected: false
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      icon: <Zap className="h-4 w-4" />,
      color: '#BD081C',
      maxLength: 500,
      selected: false
    }
  ]);

  const togglePlatform = (platformId: string) => {
    setPlatforms(prev => 
      prev.map(p => 
        p.id === platformId ? { ...p, selected: !p.selected } : p
      )
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  const handleSubmit = async () => {
    const selectedPlatforms = platforms.filter(p => p.selected);
    
    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }

    if (!content.trim()) {
      toast.error('Please enter content');
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement actual content creation logic
      // This would integrate with the platform APIs
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      toast.success('Content created successfully!', {
        description: `Posted to ${selectedPlatforms.length} platform(s)`
      });
      
      // Reset form
      setContent('');
      setTitle('');
      setLink('');
      setImage(null);
      setScheduledDate(undefined);
      setPlatforms(prev => prev.map(p => ({ ...p, selected: false })));
      
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to create content');
    } finally {
      setLoading(false);
    }
  };

  const selectedPlatforms = platforms.filter(p => p.selected);
  const minMaxLength = selectedPlatforms.length > 0 
    ? Math.min(...selectedPlatforms.map(p => p.maxLength))
    : 5000;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Content</DialogTitle>
          <DialogDescription>
            Create and publish content across multiple platforms
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                placeholder="Enter a title for your content"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="What would you like to share?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{content.length} characters</span>
                {selectedPlatforms.length > 0 && (
                  <span className={content.length > minMaxLength ? 'text-destructive' : ''}>
                    Max: {minMaxLength} for selected platforms
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link (Optional)</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="link"
                  placeholder="https://example.com"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image (Optional)</Label>
              <div className="relative">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                />
                {image && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {image.name}
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="platforms" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {platforms.map((platform) => (
                <Card 
                  key={platform.id} 
                  className={`cursor-pointer transition-all ${
                    platform.selected ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => togglePlatform(platform.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: platform.color + '20' }}
                        >
                          {platform.icon}
                        </div>
                        <CardTitle className="text-sm">{platform.name}</CardTitle>
                      </div>
                      <Checkbox 
                        checked={platform.selected}
                        onChange={() => togglePlatform(platform.id)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Max length: {platform.maxLength.toLocaleString()} characters
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="schedule-now" defaultChecked />
                <Label htmlFor="schedule-now">Publish immediately</Label>
              </div>
              
              <div className="space-y-2">
                <Label>Or schedule for later</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            {selectedPlatforms.map((platform) => (
              <Badge key={platform.id} variant="secondary">
                {platform.name}
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {scheduledDate ? 'Schedule' : 'Publish'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
