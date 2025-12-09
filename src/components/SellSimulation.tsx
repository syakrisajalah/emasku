"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calculator } from "lucide-react";
import { useInvestment } from "@/context/InvestmentContext";

export const SellSimulation = () => {
  const { totalGold, getAverageBuyPrice } = useInvestment();
  const [targetSellPriceInput, setTargetSellPriceInput] = useState<string>("");
  const [simulatedProfitLoss, setSimulatedProfitLoss] = useState<number | null>(null);
  const [simulatedSellingValue, setSimulatedSellingValue] = useState<number | null>(null);

  const averageBuyPrice = getAverageBuyPrice();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);
  };

  const handleTargetSellPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTargetSellPriceInput(e.target.value);
    setSimulatedProfitLoss(null); // Reset simulation when input changes
    setSimulatedSellingValue(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTargetSellPrice = parseFloat(targetSellPriceInput);

    if (isNaN(parsedTargetSellPrice) || parsedTargetSellPrice <= 0) {
      toast.error("Harga jual target tidak valid. Harap masukkan angka positif.");
      return;
    }

    if (totalGold === 0) {
      toast.info("Anda belum memiliki emas untuk disimulasikan penjualannya.");
      return;
    }

    const potentialSellingValue = totalGold * parsedTargetSellPrice;
    const totalInvestedCost = totalGold * averageBuyPrice; // Use average buy price to calculate total invested cost for profit/loss
    const profitLoss = potentialSellingValue - totalInvestedCost;

    setSimulatedSellingValue(potentialSellingValue);
    setSimulatedProfitLoss(profitLoss);
    toast.success("Simulasi penjualan berhasil dihitung!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Simulasi Penjualan Emas</CardTitle>
        <CardDescription>
          Perkirakan potensi keuntungan atau kerugian jika Anda menjual emas Anda pada harga tertentu.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="targetSellPrice">Harga Jual Target per Gram (Rp)</Label>
            <Input
              id="targetSellPrice"
              type="number"
              placeholder="Contoh: 2500000"
              value={targetSellPriceInput}
              onChange={handleTargetSellPriceChange}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            <Calculator className="mr-2 h-4 w-4" /> Hitung Simulasi
          </Button>
        </form>
        {simulatedProfitLoss !== null && simulatedSellingValue !== null && (
          <div className="mt-4 p-3 bg-muted rounded-md text-center space-y-2">
            <p className="text-sm text-muted-foreground">Jumlah Emas Anda:{" "}
              <span className="font-bold text-foreground">
                {new Intl.NumberFormat("id-ID", { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(totalGold)} gr
              </span>
            </p>
            <p className="text-sm text-muted-foreground">Potensi Nilai Jual:</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(simulatedSellingValue)}</p>
            <p className="text-sm text-muted-foreground">Potensi Keuntungan/Kerugian:</p>
            <p className={`text-xl font-bold ${simulatedProfitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(simulatedProfitLoss)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              *Perhitungan ini berdasarkan total emas Anda dan rata-rata harga beli.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};