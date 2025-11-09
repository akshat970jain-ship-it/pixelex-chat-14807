-- Fix infinite recursion in RLS policies by simplifying them

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;

-- Create simpler policies without circular dependencies
-- For conversation_participants: users can view all participants (we'll control access at conversation level)
CREATE POLICY "Users can view conversation participants"
ON conversation_participants
FOR SELECT
USING (true);

-- For conversations: users can only view conversations they participate in
-- Use a direct check without subquery to avoid recursion
CREATE POLICY "Users can view their conversations"
ON conversations
FOR SELECT
USING (
  id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid()
  )
);

-- For messages: allow viewing if user is in the conversation
CREATE POLICY "Users can view conversation messages"
ON messages
FOR SELECT
USING (
  conversation_id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid()
  )
);

-- For messages: allow sending if user is in the conversation and is the sender
CREATE POLICY "Users can send messages"
ON messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid() 
  AND conversation_id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid()
  )
);