"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: "buy" | "sell"; // For now, only 'buy'
  pricePerGram: number;
  amountSpent: number; // For buy transactions
  goldAmount: number; // In grams
}

interface InvestmentState {
  cashBalance: number;
  totalGold: number; // In grams
  transactions: Transaction[];
  latestGoldPrice: number; // Latest price per gram from bank
}

interface InvestmentContextType extends InvestmentState {
  addTransaction: (transaction: Omit<Transaction, "id" | "type">) => void;
  updateLatestGoldPrice: (price: number) => void;
  getAverageBuyPrice: () => number;
}

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

const initialInvestmentState: InvestmentState = {
  cashBalance: 950000, // Saldo awal
  totalGold: 0,
  transactions: [],
  latestGoldPrice: 0, // Will be updated by user
};

export const InvestmentProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<InvestmentState>(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("goldInvestmentState");
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        // Ensure transactions have 'id' and 'type'
        const transactionsWithDefaults = parsedState.transactions.map((t: Transaction) => ({
          ...t,
          id: t.id || crypto.randomUUID(),
          type: t.type || "buy",
        }));
        return { ...parsedState, transactions: transactionsWithDefaults };
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
        },
        {
          id: crypto.randomUUID(),
          date: "2025-12-09",
          type: "buy",
          pricePerGram: 2442000,
          amountSpent: 200000,
          goldAmount: 0.0819,
        },
      ];

      let newCashBalance = initialInvestmentState.cashBalance;
      let newTotalGold = 0;

      initialTransactions.forEach(tx => {
        newCashBalance -= tx.amountSpent;
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


  const addTransaction = (newTransaction: Omit<Transaction, "id" | "type">) => {
    if (state.cashBalance < newTransaction.amountSpent) {
      toast.error("Saldo kas tidak cukup untuk melakukan pembelian ini.");
      return;
    }

    const transactionWithId: Transaction = {
      ...newTransaction,
      id: crypto.randomUUID(),
      type: "buy",
    };

    setState(prevState => ({
      ...prevState,
      cashBalance: prevState.cashBalance - transactionWithId.amountSpent,
      totalGold: prevState.totalGold + transactionWithId.goldAmount,
      transactions: [...prevState.transactions, transactionWithId],
    }));
    toast.success("Transaksi pembelian emas berhasil ditambahkan!");
  };

  const updateLatestGoldPrice = (price: number) => {
    setState(prevState => ({
      ...prevState,
      latestGoldPrice: price,
    }));
    toast.success("Harga emas terbaru berhasil diperbarui!");
  };

  const getAverageBuyPrice = () => {
    if (state.transactions.length === 0) return 0;
    const totalSpent = state.transactions.reduce((sum, tx) => sum + tx.amountSpent, 0);
    const totalGoldBought = state.transactions.reduce((sum, tx) => sum + tx.goldAmount, 0);
    return totalGoldBought > 0 ? totalSpent / totalGoldBought : 0;
  };

  return (
    <InvestmentContext.Provider
      value={{
        ...state,
        addTransaction,
        updateLatestGoldPrice,
        getAverageBuyPrice,
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