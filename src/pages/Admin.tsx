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
import { Shield, UserPlus, Trash2, Crown, Users, ArrowLeft, Building2, Check, X, Clock, Wallet, IndianRupee, TrendingUp } from 'lucide-react';
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

interface EnterpriseRequest {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  organization: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

interface UpiPayment {
  id: string;
  user_id: string;
  email: string | null;
  amount: number;
  plan: string;
  upi_reference: string;
  payer_phone: string | null;
  status: string;
  starts_at: string;
  expires_at: string;
  created_at: string;
}

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [enterpriseRequests, setEnterpriseRequests] = useState<EnterpriseRequest[]>([]);
  const [adminUsers, setAdminUsers] = useState<Array<{ id: string; email: string | null }>>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [payments, setPayments] = useState<UpiPayment[]>([]);
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
      // Load the complete admin snapshot through the protected backend boundary.
      const { data: usersPayload, error: usersError } = await supabase.functions.invoke('admin-users');
      if (usersError) throw usersError;
      if (usersPayload?.error) throw new Error(String(usersPayload.error));

      const users = (usersPayload?.users || []) as Array<{ id: string; email: string | null }>;
      const total = typeof usersPayload?.total === 'number' ? usersPayload.total : users.length;
      const rolesData = (usersPayload?.roles || []) as UserRole[];
      const requestsData = (usersPayload?.enterpriseRequests || []) as EnterpriseRequest[];
      const paymentsData = (usersPayload?.payments || []) as UpiPayment[];

      setAdminUsers(users);
      setTotalUsers(total);
      setProfiles(users.map((u) => ({ user_id: u.id, email: u.email, display_name: null })));

      setEnterpriseRequests(requestsData);
      setPayments(paymentsData);

      // Merge roles with email from users list
      const rolesWithEmail = rolesData.map((role) => {
        const u = users.find((x) => x.id === role.user_id);
        return {
          ...role,
          email: u?.email || 'Unknown',
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

  const handleApproveRequest = async (request: EnterpriseRequest) => {
    try {
      // Add moderator role to user for Pro access
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: request.user_id, role: 'moderator' });

      if (roleError && !roleError.message.includes('duplicate')) throw roleError;

      // Update request status
      const { error: updateError } = await supabase
        .from('enterprise_requests')
        .update({ 
          status: 'approved', 
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      toast.success(`Approved! ${request.user_email} now has Pro access.`);
      fetchData();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  };

  const handleRejectRequest = async (request: EnterpriseRequest) => {
    if (!confirm(`Reject request from ${request.user_email}?`)) return;

    try {
      const { error } = await supabase
        .from('enterprise_requests')
        .update({ 
          status: 'rejected',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (error) throw error;

      toast.success('Request rejected');
      fetchData();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  const handleAddRole = async () => {
    if (!newEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setAdding(true);
    try {
      const email = newEmail.trim().toLowerCase();
      const foundUser = adminUsers.find((u) => (u.email || '').toLowerCase() === email);

      if (!foundUser) {
        toast.error('User not found. They must sign up first.');
        return;
      }

      // Check if role already exists
      const existingRole = roles.find((r) => r.user_id === foundUser.id && r.role === newRole);
      if (existingRole) {
        toast.error('User already has this role');
        return;
      }

      // Add the role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: foundUser.id, role: newRole });

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

  const now = Date.now();
  const activePayments = payments.filter(
    (p) => p.status === 'approved' && new Date(p.expires_at).getTime() > now
  );
  const totalRevenue = payments
    .filter((p) => p.status === 'approved')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthRevenue = payments
    .filter((p) => p.status === 'approved' && new Date(p.created_at) >= monthStart)
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const emailFor = (userId: string, fallback: string | null) =>
    adminUsers.find((u) => u.id === userId)?.email || fallback || 'Unknown';

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
                <span className="text-2xl font-bold">{totalUsers}</span>
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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-500" />
                <span className="text-2xl font-bold">
                  {enterpriseRequests.filter(r => r.status === 'pending').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wallet */}
        <Card className="mb-8 border-primary/30 animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Wallet & Subscriptions
            </CardTitle>
            <CardDescription>Revenue collected from Pro subscriptions (UPI / PhonePe)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 transition-transform hover:-translate-y-1">
                <p className="text-xs text-muted-foreground mb-1">Total earnings</p>
                <p className="text-2xl font-bold flex items-center">
                  <IndianRupee className="w-5 h-5" />{totalRevenue.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="rounded-xl border border-glass-border/30 p-4 transition-transform hover:-translate-y-1">
                <p className="text-xs text-muted-foreground mb-1">This month</p>
                <p className="text-2xl font-bold flex items-center">
                  <IndianRupee className="w-5 h-5" />{monthRevenue.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="rounded-xl border border-glass-border/30 p-4 transition-transform hover:-translate-y-1">
                <p className="text-xs text-muted-foreground mb-1">Active Pro subscribers</p>
                <p className="text-2xl font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />{activePayments.length}
                </p>
              </div>
              <div className="rounded-xl border border-glass-border/30 p-4 transition-transform hover:-translate-y-1">
                <p className="text-xs text-muted-foreground mb-1">Total payments</p>
                <p className="text-2xl font-bold">{payments.length}</p>
              </div>
            </div>

            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subscription payments yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Paid on</TableHead>
                      <TableHead>Valid till</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.slice(0, 25).map((p) => {
                      const active = new Date(p.expires_at).getTime() > now && p.status === 'approved';
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{emailFor(p.user_id, p.email)}</TableCell>
                          <TableCell>₹{Number(p.amount).toLocaleString('en-IN')}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{p.upi_reference}</TableCell>
                          <TableCell>{p.payer_phone ? `+91 ${p.payer_phone}` : '—'}</TableCell>
                          <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(p.expires_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={active ? 'default' : 'secondary'}>
                              {active ? 'Active' : 'Expired'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enterprise Requests */}
        {enterpriseRequests.filter(r => r.status === 'pending').length > 0 && (
          <Card className="mb-8 border-orange-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-500" />
                Enterprise Access Requests
              </CardTitle>
              <CardDescription>
                Users requesting Pro access for their organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enterpriseRequests.filter(r => r.status === 'pending').map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.user_name}</div>
                          <div className="text-sm text-muted-foreground">{request.user_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{request.organization}</TableCell>
                      <TableCell className="max-w-xs truncate">{request.message || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApproveRequest(request)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectRequest(request)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

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
