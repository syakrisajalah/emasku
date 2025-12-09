"use client";

import React, { useState } from "react";
import { useInvestment } from "@/context/InvestmentContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { EditTransactionDialog } from "@/components/EditTransactionDialog";
import { useSession } from "@/context/SessionContext"; // Import useSession

interface Transaction {
  id: string;
  date: string;
  type: "buy" | "sell";
  price_per_gram: number; // Changed to snake_case
  amount_spent: number; // Changed to snake_case
  gold_amount: number; // Changed to snake_case
  transaction_fee?: number; // Changed to snake_case
}

const Dashboard = () => {
  const { cashBalance, totalGold, transactions, latestSellPrice, getAverageBuyPrice, isLoading: isInvestmentLoading } = useInvestment();
  const { isLoading: isSessionLoading } = useSession();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const averageBuyPrice = getAverageBuyPrice();
  const currentGoldValue = totalGold * latestSellPrice;
  const totalInvested = transactions.reduce((sum, tx) => sum + tx.amount_spent + (tx.transaction_fee || 0), 0); // Changed to snake_case
  const profitLoss = latestSellPrice > 0 ? currentGoldValue - totalInvested : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);
  };

  const formatGram = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(amount) + " gr";
  };

  const handleEditClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedTransaction(null);
  };

  if (isSessionLoading || isInvestmentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-gray-600 dark:text-gray-400">Memuat data investasi...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-gray-50">Ringkasan Investasi Emas Anda</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Kas</CardTitle>
              <span className="text-muted-foreground">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(cashBalance)}</div>
              <p className="text-xs text-muted-foreground">Dana tersedia untuk investasi</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Emas</CardTitle>
              <span className="text-muted-foreground">✨</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatGram(totalGold)}</div>
              <p className="text-xs text-muted-foreground">Jumlah emas yang Anda miliki</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nilai Emas Saat Ini</CardTitle>
              <span className="text-muted-foreground">📈</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestSellPrice > 0 ? formatCurrency(currentGoldValue) : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {latestSellPrice > 0 ? `Harga Jual: ${formatCurrency(latestSellPrice)}/gr` : "Perbarui harga terbaru"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rata-rata Harga Beli</CardTitle>
              <span className="text-muted-foreground">📊</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(averageBuyPrice)}/gr</div>
              <p className="text-xs text-muted-foreground">Harga rata-rata per gram saat pembelian</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investasi</CardTitle>
              <span className="text-muted-foreground">💸</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalInvested)}</div>
              <p className="text-xs text-muted-foreground">Total uang yang diinvestasikan (termasuk biaya)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Keuntungan/Kerugian</CardTitle>
              <span className="text-muted-foreground">💰</span>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(profitLoss)}
              </div>
              <p className="text-xs text-muted-foreground">Berdasarkan harga jual emas terbaru</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Riwayat Transaksi Emas</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground">Belum ada transaksi. Mulai beli emas Anda!</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead>Harga/Gram</TableHead>
                      <TableHead>Jumlah Uang</TableHead>
                      <TableHead>Biaya Transaksi</TableHead>
                      <TableHead>Jumlah Emas</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{format(new Date(tx.date), "dd MMMM yyyy", { locale: id })}</TableCell>
                        <TableCell className="capitalize">{tx.type === "buy" ? "Beli" : "Jual"}</TableCell>
                        <TableCell>{formatCurrency(tx.price_per_gram)}</TableCell>
                        <TableCell>{formatCurrency(tx.amount_spent)}</TableCell>
                        <TableCell>{formatCurrency(tx.transaction_fee || 0)}</TableCell>
                        <TableCell>{formatGram(tx.gold_amount)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(tx)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <MadeWithDyad />

      {selectedTransaction && (
        <EditTransactionDialog
          isOpen={isEditDialogOpen}
          onClose={handleCloseEditDialog}
          transaction={selectedTransaction}
        />
      )}
    </div>
  );
};

export default Dashboard;