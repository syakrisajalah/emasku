"use client";

import React, { useState } from "react";
import { useInvestment } from "@/context/InvestmentContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TrendingUp, TrendingDown, MinusCircle } from "lucide-react";

const PriceTracker = () => {
  const { latestGoldPrice, updateLatestGoldPrice, getAverageBuyPrice, totalGold } = useInvestment();
  const [newPriceInput, setNewPriceInput] = useState<string>(latestGoldPrice > 0 ? latestGoldPrice.toString() : "");

  const averageBuyPrice = getAverageBuyPrice();

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPriceInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(newPriceInput);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error("Harga emas tidak valid. Harap masukkan angka positif.");
      return;
    }
    updateLatestGoldPrice(parsedPrice);
  };

  const getRecommendation = () => {
    if (latestGoldPrice === 0 || totalGold === 0) {
      return {
        text: "Masukkan harga emas terbaru dan lakukan pembelian untuk mendapatkan rekomendasi.",
        icon: <MinusCircle className="h-6 w-6 text-gray-500" />,
        color: "text-gray-500",
      };
    }

    const difference = latestGoldPrice - averageBuyPrice;
    const percentageDifference = (difference / averageBuyPrice) * 100;

    if (percentageDifference >= 5) { // If price is 5% or more higher than average buy price
      return {
        text: `Harga emas naik ${percentageDifference.toFixed(2)}% dari rata-rata harga beli Anda. Pertimbangkan untuk JUAL!`,
        icon: <TrendingUp className="h-6 w-6 text-green-600" />,
        color: "text-green-600",
      };
    } else if (percentageDifference <= -5) { // If price is 5% or more lower than average buy price
      return {
        text: `Harga emas turun ${Math.abs(percentageDifference).toFixed(2)}% dari rata-rata harga beli Anda. Pertimbangkan untuk BELI!`,
        icon: <TrendingDown className="h-6 w-6 text-red-600" />,
        color: "text-red-600",
      };
    } else {
      return {
        text: `Harga emas stabil (${percentageDifference.toFixed(2)}% dari rata-rata harga beli). Tahan posisi Anda.`,
        icon: <MinusCircle className="h-6 w-6 text-yellow-600" />,
        color: "text-yellow-600",
      };
    }
  };

  const recommendation = getRecommendation();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Perbarui Harga Emas Terbaru</CardTitle>
            <CardDescription>Masukkan harga emas per gram dari bank Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="latestPrice">Harga Emas Terbaru per Gram (Rp)</Label>
                <Input
                  id="latestPrice"
                  type="number"
                  placeholder="Contoh: 2500000"
                  value={newPriceInput}
                  onChange={handlePriceChange}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Perbarui Harga
              </Button>
            </form>
            {latestGoldPrice > 0 && (
              <p className="text-sm text-muted-foreground mt-4">
                Harga terakhir diperbarui: <span className="font-medium">{formatCurrency(latestGoldPrice)}/gr</span>
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Rekomendasi Investasi</CardTitle>
            <CardDescription>Berdasarkan harga emas terbaru dan riwayat pembelian Anda.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center space-y-4">
            {recommendation.icon}
            <p className={`text-lg font-semibold ${recommendation.color}`}>
              {recommendation.text}
            </p>
            {totalGold > 0 && averageBuyPrice > 0 && latestGoldPrice > 0 && (
              <div className="text-sm text-muted-foreground">
                <p>Rata-rata Harga Beli Anda: {formatCurrency(averageBuyPrice)}/gr</p>
                <p>Harga Emas Terbaru: {formatCurrency(latestGoldPrice)}/gr</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Fitur Menarik Lainnya</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">Analisis Profit/Loss:</span> Lihat keuntungan atau kerugian Anda secara real-time di Dashboard.
            </p>
            <p>
              <span className="font-semibold text-foreground">Rata-rata Harga Beli:</span> Pantau harga rata-rata Anda untuk membuat keputusan yang lebih baik.
            </p>
            <p>
              <span className="font-semibold text-foreground">Peringatan Harga (Coming Soon):</span> Dapatkan notifikasi saat harga mencapai target Anda.
            </p>
            <p>
              <span className="font-semibold text-foreground">Simulasi Penjualan (Coming Soon):</span> Hitung potensi keuntungan sebelum menjual.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PriceTracker;