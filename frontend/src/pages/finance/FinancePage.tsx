import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financeService } from "@/services";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { TableCell } from "@/components/ui/Table";
import { LoadingState, EmptyState } from "@/components/ui/LoadingStates";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/utils/auth";
import type { Expense } from "@/types";

const FinancePage = () => {
  const [showExpenseModal, setShowExpenseModal] = useState(false);


  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["finance-summary"],
    queryFn: () => financeService.getSummary()
  });

  const { data: incomes, isLoading: incomesLoading } = useQuery({
    queryKey: ["incomes"],
    queryFn: () => financeService.getIncomes()
  });

  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => financeService.getExpenses()
  });

  if (summaryLoading) return <LoadingState message="Loading finance data..." />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">Finance</h1>
        <Button onClick={() => setShowExpenseModal(true)} variant="outline">
          Add Expense
        </Button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card noPadding>
            <div className="p-6">
              <h3 className="text-sm font-medium text-neutral-500">Total Revenue</h3>
              <p className="text-2xl font-bold text-success-600">{formatCurrency(summary.totalRevenue || 0)}</p>
            </div>
          </Card>
          <Card noPadding>
            <div className="p-6">
              <h3 className="text-sm font-medium text-neutral-500">Total Expense</h3>
              <p className="text-2xl font-bold text-danger-600">{formatCurrency(summary.totalExpense || 0)}</p>
            </div>
          </Card>
          <Card noPadding>
            <div className="p-6">
              <h3 className="text-sm font-medium text-neutral-500">Net Profit</h3>
              <p className="text-2xl font-bold text-neutral-800">{formatCurrency(summary.netProfit || 0)}</p>
            </div>
          </Card>
          <Card noPadding>
            <div className="p-6">
              <h3 className="text-sm font-medium text-neutral-500">Monthly Revenue</h3>
              <p className="text-2xl font-bold text-primary-600">{formatCurrency(summary.monthlyRevenue || 0)}</p>
            </div>
          </Card>
        </div>
      )}

      <Card title="Recent Incomes" noPadding>
        {incomesLoading ? (
          <LoadingState message="Loading incomes..." />
        ) : !incomes || incomes.length === 0 ? (
          <EmptyState message="No incomes recorded" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="px-4 py-2 text-left font-medium">Date</th>
                  <th className="px-4 py-2 text-left font-medium">Order</th>
                  <th className="px-4 py-2 text-right font-medium">Amount</th>
                  <th className="px-4 py-2 text-left font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map((income: any) => (
                  <tr key={income.id} className="border-b border-neutral-100">
                    <TableCell>{new Date(income.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{income.order?.order_number || income.order_id}</TableCell>
                    <TableCell align="right">{formatCurrency(income.amount)}</TableCell>
                    <TableCell>{income.source}</TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Recent Expenses" noPadding>
        {expensesLoading ? (
          <LoadingState message="Loading expenses..." />
        ) : !expenses || expenses.length === 0 ? (
          <EmptyState message="No expenses recorded" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="px-4 py-2 text-left font-medium">Date</th>
                  <th className="px-4 py-2 text-left font-medium">Category</th>
                  <th className="px-4 py-2 text-right font-medium">Amount</th>
                  <th className="px-4 py-2 text-left font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense: Expense) => (
                  <tr key={expense.id} className="border-b border-neutral-100">
                    <TableCell>{new Date(expense.expense_date).toLocaleDateString()}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell align="right">{formatCurrency(expense.amount)}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ExpenseModal isOpen={showExpenseModal} onClose={() => setShowExpenseModal(false)} />
    </div>
  );
};

const ExpenseModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ category: "", amount: 0, description: "" });

  const expenseMutation = useMutation({
    mutationFn: financeService.createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["finance-summary"] });
      showToast("Expense recorded", "success");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    expenseMutation.mutate(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Expense">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Rent, Electricity" required />
        <Input label="Amount" type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })} required />
        <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
};

export default FinancePage;


