"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/DatePicker";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { useInvestment } from "@/context/InvestmentContext";

interface Transaction {
  id: string;
  date: string;
  type: "buy" | "sell";
  price_per_gram: number; // Changed to snake_case
  amount_spent: number; // Changed to snake_case
  gold_amount: number; // Changed to snake_case
  transaction_fee?: number; // Changed to snake_case
}

interface EditTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
}

export const EditTransactionDialog = ({ isOpen, onClose, transaction }: EditTransactionDialogProps) => {
  const { updateTransaction, cashBalance } = useInvestment();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [pricePerGram, setPricePerGram] = useState<string>("");
  const [amountSpent, setAmountSpent] = useState<string>("");
  const [goldAmount, setGoldAmount] = useState<string>("");
  const [transactionFee, setTransactionFee] = useState<string>("");

  useEffect(() => {
    if (transaction) {
      setDate(parseISO(transaction.date));
      setPricePerGram(transaction.price_per_gram.toString());
      setAmountSpent(transaction.amount_spent.toString());
      setGoldAmount(transaction.gold_amount.toString());
      setTransactionFee((transaction.transaction_fee || 0).toString());
    }
  }, [transaction]);

  const calculateGoldAmount = (currentAmountSpent: string, currentPricePerGram: string) => {
    const parsedAmount = parseFloat(currentAmountSpent);
    const parsedPrice = parseFloat(currentPricePerGram);
    if (!isNaN(parsedAmount) && !isNaN(parsedPrice) && parsedPrice > 0) {
      setGoldAmount((parsedAmount / parsedPrice).toFixed(4));
    } else {
      setGoldAmount("");
    }
  };

  const handleAmountSpentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmountSpent(value);
    calculateGoldAmount(value, pricePerGram);
  };

  const handlePricePerGramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPricePerGram(value);
    calculateGoldAmount(amountSpent, value);
  };

  const handleTransactionFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTransactionFee(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => { // Made async
    e.preventDefault();

    if (!date || !pricePerGram || !amountSpent || !goldAmount) {
      toast.error("Harap lengkapi semua kolom yang wajib diisi.");
      return;
    }

    const parsedPricePerGram = parseFloat(pricePerGram);
    const parsedAmountSpent = parseFloat(amountSpent);
    const parsedGoldAmount = parseFloat(goldAmount);
    const parsedTransactionFee = parseFloat(transactionFee || "0");

    if (isNaN(parsedPricePerGram) || isNaN(parsedAmountSpent) || isNaN(parsedGoldAmount) || parsedPricePerGram <= 0 || parsedAmountSpent <= 0 || parsedGoldAmount <= 0) {
      toast.error("Nilai input tidak valid. Pastikan angka positif untuk harga, jumlah uang, dan jumlah emas.");
      return;
    }
    if (isNaN(parsedTransactionFee) || parsedTransactionFee < 0) {
      toast.error("Biaya transaksi tidak valid. Harap masukkan angka positif atau nol.");
      return;
    }

    // Calculate the difference in total cost for cash balance check
    const oldTotalCost = transaction.amount_spent + (transaction.transaction_fee || 0); // Changed to snake_case
    const newTotalCost = parsedAmountSpent + parsedTransactionFee;
    const cashDifference = newTotalCost - oldTotalCost;

    if (cashBalance - cashDifference < 0) {
      toast.error("Saldo kas tidak cukup untuk perubahan transaksi ini.");
      return;
    }

    await updateTransaction(transaction.id, { // Await the async call
      date: format(date, "yyyy-MM-dd"),
      price_per_gram: parsedPricePerGram, // Changed to snake_case
      amount_spent: parsedAmountSpent, // Changed to snake_case
      gold_amount: parsedGoldAmount, // Changed to snake_case
      transaction_fee: parsedTransactionFee, // Changed to snake_case
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Transaksi Emas</DialogTitle>
          <DialogDescription>
            Perbarui detail transaksi pembelian emas Anda.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Tanggal
            </Label>
            <div className="col-span-3">
              <DatePicker date={date} setDate={setDate} />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pricePerGram" className="text-right">
              Harga/Gram
            </Label>
            <Input
              id="pricePerGram"
              type="number"
              value={pricePerGram}
              onChange={handlePricePerGramChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amountSpent" className="text-right">
              Jumlah Uang
            </Label>
            <Input
              id="amountSpent"
              type="number"
              value={amountSpent}
              onChange={handleAmountSpentChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="transactionFee" className="text-right">
              Biaya Transaksi
            </Label>
            <Input
              id="transactionFee"
              type="number"
              value={transactionFee}
              onChange={handleTransactionFeeChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="goldAmount" className="text-right">
              Jumlah Emas
            </Label>
            <Input
              id="goldAmount"
              type="number"
              value={goldAmount}
              readOnly
              className="col-span-3 bg-gray-100 dark:bg-gray-800"
            />
          </div>
          <DialogFooter>
            <Button type="submit">Simpan Perubahan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};