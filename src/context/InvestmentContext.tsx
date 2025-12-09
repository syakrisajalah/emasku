"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: "buy" | "sell"; // For now, only 'buy'
  pricePerGram: number;
  amountSpent: number; // For buy transactions (cost of gold itself)
  goldAmount: number; // In grams
  transactionFee?: number; // New: Optional transaction fee
}

interface InvestmentState {
  cashBalance: number;
  totalGold: number; // In grams
  transactions: Transaction[];
  latestBuyPrice: number; // Latest buy price per gram from bank
  latestSellPrice: number; // Latest sell price per gram from bank
}

interface InvestmentContextType extends InvestmentState {
  addTransaction: (transaction: Omit<Transaction, "id" | "type"> & { transactionFee?: number }) => void;
  updateTransaction: (transactionId: string, updatedFields: Partial<Omit<Transaction, "id" | "type"> & { transactionFee?: number }>) => void; // New: Update transaction
  updateLatestGoldPrices: (buyPrice: number, sellPrice: number) => void;
  getAverageBuyPrice: () => number;
  addCash: (amount: number) => void;
}

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

const initialInvestmentState: InvestmentState = {
  cashBalance: 950000, // Saldo awal
  totalGold: 0,
  transactions: [],
  latestBuyPrice: 0, // Will be updated by user
  latestSellPrice: 0, // Will be updated by user
};

export const InvestmentProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<InvestmentState>(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("goldInvestmentState");
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        // Ensure transactions have 'id', 'type', and 'transactionFee'
        const transactionsWithDefaults = parsedState.transactions.map((t: Transaction) => ({
          ...t,
          id: t.id || crypto.randomUUID(),
          type: t.type || "buy",
          transactionFee: t.transactionFee || 0, // Default to 0 if not present
        }));
        return { 
          ...parsedState, 
          transactions: transactionsWithDefaults,
          // Handle migration from single latestGoldPrice to separate buy/sell prices
          latestBuyPrice: parsedState.latestBuyPrice || parsedState.latestGoldPrice || 0,
          latestSellPrice: parsedState.latestSellPrice || parsedState.latestGoldPrice || 0,
        };
      }
    }
    return initialInvestmentState;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("goldInvestmentState", JSON.stringify(state));
    }
  }, [state]);

  // Initialize with user's provided transactions if not already present
  useEffect(() => {
    if (state.transactions.length === 0 && state.cashBalance === 950000) {
      const initialTransactions: Transaction[] = [
        {
          id: crypto.randomUUID(),
          date: "2025-12-09",
          type: "buy",
          pricePerGram: 2448000,
          amountSpent: 150000,
          goldAmount: 0.0613,
          transactionFee: 0, // Added default fee
        },
        {
          id: crypto.randomUUID(),
          date: "2025-12-09",
          type: "buy",
          pricePerGram: 2442000,
          amountSpent: 200000,
          goldAmount: 0.0819,
          transactionFee: 0, // Added default fee
        },
      ];

      let newCashBalance = initialInvestmentState.cashBalance;
      let newTotalGold = 0;

      initialTransactions.forEach(tx => {
        newCashBalance -= (tx.amountSpent + (tx.transactionFee || 0)); // Deduct fee from cash balance
        newTotalGold += tx.goldAmount;
      });

      setState(prevState => ({
        ...prevState,
        cashBalance: newCashBalance,
        totalGold: newTotalGold,
        transactions: initialTransactions,
      }));
    }
  }, [state.transactions.length, state.cashBalance]);


  const addTransaction = (newTransaction: Omit<Transaction, "id" | "type"> & { transactionFee?: number }) => {
    const totalCost = newTransaction.amountSpent + (newTransaction.transactionFee || 0);
    if (state.cashBalance < totalCost) {
      toast.error("Saldo kas tidak cukup untuk melakukan pembelian ini (termasuk biaya transaksi).");
      return;
    }

    const transactionWithId: Transaction = {
      ...newTransaction,
      id: crypto.randomUUID(),
      type: "buy",
      transactionFee: newTransaction.transactionFee || 0,
    };

    setState(prevState => ({
      ...prevState,
      cashBalance: prevState.cashBalance - totalCost, // Deduct total cost including fee
      totalGold: prevState.totalGold + transactionWithId.goldAmount,
      transactions: [...prevState.transactions, transactionWithId],
    }));
    toast.success("Transaksi pembelian emas berhasil ditambahkan!");
  };

  const updateTransaction = (transactionId: string, updatedFields: Partial<Omit<Transaction, "id" | "type"> & { transactionFee?: number }>) => {
    setState(prevState => {
      const transactionIndex = prevState.transactions.findIndex(tx => tx.id === transactionId);
      if (transactionIndex === -1) {
        toast.error("Transaksi tidak ditemukan.");
        return prevState;
      }

      const oldTransaction = prevState.transactions[transactionIndex];
      const newTransaction = { ...oldTransaction, ...updatedFields };

      // Calculate old and new total costs (amountSpent + transactionFee)
      const oldTotalCost = oldTransaction.amountSpent + (oldTransaction.transactionFee || 0);
      const newTotalCost = newTransaction.amountSpent + (newTransaction.transactionFee || 0);

      // Calculate changes in cash balance and gold amount
      const cashBalanceChange = oldTotalCost - newTotalCost; // If new cost is higher, cashBalanceChange will be negative
      const goldAmountChange = newTransaction.goldAmount - oldTransaction.goldAmount;

      // Check if cash balance is sufficient for the change
      if (prevState.cashBalance + cashBalanceChange < 0) {
        toast.error("Saldo kas tidak cukup untuk perubahan transaksi ini.");
        return prevState;
      }

      const updatedTransactions = [...prevState.transactions];
      updatedTransactions[transactionIndex] = newTransaction;

      toast.success("Transaksi berhasil diperbarui!");
      return {
        ...prevState,
        cashBalance: prevState.cashBalance + cashBalanceChange,
        totalGold: prevState.totalGold + goldAmountChange,
        transactions: updatedTransactions,
      };
    });
  };

  const updateLatestGoldPrices = (buyPrice: number, sellPrice: number) => {
    setState(prevState => ({
      ...prevState,
      latestBuyPrice: buyPrice,
      latestSellPrice: sellPrice,
    }));
    toast.success("Harga emas terbaru berhasil diperbarui!");
  };

  const getAverageBuyPrice = () => {
    if (state.transactions.length === 0) return 0;
    const totalSpentIncludingFees = state.transactions.reduce((sum, tx) => sum + tx.amountSpent + (tx.transactionFee || 0), 0);
    const totalGoldBought = state.transactions.reduce((sum, tx) => sum + tx.goldAmount, 0);
    return totalGoldBought > 0 ? totalSpentIncludingFees / totalGoldBought : 0;
  };

  const addCash = (amount: number) => {
    setState(prevState => ({
      ...prevState,
      cashBalance: prevState.cashBalance + amount,
    }));
    toast.success(`Rp ${new Intl.NumberFormat("id-ID").format(amount)} berhasil ditambahkan ke saldo kas.`);
  };

  return (
    <InvestmentContext.Provider
      value={{
        ...state,
        addTransaction,
        updateTransaction, // Provide the new function
        updateLatestGoldPrices,
        getAverageBuyPrice,
        addCash,
      }}
    >
      {children}
    </InvestmentContext.Provider>
  );
};

export const useInvestment = () => {
  const context = useContext(InvestmentContext);
  if (context === undefined) {
    throw new Error("useInvestment must be used within an InvestmentProvider");
  }
  return context;
};