"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, PlusCircle, TrendingUp, Wallet } from "lucide-react"; // Added Wallet icon

const Header = () => {
  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <nav className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          EmasKu
        </Link>
        <div className="flex space-x-4">
          <Button asChild variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" /> Dashboard
            </Link>
          </Button>
          <Button asChild variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">
            <Link to="/add-transaction">
              <PlusCircle className="mr-2 h-4 w-4" /> Beli Emas
            </Link>
          </Button>
          <Button asChild variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">
            <Link to="/price-tracker">
              <TrendingUp className="mr-2 h-4 w-4" /> Harga & Rekomendasi
            </Link>
          </Button>
          <Button asChild variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">
            <Link to="/add-cash">
              <Wallet className="mr-2 h-4 w-4" /> Tambah Saldo
            </Link>
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Header;