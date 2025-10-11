const faqs = [
  {
    question: 'How fast do you ship orders?',
    answer: [
      'All Velocity footwear and apparel orders ship free anywhere in the continental U.S. We pick and pack within two business days, and most deliveries arrive in 3–5 days thanks to our regional fulfillment centers.',
      'Need gear in a rush? Choose express checkout at the cart for guaranteed two-day delivery.',
    ],
  },
  {
    question: 'What is your return window?',
    answer: [
      'We stand behind every mile. You have 60 days to run, train, and test Velocity product. If something misses the mark, start a free return or exchange from your order history—no restocking fees and no questions asked.',
      'Returns are processed within 48 hours of arrival to our warehouse, and refunds appear on your statement 3–5 days later.',
    ],
  },
  {
    question: 'Do you offer gear for group orders or teams?',
    answer: [
      'Absolutely. Our wholesale and team outfitting specialists can dial in custom kits, restock team stores, or ship seasonal uniforms directly to athletes.',
      'Send us your roster size and timelines at partnerships@velocity.run and we will reply within one business day.',
    ],
  },
  {
    question: 'Where can I try Velocity shoes in person?',
    answer: [
      'Visit our flagship in Denver, our Lafayette Street studio in NYC, or our innovation lab in Austin. Each location has full-size runs, gait analysis, and demo inventory so you can feel the difference before you purchase.',
      'Check local events on the Run Club page for traveling try-on experiences.',
    ],
  },
];

export default function FAQ() {
  return (
    <section className="static-page">
      <div className="static-page__container">
        <header className="static-page__header">
          <span className="static-page__eyebrow">Support</span>
          <h1 className="static-page__title">Frequently Asked Questions</h1>
          <p className="static-page__intro">
            We pulled the most common questions from our customer support inbox. If you do not see what you need, the
            Velocity team is only a message away.
          </p>
        </header>

        <div className="static-page__content">
          <dl className="faq-list">
            {faqs.map((faq) => (
              <div key={faq.question} className="faq-item">
                <dt>{faq.question}</dt>
                {faq.answer.map((paragraph, index) => (
                  <dd key={index}>{paragraph}</dd>
                ))}
              </div>
            ))}
          </dl>

          <section className="static-section">
            <h2 className="static-section__title">Need to talk to a human?</h2>
            <p className="static-section__lead">
              Email <a href="mailto:hello@velocity.run">hello@velocity.run</a> or call us weekdays 8am–6pm Mountain
              Time. You can also reach out through live chat inside the Velocity app.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
