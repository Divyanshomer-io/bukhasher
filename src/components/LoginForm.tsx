import { useState } from 'react';
import { motion } from 'framer-motion';
import { EMOJI_AVATARS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface LoginFormProps {
  onLogin: (name: string, avatar: string) => Promise<any>;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🐯');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name is required!'); return; }
    setLoading(true);
    try {
      await onLogin(name, avatar);
      toast.success('Welcome to BukhaSher! 🐯');
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full max-w-md mx-auto space-y-6"
    >
      <div className="glass rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-display font-semibold mb-2 text-foreground">
            Your Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name..."
            className="rounded-xl text-base h-12 bg-card border-border"
          />
        </div>

        <div>
          <label className="block text-sm font-display font-semibold mb-3 text-foreground">
            Pick Your Avatar
          </label>
          <div className="grid grid-cols-8 gap-2">
            {EMOJI_AVATARS.map((emoji) => (
              <motion.button
                key={emoji}
                type="button"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setAvatar(emoji)}
                className={`text-2xl p-2 rounded-xl transition-all ${
                  avatar === emoji
                    ? 'gradient-primary ring-2 ring-primary shadow-lg'
                    : 'bg-muted hover:bg-accent/20'
                }`}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl text-base font-display font-semibold gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          {loading ? '...' : `Save Profile ${avatar}`}
        </Button>
      </div>
    </motion.form>
  );
}
