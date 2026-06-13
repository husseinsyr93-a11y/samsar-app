import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { SlidersHorizontal, Grid3X3, List, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { PropertyCard } from "@/components/PropertyCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useListProperties, getListPropertiesQueryKey } from "@workspace/api-client-react";

const CITIES = ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart"];
const CITY_AR: Record<string, string> = {
  Berlin: "برلين", Munich: "ميونخ", Hamburg: "هامبورغ",
  Frankfurt: "فرانكفورت", Cologne: "كولونيا", Stuttgart: "شتوتغارت"
};

export default function Properties() {
  const [location] = useLocation();
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");

  const [city, setCity] = useState(params.get("city") || "");
  const [type, setType] = useState(params.get("type") || "");
  const [maxRent, setMaxRent] = useState<number>(parseInt(params.get("maxRent") || "5000"));
  const [rooms, setRooms] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const queryParams = {
    city: city || undefined,
    type: type || undefined,
    maxRent: maxRent < 5000 ? maxRent : undefined,
    rooms: rooms ? parseInt(rooms) : undefined,
    page,
    limit: 12,
  };

  const { data, isLoading } = useListProperties(queryParams, {
    query: { queryKey: getListPropertiesQueryKey(queryParams) }
  });

  const activeFilters = [city, type, maxRent < 5000 ? `≤${maxRent}€` : ""].filter(Boolean);

  function clearFilters() {
    setCity("");
    setType("");
    setMaxRent(5000);
    setRooms("");
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold">العقارات المتاحة</h1>
              {data && (
                <p className="text-sm text-muted-foreground">{data.total.toLocaleString()} عقار</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeFilters.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {activeFilters.map((f, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>
                  ))}
                  <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                    <X className="w-3 h-3" /> مسح
                  </button>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-1.5">
                <SlidersHorizontal className="w-4 h-4" />
                فلترة
              </Button>
              <div className="flex border border-border rounded-md overflow-hidden">
                <button onClick={() => setViewMode("grid")} className={`p-1.5 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}>
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode("list")} className={`p-1.5 ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}>
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">المدينة</Label>
                <Select value={city} onValueChange={v => { setCity(v === "all" ? "" : v); setPage(1); }}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="الكل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    {CITIES.map(c => <SelectItem key={c} value={c}>{CITY_AR[c] || c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">النوع</Label>
                <Select value={type} onValueChange={v => { setType(v === "all" ? "" : v); setPage(1); }}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="الكل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="apartment">شقة</SelectItem>
                    <SelectItem value="house">بيت</SelectItem>
                    <SelectItem value="room">غرفة</SelectItem>
                    <SelectItem value="studio">ستوديو</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">عدد الغرف (الحد الأدنى)</Label>
                <Select value={rooms} onValueChange={v => { setRooms(v === "all" ? "" : v); setPage(1); }}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="الكل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">أقصى إيجار: {maxRent}€</Label>
                <Slider
                  min={300}
                  max={5000}
                  step={50}
                  value={[maxRent]}
                  onValueChange={([v]) => { setMaxRent(v); setPage(1); }}
                  className="mt-2"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        ) : !data?.items?.length ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏠</div>
            <h3 className="text-lg font-semibold mb-2">لا توجد نتائج</h3>
            <p className="text-muted-foreground mb-4">جرب تغيير فلاتر البحث</p>
            <Button variant="outline" onClick={clearFilters}>مسح الفلاتر</Button>
          </div>
        ) : (
          <>
            <div className={`grid gap-5 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
              {data.items.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>

            {/* Pagination */}
            {data.total > 12 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>السابق</Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  صفحة {page} من {Math.ceil(data.total / 12)}
                </span>
                <Button variant="outline" disabled={page >= Math.ceil(data.total / 12)} onClick={() => setPage(p => p + 1)}>التالي</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
