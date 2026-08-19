import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/hooks/useCart";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/LoadingStates";
import { formatCurrency, calculateTotal, calculateTax } from "@/utils/auth";
import { TrashIcon, MinusIcon, PlusIcon } from "@/components/ui/icons";

const CartPage = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="mb-6 text-2xl font-bold text-neutral-800">Your Cart</h1>
        <EmptyState message="Your cart is empty" actionLabel="Continue Shopping" onAction={() => navigate("/products")} />
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const tax = calculateTax(subtotal);
  const total = calculateTotal(subtotal, tax);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-800">Your Cart</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.product.id} className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm border border-neutral-200">
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                {item.product.image ? (
                  <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-neutral-400">No Image</div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-800">{item.product.name}</h3>
                <p className="text-sm text-neutral-600">SKU: {item.product.sku}</p>
                <p className="text-sm text-neutral-600">{formatCurrency(item.product.price)} x {item.quantity}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className="rounded-lg border border-neutral-300 px-2 py-1"
                  disabled={item.quantity <= 1}
                >
                  <MinusIcon className="h-3 w-3" />
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  className="rounded-lg border border-neutral-300 px-2 py-1"
                  disabled={item.quantity >= item.product.stock}
                >
                  <PlusIcon className="h-3 w-3" />
                </button>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatCurrency(item.product.price * item.quantity)}</p>
                <button onClick={() => removeItem(item.product.id)} className="mt-1 text-danger-600 hover:text-danger-700">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <Card title="Order Summary" noPadding>
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Tax (11%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="border-t border-neutral-200 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary-600">{formatCurrency(total)}</span>
                </div>
              </div>
              <div className="space-y-2 pt-4">
                <Button fullWidth onClick={() => navigate("/products")}>
                  Continue Shopping
                </Button>
                <Button fullWidth  onClick={() => navigate("/checkout")}>
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartPage;




