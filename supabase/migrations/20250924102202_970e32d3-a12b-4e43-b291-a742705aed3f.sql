-- Create profiles table for authenticated users
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add user_id to servers table to link servers to authenticated users
ALTER TABLE public.servers ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update RLS policies for servers to be user-specific
DROP POLICY IF EXISTS "Allow all operations on servers" ON public.servers;

CREATE POLICY "Users can view their own servers" 
ON public.servers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own servers" 
ON public.servers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own servers" 
ON public.servers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own servers" 
ON public.servers 
FOR DELETE 
USING (auth.uid() = user_id);

-- Update RLS policies for IPs to be user-specific (through server relationship)
DROP POLICY IF EXISTS "Allow all operations on ips" ON public.ips;

CREATE POLICY "Users can view IPs of their servers" 
ON public.ips 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.servers 
  WHERE servers.id = ips.server_id 
  AND servers.user_id = auth.uid()
));

CREATE POLICY "Users can create IPs for their servers" 
ON public.ips 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.servers 
  WHERE servers.id = ips.server_id 
  AND servers.user_id = auth.uid()
));

CREATE POLICY "Users can update IPs of their servers" 
ON public.ips 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.servers 
  WHERE servers.id = ips.server_id 
  AND servers.user_id = auth.uid()
));

CREATE POLICY "Users can delete IPs of their servers" 
ON public.ips 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.servers 
  WHERE servers.id = ips.server_id 
  AND servers.user_id = auth.uid()
));

-- Update RLS policies for domains to be user-specific (through IP->server relationship)
DROP POLICY IF EXISTS "Allow all operations on domains" ON public.domains;

CREATE POLICY "Users can view domains of their servers" 
ON public.domains 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.ips 
  JOIN public.servers ON servers.id = ips.server_id
  WHERE ips.id = domains.ip_id 
  AND servers.user_id = auth.uid()
));

CREATE POLICY "Users can create domains for their servers" 
ON public.domains 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.ips 
  JOIN public.servers ON servers.id = ips.server_id
  WHERE ips.id = domains.ip_id 
  AND servers.user_id = auth.uid()
));

CREATE POLICY "Users can update domains of their servers" 
ON public.domains 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.ips 
  JOIN public.servers ON servers.id = ips.server_id
  WHERE ips.id = domains.ip_id 
  AND servers.user_id = auth.uid()
));

CREATE POLICY "Users can delete domains of their servers" 
ON public.domains 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.ips 
  JOIN public.servers ON servers.id = ips.server_id
  WHERE ips.id = domains.ip_id 
  AND servers.user_id = auth.uid()
));

-- Update RLS policies for users table to be user-specific
DROP POLICY IF EXISTS "Allow all operations on users" ON public.users;

CREATE POLICY "Users can view users assigned to their servers" 
ON public.users 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.servers 
  WHERE servers.assigned_user_id = users.id 
  AND servers.user_id = auth.uid()
) OR EXISTS (
  SELECT 1 FROM public.servers 
  WHERE servers.user_id = auth.uid()
));

CREATE POLICY "Users can create users for their servers" 
ON public.users 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update users assigned to their servers" 
ON public.users 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.servers 
  WHERE servers.assigned_user_id = users.id 
  AND servers.user_id = auth.uid()
) OR EXISTS (
  SELECT 1 FROM public.servers 
  WHERE servers.user_id = auth.uid()
));

CREATE POLICY "Users can delete users assigned to their servers" 
ON public.users 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.servers 
  WHERE servers.assigned_user_id = users.id 
  AND servers.user_id = auth.uid()
) OR EXISTS (
  SELECT 1 FROM public.servers 
  WHERE servers.user_id = auth.uid()
));

-- Add trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();