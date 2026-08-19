import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services";
import { useCartStore } from "@/hooks/useCart";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingState, ErrorState } from "@/components/ui/LoadingStates";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/utils/auth";

const ShoppingCartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3 3h2l.293.293c.185.184.427.332.68.41.226.07.461.127.697.127h13.746l-.293-.293c-.185-.184-.427-.332-.68-.41-.226-.07-.461-.127-.697-.127H9M3 3l-2 2v2m10 10v-4m-2 4h4m-4 4a2 2 0 100-4 2 2 0 000 4zm8-4a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productService.getById(parseInt(id!)),
    enabled: !!id
  });

  const { showToast } = useToast();

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      showToast(`${product.name} added to cart`, "success");
    }
  };

  if (isLoading) return <LoadingState message="Loading product..." />;
  if (error) return <ErrorState message="Failed to load product" />;
  if (!product) return <ErrorState message="Product not found" />;

  const isLowStock = product.stock <= product.minimum_stock;
  const canPurchase = product.status === "ACTIVE" && product.stock > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="h-80 w-full overflow-hidden rounded-lg bg-neutral-100">
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-400">No Image</div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between">
            <h1 className="text-3xl font-bold text-neutral-800">{product.name}</h1>
            <Badge variant={product.status === "ACTIVE" ? "success" : "warning"}>
              {product.status}
            </Badge>
          </div>

          <p className="mt-2 text-3xl font-bold text-primary-600">{formatCurrency(product.price)}</p>
          {product.cost > 0 && <p className="text-sm text-neutral-500">Cost: {formatCurrency(product.cost)}</p>}

          <p className="mt-4 text-neutral-600">{product.description || "No description available."}</p>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-neutral-700">Quantity:</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="rounded-lg border border-neutral-300 px-2 py-1 text-sm">
                  -
                </button>
                <span className="w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="rounded-lg border border-neutral-300 px-2 py-1 text-sm"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <span className={`text-sm ${isLowStock ? "text-warning-600 font-medium" : "text-neutral-500"}`}>
                {product.stock} in stock {isLowStock && "(Low stock)"}
              </span>
            </div>

            {canPurchase && (
              <Button onClick={handleAddToCart} leftIcon={<ShoppingCartIcon />}>
                Add to Cart
              </Button>
            )}

            {!canPurchase && (
              <Button disabled variant="secondary">
                {product.status === "INACTIVE" ? "Product Unavailable" : "Out of Stock"}
              </Button>
            )}
          </div>

          {product.sku && (
            <div className="mt-6 border-t border-neutral-200 pt-4">
              <p className="text-sm text-neutral-500">SKU: {product.sku}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;


