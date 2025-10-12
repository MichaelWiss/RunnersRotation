const featuredPost = {
  topic: 'Featured',
  title: 'Velocity Teams Up with City Run Crews Worldwide',
  description:
    'Our biggest community initiative yet brings together captains from 12 cities to create inclusive training camps, pop-up races, and shared gear libraries.',
  release: 'March 28, 2025',
  readingTime: '8 min read',
  image: {
    src: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1600&q=80',
    alt: 'Silhouette of three runners charging along a concrete stretch at sunrise.',
  },
};

const posts = [
  {
    topic: 'Training',
    title: 'Building Speed Without Burning Out',
    description:
      'Our performance team shares the three workouts they use to sharpen athletes ahead of race day, complete with drills and cooldown protocols.',
    release: 'March 12, 2025',
    readingTime: '6 min read',
    image: {
      src: 'https://plus.unsplash.com/premium_photo-1674605365723-15e6749630f4?auto=format&fit=crop&w=1600&q=80',
      alt: 'Runner striding up an open road beneath a wide morning sky.',
    },
  },
  {
    topic: 'Product',
    title: 'Inside the Velocity Ultralight Prototype Lab',
    description:
      'Step into the Austin innovation lab to see how we blend bio-based foams, precision 3D-printed plates, and athlete data to craft our fastest shoes yet.',
    release: 'February 27, 2025',
    readingTime: '5 min read',
    image: {
      src: 'https://images.unsplash.com/photo-1706550633858-dcf3983fdf86?auto=format&fit=crop&w=1600&q=80',
      alt: 'Two athletes balancing together on a longboard before training.',
    },
  },
  {
    topic: 'Community',
    title: 'Mornings on the Mile High Loop',
    description:
      'Follow three Run Club captains as they prep Denver runners for the spring half—routes, playlists, and where to grab breakfast afterward.',
    release: 'January 30, 2025',
    readingTime: '4 min read',
    image: {
      src: 'https://images.unsplash.com/photo-1436380138417-a2dcbd582f35?auto=format&fit=crop&w=1600&q=80',
      alt: 'Solo runner cruising past rocky canyon walls during sunrise.',
    },
  },
];

const collections = [
  {
    title: 'Coach’s Corner Newsletter',
    description:
      'Get stride tips and strength routines in your inbox every Sunday. Designed for runners balancing training with real life.',
  },
  {
    title: 'Velocity Soundtrack',
    description:
      'A curated Spotify series updated monthly to match our training blocks—tempo beat drops, long run crescendos, and easy day grooves.',
  },
  {
    title: 'Photo Stories',
    description:
      'Explore galleries from race weekends, product shoots, and trail camp adventures captured by our in-house creative crew.',
  },
];

export default function Blog() {
  return (
    <section className="static-page">
      <div className="static-page__container">
        <header className="static-page__header">
          <span className="static-page__eyebrow">Stories</span>
          <h1 className="static-page__title">Velocity Journal</h1>
          <p className="static-page__intro">
            Training insight, athlete stories, and behind-the-scenes looks at the product decisions driving Velocity
            forward. Pull up a chair, lace up, and stay awhile.
          </p>
        </header>

        <div className="static-page__content">
          <section className="static-section">
            <div className="featured-card">
              {featuredPost.image ? (
                <img
                  src={featuredPost.image.src}
                  alt={featuredPost.image.alt}
                  loading="lazy"
                  className="featured-card__image"
                />
              ) : null}
              <div className="featured-card__meta">{featuredPost.topic}</div>
              <h2 className="featured-card__title">{featuredPost.title}</h2>
              <p className="featured-card__description">{featuredPost.description}</p>
              <div className="featured-card__footer">
                <span>{featuredPost.release}</span>
                <span>{featuredPost.readingTime}</span>
              </div>
            </div>
          </section>

          <section className="static-section">
            <h2 className="static-section__title">Latest reads</h2>
            <ul className="static-card-grid">
              {posts.map((post) => (
                <li key={post.title}>
                  <a className="static-card static-card--link" href="#">
                    {post.image ? (
                      <img
                        src={post.image.src}
                        alt={post.image.alt}
                        loading="lazy"
                        className="static-card__image"
                      />
                    ) : null}
                    <span className="static-card__meta">{post.topic}</span>
                    <h3 className="static-card__title">{post.title}</h3>
                    <p className="static-card__description">{post.description}</p>
                    <div className="static-card__footer">
                      <span>{post.release}</span>
                      <span>{post.readingTime}</span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="static-section">
            <h2 className="static-section__title">Stay connected</h2>
            <ul className="static-card-grid">
              {collections.map((collection) => (
                <li key={collection.title} className="static-card">
                  <h3 className="static-card__title">{collection.title}</h3>
                  <p className="static-card__description">{collection.description}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </section>
  );
}
