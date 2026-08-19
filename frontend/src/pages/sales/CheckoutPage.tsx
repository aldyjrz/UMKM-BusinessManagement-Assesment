import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useCartStore } from "@/hooks/useCart";
import { orderService } from "@/services";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, calculateTotal, calculateTax } from "@/utils/auth";

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { items, clearCart } = useCartStore();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postal_code: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const tax = calculateTax(subtotal);
  const total = calculateTotal(subtotal, tax);

  const createOrderMutation = useMutation({
    mutationFn: (data: any) => orderService.createGuestOrder(data),
    onSuccess: (data) => {
      clearCart();
      showToast("Order created successfully", "success");

      const snapToken = data.payment?.snap_token;
      if (snapToken) {
        window.localStorage.setItem("pending_order", JSON.stringify({
          order_number: data.order.order_number,
          snap_token: snapToken
        }));
        window.location.href = `/checkout/payment/${data.order.order_number}?token=${data.order.secure_token}`;
      } else {
        navigate(`/order-status/${data.order.order_number}?token=${data.order.secure_token}`);
      }
    },
    onError: (error: any) => {
      showToast(error?.response?.data?.message || "Failed to create order", "error");
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    createOrderMutation.mutate({
      customer: customerInfo,
      items: items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity
      }))
    });
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="mb-4 text-neutral-600">Your cart is empty</p>
        <Button onClick={() => navigate("/products")}>Continue Shopping</Button>
      </div>
    );
  }

  const isFormValid = Object.values(customerInfo).every((val) => val.trim().length > 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-800">Checkout</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-neutral-800">Customer Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              placeholder="John Doe"
              required
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Email"
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                placeholder="you@example.com"
                required
              />
              <Input
                label="Phone"
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                placeholder="+628xx"
                required
              />
            </div>
            <Input
              label="Address"
              value={customerInfo.address}
              onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
              placeholder="Street address"
              required
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="City"
                value={customerInfo.city}
                onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                placeholder="City"
                required
              />
              <Input
                label="Postal Code"
                value={customerInfo.postal_code}
                onChange={(e) => setCustomerInfo({ ...customerInfo, postal_code: e.target.value })}
                placeholder="171xx"
                required
              />
            </div>
            <Button
              type="submit"
              fullWidth
              disabled={!isFormValid || isProcessing}
              isLoading={isProcessing}
              variant="success"
            >
              {isProcessing ? "Processing..." : `Pay ${formatCurrency(total)}`}
            </Button>
          </form>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-neutral-800">Order Summary</h2>
          <div className="space-y-3 rounded-lg bg-white p-6 shadow-sm border border-neutral-200">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between">
                <span className="text-neutral-600">
                  {item.product.name} x {item.quantity}
                </span>
                <span>{formatCurrency(item.product.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-neutral-200 pt-3">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Tax (11%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

