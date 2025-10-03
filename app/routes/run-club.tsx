import Layout from '~/components/layout/Layout';

export default function RunClub() {
  return (
    <Layout>
      <section className="section" style={{padding: '96px 24px'}}>
        <div className="collection-container" style={{maxWidth: 720, margin: '0 auto'}}>
          <h1 className="collection-title" style={{marginBottom: 24}}>Velocity Run Club</h1>
          <p style={{fontSize: 18, color: 'var(--muted)', lineHeight: 1.6}}>
            Join a nationwide community of runners pushing for faster splits and stronger miles. We host weekly
            group runs, structured training plans, and expert-led workshops designed to keep you motivated and injury-free.
          </p>
          <p style={{fontSize: 18, color: 'var(--muted)', lineHeight: 1.6}}>
            Want in? Subscribe to our newsletter and be the first to know about upcoming events and exclusive gear drops.
          </p>
        </div>
      </section>
    </Layout>
  );
}
