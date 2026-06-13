import { Link, useLocation } from "wouter";
import { Home, Building2, Heart, MessageCircle, Map, Sparkles, BarChart3, Plus, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/properties", label: "العقارات", icon: Building2 },
  { href: "/matches", label: "تطابق", icon: Sparkles },
  { href: "/favorites", label: "المفضلة", icon: Heart },
  { href: "/messages", label: "الرسائل", icon: MessageCircle },
  { href: "/neighborhoods", label: "الأحياء", icon: Map },
  { href: "/ai-assistant", label: "المساعد الذكي", icon: Sparkles },
  { href: "/admin", label: "الإدارة", icon: BarChart3 },
];

export function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary tracking-wide">سمسار</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href}>
              <span className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                location === href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}>
                {label}
              </span>
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-2">
          <Link href="/add-property">
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              أضف عقارك
            </Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button className="lg:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <span
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                  location === href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </span>
            </Link>
          ))}
          <Link href="/add-property">
            <Button size="sm" className="w-full mt-2 gap-1.5" onClick={() => setOpen(false)}>
              <Plus className="w-4 h-4" />
              أضف عقارك
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
