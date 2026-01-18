import Slider from './home/partials/HomeSlider';
import CompanyLiability from "@/app/home/partials/CompanyLiability";

export default function HomePage() {
  return (
    <div className="container py-5">
      <Slider />
      <CompanyLiability />
    </div>
  );
}
