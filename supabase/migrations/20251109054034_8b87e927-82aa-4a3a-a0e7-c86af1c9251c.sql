-- Fix infinite recursion in RLS policies using security definer functions

-- First, drop all existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add participants to conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view conversation messages" ON messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;

-- Create security definer function to check if user is in conversation
CREATE OR REPLACE FUNCTION public.is_conversation_participant(conversation_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_id = conversation_uuid
      AND user_id = user_uuid
  );
$$;

-- Recreate policies using the security definer function

-- conversation_participants policies
CREATE POLICY "Enable read access for conversation participants"
ON conversation_participants
FOR SELECT
USING (public.is_conversation_participant(conversation_id, auth.uid()));

CREATE POLICY "Enable insert for authenticated users"
ON conversation_participants
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- conversations policies
CREATE POLICY "Enable read for conversation participants"
ON conversations
FOR SELECT
USING (public.is_conversation_participant(id, auth.uid()));

CREATE POLICY "Enable insert for authenticated users"
ON conversations
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- messages policies
CREATE POLICY "Enable read for conversation participants"
ON messages
FOR SELECT
USING (public.is_conversation_participant(conversation_id, auth.uid()));

CREATE POLICY "Enable insert for conversation participants"
ON messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND public.is_conversation_participant(conversation_id, auth.uid())
);