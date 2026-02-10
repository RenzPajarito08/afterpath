-- Table to store image URLs linked to journeys
CREATE TABLE IF NOT EXISTS public.journey_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journey_id UUID NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_journey_images_journey_id ON public.journey_images(journey_id);

-- Enable Row Level Security
ALTER TABLE public.journey_images ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view images for their own journeys
CREATE POLICY "Users can view their own journey images"
    ON public.journey_images
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.journeys
            WHERE journeys.id = journey_images.journey_id
            AND journeys.user_id = auth.uid()
        )
    );

-- Policy: Users can insert images for their own journeys
CREATE POLICY "Users can insert their own journey images"
    ON public.journey_images
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.journeys
            WHERE journeys.id = journey_images.journey_id
            AND journeys.user_id = auth.uid()
        )
    );
