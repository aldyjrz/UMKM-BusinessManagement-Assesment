import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerService } from "@/services";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/LoadingStates";
import { useToast } from "@/components/ui/Toast";
import type { Customer } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { TableCell } from "@/components/ui/Table";

const CustomerManagementPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers, isLoading, error } = useQuery({
    queryKey: ["customers"],
    queryFn: () => customerService.getAll()
  });

  const deleteMutation = useMutation({
    mutationFn: customerService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      showToast("Customer deleted", "success");
    }
  });

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <LoadingState message="Loading customers..." />;
  if (error) return <ErrorState message="Failed to load customers" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">Customers</h1>
        <Button onClick={() => { setEditingCustomer(null); setShowModal(true); }}>Add Customer</Button>
      </div>

      {!customers || customers.length === 0 ? (
        <EmptyState message="No customers found" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50">
                <th className="px-4 py-3 text-left font-medium text-neutral-700">Name</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-700">Email</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-700">Phone</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-700">Type</th>
                <th className="px-4 py-3 text-right font-medium text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer: Customer) => (
                <tr key={customer.id} className="border-b border-neutral-100">
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>
                    <Badge variant={customer.type === "REGISTERED" ? "success" : "secondary"}>
                      {customer.type}
                    </Badge>
                  </TableCell>
                  <TableCell align="right">
                    <Button size="sm" variant="ghost" onClick={() => { setEditingCustomer(customer); setShowModal(true); }}>Edit</Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(customer.id)} className="ml-2 text-danger-600">Delete</Button>
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CustomerModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        customer={editingCustomer}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ["customers"] })}
      />
    </div>
  );
};

const CustomerModal: React.FC<any> = ({ isOpen, onClose, customer }) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const isEdit = !!customer;

  const [formData, setFormData] = useState({
    name: customer?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    address: customer?.address || "",
    city: customer?.city || "",
    postal_code: customer?.postal_code || "",
    type: customer?.type || "REGISTERED"
  });

  const createMutation = useMutation({
    mutationFn: customerService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      showToast("Customer created", "success");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => customerService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      showToast("Customer updated", "success");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && customer) {
      updateMutation.mutate({ id: customer.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Customer" : "Add Customer"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
        <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
        <Input label="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />
        <Input label="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required />
        <Input label="Postal Code" value={formData.postal_code} onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })} required />
        <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })} className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm">
          <option value="GUEST">Guest</option>
          <option value="REGISTERED">Registered</option>
        </select>
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">{isEdit ? "Update" : "Create"}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomerManagementPage;


