import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryService, productService } from "@/services";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { TableCell } from "@/components/ui/Table";
import { LoadingState, EmptyState } from "@/components/ui/LoadingStates";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/utils/auth";
import type { Product } from "@/types";

const InventoryPage = () => {
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", "inventory"],
    queryFn: () => productService.getAll({ lowStock: true })
  });

  const { data: movements } = useQuery({
    queryKey: ["stock-movements"],
    queryFn: () => inventoryService.getMovements()
  });

  const adjustmentMutation = useMutation({
    mutationFn: (data: { productId: number; quantity: number; notes: string }) =>
      inventoryService.createAdjustment({ productId: data.productId, quantity: data.quantity, notes: data.notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      showToast("Stock adjusted", "success");
    }
  });

  const purchaseMutation = useMutation({
    mutationFn: (data: { productId: number; quantity: number; notes: string }) =>
      inventoryService.createPurchase({ productId: data.productId, quantity: data.quantity, notes: data.notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      showToast("Purchase recorded", "success");
    }
  });

  if (isLoading) return <LoadingState message="Loading inventory..." />;

  const lowStockProducts = products || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">Inventory</h1>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setShowPurchaseModal(true)} variant="success">
            Record Purchase
          </Button>
          <Button size="sm" onClick={() => setShowAdjustmentModal(true)} variant="outline">
            Stock Adjustment
          </Button>
        </div>
      </div>

      <Card title="Low Stock Products" className="mb-6">
        {lowStockProducts.length === 0 ? (
          <EmptyState message="No low stock products" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="px-4 py-2 text-left font-medium">Product</th>
                  <th className="px-4 py-2 text-center font-medium">Current Stock</th>
                  <th className="px-4 py-2 text-center font-medium">Min Stock</th>
                  <th className="px-4 py-2 text-right font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((product: Product) => (
                  <tr key={product.id} className="border-b border-neutral-100">
                    <TableCell>{product.name} ({product.sku})</TableCell>
                    <TableCell align="center" className="text-warning-600 font-medium">{product.stock}</TableCell>
                    <TableCell align="center">{product.minimum_stock}</TableCell>
                    <TableCell align="right">{formatCurrency(product.price * product.stock)}</TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Recent Stock Movements">
        {!movements || movements.length === 0 ? (
          <EmptyState message="No movements recorded" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="px-4 py-2 text-left font-medium">Product</th>
                  <th className="px-4 py-2 text-left font-medium">Type</th>
                  <th className="px-4 py-2 text-center font-medium">Quantity</th>
                  <th className="px-4 py-2 text-center font-medium">Before</th>
                  <th className="px-4 py-2 text-center font-medium">After</th>
                  <th className="px-4 py-2 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m: any) => (
                  <tr key={m.id} className="border-b border-neutral-100">
                    <TableCell>{m.product?.name || `ID: ${m.product_id}`}</TableCell>
                    <TableCell>
                      <span className={m.type === "SALE" ? "text-danger-600" : m.type === "PURCHASE" ? "text-success-600" : "text-warning-600"}>
                        {m.type}
                      </span>
                    </TableCell>
                    <TableCell align="center">{m.quantity}</TableCell>
                    <TableCell align="center">{m.stock_before}</TableCell>
                    <TableCell align="center">{m.stock_after}</TableCell>
                    <TableCell>{new Date(m.created_at).toLocaleDateString()}</TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        products={lowStockProducts}
        onSubmit={(data: any) => purchaseMutation.mutate(data)}
      />

      <AdjustmentModal
        isOpen={showAdjustmentModal}
        onClose={() => setShowAdjustmentModal(false)}
        products={lowStockProducts}
        onSubmit={(data: any) => adjustmentMutation.mutate(data)}
      />
    </div>
  );
};

const PurchaseModal = ({ isOpen, onClose, products, onSubmit }: any) => {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Purchase">
      <div className="space-y-4">
        <select value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2">
          <option value="">Select Product</option>
          {products.map((p: Product) => (
            <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
          ))}
        </select>
        <Input label="Quantity" type="number" min={1} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} />
        <Input label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              if (productId) {
                onSubmit({ productId: parseInt(productId), quantity, notes });
                onClose();
              }
            }}
          >
            Record
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const AdjustmentModal = ({ isOpen, onClose, products, onSubmit }: any) => {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [notes, setNotes] = useState("");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Stock Adjustment">
      <div className="space-y-4">
        <select value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2">
          <option value="">Select Product</option>
          {products.map((p: Product) => (
            <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
          ))}
        </select>
        <Input label="New Quantity" type="number" min={0} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} />
        <Input label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              if (productId) {
                onSubmit({ productId: parseInt(productId), quantity, notes });
                onClose();
              }
            }}
          >
            Adjust
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default InventoryPage;


