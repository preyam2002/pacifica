ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Profiles viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Markets
CREATE POLICY "Markets viewable by everyone" ON markets FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create markets" ON markets FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Creator can update market" ON markets FOR UPDATE USING (auth.uid() = creator_id);

-- Trades
CREATE POLICY "Trades viewable by everyone" ON trades FOR SELECT USING (true);
CREATE POLICY "Authenticated users can trade" ON trades FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Positions
CREATE POLICY "Positions viewable by everyone" ON positions FOR SELECT USING (true);

-- Market history
CREATE POLICY "History viewable by everyone" ON market_history FOR SELECT USING (true);

-- Comments
CREATE POLICY "Comments viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Likes
CREATE POLICY "Likes viewable by everyone" ON likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON likes FOR DELETE USING (auth.uid() = user_id);
