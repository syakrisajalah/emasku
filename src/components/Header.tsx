"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, PlusCircle, TrendingUp, Wallet, Menu } from "lucide-react"; // Added Menu icon
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // Import Sheet components
import { useIsMobile } from "@/hooks/use-mobile"; // Import useIsMobile hook

const Header = () => {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false); // State to manage sheet open/close

  const NavLinks = () => (
    <>
      <Button asChild variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 w-full justify-start" onClick={() => setIsSheetOpen(false)}>
        <Link to="/">
          <Home className="mr-2 h-4 w-4" /> Dashboard
        </Link>
      </Button>
      <Button asChild variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 w-full justify-start" onClick={() => setIsSheetOpen(false)}>
        <Link to="/add-transaction">
          <PlusCircle className="mr-2 h-4 w-4" /> Beli Emas
        </Link>
      </Button>
      <Button asChild variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 w-full justify-start" onClick={() => setIsSheetOpen(false)}>
        <Link to="/price-tracker">
          <TrendingUp className="mr-2 h-4 w-4" /> Harga & Rekomendasi
        </Link>
      </Button>
      <Button asChild variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 w-full justify-start" onClick={() => setIsSheetOpen(false)}>
        <Link to="/add-cash">
          <Wallet className="mr-2 h-4 w-4" /> Tambah Saldo
        </Link>
      </Button>
    </>
  );

  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <nav className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          EmasKu
        </Link>
        {isMobile ? (
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px] bg-primary text-primary-foreground p-4">
              <div className="flex flex-col space-y-2 mt-6">
                <NavLinks />
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="flex space-x-4">
            <NavLinks />
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;