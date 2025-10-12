export default function RunClub() {
  const heroImage = {
    src: 'https://plus.unsplash.com/premium_photo-1663134254080-a3e9f79ae748?auto=format&fit=crop&w=1600&q=80',
    alt: 'Group of young athletes cruising through a sunlit park path during a run.',
  };

  const weeklySessions = [
    {
      city: 'Denver Flagship',
      day: 'Tuesdays',
      description:
        'Tempo runs along the Cherry Creek trail with structured warm-ups, drills, and post-run mobility led by our coaching staff.',
      details: ['Meet • Union Station', 'Pace • 7:00–9:30 min/mile'],
      image: {
        src: 'https://images.unsplash.com/photo-1568556989497-cbea3ab63a46?auto=format&fit=crop&w=1200&q=80',
        alt: 'Runner warming up across the Denver greenway at Cherry Creek.',
      },
    },
    {
      city: 'New York City',
      day: 'Thursdays',
      description:
        'Laps through Central Park focused on speed development and hill repeats with staggered groups to accommodate every pace.',
      details: ['Meet • Bethesda Terrace', 'Pace • 6:30–9:00 min/mile'],
      image: {
        src: 'https://plus.unsplash.com/premium_photo-1726481621787-66edd0e52ea0?auto=format&fit=crop&w=1200&q=80',
        alt: 'Runner cruising across the Central Park bridge on a fall morning.',
      },
    },
    {
      city: 'Austin Lab',
      day: 'Saturdays',
      description:
        'Long runs on the Lady Bird Lake loop with soft-surface options, pit stops stocked with Velocity hydration and gels.',
      details: ['Meet • South Congress Pop-up', 'Pace • 7:30–10:00 min/mile'],
      image: {
        src: 'https://plus.unsplash.com/premium_photo-1753737684933-324ca471b06a?auto=format&fit=crop&w=1200&q=80',
        alt: 'Athlete levelling up on the Lady Bird Lake trail at sunset.',
      },
    },
  ];

  const membershipPerks = [
    'Personalized training plans designed by our in-house biomechanics team.',
    'Access to quarterly gear labs to test unreleased Velocity prototypes.',
    'Priority registration for destination races and community travel weekends.',
    'Exclusive 15% member pricing on footwear, apparel, and nutrition.',
  ];

  const upcomingEvents = [
    {
      date: 'APR 20',
      title: 'Spring Speed Clinic',
      description:
        'A half-day workshop with our coaching crew covering race strategy, pacing drills, and recovery protocols ahead of the summer season.',
      location: 'Velocity HQ • Denver',
    },
    {
      date: 'MAY 11',
      title: 'Trail Immersion Camp',
      description:
        'Join us in Boulder for a guided technical trail session, demo ultralight footwear, and fueling seminar tailored to multi-hour efforts.',
      location: 'Chautauqua Park • Boulder',
    },
    {
      date: 'JUN 02',
      title: 'Community Shakeout Run',
      description:
        'Open-to-all fun run the morning before the Mile High Half Marathon with post-run brunch and race kit pickup.',
      location: 'Union Station • Denver',
    },
  ];

  return (
    <section className="static-page">
      <div className="static-page__container">
        <header className="static-page__header">
          <span className="static-page__eyebrow">Community</span>
          <h1 className="static-page__title">Velocity Run Club</h1>
          <p className="static-page__intro">
            Join a nationwide crew of runners chasing faster splits, stronger miles, and deeper community. We design
            every workout through the same lens as our footwear—grounded in research, tested by athletes, and open to
            every pace.
          </p>
        </header>
        <figure className="static-page__figure">
          <img src={heroImage.src} alt={heroImage.alt} loading="lazy" />
        </figure>

        <div className="static-page__content">
          <section className="static-section">
            <h2 className="static-section__title">Weekly sessions</h2>
            <p className="static-section__lead">
              Show up and we will take care of the rest. Certified coaches, mapped routes, and recovery support meet you
              at every starting line.
            </p>
            <ul className="static-card-grid">
              {weeklySessions.map((session) => (
                <li key={session.city} className="static-card">
                  {session.image ? (
                    <img
                      src={session.image.src}
                      alt={session.image.alt}
                      loading="lazy"
                      className="static-card__image"
                    />
                  ) : null}
                  <span className="static-card__meta">{session.day}</span>
                  <h3 className="static-card__title">{session.city}</h3>
                  <p className="static-card__description">{session.description}</p>
                  <div className="static-card__footer">
                    {session.details.map((detail) => (
                      <span key={detail}>{detail}</span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="static-section">
            <h2 className="static-section__title">Member perks</h2>
            <ul className="static-list">
              {membershipPerks.map((perk) => (
                <li key={perk}>{perk}</li>
              ))}
            </ul>
          </section>

          <section className="static-section">
            <h2 className="static-section__title">Upcoming events</h2>
            <p className="static-section__lead">
              RSVP inside the Velocity app or at your local store. Every gathering includes route support, nutrition
              samples, and post-run recovery guidance.
            </p>
            <ul className="static-card-grid">
              {upcomingEvents.map((event) => (
                <li key={event.title} className="static-card">
                  <span className="static-card__meta">{event.date}</span>
                  <h3 className="static-card__title">{event.title}</h3>
                  <p className="static-card__description">{event.description}</p>
                  <div className="static-card__footer">
                    <span>{event.location}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </section>
  );
}
