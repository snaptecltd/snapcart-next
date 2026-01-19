import Slider from './home/partials/HomeSlider';
import CompanyLiability from "@/app/home/partials/CompanyLiability";
import HomeCategories from "@/app/home/partials/HomeCategories";
import FeaturedProducts from "@/app/home/partials/FeaturedProducts";
import DealOfTheDay from './home/partials/DealOfTheDay';

export default function HomePage() {
  return (
    <div className="container py-5">
      <Slider />
      <CompanyLiability />
      <HomeCategories />
      <FeaturedProducts />
      <DealOfTheDay />

    </div>
  );
}
