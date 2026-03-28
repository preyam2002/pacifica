CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE likes (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, market_id)
);

CREATE OR REPLACE FUNCTION update_market_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE markets SET comments_count = comments_count + 1 WHERE id = NEW.market_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE markets SET comments_count = comments_count - 1 WHERE id = OLD.market_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comments_count_trigger
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_market_comments_count();

CREATE OR REPLACE FUNCTION update_market_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE markets SET likes_count = likes_count + 1 WHERE id = NEW.market_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE markets SET likes_count = likes_count - 1 WHERE id = OLD.market_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER likes_count_trigger
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_market_likes_count();
