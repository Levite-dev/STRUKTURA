import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { BackendRole } from '@/lib/auth-context';
import { ActionGateDialog } from './action-gate-dialog';

export type GateOptions = {
  role: BackendRole;
  phase: number;
  addRoleIfMissing?: boolean;
  reason?: string;
};
export type GateResult = 'completed' | 'cancelled';

type ActionGateContextValue = {
  require: (opts: GateOptions) => Promise<GateResult>;
};

const ActionGateContext = createContext<ActionGateContextValue | null>(null);

export function ActionGateProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<GateOptions | null>(null);
  const resolveRef = useRef<((r: GateResult) => void) | null>(null);

  const require = useCallback(
    (options: GateOptions): Promise<GateResult> =>
      new Promise((resolve) => {
        setOpts(options);
        setOpen(true);
        resolveRef.current = resolve;
      }),
    [],
  );

  const onComplete = useCallback(() => {
    setOpen(false);
    resolveRef.current?.('completed');
  }, []);

  const onCancel = useCallback(() => {
    setOpen(false);
    resolveRef.current?.('cancelled');
  }, []);

  return (
    <ActionGateContext.Provider value={{ require }}>
      {children}
      {open && opts && (
        <ActionGateDialog opts={opts} onComplete={onComplete} onCancel={onCancel} />
      )}
    </ActionGateContext.Provider>
  );
}

export function useActionGate() {
  const ctx = useContext(ActionGateContext);
  if (!ctx) throw new Error('useActionGate must be inside ActionGateProvider');
  return ctx;
}
