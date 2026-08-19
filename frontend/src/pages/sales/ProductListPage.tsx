import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/LoadingStates";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types";

const ProductListPage = () => {
  const [search, setSearch] = useState("");

  const { data: products, isLoading, error } = useQuery({
    queryKey: ["products", search],
    queryFn: () => productService.getAll({ search: search || undefined })
  });

  return (
    <div className="container mx-auto px-4">
      <h1 className="mb-6 text-2xl font-bold text-neutral-800">Products</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search products..."
          className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading && <LoadingState message="Loading products..." />}
      {error && <ErrorState message="Failed to load products" onRetry={() => window.location.reload()} />}
      {!isLoading && !error && products && (
        products.length === 0 ? (
          <EmptyState message="No products found" />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default ProductListPage;


