import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import useAuth from "@/hooks/useAuth";

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col items-center">
      <section className="w-full text-center py-16 sm:py-24">
        <h1 className="text-4xl sm:text-5xl font-bold text-neutral-800 mb-4">UMKM ERP</h1>
        <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
          Integrated Business Management System for Micro, Small, and Medium Enterprises
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => navigate("/products")}>
            Browse Products
          </Button>
         
        </div>
      </section>

      <section className="w-full max-w-6xl mx-auto py-12">
        <h2 className="text-2xl font-bold text-neutral-800 mb-8 text-center">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="h-48 bg-neutral-100 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-neutral-400">Product Image</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Kopi Arabica</h3>
            <p className="text-neutral-600 text-sm mb-4">Premium arabica coffee beans</p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg text-primary-600">Rp 25.000</span>
              <Button size="sm" onClick={() => navigate("/products/1")}>View</Button>
            </div>
          </div>
        </div>
      </section>
 
    </div>
  );
};

export default LandingPage;


