import { useEffect, useMemo, useState } from 'react';
import { ApiClient } from './api';
import { createOidcClient, type OidcClient } from './auth';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const oidc = useMemo(() => createOidcClient(), []);
  const [client, setClient] = useState<OidcClient | null>(oidc);
  const [loading, setLoading] = useState(Boolean(oidc));
  const [error, setError] = useState('');
  const callback = window.location.pathname === '/auth/callback';

  useEffect(() => {
    if (!oidc) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        await oidc.initialize();
        if (callback) await oidc.handleCallback();
        if (!cancelled) setClient(oidc);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Authentication failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [oidc, callback]);

  if (!oidc) return <>{children}</>;
  if (loading) return <AuthScreen title="AUTHENTICATING" detail="Establishing a secure JARVIS-SEC session…" />;
  if (error) return <AuthScreen title="AUTHENTICATION ERROR" detail={error} action={<button onClick={() => window.location.assign('/')}>RETRY</button>} />;
  if (!client?.token) return <AuthScreen title="JARVIS-SEC" detail="Sign in to access your organization workspace." action={<button className="primary" onClick={() => client.beginLogin()}>SIGN IN WITH SSO</button>} />;

  return <AuthenticatedApp token={client.token}>{children}</AuthenticatedApp>;
}

function AuthenticatedApp({ token, children }: { token: string; children: React.ReactNode }) {
  const api = useMemo(() => new ApiClient(import.meta.env.VITE_API_BASE_URL ?? '', token), [token]);
  void api;
  return <>{children}</>;
}

function AuthScreen({ title, detail, action }: { title: string; detail: string; action?: React.ReactNode }) {
  return <div className="auth-screen"><div className="auth-card"><div className="brand-mark">J</div><div className="eyebrow">JARVIS-SEC / IDENTITY</div><h1>{title}</h1><p>{detail}</p>{action}</div></div>;
}
