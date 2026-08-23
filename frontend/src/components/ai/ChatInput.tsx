import { useState } from 'react';
import { Send } from 'lucide-react';

export default function ChatInput({
  loading,
  onSend,
}: {
  loading: boolean;
  onSend: (text: string) => void;
}) {
  const [value, setValue] = useState('');

  const submit = () => {
    const text = value.trim();
    if (!text || loading) return;
    setValue('');
    onSend(text);
  };

  return (
    <div className="flex items-center gap-2 border-t border-line px-4 py-3">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="T.ex. 3 rum, 72 m² i Malmö"
        data-testid="ai-input"
        className="field !py-2.5"
      />
      <button
        type="button"
        onClick={submit}
        disabled={loading}
        data-testid="ai-send-btn"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky text-white transition-colors duration-200 hover:bg-sky-deep disabled:opacity-60"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  );
}
