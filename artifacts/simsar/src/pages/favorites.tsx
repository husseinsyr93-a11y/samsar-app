import { useLocation } from "wouter";
import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyCard } from "@/components/PropertyCard";
import { useListFavorites, useRemoveFavorite, getListFavoritesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Favorites() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { data: favorites, isLoading } = useListFavorites({ query: { queryKey: getListFavoritesQueryKey() } });
  const removeMutation = useRemoveFavorite();

  function handleRemove(propertyId: number) {
    removeMutation.mutate({ propertyId }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() })
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            المفضلة
          </h1>
          {favorites && <p className="text-muted-foreground text-sm">{favorites.length} عقار محفوظ</p>}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-xl" />)}
          </div>
        ) : !favorites?.length ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="text-lg font-semibold mb-2">لا توجد عقارات محفوظة</h3>
            <p className="text-muted-foreground mb-6">أضف عقارات إلى مفضلتك لتجدها هنا</p>
            <Button onClick={() => navigate("/properties")}>تصفح العقارات</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {favorites.map(p => (
              <div key={p.id} className="relative">
                <PropertyCard property={p} />
                <button
                  onClick={() => handleRemove(p.id)}
                  className="absolute top-3 left-3 bg-white/90 dark:bg-black/70 rounded-full p-1.5 hover:bg-red-50 dark:hover:bg-red-950 transition-colors z-10"
                  title="إزالة من المفضلة"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
