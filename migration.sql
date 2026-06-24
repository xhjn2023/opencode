-- notes.html 增强功能所需的新字段
-- 在 Supabase SQL Editor 中执行

ALTER TABLE daily_notes
  ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS favorite BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS notebook TEXT;

-- 为置顶排序创建索引（可选，提升查询性能）
CREATE INDEX IF NOT EXISTS idx_daily_notes_pinned ON daily_notes (pinned DESC);
CREATE INDEX IF NOT EXISTS idx_daily_notes_archived ON daily_notes (archived);
