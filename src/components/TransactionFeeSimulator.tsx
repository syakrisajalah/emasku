"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calculator } from "lucide-react";

export const TransactionFeeSimulator = () => {
  const [amountToInvest, setAmountToInvest] = useState<string>("");
  const [simulatedFee, setSimulatedFee] = useState<number | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);
  };

  const calculateFee = (amount: number): number => {
    // --- LOGIKA SIMULASI BIAYA TRANSAKSI ANDA DI SINI ---
    // Ini adalah contoh. Anda perlu menyesuaikannya dengan kebijakan bank Anda.
    // Contoh 1: Biaya tetap
    // return 5000; // Rp 5.000 untuk setiap transaksi

    // Contoh 2: Biaya persentase (misal 0.1% dari jumlah investasi)
    // return amount * 0.001;

    // Contoh 3: Biaya bertingkat (misal, Rp 5.000 untuk < Rp 1jt, 0.1% untuk >= Rp 1jt)
    if (amount <= 1000000) {
      return 5000;
    } else {
      return amount * 0.001; // 0.1%
    }
    // --- AKHIR LOGIKA SIMULASI ---
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmountToInvest(e.target.value);
    setSimulatedFee(null); // Reset fee when amount changes
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountToInvest);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Jumlah investasi tidak valid. Harap masukkan angka positif.");
      return;
    }

    const fee = calculateFee(parsedAmount);
    setSimulatedFee(fee);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Simulasi Biaya Transaksi</CardTitle>
        <CardDescription>
          Perkirakan biaya transaksi berdasarkan jumlah uang yang ingin Anda investasikan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="investAmount">Jumlah Uang yang Ingin Diinvestasikan (Rp)</Label>
            <Input
              id="investAmount"
              type="number"
              placeholder="Contoh: 1000000"
              value={amountToInvest}
              onChange={handleAmountChange}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            <Calculator className="mr-2 h-4 w-4" /> Hitung Biaya
          </Button>
        </form>
        {simulatedFee !== null && (
          <div className="mt-4 p-3 bg-muted rounded-md text-center">
            <p className="text-sm text-muted-foreground">Perkiraan Biaya Transaksi:</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(simulatedFee)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              *Ini adalah simulasi. Sesuaikan logika di `src/components/TransactionFeeSimulator.tsx`
              agar sesuai dengan kebijakan bank Anda.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};