import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Sparkles } from 'lucide-react';
import { useAiAgent, AI_MODELS, CustomerType } from '../hooks/useAiAgent';
import ChatMessages from './ai/ChatMessages';
import ChatInput from './ai/ChatInput';

export default function AiPriceAgent() {
  const [open, setOpen] = useState(false);
  const agent = useAiAgent();

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        data-testid="ai-agent-toggle"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="fixed bottom-5 right-5 z-[60] inline-flex items-center gap-2 rounded-full bg-ink px-5 py-4 text-sm font-semibold text-white shadow-lift transition-colors duration-200 hover:bg-sky-deep"
      >
        {open ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        <span className="hidden sm:inline">{open ? 'Stäng' : 'AI-prisagent'}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            data-testid="ai-agent-panel"
            className="fixed bottom-24 right-3 z-[60] flex max-h-[76vh] w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-4xl border border-line bg-white shadow-lift sm:right-5 sm:w-[26rem]"
          >
            <div className="border-b border-line bg-sky-soft px-5 py-4">
              <p className="flex items-center gap-2 font-display text-base font-extrabold text-ink">
                <Sparkles className="h-4 w-4 text-sky" /> Stella – prisagent
              </p>
              <p className="mt-0.5 text-xs text-muted">
                Fastpris på kvm & rum, förhandla upp till 10 % rabatt.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <select
                  value={agent.customerType}
                  onChange={(e) => agent.setCustomerType(e.target.value as CustomerType)}
                  data-testid="ai-customer-type"
                  className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink"
                >
                  <option value="privat">Privat</option>
                  <option value="foretag">Företag</option>
                </select>
                <select
                  value={agent.model}
                  onChange={(e) => agent.setModel(e.target.value)}
                  data-testid="ai-model-select"
                  className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink"
                >
                  {AI_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <ChatMessages
              messages={agent.messages}
              price={agent.price}
              booking={agent.booking}
              ready={agent.ready}
              loading={agent.loading}
              onConfirm={agent.confirm}
            />
            <ChatInput loading={agent.loading} onSend={agent.send} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
