-- Resolve infinite recursion by simplifying conversation_participants SELECT policy
DROP POLICY IF EXISTS "Enable read access for conversation participants" ON conversation_participants;

CREATE POLICY "Users can view their participant rows"
ON conversation_participants
FOR SELECT
USING (user_id = auth.uid());