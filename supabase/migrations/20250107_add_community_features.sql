-- Add community sharing features to learning_paths
ALTER TABLE public.learning_paths
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS published_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS fork_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS forked_from_id uuid REFERENCES public.learning_paths(id),
ADD COLUMN IF NOT EXISTS tags text[];

-- Create index for public paths queries
CREATE INDEX IF NOT EXISTS idx_learning_paths_public ON public.learning_paths(is_public, published_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_learning_paths_user_public ON public.learning_paths(user_id, is_public);

-- Create path_interactions table for tracking user interactions
CREATE TABLE IF NOT EXISTS public.path_interactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    path_id uuid NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    interaction_type text NOT NULL CHECK (interaction_type IN ('view', 'like', 'fork')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(path_id, user_id, interaction_type)
);

-- Create indexes for interaction queries
CREATE INDEX IF NOT EXISTS idx_path_interactions_path ON public.path_interactions(path_id);
CREATE INDEX IF NOT EXISTS idx_path_interactions_user ON public.path_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_path_interactions_type ON public.path_interactions(interaction_type);

-- Enable Row Level Security
ALTER TABLE public.path_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning_paths
DROP POLICY IF EXISTS "Public paths are viewable by everyone" ON public.learning_paths;
CREATE POLICY "Public paths are viewable by everyone" ON public.learning_paths
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own paths" ON public.learning_paths;
CREATE POLICY "Users can update their own paths" ON public.learning_paths
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own paths" ON public.learning_paths;
CREATE POLICY "Users can delete their own paths" ON public.learning_paths
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for path_interactions
DROP POLICY IF EXISTS "Users can view all interactions" ON public.path_interactions;
CREATE POLICY "Users can view all interactions" ON public.path_interactions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own interactions" ON public.path_interactions;
CREATE POLICY "Users can create their own interactions" ON public.path_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own interactions" ON public.path_interactions;
CREATE POLICY "Users can delete their own interactions" ON public.path_interactions
    FOR DELETE USING (auth.uid() = user_id);

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_view_count(path_id_param uuid, viewer_id uuid)
RETURNS void AS $$
BEGIN
    -- Insert or ignore if already viewed
    INSERT INTO public.path_interactions (path_id, user_id, interaction_type)
    VALUES (path_id_param, viewer_id, 'view')
    ON CONFLICT (path_id, user_id, interaction_type) DO NOTHING;

    -- Update view count
    UPDATE public.learning_paths
    SET view_count = view_count + 1
    WHERE id = path_id_param AND is_public = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to fork a learning path (clone path and its steps)
CREATE OR REPLACE FUNCTION public.fork_learning_path(
    source_path_id uuid,
    new_owner_id uuid
)
RETURNS uuid AS $$
DECLARE
    new_path_id uuid;
BEGIN
    -- Create new learning path cloned from source, owned by new user, set private by default
    INSERT INTO public.learning_paths (
        topic, title, user_id, is_approved, is_completed,
        audio_script, audio_url, podcast_script,
        forked_from_id, is_public, published_at,
        view_count, like_count, fork_count, tags
    )
    SELECT
        topic,
        COALESCE(title, topic) || ' (Fork)',
        new_owner_id,
        false,
        false,
        audio_script,
        audio_url,
        podcast_script,
        id,
        false,
        NULL,
        0,
        0,
        0,
        tags
    FROM public.learning_paths
    WHERE id = source_path_id
    RETURNING id INTO new_path_id;

    -- Copy steps
    INSERT INTO public.learning_steps (
        path_id, title, content, detailed_content, order_index, completed
    )
    SELECT
        new_path_id,
        title,
        content,
        detailed_content,
        order_index,
        false
    FROM public.learning_steps
    WHERE path_id = source_path_id
    ORDER BY order_index;

    -- Increment fork count on source
    UPDATE public.learning_paths
    SET fork_count = fork_count + 1
    WHERE id = source_path_id;

    -- Record interaction
    INSERT INTO public.path_interactions (path_id, user_id, interaction_type)
    VALUES (source_path_id, new_owner_id, 'fork')
    ON CONFLICT (path_id, user_id, interaction_type) DO NOTHING;

    RETURN new_path_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to toggle like
CREATE OR REPLACE FUNCTION public.toggle_like(path_id_param uuid, user_id_param uuid)
RETURNS boolean AS $$
DECLARE
    is_liked boolean;
BEGIN
    -- Check if already liked
    SELECT EXISTS (
        SELECT 1 FROM public.path_interactions
        WHERE path_id = path_id_param
        AND user_id = user_id_param
        AND interaction_type = 'like'
    ) INTO is_liked;

    IF is_liked THEN
        -- Unlike
        DELETE FROM public.path_interactions
        WHERE path_id = path_id_param
        AND user_id = user_id_param
        AND interaction_type = 'like';

        UPDATE public.learning_paths
        SET like_count = GREATEST(0, like_count - 1)
        WHERE id = path_id_param;

        RETURN false;
    ELSE
        -- Like
        INSERT INTO public.path_interactions (path_id, user_id, interaction_type)
        VALUES (path_id_param, user_id_param, 'like');

        UPDATE public.learning_paths
        SET like_count = like_count + 1
        WHERE id = path_id_param;

        RETURN true;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;