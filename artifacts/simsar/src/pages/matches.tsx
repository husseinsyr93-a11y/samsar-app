import { useState } from "react";
import { useLocation } from "wouter";
import { Heart, X, CheckCircle, BedDouble, Maximize2, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMatchSuggestions, useCreateMatch, useListMatches, getGetMatchSuggestionsQueryKey, getListMatchesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
];

export default function Matches() {
  const [, navigate] = useLocation();
  const [currentIdx, setCurrentIdx] = useState(0);
  const queryClient = useQueryClient();

  const { data: suggestions, isLoading } = useGetMatchSuggestions({
    query: { queryKey: getGetMatchSuggestionsQueryKey() }
  });
  const { data: matches } = useListMatches({ query: { queryKey: getListMatchesQueryKey() } });
  const createMatchMutation = useCreateMatch();

  const current = suggestions?.[currentIdx];

  function handleAction(action: "like" | "dislike") {
    if (!current) return;
    createMatchMutation.mutate({ data: { propertyId: current.id, action } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMatchesQueryKey() });
        setCurrentIdx(i => i + 1);
      }
    });
  }

  const matchedMatches = matches?.filter(m => m.status === "matched") || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Swipe section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">نظام التطابق</h1>
              <p className="text-muted-foreground text-sm">تصفح العقارات وأخبرنا ما يعجبك</p>
            </div>

            {isLoading ? (
              <Skeleton className="h-[500px] rounded-2xl" />
            ) : !current || currentIdx >= (suggestions?.length || 0) ? (
              <div className="bg-card border border-border rounded-2xl h-[500px] flex flex-col items-center justify-center text-center p-8">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-bold mb-2">لقد رأيت جميع العقارات!</h3>
                <p className="text-muted-foreground mb-6">تحقق من تطابقاتك أدناه أو تصفح المزيد</p>
                <Button onClick={() => { setCurrentIdx(0); queryClient.invalidateQueries({ queryKey: getGetMatchSuggestionsQueryKey() }); }}>
                  إعادة التشغيل
                </Button>
              </div>
            ) : (
              <div className="relative">
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                  {/* Image */}
                  <div className="relative h-72">
                    <img
                      src={current.images?.[0] || PLACEHOLDER_IMAGES[current.id % PLACEHOLDER_IMAGES.length]}
                      alt={current.titleAr}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGES[0]; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    {current.aiScore != null && (
                      <div className="absolute top-4 left-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        {current.aiScore}/100
                      </div>
                    )}
                    <div className="absolute bottom-4 right-4 text-white">
                      <div className="font-bold text-xl">{current.titleAr}</div>
                      <div className="flex items-center gap-1 text-white/80 text-sm">
                        <MapPin className="w-3.5 h-3.5" /> {current.city}
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-primary">{current.rent.toLocaleString()}€/شهر</span>
                      {current.tier !== "basic" && (
                        <Badge className={current.tier === "platinum" ? "bg-purple-600 text-white" : current.tier === "gold" ? "bg-yellow-500 text-black" : "bg-blue-600 text-white"}>
                          {current.tier === "platinum" ? "بلاتيني" : current.tier === "gold" ? "ذهبي" : "مميز"}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><BedDouble className="w-4 h-4" /> {current.rooms} غرف</span>
                      <span className="flex items-center gap-1"><Maximize2 className="w-4 h-4" /> {current.area} م²</span>
                    </div>
                    {current.amenities?.slice(0, 3).map((a, i) => (
                      <Badge key={i} variant="outline" className="text-xs ml-1 mb-1">{a}</Badge>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-center gap-6 mt-6">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-16 h-16 rounded-full border-2 border-red-300 hover:bg-red-50 hover:border-red-400"
                    onClick={() => handleAction("dislike")}
                    disabled={createMatchMutation.isPending}
                  >
                    <X className="w-6 h-6 text-red-500" />
                  </Button>
                  <Button
                    size="lg"
                    className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600"
                    onClick={() => handleAction("like")}
                    disabled={createMatchMutation.isPending}
                  >
                    <Heart className="w-6 h-6 text-white fill-white" />
                  </Button>
                </div>

                <div className="text-center mt-3 text-sm text-muted-foreground">
                  {currentIdx + 1} / {suggestions?.length || 0}
                </div>
              </div>
            )}
          </div>

          {/* Matches sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  تطابقاتك ({matchedMatches.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {matchedMatches.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-6">
                    <Heart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>لا توجد تطابقات بعد</p>
                    <p>أعجب بعقار لتبدأ</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {matchedMatches.map(match => match.property && (
                      <div
                        key={match.id}
                        className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => navigate(`/properties/${match.propertyId}`)}
                      >
                        <img
                          src={match.property.images?.[0] || PLACEHOLDER_IMAGES[match.propertyId % PLACEHOLDER_IMAGES.length]}
                          alt={match.property.titleAr}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGES[0]; }}
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{match.property.titleAr}</div>
                          <div className="text-muted-foreground text-xs">{match.property.rent.toLocaleString()}€/شهر</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
