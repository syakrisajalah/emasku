"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "./SessionContext"; // Import useSession

interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: "buy" | "sell"; // For now, only 'buy'
  price_per_gram: number; // Changed to match DB column name
  amount_spent: number; // Changed to match DB column name
  gold_amount: number; // In grams, changed to match DB column name
  transaction_fee?: number; // Optional transaction fee, changed to match DB column name
}

interface Profile {
  id: string;
  cash_balance: number; // Changed to match DB column name
  latest_buy_price: number; // Changed to match DB column name
  latest_sell_price: number; // Changed to match DB column name
}

interface InvestmentState {
  cashBalance: number;
  totalGold: number; // Derived from transactions
  transactions: Transaction[];
  latestBuyPrice: number;
  latestSellPrice: number;
  isLoading: boolean; // New loading state
}

interface InvestmentContextType extends InvestmentState {
  addTransaction: (transaction: Omit<Transaction, "id" | "type"> & { transactionFee?: number }) => Promise<void>;
  updateTransaction: (transactionId: string, updatedFields: Partial<Omit<Transaction, "id" | "type"> & { transactionFee?: number }>) => Promise<void>;
  updateLatestGoldPrices: (buyPrice: number, sellPrice: number) => Promise<void>;
  getAverageBuyPrice: () => number;
  addCash: (amount: number) => Promise<void>;
}

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

