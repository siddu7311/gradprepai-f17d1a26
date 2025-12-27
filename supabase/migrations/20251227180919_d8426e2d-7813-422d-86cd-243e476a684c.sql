-- Create table for enterprise access requests
CREATE TABLE public.enterprise_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  organization TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.enterprise_requests ENABLE ROW LEVEL SECURITY;

-- Users can create their own requests
CREATE POLICY "Users can create their own requests" 
ON public.enterprise_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can view their own requests
CREATE POLICY "Users can view their own requests" 
ON public.enterprise_requests 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all requests" 
ON public.enterprise_requests 
FOR SELECT 
USING (public.is_admin(auth.uid()));

-- Admins can update requests
CREATE POLICY "Admins can update requests" 
ON public.enterprise_requests 
FOR UPDATE 
USING (public.is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_enterprise_requests_updated_at
BEFORE UPDATE ON public.enterprise_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();