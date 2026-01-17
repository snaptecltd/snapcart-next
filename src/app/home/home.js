import Slider from 'partials/slider';
export default function HomePage() {
  return (
    <div className="container py-5">
      <Slider />
      <h1>Home Page Contents</h1>
      <p>This is Snapcart main home content area.</p>
      <button className="btn btn-success">
        <i className="fas fa-bag-shopping"></i> Start Shopping
      </button>
    </div>
  );
}
