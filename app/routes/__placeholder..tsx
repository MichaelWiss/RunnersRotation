import {type LoaderFunctionArgs} from 'react-router';
import Layout from '~/components/layout/Layout';

const DEFAULT_COPY = {
  heading: 'Coming Soon',
  message: "We're putting the finishing touches on this experience. Check back soon for fresh content.",
};

export async function loader({params}: LoaderFunctionArgs) {
  const slug = params.slug ?? 'coming-soon';
  return {slug};
}

export default function Placeholder() {
  return (
    <Layout>
      <section className="section" style={{padding: '96px 24px', textAlign: 'center'}}>
        <div className="collection-container" style={{maxWidth: 720, margin: '0 auto'}}>
          <h1 className="collection-title" style={{marginBottom: 20}}>{DEFAULT_COPY.heading}</h1>
          <p style={{fontSize: 18, color: 'var(--muted)'}}>{DEFAULT_COPY.message}</p>
        </div>
      </section>
    </Layout>
  );
}
