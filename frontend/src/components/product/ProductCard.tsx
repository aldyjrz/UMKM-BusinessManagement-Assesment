import { Link } from "react-router-dom";
import { useCartStore } from "@/hooks/useCart";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/utils/auth";
import { ShoppingCart } from "@/components/ui/icons";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const { showToast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    showToast(`${product.name} added to cart`, "success");
  };

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="relative h-48 w-full overflow-hidden rounded-lg bg-neutral-100">
        {product.image ? (
          <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">No Image</div>
        )}

        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className="absolute top-2 right-2 rounded-full bg-white p-2 shadow-md opacity-0 transition-opacity duration-200 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingCart className="h-4 w-4 text-primary-600" />
        </button>
      </div>

      <div className="mt-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-neutral-800 group-hover:text-primary-600">{product.name}</h3>
          <Badge variant={product.status === "ACTIVE" ? "success" : "warning"}>
            {product.status === "ACTIVE" ? "Active" : "Inactive"}
          </Badge>
        </div>

        <p className="mt-1 text-sm text-neutral-600">
          Stock: <span className={product.stock <= product.minimum_stock ? "text-warning-600 font-medium" : ""}>{product.stock}</span>
        </p>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-neutral-800">{formatCurrency(product.price)}</span>
          {product.stock > 0 ? (
            <Button size="sm" variant="secondary" onClick={handleAddToCart}>
              <ShoppingCart className="h-3 w-3 mr-1" />
              Add to Cart
            </Button>
          ) : (
            <Badge variant="warning">Out of Stock</Badge>
          )}
        </div>
      </div>
    </Link>
  );
};
