
-- Bids table for rider bidding system
CREATE TABLE public.bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  rider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(order_id, rider_id)
);

-- Messages table for in-app chat
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Bids policies
CREATE POLICY "Riders can create bids" ON public.bids
  FOR INSERT TO authenticated
  WITH CHECK (rider_id = get_profile_id(auth.uid()));

CREATE POLICY "Users can view relevant bids" ON public.bids
  FOR SELECT TO authenticated
  USING (
    rider_id = get_profile_id(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = bids.order_id 
      AND orders.customer_id = get_profile_id(auth.uid())
    ) OR
    is_admin(auth.uid())
  );

CREATE POLICY "Riders can update own bids" ON public.bids
  FOR UPDATE TO authenticated
  USING (rider_id = get_profile_id(auth.uid()));

CREATE POLICY "Customers can update bids on their orders" ON public.bids
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = bids.order_id 
      AND orders.customer_id = get_profile_id(auth.uid())
    )
  );

-- Messages policies
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = get_profile_id(auth.uid()));

CREATE POLICY "Users can view their messages" ON public.messages
  FOR SELECT TO authenticated
  USING (
    sender_id = get_profile_id(auth.uid()) OR 
    receiver_id = get_profile_id(auth.uid())
  );

CREATE POLICY "Users can update their received messages" ON public.messages
  FOR UPDATE TO authenticated
  USING (receiver_id = get_profile_id(auth.uid()));

-- Enable realtime for bids and messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Indexes
CREATE INDEX idx_bids_order_id ON public.bids(order_id);
CREATE INDEX idx_bids_rider_id ON public.bids(rider_id);
CREATE INDEX idx_bids_status ON public.bids(status);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX idx_messages_order_id ON public.messages(order_id);
