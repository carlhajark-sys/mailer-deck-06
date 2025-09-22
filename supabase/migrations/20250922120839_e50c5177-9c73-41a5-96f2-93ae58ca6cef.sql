-- Create users table
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create servers table
CREATE TABLE public.servers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  main_ip TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Production', 'Test', 'Down', 'Timed out')),
  assigned_user_id UUID REFERENCES public.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ips table
CREATE TABLE public.ips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT NOT NULL,
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create domains table
CREATE TABLE public.domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('found', 'production')),
  ip_id UUID NOT NULL REFERENCES public.ips(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (make tables public for now since no auth)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (since no auth required)
CREATE POLICY "Allow all operations on users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on servers" ON public.servers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on ips" ON public.ips FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on domains" ON public.domains FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates on servers
CREATE TRIGGER update_servers_updated_at
  BEFORE UPDATE ON public.servers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data
INSERT INTO public.users (id, name) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'John Smith'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Sarah Johnson'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Mike Chen'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Emma Davis'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Alex Rodriguez');

INSERT INTO public.servers (id, name, main_ip, status, assigned_user_id, notes) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'Server-A10', '192.168.1.10', 'Production', '550e8400-e29b-41d4-a716-446655440001', 'Primary production server, handles main traffic'),
  ('650e8400-e29b-41d4-a716-446655440002', 'Server-B15', '192.168.1.15', 'Test', '550e8400-e29b-41d4-a716-446655440002', 'Testing environment for new features'),
  ('650e8400-e29b-41d4-a716-446655440003', 'Server-C20', '192.168.1.20', 'Down', '550e8400-e29b-41d4-a716-446655440003', 'Server down for maintenance'),
  ('650e8400-e29b-41d4-a716-446655440004', 'Server-D25', '192.168.1.25', 'Timed out', '550e8400-e29b-41d4-a716-446655440004', 'Connection timeout issues, investigating'),
  ('650e8400-e29b-41d4-a716-446655440005', 'Server-E30', '192.168.1.30', 'Production', '550e8400-e29b-41d4-a716-446655440005', 'Secondary production server');

INSERT INTO public.ips (address, server_id) VALUES
  ('192.168.1.100', '650e8400-e29b-41d4-a716-446655440001'),
  ('192.168.1.101', '650e8400-e29b-41d4-a716-446655440001'),
  ('192.168.1.102', '650e8400-e29b-41d4-a716-446655440002'),
  ('192.168.1.103', '650e8400-e29b-41d4-a716-446655440003');

INSERT INTO public.domains (domain, type, ip_id) VALUES
  ('example1.com', 'found', (SELECT id FROM public.ips WHERE address = '192.168.1.100' LIMIT 1)),
  ('production1.com', 'production', (SELECT id FROM public.ips WHERE address = '192.168.1.100' LIMIT 1)),
  ('testsite2.org', 'found', (SELECT id FROM public.ips WHERE address = '192.168.1.101' LIMIT 1)),
  ('live-site2.org', 'production', (SELECT id FROM public.ips WHERE address = '192.168.1.101' LIMIT 1));