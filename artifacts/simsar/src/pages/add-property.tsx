import { useState } from "react";
import { useLocation } from "wouter";
import { Check, ChevronLeft, ChevronRight, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateProperty, useGeneratePropertyDescription } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const STEPS = ["المعلومات الأساسية", "الموقع", "المميزات", "الترقية"];
const AMENITIES = ["بلكونة", "مصعد", "موقف سيارة", "تدفئة مركزية", "إنترنت سريع", "غسالة", "مطبخ مجهز", "خزانة", "مخزن", "مسبح", "حديقة"];

export default function AddProperty() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [descAr, setDescAr] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [rent, setRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [rooms, setRooms] = useState("");
  const [area, setArea] = useState("");
  const [floor, setFloor] = useState("");
  const [type, setType] = useState("apartment");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [nearMosque, setNearMosque] = useState(false);
  const [nearSchool, setNearSchool] = useState(false);
  const [nearStation, setNearStation] = useState(false);
  const [nearSupermarket, setNearSupermarket] = useState(false);
  const [tier, setTier] = useState("basic");

  const createMutation = useCreateProperty();
  const describeMutation = useGeneratePropertyDescription();

  function toggleAmenity(a: string) {
    setSelectedAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  }

  async function handleAiDescribe() {
    // Temporary placeholder until we have a real property ID
    setDescAr(`شقة ${rooms} غرفة رائعة في ${city}، ${district}. مساحة ${area} متر مربع مع جميع وسائل الراحة. الإيجار ${rent}€ شهرياً. ${nearStation ? "قريبة من وسائل النقل العام. " : ""}${nearMosque ? "قريبة من المسجد. " : ""}${nearSchool ? "قريبة من المدارس. " : ""}عقار مثالي للعائلة.`);
    toast({ title: "تم توليد الوصف", description: "يمكنك تعديله حسب رغبتك" });
  }

  async function handleSubmit() {
    createMutation.mutate({
      data: {
        title: title || titleAr,
        titleAr,
        descriptionAr: descAr || undefined,
        city,
        district: district || undefined,
        address,
        rent: parseInt(rent),
        deposit: deposit ? parseInt(deposit) : undefined,
        rooms: parseFloat(rooms),
        area: parseFloat(area),
        floor: floor ? parseInt(floor) : undefined,
        type: type as any,
        amenities: selectedAmenities,
        images: [],
        nearMosque,
        nearSchool,
        nearStation,
        nearSupermarket,
      }
    }, {
      onSuccess: (data) => {
        toast({ title: "تم نشر الإعلان!", description: "تمت إضافة عقارك بنجاح" });
        navigate(`/properties/${data.id}`);
      },
      onError: () => {
        toast({ title: "خطأ", description: "تعذر نشر الإعلان، حاول مجدداً", variant: "destructive" });
      }
    });
  }

  const tierOptions = [
    { value: "basic", label: "أساسي", price: "مجاني", desc: "نشر عادي" },
    { value: "featured", label: "مميز", price: "29€/شهر", desc: "يظهر في أعلى النتائج" },
    { value: "gold", label: "ذهبي", price: "59€/شهر", desc: "شارة ذهبية + أولوية عالية" },
    { value: "platinum", label: "بلاتيني", price: "99€/شهر", desc: "كل المميزات + صفحة خاصة" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">نشر إعلان عقاري</h1>

        {/* Steps */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className={`flex-1 text-center ${i <= step ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold mb-1 ${i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : "bg-muted"}`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <div className="text-xs hidden sm:block">{s}</div>
            </div>
          ))}
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6 space-y-4">
            {step === 0 && (
              <>
                <div>
                  <Label>العنوان بالعربية *</Label>
                  <Input value={titleAr} onChange={e => setTitleAr(e.target.value)} placeholder="مثال: شقة فاخرة في برلين" className="mt-1.5" />
                </div>
                <div>
                  <Label>العنوان بالألمانية</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="z.B. Luxuswohnung in Berlin" className="mt-1.5" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>الإيجار الشهري (€) *</Label>
                    <Input type="number" value={rent} onChange={e => setRent(e.target.value)} placeholder="1000" className="mt-1.5" />
                  </div>
                  <div>
                    <Label>الوديعة (€)</Label>
                    <Input type="number" value={deposit} onChange={e => setDeposit(e.target.value)} placeholder="2000" className="mt-1.5" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>النوع *</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">شقة</SelectItem>
                        <SelectItem value="house">بيت</SelectItem>
                        <SelectItem value="room">غرفة</SelectItem>
                        <SelectItem value="studio">ستوديو</SelectItem>
                        <SelectItem value="office">مكتب</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>عدد الغرف *</Label>
                    <Input type="number" step="0.5" value={rooms} onChange={e => setRooms(e.target.value)} placeholder="3" className="mt-1.5" />
                  </div>
                  <div>
                    <Label>المساحة (م²) *</Label>
                    <Input type="number" value={area} onChange={e => setArea(e.target.value)} placeholder="75" className="mt-1.5" />
                  </div>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div>
                  <Label>المدينة *</Label>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="اختر المدينة" /></SelectTrigger>
                    <SelectContent>
                      {["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart"].map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>الحي</Label>
                  <Input value={district} onChange={e => setDistrict(e.target.value)} placeholder="مثال: Neukölln" className="mt-1.5" />
                </div>
                <div>
                  <Label>العنوان الكامل *</Label>
                  <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Straße Nr., Stadt" className="mt-1.5" />
                </div>
                <div>
                  <Label>الطابق</Label>
                  <Input type="number" value={floor} onChange={e => setFloor(e.target.value)} placeholder="2" className="mt-1.5" />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <Label className="mb-2 block">المميزات</Label>
                  <div className="flex flex-wrap gap-2">
                    {AMENITIES.map(a => (
                      <button key={a} onClick={() => toggleAmenity(a)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${selectedAmenities.includes(a) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">الخدمات القريبة</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "محطة مواصلات", state: nearStation, set: setNearStation },
                      { label: "مسجد", state: nearMosque, set: setNearMosque },
                      { label: "مدرسة", state: nearSchool, set: setNearSchool },
                      { label: "سوبرماركت", state: nearSupermarket, set: setNearSupermarket },
                    ].map((item, i) => (
                      <button key={i} onClick={() => item.set(!item.state)}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all text-right ${item.state ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                        {item.state && "✓ "}{item.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label>الوصف بالعربية</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAiDescribe} className="gap-1.5 h-7 text-xs">
                      <Wand2 className="w-3 h-3" /> توليد بالذكاء الاصطناعي
                    </Button>
                  </div>
                  <Textarea value={descAr} onChange={e => setDescAr(e.target.value)} placeholder="أكتب وصفاً احترافياً للعقار..." className="min-h-28" />
                </div>
              </>
            )}

            {step === 3 && (
              <div className="grid grid-cols-2 gap-3">
                {tierOptions.map(t => (
                  <button key={t.value} onClick={() => setTier(t.value)}
                    className={`p-4 rounded-xl border-2 text-right transition-all ${tier === t.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                    <div className="font-bold mb-0.5">{t.label}</div>
                    <div className="text-primary font-semibold text-sm mb-1">{t.price}</div>
                    <div className="text-xs text-muted-foreground">{t.desc}</div>
                    {tier === t.value && <Check className="w-4 h-4 text-primary mt-2" />}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between gap-3">
          <Button variant="outline" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="gap-1">
            <ChevronRight className="w-4 h-4" /> السابق
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)} className="gap-1 flex-1">
              التالي <ChevronLeft className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={createMutation.isPending || !titleAr || !city || !rent || !rooms || !area || !address} className="flex-1">
              {createMutation.isPending ? "جاري النشر..." : "نشر الإعلان"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
