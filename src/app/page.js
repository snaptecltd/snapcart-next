import Slider from './home/partials/HomeSlider';
import CompanyLiability from "@/app/home/partials/CompanyLiability";
import HomeCategories from "@/app/home/partials/HomeCategories";

export default function HomePage() {
  return (
    <div className="container py-5">
      <Slider />
      <CompanyLiability />
      <HomeCategories />
    </div>
  );
}
