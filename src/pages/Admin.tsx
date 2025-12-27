import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, UserPlus, Trash2, Crown, Users, ArrowLeft } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
  created_at: string;
  email?: string;
}

interface Profile {
  user_id: string;
  email: string | null;
  display_name: string | null;
}

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'moderator'>('admin');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    // Wait for both auth and subscription to finish loading
    if (authLoading || subLoading) return;
    
    if (!user) {
      navigate('/signin');
      return;
    }
    if (!isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/dashboard');
    }
  }, [isAdmin, subLoading, authLoading, user, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (rolesError) throw rolesError;

      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, display_name');

      if (profilesError) throw profilesError;

      setProfiles(profilesData || []);
      
      // Merge roles with email from profiles
      const rolesWithEmail = (rolesData || []).map(role => {
        const profile = profilesData?.find(p => p.user_id === role.user_id);
        return {
          ...role,
          email: profile?.email || 'Unknown'
        };
      });
      
      setRoles(rolesWithEmail);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async () => {
    if (!newEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setAdding(true);
    try {
      // Find user by email in profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', newEmail.trim().toLowerCase())
        .single();

      if (profileError || !profile) {
        toast.error('User not found. They must sign up first.');
        return;
      }

      // Check if role already exists
      const existingRole = roles.find(r => r.user_id === profile.user_id && r.role === newRole);
      if (existingRole) {
        toast.error('User already has this role');
        return;
      }

      // Add the role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: profile.user_id, role: newRole });

      if (error) throw error;

      toast.success(`${newRole} role granted to ${newEmail}`);
      setNewEmail('');
      fetchData();
    } catch (error) {
      console.error('Error adding role:', error);
      toast.error('Failed to add role');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveRole = async (roleId: string, email: string) => {
    if (!confirm(`Remove role from ${email}?`)) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast.success('Role removed');
      fetchData();
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error('Failed to remove role');
    }
  };

  if (authLoading || subLoading || loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users and access permissions</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{profiles.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" />
                <span className="text-2xl font-bold">{roles.filter(r => r.role === 'admin').length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Moderators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                <span className="text-2xl font-bold">{roles.filter(r => r.role === 'moderator').length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add New Role */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Grant Access
            </CardTitle>
            <CardDescription>
              Add admin or moderator privileges to a user. They must have signed up first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="email"
                placeholder="user@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-1"
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'admin' | 'moderator')}
                className="px-4 py-2 rounded-md border border-input bg-background"
              >
                <option value="admin">Admin (Full Access)</option>
                <option value="moderator">Moderator (Pro Access)</option>
              </select>
              <Button onClick={handleAddRole} disabled={adding}>
                {adding ? 'Adding...' : 'Grant Access'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              <strong>Admin:</strong> Full access + can manage other users. <strong>Moderator:</strong> Pro features only.
            </p>
          </CardContent>
        </Card>

        {/* Roles Table */}
        <Card>
          <CardHeader>
            <CardTitle>User Roles</CardTitle>
            <CardDescription>
              Users with special access privileges
            </CardDescription>
          </CardHeader>
          <CardContent>
            {roles.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No special roles assigned yet. Add your first admin above.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.email}</TableCell>
                      <TableCell>
                        <Badge variant={role.role === 'admin' ? 'destructive' : 'secondary'}>
                          {role.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                          {role.role === 'moderator' && <Crown className="w-3 h-3 mr-1" />}
                          {role.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(role.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {role.user_id !== user?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveRole(role.id, role.email || '')}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Admin;
