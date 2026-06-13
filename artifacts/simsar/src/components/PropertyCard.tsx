import { Link } from "wouter";
import { MapPin, BedDouble, Maximize2, Star, Shield, Train, School, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Property } from "@workspace/api-client-react";

interface PropertyCardProps {
  property: Property;
  onFavorite?: (id: number) => void;
  isFavorited?: boolean;
}

const tierConfig: Record<string, { label: string; className: string }> = {
  platinum: { label: "بلاتيني", className: "bg-purple-600 text-white" },
  gold: { label: "ذهبي", className: "bg-yellow-500 text-black" },
  featured: { label: "مميز", className: "bg-blue-600 text-white" },
  basic: { label: "", className: "" },
};

const typeLabels: Record<string, string> = {
  apartment: "شقة",
  house: "بيت",
  room: "غرفة",
  studio: "ستوديو",
  office: "مكتب",
  commercial: "تجاري",
};

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
];

export function PropertyCard({ property, onFavorite, isFavorited }: PropertyCardProps) {
  const tier = tierConfig[property.tier || "basic"];
  const img = property.images?.[0] || PLACEHOLDER_IMAGES[property.id % PLACEHOLDER_IMAGES.length];

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border border-border/60">
      <div className="relative overflow-hidden h-52">
        <img
          src={img}
          alt={property.titleAr}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGES[0]; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {/* Tier badge */}
        {tier.label && (
          <Badge className={cn("absolute top-3 right-3 text-xs font-bold", tier.className)}>
            {tier.label}
          </Badge>
        )}
        {/* AI score */}
        {property.aiScore != null && (
          <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{property.aiScore}/100</span>
          </div>
        )}
        {/* Price */}
        <div className="absolute bottom-3 right-3">
          <span className="text-white font-bold text-xl">{property.rent.toLocaleString()} €</span>
          <span className="text-white/80 text-xs mr-1">/شهر</span>
        </div>
        {/* Verified */}
        {property.isVerified && (
          <div className="absolute bottom-3 left-3">
            <Shield className="w-4 h-4 text-green-400" />
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-base text-foreground mb-1 line-clamp-1">{property.titleAr}</h3>
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{property.city}{property.district ? `، ${property.district}` : ""}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <BedDouble className="w-3.5 h-3.5" />
            <span>{property.rooms} غ</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{property.area} م²</span>
          </div>
          <Badge variant="outline" className="text-xs py-0">
            {typeLabels[property.type] || property.type}
          </Badge>
        </div>

        {/* Features */}
        <div className="flex gap-2 mb-3">
          {property.nearStation && <Train className="w-3.5 h-3.5 text-blue-500" title="قريب من المحطة" />}
          {property.nearSchool && <School className="w-3.5 h-3.5 text-green-500" title="قريب من المدرسة" />}
          {property.nearMosque && <BookOpen className="w-3.5 h-3.5 text-yellow-600" title="قريب من المسجد" />}
        </div>

        <Link href={`/properties/${property.id}`}>
          <Button className="w-full" size="sm">عرض التفاصيل</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