export const InvestmentProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading: isSessionLoading } = useSession();
  const [state, setState] = useState<InvestmentState>({
    cashBalance: 0,
    totalGold: 0,
    transactions: [],
    latestBuyPrice: 0,
    latestSellPrice: 0,
    isLoading: true,
  });

  const fetchInvestmentData = useCallback(async () => {
    if (!user) {
      setState(prevState => ({ ...prevState, isLoading: false }));
      return;
    }

    setState(prevState => ({ ...prevState, isLoading: true }));

    // Fetch profile data
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("cash_balance, latest_buy_price, latest_sell_price")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      toast.error("Gagal memuat data profil.");
      // If profile not found, it might be a new user, Supabase trigger should handle initial creation
      // For now, we'll just set defaults if not found
      if (profileError.code === 'PGRST116') { // No rows found
        setState(prevState => ({
          ...prevState,
          cashBalance: 950000, // Default initial cash
          latestBuyPrice: 0,
          latestSellPrice: 0,
        }));
      }
    }

    // Fetch transactions
    const { data: transactionsData, error: transactionsError } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (transactionsError) {
      console.error("Error fetching transactions:", transactionsError);
      toast.error("Gagal memuat transaksi.");
    }

    let totalGoldCalculated = 0;
    if (transactionsData) {
      totalGoldCalculated = transactionsData.reduce((sum, tx) => sum + tx.gold_amount, 0);
    }

    setState(prevState => ({
      ...prevState,
      cashBalance: profileData?.cash_balance || 0,
      latestBuyPrice: profileData?.latest_buy_price || 0,
      latestSellPrice: profileData?.latest_sell_price || 0,
      transactions: transactionsData || [],
      totalGold: totalGoldCalculated,
      isLoading: false,
    }));
  }, [user]);

  useEffect(() => {
    if (!isSessionLoading) {
      fetchInvestmentData();
    }
  }, [user, isSessionLoading, fetchInvestmentData]);

  const addTransaction = async (newTransaction: Omit<Transaction, "id" | "type"> & { transactionFee?: number }) => {
    if (!user) {
      toast.error("Anda harus masuk untuk menambahkan transaksi.");
      return;
    }

    const totalCost = newTransaction.amount_spent + (newTransaction.transaction_fee || 0);
    if (state.cashBalance < totalCost) {
      toast.error("Saldo kas tidak cukup untuk melakukan pembelian ini (termasuk biaya transaksi).");
      return;
    }

    const transactionToInsert = {
      user_id: user.id,
      date: newTransaction.date,
      type: "buy",
      price_per_gram: newTransaction.price_per_gram,
      amount_spent: newTransaction.amount_spent,
      gold_amount: newTransaction.gold_amount,
      transaction_fee: newTransaction.transaction_fee || 0,
    };

    const { data, error } = await supabase
      .from("transactions")
      .insert([transactionToInsert])
      .select()
      .single();

    if (error) {
      console.error("Error adding transaction:", error);
      toast.error("Gagal menambahkan transaksi.");
      return;
    }

    // Update cash balance in profile
    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({ cash_balance: state.cashBalance - totalCost, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (profileUpdateError) {
      console.error("Error updating profile cash balance:", profileUpdateError);
      toast.error("Gagal memperbarui saldo kas.");
      // Potentially revert transaction if profile update fails
      return;
    }

    setState(prevState => ({
      ...prevState,
      cashBalance: prevState.cashBalance - totalCost,
      totalGold: prevState.totalGold + data.gold_amount,
      transactions: [data, ...prevState.transactions], // Add new transaction to the beginning
    }));
    toast.success("Transaksi pembelian emas berhasil ditambahkan!");
  };

  const updateTransaction = async (transactionId: string, updatedFields: Partial<Omit<Transaction, "id" | "type"> & { transactionFee?: number }>) => {
    if (!user) {
      toast.error("Anda harus masuk untuk memperbarui transaksi.");
      return;
    }

    const oldTransaction = state.transactions.find(tx => tx.id === transactionId);
    if (!oldTransaction) {
      toast.error("Transaksi tidak ditemukan.");
      return;
    }

    const newTransaction = {
      ...oldTransaction,
      ...updatedFields,
      price_per_gram: updatedFields.pricePerGram ?? oldTransaction.price_per_gram,
      amount_spent: updatedFields.amountSpent ?? oldTransaction.amount_spent,
      gold_amount: updatedFields.goldAmount ?? oldTransaction.gold_amount,
      transaction_fee: updatedFields.transactionFee ?? oldTransaction.transaction_fee,
    };

    // Calculate old and new total costs (amountSpent + transactionFee)
    const oldTotalCost = oldTransaction.amount_spent + (oldTransaction.transaction_fee || 0);
    const newTotalCost = newTransaction.amount_spent + (newTransaction.transaction_fee || 0);

    // Calculate changes in cash balance and gold amount
    const cashBalanceChange = oldTotalCost - newTotalCost; // If new cost is higher, cashBalanceChange will be negative
    const goldAmountChange = newTransaction.gold_amount - oldTransaction.gold_amount;

    // Check if cash balance is sufficient for the change
    if (state.cashBalance + cashBalanceChange < 0) {
      toast.error("Saldo kas tidak cukup untuk perubahan transaksi ini.");
      return;
    }

    const { data, error } = await supabase
      .from("transactions")
      .update({
        date: newTransaction.date,
        price_per_gram: newTransaction.price_per_gram,
        amount_spent: newTransaction.amount_spent,
        gold_amount: newTransaction.gold_amount,
        transaction_fee: newTransaction.transaction_fee,
      })
      .eq("id", transactionId)
      .select()
      .single();

    if (error) {
      console.error("Error updating transaction:", error);
      toast.error("Gagal memperbarui transaksi.");
      return;
    }

    // Update cash balance in profile
    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({ cash_balance: state.cashBalance + cashBalanceChange, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (profileUpdateError) {
      console.error("Error updating profile cash balance:", profileUpdateError);
      toast.error("Gagal memperbarui saldo kas.");
      return;
    }

    setState(prevState => ({
      ...prevState,
      cashBalance: prevState.cashBalance + cashBalanceChange,
      totalGold: prevState.totalGold + goldAmountChange,
      transactions: prevState.transactions.map(tx => (tx.id === transactionId ? data : tx)),
    }));
    toast.success("Transaksi berhasil diperbarui!");
  };

  const updateLatestGoldPrices = async (buyPrice: number, sellPrice: number) => {
    if (!user) {
      toast.error("Anda harus masuk untuk memperbarui harga emas.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        latest_buy_price: buyPrice,
        latest_sell_price: sellPrice,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating gold prices:", error);
      toast.error("Gagal memperbarui harga emas terbaru.");
      return;
    }

    setState(prevState => ({
      ...prevState,
      latestBuyPrice: buyPrice,
      latestSellPrice: sellPrice,
    }));
    toast.success("Harga emas terbaru berhasil diperbarui!");
  };

  const getAverageBuyPrice = () => {
    if (state.transactions.length === 0) return 0;
    const totalSpentIncludingFees = state.transactions.reduce((sum, tx) => sum + tx.amount_spent + (tx.transaction_fee || 0), 0);
    const totalGoldBought = state.transactions.reduce((sum, tx) => sum + tx.gold_amount, 0);
    return totalGoldBought > 0 ? totalSpentIncludingFees / totalGoldBought : 0;
  };

  const addCash = async (amount: number) => {
    if (!user) {
      toast.error("Anda harus masuk untuk menambahkan saldo kas.");
      return;
    }

    const newCashBalance = state.cashBalance + amount;
    const { error } = await supabase
      .from("profiles")
      .update({ cash_balance: newCashBalance, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) {
      console.error("Error adding cash:", error);
      toast.error("Gagal menambahkan saldo kas.");
      return;
    }

    setState(prevState => ({
      ...prevState,
      cashBalance: newCashBalance,
    }));
    toast.success(`Rp ${new Intl.NumberFormat("id-ID").format(amount)} berhasil ditambahkan ke saldo kas.`);
  };

  return (
    <InvestmentContext.Provider
      value={{
        ...state,
        addTransaction,
        updateTransaction,
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