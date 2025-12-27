import { useState, useEffect } from 'react';
import { X, Plus, Bell, Calendar, Clock, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, differenceInMinutes } from 'date-fns';

interface Schedule {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  scheduled_at: string;
  reminder_minutes: number;
  notified: boolean;
}

interface ScheduleManagerProps {
  onClose: () => void;
}

const ScheduleManager = ({ onClose }: ScheduleManagerProps) => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'interview',
    scheduled_at: '',
    reminder_minutes: 15,
  });
  useEffect(() => {
    if (user) {
      fetchSchedules();
    }
  }, [user]);

  // Check for upcoming events and notify
  useEffect(() => {
    const checkNotifications = () => {
      const now = new Date();
      schedules.forEach(async (schedule) => {
        if (schedule.notified) return;
        
        const eventTime = new Date(schedule.scheduled_at);
        const minutesUntil = differenceInMinutes(eventTime, now);
        
        if (minutesUntil <= schedule.reminder_minutes && minutesUntil > 0) {
          // Show notification
          toast.info(`Upcoming: ${schedule.title}`, {
            description: `Starting in ${minutesUntil} minute${minutesUntil !== 1 ? 's' : ''}`,
            duration: 10000,
          });
          
          // Also show browser notification if permitted
          if (Notification.permission === 'granted') {
            new Notification(`Upcoming: ${schedule.title}`, {
              body: `Starting in ${minutesUntil} minute${minutesUntil !== 1 ? 's' : ''}`,
              icon: '/favicon.ico',
            });
          }
          
          // Mark as notified
          await supabase
            .from('schedules')
            .update({ notified: true })
            .eq('id', schedule.id);
          
          setSchedules(prev => 
            prev.map(s => s.id === schedule.id ? { ...s, notified: true } : s)
          );
        }
      });
    };

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const interval = setInterval(checkNotifications, 30000); // Check every 30 seconds
    checkNotifications(); // Check immediately

    return () => clearInterval(interval);
  }, [schedules]);

  const fetchSchedules = async () => {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .order('scheduled_at', { ascending: true });

    if (error) {
      console.error('Error fetching schedules:', error);
      return;
    }

    setSchedules(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to manage schedules');
      return;
    }

    if (!formData.scheduled_at) {
      toast.error('Please select a date and time');
      return;
    }

    setLoading(true);
    
    const localDate = new Date(formData.scheduled_at);
    const isoString = localDate.toISOString();

    if (editingSchedule) {
      // Update existing schedule
      const { error } = await supabase
        .from('schedules')
        .update({
          title: formData.title,
          description: formData.description || null,
          event_type: formData.event_type,
          scheduled_at: isoString,
          reminder_minutes: formData.reminder_minutes,
          notified: false, // Reset notification status when schedule is updated
        })
        .eq('id', editingSchedule.id);

      if (error) {
        console.error('Error updating schedule:', error);
        toast.error('Failed to update schedule');
      } else {
        toast.success('Schedule updated!');
        resetForm();
        fetchSchedules();
      }
    } else {
      // Create new schedule
      const { error } = await supabase.from('schedules').insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description || null,
        event_type: formData.event_type,
        scheduled_at: isoString,
        reminder_minutes: formData.reminder_minutes,
      });

      if (error) {
        console.error('Error creating schedule:', error);
        toast.error('Failed to create schedule');
      } else {
        toast.success('Schedule created!');
        resetForm();
        fetchSchedules();
      }
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_type: 'interview',
      scheduled_at: '',
      reminder_minutes: 15,
    });
    setShowForm(false);
    setEditingSchedule(null);
  };

  const handleEdit = (schedule: Schedule) => {
    // Convert ISO string to datetime-local format
    const date = new Date(schedule.scheduled_at);
    const localDatetime = date.toISOString().slice(0, 16);
    
    setFormData({
      title: schedule.title,
      description: schedule.description || '',
      event_type: schedule.event_type,
      scheduled_at: localDatetime,
      reminder_minutes: schedule.reminder_minutes,
    });
    setEditingSchedule(schedule);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('schedules').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete schedule');
    } else {
      toast.success('Schedule deleted');
      setSchedules(prev => prev.filter(s => s.id !== id));
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'interview': return 'bg-blue-500';
      case 'meeting': return 'bg-green-500';
      case 'important_day': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-primary/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Schedule Manager</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4">
        {!user ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            Please sign in to manage your schedules
          </p>
        ) : showForm ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Interview at Google"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Technical round with team lead"
              />
            </div>
            <div>
              <Label htmlFor="event_type">Event Type</Label>
              <Select
                value={formData.event_type}
                onValueChange={(value) => setFormData({ ...formData, event_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="important_day">Important Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="scheduled_at">Date & Time</Label>
              <Input
                id="scheduled_at"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="reminder">Remind me before</Label>
              <Select
                value={formData.reminder_minutes.toString()}
                onValueChange={(value) => setFormData({ ...formData, reminder_minutes: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="1440">1 day</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (editingSchedule ? 'Updating...' : 'Creating...') : (editingSchedule ? 'Update' : 'Create')}
              </Button>
            </div>
          </form>
        ) : (
          <>
            <Button onClick={() => setShowForm(true)} className="w-full mb-3" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Schedule
            </Button>
            <ScrollArea className="h-64">
              {schedules.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  No schedules yet. Add your first event!
                </p>
              ) : (
                <div className="space-y-2">
                  {schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="p-3 bg-muted/50 rounded-lg border border-border/50 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getEventTypeColor(schedule.event_type)}`} />
                            <span className="font-medium text-sm">{schedule.title}</span>
                          </div>
                          {schedule.description && (
                            <p className="text-xs text-muted-foreground mt-1 ml-4">
                              {schedule.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 ml-4">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(schedule.scheduled_at), 'MMM d, yyyy h:mm a')}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Bell className="w-3 h-3" />
                              {schedule.reminder_minutes}m before
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                            onClick={() => handleEdit(schedule)}
                          >
                            <Pencil className="w-4 h-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                            onClick={() => handleDelete(schedule.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  );
};

export default ScheduleManager;
