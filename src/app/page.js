import Slider from './home/partials/HomeSlider';
import CompanyLiability from "@/app/home/partials/CompanyLiability";
import HomeCategories from "@/app/home/partials/HomeCategories";
import FeaturedProducts from "@/app/home/partials/FeaturedProducts";
import DealOfTheDay from './home/partials/DealOfTheDay';
import NewArrivalProducts from './home/partials/NewArrivalProducts';
import HomeBlockBanner from './home/partials/HomeBlockBanner';
import Brands from './home/partials/Brands';

export const metadata = {
  title: 'Home - Snapcart',
  description: 'Welcome to Snapcart, your one-stop shop for all your needs. Discover our featured products, latest arrivals, and exclusive deals.',
};

export default function HomePage() {
  return (
    <div className="container py-5">
      <Slider />
      <CompanyLiability />
      <HomeCategories />
      <FeaturedProducts />
      <DealOfTheDay />
      <NewArrivalProducts />
      <HomeBlockBanner />
      <Brands />

    </div>
  );
}
