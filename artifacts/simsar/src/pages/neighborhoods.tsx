import { useState } from "react";
import { Shield, Waves, Volume2, Train, Users, School, Briefcase, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useListNeighborhoods, getListNeighborhoodsQueryKey } from "@workspace/api-client-react";

const CITIES = ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart"];
const CITY_AR: Record<string, string> = {
  Berlin: "برلين", Munich: "ميونخ", Hamburg: "هامبورغ",
  Frankfurt: "فرانكفورت", Cologne: "كولونيا", Stuttgart: "شتوتغارت"
};

const ratingItems = [
  { key: "safety", label: "الأمان", icon: Shield, color: "text-green-500" },
  { key: "cleanliness", label: "النظافة", icon: Waves, color: "text-blue-500" },
  { key: "quiet", label: "الهدوء", icon: Volume2, color: "text-purple-500" },
  { key: "transport", label: "المواصلات", icon: Train, color: "text-yellow-500" },
  { key: "arabCommunity", label: "العرب في المنطقة", icon: Users, color: "text-orange-500" },
  { key: "schools", label: "المدارس", icon: School, color: "text-pink-500" },
  { key: "employment", label: "فرص العمل", icon: Briefcase, color: "text-cyan-500" },
];

export default function Neighborhoods() {
  const [city, setCity] = useState("");
  const [selected, setSelected] = useState<number | null>(null);

  const params = city ? { city } : {};
  const { data: neighborhoods, isLoading } = useListNeighborhoods(params, {
    query: { queryKey: getListNeighborhoodsQueryKey(params) }
  });

  const selectedN = neighborhoods?.find(n => n.id === selected) || neighborhoods?.[0];

  const radarData = selectedN ? ratingItems.map(item => ({
    subject: item.label,
    value: selectedN[item.key as keyof typeof selectedN] as number,
  })) : [];

  const barData = neighborhoods?.map(n => ({
    name: n.nameAr,
    score: n.overallScore,
    rent: n.avgRent,
  })) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">تقييم الأحياء</h1>
            <p className="text-muted-foreground text-sm">اكتشف أفضل الأحياء للعرب في أوروبا</p>
          </div>
          <Select value={city} onValueChange={v => setCity(v === "all" ? "" : v)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="كل المدن" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل المدن</SelectItem>
              {CITIES.map(c => <SelectItem key={c} value={c}>{CITY_AR[c]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Neighborhood list */}
            <div className="space-y-3">
              {neighborhoods?.map(n => (
                <button
                  key={n.id}
                  onClick={() => setSelected(n.id)}
                  className={`w-full text-right p-4 rounded-xl border transition-all ${(selected === n.id || (!selected && neighborhoods[0] === n)) ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card hover:border-primary/50"}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-bold">{n.nameAr}</div>
                      <div className="text-xs text-muted-foreground">{n.city}</div>
                    </div>
                    <div className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-sm font-bold">
                      <Star className="w-3 h-3 fill-primary" />
                      {n.overallScore}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-0.5">
                      <Shield className="w-3 h-3 text-green-500" /> {n.safety}
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Train className="w-3 h-3 text-blue-500" /> {n.transport}
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Users className="w-3 h-3 text-orange-500" /> {n.arabCommunity}
                    </div>
                  </div>
                  {n.avgRent && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      متوسط الإيجار: <span className="font-semibold text-foreground">{n.avgRent}€</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Detail panel */}
            {selectedN && (
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{selectedN.nameAr}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-0.5">{selectedN.city}</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="text-3xl font-bold text-primary">{selectedN.overallScore}</div>
                        <div className="text-xs text-muted-foreground">من 100</div>
                      </div>
                    </div>
                    {selectedN.descriptionAr && (
                      <p className="text-sm text-muted-foreground mt-2">{selectedN.descriptionAr}</p>
                    )}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge variant="secondary">{selectedN.propertiesCount} عقار</Badge>
                      <Badge variant="secondary">{selectedN.reviewsCount} تقييم</Badge>
                      {selectedN.avgRent && <Badge variant="secondary">متوسط: {selectedN.avgRent}€</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Rating bars */}
                    <div className="space-y-3 mb-6">
                      {ratingItems.map(item => (
                        <div key={item.key} className="flex items-center gap-3">
                          <item.icon className={`w-4 h-4 flex-shrink-0 ${item.color}`} />
                          <span className="text-sm w-32 flex-shrink-0">{item.label}</span>
                          <div className="flex-1">
                            <Progress value={selectedN[item.key as keyof typeof selectedN] as number} className="h-2" />
                          </div>
                          <span className="text-sm font-medium w-8 text-left">{selectedN[item.key as keyof typeof selectedN]}</span>
                        </div>
                      ))}
                    </div>

                    {/* Radar chart */}
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                          <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Comparison chart */}
                {barData.length > 1 && (
                  <Card>
                    <CardHeader><CardTitle className="text-base">مقارنة الأحياء</CardTitle></CardHeader>
                    <CardContent>
                      <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Bar dataKey="score" name="التقييم" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
