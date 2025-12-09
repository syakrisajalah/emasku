"use client";

import React, { useState } from "react";
import { useInvestment } from "@/context/InvestmentContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/DatePicker";
import { format } from "date-fns";
import { toast } from "sonner";

const AddTransaction = () => {
  const { addTransaction, cashBalance } = useInvestment();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [pricePerGram, setPricePerGram] = useState<string>("");
  const [amountSpent, setAmountSpent] = useState<string>("");
  const [goldAmount, setGoldAmount] = useState<string>("");
  const [transactionFee, setTransactionFee] = useState<string>(""); // New state for transaction fee

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
    const parsedTransactionFee = parseFloat(transactionFee || "0"); // Default to 0 if empty

    if (isNaN(parsedPricePerGram) || isNaN(parsedAmountSpent) || isNaN(parsedGoldAmount) || parsedPricePerGram <= 0 || parsedAmountSpent <= 0 || parsedGoldAmount <= 0) {
      toast.error("Nilai input tidak valid. Pastikan angka positif untuk harga, jumlah uang, dan jumlah emas.");
      return;
    }
    if (isNaN(parsedTransactionFee) || parsedTransactionFee < 0) {
      toast.error("Biaya transaksi tidak valid. Harap masukkan angka positif atau nol.");
      return;
    }

    const totalCost = parsedAmountSpent + parsedTransactionFee;
    if (totalCost > cashBalance) {
      toast.error("Saldo kas tidak cukup untuk pembelian ini (termasuk biaya transaksi).");
      return;
    }

    await addTransaction({ // Await the async call
      date: format(date, "yyyy-MM-dd"),
      price_per_gram: parsedPricePerGram, // Changed to snake_case
      amount_spent: parsedAmountSpent, // Changed to snake_case
      gold_amount: parsedGoldAmount, // Changed to snake_case
      transaction_fee: parsedTransactionFee, // Changed to snake_case
    });

    // Reset form
    setDate(new Date());
    setPricePerGram("");
    setAmountSpent("");
    setGoldAmount("");
    setTransactionFee("");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Beli Emas Baru</CardTitle>
          <CardDescription>Tambahkan detail pembelian emas Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="date">Tanggal Pembelian</Label>
              <DatePicker date={date} setDate={setDate} />
            </div>
            <div>
              <Label htmlFor="pricePerGram">Harga Beli per Gram (Rp)</Label>
              <Input
                id="pricePerGram"
                type="number"
                placeholder="Contoh: 2448000"
                value={pricePerGram}
                onChange={handlePricePerGramChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="amountSpent">Jumlah Uang untuk Emas (Rp)</Label>
              <Input
                id="amountSpent"
                type="number"
                placeholder="Contoh: 150000"
                value={amountSpent}
                onChange={handleAmountSpentChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="transactionFee">Biaya Transaksi (Rp, opsional)</Label>
              <Input
                id="transactionFee"
                type="number"
                placeholder="Contoh: 5000 (jika ada)"
                value={transactionFee}
                onChange={handleTransactionFeeChange}
              />
            </div>
            <div>
              <Label htmlFor="goldAmount">Jumlah Emas (gram)</Label>
              <Input
                id="goldAmount"
                type="number"
                placeholder="Dihitung otomatis"
                value={goldAmount}
                readOnly
                className="bg-gray-100 dark:bg-gray-800"
              />
            </div>
            <Button type="submit" className="w-full">
              Tambahkan Pembelian
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddTransaction;