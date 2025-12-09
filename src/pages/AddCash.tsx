"use client";

import React, { useState } from "react";
import { useInvestment } from "@/context/InvestmentContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const AddCash = () => {
  const { addCash } = useInvestment();
  const [amount, setAmount] = useState<string>("");
  const navigate = useNavigate();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Jumlah tidak valid. Harap masukkan angka positif.");
      return;
    }

    addCash(parsedAmount);
    setAmount(""); // Reset form
    navigate("/"); // Redirect to dashboard after adding cash
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Tambah Saldo Kas</CardTitle>
          <CardDescription>Masukkan jumlah uang yang ingin Anda tambahkan ke saldo kas.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">Jumlah Uang (Rp)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Contoh: 500000"
                value={amount}
                onChange={handleAmountChange}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Tambahkan Saldo
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddCash;