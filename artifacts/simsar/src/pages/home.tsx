import { useState } from "react";
import { useLocation } from "wouter";
import { Search, MapPin, Building2, Users, Star, ArrowLeft, Sparkles, Shield, TrendingUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PropertyCard } from "@/components/PropertyCard";
import {
  useListFeaturedProperties,
  useGetPropertyStats,
  useGetCityDistribution,
  useGetRecentActivity,
} from "@workspace/api-client-react";

const CITIES = ["برلين", "ميونخ", "هامبورغ", "فرانكفورت", "كولونيا", "شتوتغارت"];
const CITY_MAP: Record<string, string> = {
  "برلين": "Berlin", "ميونخ": "Munich", "هامبورغ": "Hamburg",
  "فرانكفورت": "Frankfurt", "كولونيا": "Cologne", "شتوتغارت": "Stuttgart"
};
const CITY_IMAGES: Record<string, string> = {
  Berlin: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=400&q=80",
  Munich: "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=400&q=80",
  Hamburg: "https://images.unsplash.com/photo-1574240796261-e04d04a2b3a4?w=400&q=80",
  Frankfurt: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&q=80",
  Cologne: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80",
  Stuttgart: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&q=80",
};

export default function Home() {
  const [, navigate] = useLocation();
  const [searchCity, setSearchCity] = useState("");
  const [searchType, setSearchType] = useState("");
  const [searchMax, setSearchMax] = useState("");

  const { data: featured } = useListFeaturedProperties();
  const { data: stats } = useGetPropertyStats();
  const { data: cityDist } = useGetCityDistribution();
  const { data: activity } = useGetRecentActivity();

  function handleSearch() {
    const params = new URLSearchParams();
    if (searchCity) params.set("city", CITY_MAP[searchCity] || searchCity);
    if (searchType) params.set("type", searchType);
    if (searchMax) params.set("maxRent", searchMax);
    navigate(`/properties?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary via-transparent to-transparent" />
        </div>
        <div className="container mx-auto px-4 py-16 lg:py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-secondary/20 text-secondary border-secondary/30 text-sm">
              أول منصة عقارية عربية في أوروبا
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold mb-4 leading-tight">
              ابحث عن منزل أحلامك
              <span className="block text-secondary">في أوروبا</span>
            </h1>
            <p className="text-lg opacity-80 mb-8">
              نربطك بأفضل العقارات في ألمانيا مع دعم كامل باللغة العربية. أكثر من {stats?.totalListings?.toLocaleString() || "500"} عقار متاح الآن.
            </p>

            {/* Search box */}
            <div className="bg-card text-foreground rounded-2xl p-4 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Select onValueChange={setSearchCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المدينة" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select onValueChange={setSearchType}>
                  <SelectTrigger>
                    <SelectValue placeholder="نوع العقار" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">شقة</SelectItem>
                    <SelectItem value="house">بيت</SelectItem>
                    <SelectItem value="room">غرفة</SelectItem>
                    <SelectItem value="studio">ستوديو</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="أقصى إيجار (€)"
                  value={searchMax}
                  onChange={e => setSearchMax(e.target.value)}
                  className="bg-card"
                />
                <Button onClick={handleSearch} className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  <Search className="w-4 h-4" />
                  بحث
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="border-b bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">{stats.totalListings?.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">عقار متاح</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">{stats.citiesCount}</div>
                <div className="text-sm text-muted-foreground">مدينة</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">{stats.avgRent?.toLocaleString()}€</div>
                <div className="text-sm text-muted-foreground">متوسط الإيجار</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">{stats.newThisWeek}</div>
                <div className="text-sm text-muted-foreground">جديد هذا الأسبوع</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="container mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">تصفح حسب النوع</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { type: "apartment", label: "شقق", icon: "🏢", count: "245+" },
            { type: "house", label: "بيوت", icon: "🏠", count: "82+" },
            { type: "room", label: "غرف", icon: "🛏", count: "134+" },
            { type: "studio", label: "ستوديو", icon: "🏗", count: "67+" },
          ].map(cat => (
            <button
              key={cat.type}
              onClick={() => navigate(`/properties?type=${cat.type}`)}
              className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary hover:shadow-md transition-all group"
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="font-semibold text-foreground">{cat.label}</div>
              <div className="text-sm text-muted-foreground">{cat.count} عقار</div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured && featured.length > 0 && (
        <section className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">عقارات مميزة</h2>
              <p className="text-muted-foreground text-sm">اختيارات المحررين لأفضل العروض</p>
            </div>
            <Button variant="ghost" onClick={() => navigate("/properties?featured=true")} className="gap-1">
              عرض الكل <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.slice(0, 6).map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        </section>
      )}

      {/* Cities */}
      {cityDist && cityDist.length > 0 && (
        <section className="container mx-auto px-4 py-10 border-t">
          <h2 className="text-2xl font-bold mb-6">المدن المتاحة</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {cityDist.slice(0, 6).map(city => (
              <button
                key={city.city}
                onClick={() => navigate(`/properties?city=${city.city}`)}
                className="group relative rounded-xl overflow-hidden h-32 hover:shadow-lg transition-shadow"
              >
                <img
                  src={CITY_IMAGES[city.city] || "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&q=80"}
                  alt={city.city}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-2 right-0 left-0 text-center text-white">
                  <div className="font-bold text-sm">{city.city}</div>
                  <div className="text-xs opacity-80">{city.count} عقار</div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="bg-primary/5 border-y">
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-center mb-8">لماذا سمسار؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Sparkles className="w-6 h-6 text-secondary" />, title: "ذكاء اصطناعي", desc: "نظام ذكي يقترح العقارات المناسبة بناءً على احتياجاتك" },
              { icon: <Shield className="w-6 h-6 text-green-500" />, title: "عقارات موثوقة", desc: "نتحقق من كل إعلان لضمان أمانك وسلامة معلوماتك" },
              { icon: <Users className="w-6 h-6 text-blue-500" />, title: "مجتمع عربي", desc: "تواصل مع أكبر مجتمع عربي عقاري في أوروبا" },
            ].map((f, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6 text-center">
                <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">{f.icon}</div>
                <h3 className="font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI assistant CTA */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-gradient-to-l from-primary to-primary/80 rounded-2xl p-8 text-primary-foreground text-center">
          <Sparkles className="w-10 h-10 mx-auto mb-3 text-secondary" />
          <h2 className="text-2xl font-bold mb-2">جرب المساعد الذكي</h2>
          <p className="opacity-80 mb-6">أخبرنا عن احتياجاتك وسنجد لك العقار المثالي في دقائق</p>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate("/ai-assistant")}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            ابدأ الآن
          </Button>
        </div>
      </section>

      {/* Recent Activity */}
      {activity && activity.length > 0 && (
        <section className="container mx-auto px-4 pb-12">
          <h2 className="text-xl font-bold mb-4">آخر النشاطات</h2>
          <div className="space-y-2">
            {activity.slice(0, 4).map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3 text-sm">
                <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-foreground">{item.descriptionAr}</span>
                <span className="text-muted-foreground text-xs mr-auto">
                  {new Date(item.createdAt).toLocaleDateString("ar")}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
