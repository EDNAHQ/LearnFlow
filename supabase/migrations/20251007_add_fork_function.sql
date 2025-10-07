-- Add or replace the function to fork a learning path and copy its steps
-- This migration is safe to run even if prior community changes were applied manually.

CREATE OR REPLACE FUNCTION public.fork_learning_path(
    source_path_id uuid,
    new_owner_id uuid
)
RETURNS uuid AS $$
DECLARE
    new_path_id uuid;
BEGIN
    -- Clone the source path to the new owner. New copy is private by default.
    INSERT INTO public.learning_paths (
        topic, title, user_id, is_approved, is_completed,
        audio_script, audio_url, podcast_script,
        forked_from_id, is_public, published_at,
        view_count, like_count, fork_count, tags
    )
    SELECT
        topic,
        CASE WHEN title IS NULL THEN topic || ' (Fork)' ELSE title || ' (Fork)' END,
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

    -- Copy all steps in order
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

    -- Increment fork count on the source path
    UPDATE public.learning_paths
    SET fork_count = fork_count + 1
    WHERE id = source_path_id;

    -- Record fork interaction (idempotent per (path_id, user_id, type))
    INSERT INTO public.path_interactions (path_id, user_id, interaction_type)
    VALUES (source_path_id, new_owner_id, 'fork')
    ON CONFLICT (path_id, user_id, interaction_type) DO NOTHING;

    RETURN new_path_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


