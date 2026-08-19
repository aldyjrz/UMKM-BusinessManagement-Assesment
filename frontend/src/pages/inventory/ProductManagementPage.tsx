import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { TableCell } from "@/components/ui/Table";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/LoadingStates";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/utils/auth";
import type { Product, Category, Supplier } from "@/types";

const ProductManagementPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: products, isLoading, error } = useQuery({
    queryKey: ["products", search],
    queryFn: () => productService.getAll({ search: search || undefined })
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productService.getCategories()
  });

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => productService.getSuppliers()
  });

  const getProductStatusBadge = (product: Product) => {
    const isLow = product.stock <= product.minimum_stock;
    return (
      <div className="flex flex-col gap-1">
        <Badge variant={product.status === "ACTIVE" ? "success" : "warning"}>
          {product.status}
        </Badge>
        {isLow && <Badge variant="warning">Low Stock</Badge>}
      </div>
    );
  };

  if (isLoading) return <LoadingState message="Loading products..." />;
  if (error) return <ErrorState message="Failed to load products" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">Products</h1>
        <Button onClick={() => { setEditingProduct(null); setShowModal(true); }}>Add Product</Button>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search products..."
          className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 focus:border-primary-500 focus:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {!products || products.length === 0 ? (
        <EmptyState message="No products found" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50">
                <th className="px-4 py-3 text-left font-medium text-neutral-700">SKU</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-700">Name</th>
                <th className="px-4 py-3 text-right font-medium text-neutral-700">Price</th>
                <th className="px-4 py-3 text-center font-medium text-neutral-700">Stock</th>
                <th className="px-4 py-3 text-center font-medium text-neutral-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: Product) => (
                <tr key={product.id} className="border-b border-neutral-100">
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                  </TableCell>
                  <TableCell align="right">{formatCurrency(product.price)}</TableCell>
                  <TableCell align="center">
                    <span className={product.stock <= product.minimum_stock ? "text-warning-600 font-medium" : ""}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell align="center">{getProductStatusBadge(product)}</TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        product={editingProduct}
        categories={categories || []}
        suppliers={suppliers || []}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ["products"] })}
      />
    </div>
  );
};

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  categories: Category[];
  suppliers: Supplier[];
  onSaved: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, product, categories, suppliers, onSaved }) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const isEdit = !!product;

  const [formData, setFormData] = useState({
    sku: product?.sku || "",
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    cost: product?.cost || 0,
    stock: product?.stock || 0,
    minimum_stock: product?.minimum_stock || 0,
    category_id: product?.category_id || null,
    supplier_id: product?.supplier_id || null,
    status: product?.status || "ACTIVE"
  });

  const createMutation = useMutation({
    mutationFn: productService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onSaved();
      showToast("Product created", "success");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Product> }) => productService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onSaved();
      showToast("Product updated", "success");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && product) {
      updateMutation.mutate({ id: product.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
    onClose();
    onSaved();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Product" : "Add Product"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="SKU" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} required />
          <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="Price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} required />
          <Input label="Cost" type="number" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })} required />
          <Input label="Stock" type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })} required />
          <Input label="Minimum Stock" type="number" value={formData.minimum_stock} onChange={(e) => setFormData({ ...formData, minimum_stock: parseInt(e.target.value) })} required />
        </div>
        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
        <div className="flex gap-4">
          <select
            value={formData.category_id || ""}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? parseInt(e.target.value) : null })}
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="">No Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={formData.supplier_id || ""}
            onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value ? parseInt(e.target.value) : null })}
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="">No Supplier</option>
            {suppliers.map((sup) => (
              <option key={sup.id} value={sup.id}>{sup.name}</option>
            ))}
          </select>
        </div>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as "ACTIVE" | "INACTIVE" })}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        >
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <div className="flex justify-end gap-2 border-t border-neutral-200 pt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">{isEdit ? "Update" : "Create"}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductManagementPage;


