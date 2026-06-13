import { useParams, useLocation } from "wouter";
import { MapPin, BedDouble, Maximize2, Star, Phone, Shield, Train, School, BookOpen, ShoppingCart, ChevronRight, ChevronLeft, Heart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetProperty, useGetPropertyScore, useAddFavorite, useListReviews, getGetPropertyQueryKey, getGetPropertyScoreQueryKey, getListReviewsQueryKey } from "@workspace/api-client-react";

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
];

const TYPE_AR: Record<string, string> = {
  apartment: "شقة", house: "بيت", room: "غرفة", studio: "ستوديو", office: "مكتب", commercial: "تجاري"
};

export default function PropertyDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0");
  const [, navigate] = useLocation();
  const [imgIdx, setImgIdx] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [favorited, setFavorited] = useState(false);

  const { data: property, isLoading } = useGetProperty(id, {
    query: { enabled: !!id, queryKey: getGetPropertyQueryKey(id) }
  });
  const { data: score } = useGetPropertyScore(id, {
    query: { enabled: !!id, queryKey: getGetPropertyScoreQueryKey(id) }
  });
  const { data: reviews } = useListReviews({ propertyId: id }, {
    query: { enabled: !!id, queryKey: getListReviewsQueryKey({ propertyId: id }) }
  });
  const addFavMutation = useAddFavorite();

  if (isLoading) return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-80 rounded-xl mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    </div>
  );

  if (!property) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="text-5xl mb-4">😕</div>
      <h2 className="text-xl font-bold mb-2">العقار غير موجود</h2>
      <Button onClick={() => navigate("/properties")}>العودة للقائمة</Button>
    </div>
  );

  const images = property.images?.length ? property.images : PLACEHOLDER_IMAGES;
  const scoreItems = score ? [
    { key: "price", label: "السعر", value: score.price },
    { key: "location", label: "الموقع", value: score.location },
    { key: "transport", label: "المواصلات", value: score.transport },
    { key: "safety", label: "الأمان", value: score.safety },
    { key: "schools", label: "المدارس", value: score.schools },
    { key: "internet", label: "الإنترنت", value: score.internet },
    { key: "services", label: "الخدمات", value: score.services },
  ] : [];

  function handleFavorite() {
    addFavMutation.mutate({ data: { propertyId: id } });
    setFavorited(true);
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Image Gallery */}
      <div className="relative bg-black h-72 lg:h-96 overflow-hidden">
        <img
          src={images[imgIdx]}
          alt={property.titleAr}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGES[0]; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {images.length > 1 && (
          <>
            <button onClick={() => setImgIdx(i => Math.max(0, i - 1))} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70">
              <ChevronRight className="w-5 h-5" />
            </button>
            <button onClick={() => setImgIdx(i => Math.min(images.length - 1, i + 1))} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {images.map((_, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIdx ? "bg-white scale-125" : "bg-white/50"}`} />
              ))}
            </div>
          </>
        )}
        <button onClick={() => navigate("/properties")} className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & price */}
            <div>
              <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                <h1 className="text-2xl font-bold">{property.titleAr}</h1>
                <div className="flex items-center gap-2">
                  {property.tier !== "basic" && (
                    <Badge className={property.tier === "platinum" ? "bg-purple-600 text-white" : property.tier === "gold" ? "bg-yellow-500 text-black" : "bg-blue-600 text-white"}>
                      {property.tier === "platinum" ? "بلاتيني" : property.tier === "gold" ? "ذهبي" : "مميز"}
                    </Badge>
                  )}
                  {property.isVerified && <Badge className="bg-green-500 text-white gap-1"><Shield className="w-3 h-3" /> موثق</Badge>}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground mb-4">
                <MapPin className="w-4 h-4" />
                <span>{property.address}</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-primary">{property.rent.toLocaleString()}€</span>
                <span className="text-muted-foreground">/شهر</span>
                {property.deposit && <span className="text-sm text-muted-foreground mr-4">وديعة: {property.deposit.toLocaleString()}€</span>}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <BedDouble className="w-5 h-5" />, label: "الغرف", value: `${property.rooms} غرفة` },
                { icon: <Maximize2 className="w-5 h-5" />, label: "المساحة", value: `${property.area} م²` },
                { icon: <span className="text-base">🏢</span>, label: "النوع", value: TYPE_AR[property.type] || property.type },
              ].map((s, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-3 text-center">
                  <div className="flex justify-center text-primary mb-1">{s.icon}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className="font-semibold text-sm">{s.value}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            {property.descriptionAr && (
              <Card>
                <CardHeader><CardTitle className="text-base">الوصف</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground leading-relaxed">{property.descriptionAr}</p></CardContent>
              </Card>
            )}

            {/* Amenities & Nearby */}
            <Card>
              <CardHeader><CardTitle className="text-base">المميزات والخدمات القريبة</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {property.amenities?.map((a, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{a}</Badge>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    { active: property.nearStation, icon: <Train className="w-4 h-4 text-blue-500" />, label: "محطة مواصلات" },
                    { active: property.nearSchool, icon: <School className="w-4 h-4 text-green-500" />, label: "مدرسة" },
                    { active: property.nearMosque, icon: <BookOpen className="w-4 h-4 text-yellow-600" />, label: "مسجد" },
                    { active: property.nearSupermarket, icon: <ShoppingCart className="w-4 h-4 text-orange-500" />, label: "سوبرماركت" },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-2 p-2 rounded-lg ${item.active ? "bg-green-50 dark:bg-green-950/30" : "bg-muted/40 opacity-50"}`}>
                      {item.icon}
                      <span className={item.active ? "text-foreground" : "text-muted-foreground line-through"}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Score */}
            {score && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">تقييم الذكاء الاصطناعي</CardTitle>
                    <div className="flex items-center gap-1 text-secondary font-bold text-xl">
                      <Star className="w-5 h-5 fill-secondary" />
                      {score.total}/100
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {scoreItems.map(item => (
                    <div key={item.key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-medium">{item.value}%</span>
                      </div>
                      <Progress value={item.value} className="h-1.5" />
                    </div>
                  ))}
                  {score.summary && <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">{score.summary}</p>}
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            {reviews && reviews.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">التقييمات</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {reviews.map(r => (
                    <div key={r.id} className="border-b border-border pb-3 last:border-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{r.authorName}</span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{r.content}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Contact */}
            <Card>
              <CardHeader><CardTitle className="text-base">تواصل مع المالك</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {property.ownerName && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                      {property.ownerName.charAt(0)}
                    </div>
                    <span>{property.ownerName}</span>
                  </div>
                )}
                {property.ownerPhone ? (
                  showPhone ? (
                    <div className="bg-muted rounded-lg p-3 text-center font-mono text-sm">{property.ownerPhone}</div>
                  ) : (
                    <Button className="w-full gap-2" onClick={() => setShowPhone(true)}>
                      <Phone className="w-4 h-4" />
                      عرض رقم الهاتف
                    </Button>
                  )
                ) : (
                  <Button className="w-full" variant="outline" disabled>لا يوجد رقم هاتف</Button>
                )}
                <Button variant="outline" className="w-full" onClick={() => navigate("/messages")}>
                  إرسال رسالة
                </Button>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-4 space-y-2">
                <Button
                  variant={favorited ? "secondary" : "outline"}
                  className="w-full gap-2"
                  onClick={handleFavorite}
                  disabled={addFavMutation.isPending || favorited}
                >
                  <Heart className={`w-4 h-4 ${favorited ? "fill-current" : ""}`} />
                  {favorited ? "تمت الإضافة للمفضلة" : "إضافة للمفضلة"}
                </Button>
              </CardContent>
            </Card>

            {/* Quick info */}
            <Card>
              <CardHeader><CardTitle className="text-base">معلومات سريعة</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {[
                  { label: "المدينة", value: property.city },
                  { label: "الحي", value: property.district || "—" },
                  { label: "الطابق", value: property.floor ? `${property.floor} من ${property.totalFloors || "?"}` : "—" },
                  { label: "تاريخ الإعلان", value: new Date(property.createdAt).toLocaleDateString("ar") },
                  { label: "المشاهدات", value: property.viewCount.toLocaleString() },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium">{row.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
