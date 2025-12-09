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

  const handleAmountSpentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmountSpent(value);
    const parsedAmount = parseFloat(value);
    const parsedPrice = parseFloat(pricePerGram);
    if (!isNaN(parsedAmount) && !isNaN(parsedPrice) && parsedPrice > 0) {
      setGoldAmount((parsedAmount / parsedPrice).toFixed(4));
    } else {
      setGoldAmount("");
    }
  };

  const handlePricePerGramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPricePerGram(value);
    const parsedAmount = parseFloat(amountSpent);
    const parsedPrice = parseFloat(value);
    if (!isNaN(parsedAmount) && !isNaN(parsedPrice) && parsedPrice > 0) {
      setGoldAmount((parsedAmount / parsedPrice).toFixed(4));
    } else {
      setGoldAmount("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !pricePerGram || !amountSpent || !goldAmount) {
      toast.error("Harap lengkapi semua kolom.");
      return;
    }

    const parsedPricePerGram = parseFloat(pricePerGram);
    const parsedAmountSpent = parseFloat(amountSpent);
    const parsedGoldAmount = parseFloat(goldAmount);

    if (isNaN(parsedPricePerGram) || isNaN(parsedAmountSpent) || isNaN(parsedGoldAmount) || parsedPricePerGram <= 0 || parsedAmountSpent <= 0 || parsedGoldAmount <= 0) {
      toast.error("Nilai input tidak valid. Pastikan angka positif.");
      return;
    }

    if (parsedAmountSpent > cashBalance) {
      toast.error("Saldo kas tidak cukup untuk pembelian ini.");
      return;
    }

    addTransaction({
      date: format(date, "yyyy-MM-dd"),
      pricePerGram: parsedPricePerGram,
      amountSpent: parsedAmountSpent,
      goldAmount: parsedGoldAmount,
    });

    // Reset form
    setDate(new Date());
    setPricePerGram("");
    setAmountSpent("");
    setGoldAmount("");
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
              <Label htmlFor="amountSpent">Jumlah Uang yang Dibelanjakan (Rp)</Label>
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