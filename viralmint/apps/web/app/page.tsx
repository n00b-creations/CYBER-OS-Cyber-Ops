const narratives = [
  ["Emerging narrative A", "+420%", 94],
  ["Emerging narrative B", "+210%", 88],
  ["Emerging narrative C", "+87%", 79]
];

export default function Home() {
  return (
    <main className="grid">
      <header>
        <div className="label">Autonomous cultural intelligence</div>
        <h1>ViralMint</h1>
        <p>Real-time narrative discovery, market validation and opportunity scoring.</p>
      </header>

      <section className="grid metrics">
        <Metric label="Virality" value="87" />
        <Metric label="Opportunities" value="14" />
        <Metric label="Market signals" value="231" />
        <Metric label="System" value="LIVE" />
      </section>

      <section className="grid main">
        <div className="panel">
          <div className="label">Live narratives</div>
          {narratives.map(([name, velocity, score]) => (
            <div className="row" key={name as string}>
              <span>{name}</span><span>{velocity}</span><span className="score">{score}</span>
            </div>
          ))}
        </div>
        <div className="panel">
          <div className="label">Top opportunity</div>
          <h2>Emerging Narrative A</h2>
          <div className="row"><span>Virality</span><span className="score">94</span></div>
          <div className="row"><span>Market</span><span className="score">84</span></div>
          <div className="row"><span>Confidence</span><span className="score">82</span></div>
          <div className="row"><span>Approval</span><span className="score">REQUIRED</span></div>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="panel"><div className="label">{label}</div><div className="value">{value}</div></div>;
}
