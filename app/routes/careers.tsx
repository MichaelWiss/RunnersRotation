const roles = [
  {
    team: 'Retail Experience',
    title: 'Store Lead, Denver Flagship',
    location: 'Denver, CO',
    type: 'Full-time',
    description:
      'Guide runners through gait analyses, product fittings, and community programming while leading a team of six gear specialists.',
  },
  {
    team: 'Product Creation',
    title: 'Senior Footwear Developer',
    location: 'Portland, OR',
    type: 'Hybrid',
    description:
      'Own the design-to-sample process for our speed franchise, partnering with biomechanics, materials, and athlete testing squads.',
  },
  {
    team: 'Marketing',
    title: 'Community Partnerships Manager',
    location: 'Austin, TX',
    type: 'Full-time',
    description:
      'Scale the Run Club playbook to new cities, manage local partners, and deliver premium experiences for athletes at every pace.',
  },
  {
    team: 'Digital Product',
    title: 'Product Designer, Velocity App',
    location: 'Remote (U.S.)',
    type: 'Remote',
    description:
      'Design a cohesive mobile experience for training plans, gear drops, and community check-ins with a focus on accessibility.',
  },
];

const benefits = [
  'Comprehensive health, vision, and dental coverage for you and your family.',
  'Four weeks paid vacation plus recharge weeks after major product launches.',
  'Gear stipend every season and first access to prototype footwear.',
  '401(k) with dollar-for-dollar match up to 5% of your salary.',
];

export default function Careers() {
  return (
    <section className="static-page">
      <div className="static-page__container">
        <header className="static-page__header">
          <span className="static-page__eyebrow">Team Velocity</span>
          <h1 className="static-page__title">Careers at Velocity Running</h1>
          <p className="static-page__intro">
            We are building a faster future for runners everywhere. If you thrive in energized environments, believe in
            athlete-centered design, and love celebrating community wins, we would love to meet you.
          </p>
        </header>

        <div className="static-page__content">
          <section className="static-section">
            <h2 className="static-section__title">Open roles</h2>
            <ul className="static-card-grid">
              {roles.map((role) => (
                <li key={role.title} className="static-card">
                  <span className="static-card__meta">{role.team}</span>
                  <h3 className="static-card__title">{role.title}</h3>
                  <p className="static-card__description">{role.description}</p>
                  <div className="static-card__footer">
                    <span>{role.location}</span>
                    <span>{role.type}</span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="static-section__lead">
              Ready to apply? Email your resume and a short note on why you want to run with us to{' '}
              <a href="mailto:careers@velocity.run">careers@velocity.run</a>.
            </p>
          </section>

          <section className="static-section">
            <h2 className="static-section__title">Why runners love working here</h2>
            <ul className="static-list">
              {benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </section>
  );
}
