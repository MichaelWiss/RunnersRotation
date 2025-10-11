const initiatives = [
  {
    title: 'Closed-loop foam program',
    description:
      'Every worn pair of Velocity shoes returned through our stores is ground into raw pellets and reintroduced into midsoles and track surfaces across partner facilities.',
  },
  {
    title: 'Traceable materials library',
    description:
      'We partner with regenerative farms and bluesign®-approved mills to source natural fibers and recycled synthetics with full visibility across our supply chain.',
  },
  {
    title: 'Living wage manufacturing',
    description:
      'All Tier 1 factories commit to verified living wage standards, regular third-party audits, and worker development programs focused on education and wellness.',
  },
];

const metrics = [
  {label: 'Footwear styles made with recycled content', value: '68%'},
  {label: 'Water reduction across dye houses', value: '42%'},
  {label: 'Factory partners on renewable energy', value: '9 / 11'},
  {label: 'Packaging free from single-use plastic', value: '100%'},
];

const commitments = [
  'Launch a carbon-neutral racing shoe franchise by 2026 through offset-free reductions.',
  'Transition our entire apparel line to recycled or organic fibers within the next three seasons.',
  'Publish bi-annual impact reports with third-party verification and community feedback sessions.',
];

export default function Sustainability() {
  return (
    <section className="static-page">
      <div className="static-page__container">
        <header className="static-page__header">
          <span className="static-page__eyebrow">Impact</span>
          <h1 className="static-page__title">Sustainability at Velocity</h1>
          <p className="static-page__intro">
            Building world-class running gear should never cost the planet its stride. Our sustainability work folds into
            every decision—from materials to manufacturing partners to what happens when your shoes retire.
          </p>
        </header>

        <div className="static-page__content">
          <section className="static-section">
            <h2 className="static-section__title">Where we are focused right now</h2>
            <ul className="static-card-grid">
              {initiatives.map((initiative) => (
                <li key={initiative.title} className="static-card">
                  <h3 className="static-card__title">{initiative.title}</h3>
                  <p className="static-card__description">{initiative.description}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="static-section">
            <h2 className="static-section__title">Impact metrics</h2>
            <ul className="static-metric-grid">
              {metrics.map((metric) => (
                <li key={metric.label} className="static-metric">
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </li>
              ))}
            </ul>
          </section>

          <section className="static-section">
            <h2 className="static-section__title">What comes next</h2>
            <ul className="static-list">
              {commitments.map((commitment) => (
                <li key={commitment}>{commitment}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </section>
  );
}
