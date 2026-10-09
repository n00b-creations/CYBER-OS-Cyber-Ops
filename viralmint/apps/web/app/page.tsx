"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

type MarketPair = {
  chainId: string;
  dexId: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { address: string; name: string; symbol: string };
  priceUsd?: string | null;
  liquidity?: { usd?: number | null } | null;
  volume?: Record<string, number>;
  txns?: Record<string, { buys: number; sells: number }>;
  priceChange?: Record<string, number> | null;
};

type SearchStatus = "loading" | "connected" | "error";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

function usd(value?: number | string | null): string {
  if (value === undefined || value === null || value === "") return "—";
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: number < 1 ? 8 : 2
  }).format(number);
}

function compact(value?: number): string {
  if (value === undefined || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2
  }).format(value);
}

function percentage(value?: number): string {
  if (value === undefined || !Number.isFinite(value)) return "—";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export default function Home() {
  const [query, setQuery] = useState("PEPE");
  const [pairs, setPairs] = useState<MarketPair[]>([]);
  const [status, setStatus] = useState<SearchStatus>("loading");
  const [error, setError] = useState("");

  const search = useCallback(async (term: string) => {
    const normalized = term.trim();
    if (!normalized) {
      setError("Enter a token name, symbol, or pair search term.");
      return;
    }

    setStatus("loading");
    setError("");
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/markets/search?q=${encodeURIComponent(normalized)}`,
        { cache: "no-store" }
      );
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? `Market search failed (${response.status})`);
      }
      setPairs(Array.isArray(payload.pairs) ? payload.pairs : []);
      setStatus("connected");
    } catch (cause) {
      setStatus("error");
      setError(cause instanceof Error ? cause.message : "Could not connect to the ViralMint API.");
    }
  }, []);

  useEffect(() => {
    void search("PEPE");
  }, [search]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void search(query);
  }

  return (
    <main className="grid">
      <header>
        <div className="label">Market intelligence · DEX Screener</div>
        <h1>ViralMint</h1>
        <p>Explore live market pairs now. Narrative signals, risk scoring, and simulations are separate roadmap items.</p>
      </header>

      <section className="grid metrics">
        <Metric label="Market pairs" value={String(pairs.length)} />
        <Metric label="Market API" value={status === "connected" ? "CONNECTED" : status === "loading" ? "LOADING" : "OFFLINE"} />
        <Metric label="Narrative score" value="NOT CONNECTED" />
        <Metric label="Execution" value="DISABLED" />
      </section>

      <section className="panel">
        <div className="label">Market pair search</div>
        <form className="search-form" onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="market-query">Search token or pair</label>
          <input
            id="market-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            maxLength={100}
            placeholder="Search token, symbol, or pair"
          />
          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Searching…" : "Search markets"}
          </button>
        </form>
        <p className="status-line" aria-live="polite">
          {status === "connected" ? `Showing ${pairs.length} market pairs for “${query.trim()}”.` :
            status === "loading" ? "Connecting to the market-data API…" : "Market-data API unavailable."}
        </p>
        {error && <p className="error" role="alert">{error}. Confirm the API is running and NEXT_PUBLIC_API_BASE_URL is correct.</p>}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Token / Pair</th>
                <th>Chain / DEX</th>
                <th>Price USD</th>
                <th>Liquidity</th>
                <th>Volume 24h</th>
                <th>Txns 24h</th>
                <th>Change 24h</th>
              </tr>
            </thead>
            <tbody>
              {pairs.map((pair) => {
                const tx = pair.txns?.h24;
                const pairUrl = `https://dexscreener.com/${encodeURIComponent(pair.chainId)}/${encodeURIComponent(pair.pairAddress)}`;
                return (
                  <tr key={`${pair.chainId}:${pair.pairAddress}`}>
                    <td>
                      <a href={pairUrl} target="_blank" rel="noreferrer">
                        <strong>{pair.baseToken.symbol}</strong>
                      </a>
                      <div className="muted">{pair.baseToken.name} / {pair.quoteToken.symbol}</div>
                    </td>
                    <td>{pair.chainId}<div className="muted">{pair.dexId}</div></td>
                    <td>{usd(pair.priceUsd)}</td>
                    <td>{usd(pair.liquidity?.usd)}</td>
                    <td>{usd(pair.volume?.h24)}</td>
                    <td>{compact((tx?.buys ?? 0) + (tx?.sells ?? 0))}</td>
                    <td className={((pair.priceChange?.h24 ?? 0) >= 0) ? "positive" : "negative"}>
                      {percentage(pair.priceChange?.h24)}
                    </td>
                  </tr>
                );
              })}
              {status === "connected" && pairs.length === 0 && (
                <tr><td colSpan={7}>No market pairs were returned for this search.</td></tr>
              )}
              {status === "loading" && pairs.length === 0 && (
                <tr><td colSpan={7}>Loading market data…</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="footnote">Market data can be delayed or incomplete. These metrics are descriptive only and are not investment advice or a buy signal.</p>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="panel"><div className="label">{label}</div><div className="value">{value}</div></div>;
}
