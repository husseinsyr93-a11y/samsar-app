import { useState } from "react";
import { Sparkles, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { PropertyCard } from "@/components/PropertyCard";
import { useGetAiRecommendations } from "@workspace/api-client-react";
import type { Property } from "@workspace/api-client-react";

const STEPS = [
  { id: "budget", title: "الميزانية", question: "كم ميزانيتك الشهرية للإيجار؟" },
  { id: "family", title: "الأسرة", question: "كم عدد أفراد الأسرة؟" },
  { id: "prefs", title: "التفضيلات", question: "ما هي احتياجاتك الخاصة؟" },
  { id: "city", title: "المدينة", question: "أي مدينة تفضل؟" },
];

export default function AiAssistant() {
  const [step, setStep] = useState(0);
  const [budget, setBudget] = useState("");
  const [familySize, setFamilySize] = useState(1);
  const [hasChildren, setHasChildren] = useState(false);
  const [hasCar, setHasCar] = useState(false);
  const [needsSchool, setNeedsSchool] = useState(false);
  const [needsMosque, setNeedsMosque] = useState(false);
  const [preferredCity, setPreferredCity] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Property[]>([]);

  const recommendMutation = useGetAiRecommendations();

  function handleSubmit() {
    recommendMutation.mutate({
      data: {
        budget: parseInt(budget) || 1200,
        familySize,
        hasChildren,
        hasCar,
        needsSchool,
        needsMosque,
        preferredCity: preferredCity || undefined,
      }
    }, {
      onSuccess: (data) => {
        setResults(data);
        setSubmitted(true);
      }
    });
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-1">توصيات المساعد الذكي</h1>
            <p className="text-muted-foreground text-sm">وجدنا {results.length} عقار يناسب احتياجاتك</p>
          </div>
          {results.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-muted-foreground mb-4">لم نجد عقارات بالمعايير المحددة</p>
              <Button onClick={() => { setSubmitted(false); setStep(0); }}>حاول مجدداً</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                {results.map(p => <PropertyCard key={p.id} property={p} />)}
              </div>
              <div className="text-center">
                <Button variant="outline" onClick={() => { setSubmitted(false); setStep(0); }}>
                  بحث جديد
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">المساعد العقاري الذكي</h1>
          <p className="text-muted-foreground text-sm mt-1">أجب على بعض الأسئلة لنجد العقار المثالي لك</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8 justify-center">
          {STEPS.map((s, i) => (
            <div key={s.id} className={`flex items-center gap-2 ${i > 0 ? "flex-1" : ""}`}>
              {i > 0 && <div className={`h-0.5 flex-1 ${i <= step ? "bg-primary" : "bg-muted"}`} />}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : "bg-muted text-muted-foreground"}`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
            </div>
          ))}
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="font-bold text-lg mb-4 text-center">{STEPS[step].question}</h2>

            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <Label>الميزانية الشهرية (€)</Label>
                  <Input
                    type="number"
                    placeholder="مثال: 1000"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    className="mt-1.5 text-lg text-center"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[600, 800, 1200, 1500].map(b => (
                    <button key={b} onClick={() => setBudget(String(b))}
                      className={`py-2 rounded-lg border text-sm font-medium transition-colors ${budget === String(b) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}>
                      {b}€
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label>عدد أفراد الأسرة</Label>
                  <div className="flex items-center justify-center gap-4 mt-3">
                    <button onClick={() => setFamilySize(s => Math.max(1, s - 1))} className="w-10 h-10 rounded-full border-2 border-primary text-primary font-bold text-xl hover:bg-primary hover:text-primary-foreground transition-colors">-</button>
                    <span className="text-3xl font-bold w-12 text-center">{familySize}</span>
                    <button onClick={() => setFamilySize(s => s + 1)} className="w-10 h-10 rounded-full border-2 border-primary text-primary font-bold text-xl hover:bg-primary hover:text-primary-foreground transition-colors">+</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "هل لديك أطفال؟", state: hasChildren, set: setHasChildren },
                    { label: "هل لديك سيارة؟", state: hasCar, set: setHasCar },
                  ].map((item, i) => (
                    <button key={i} onClick={() => item.set(!item.state)}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${item.state ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}>
                      {item.label}
                      {item.state && <Check className="w-4 h-4 mr-1 inline" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "قريب من مدرسة", state: needsSchool, set: setNeedsSchool },
                  { label: "قريب من مسجد", state: needsMosque, set: setNeedsMosque },
                ].map((item, i) => (
                  <button key={i} onClick={() => item.set(!item.state)}
                    className={`p-4 rounded-xl border-2 text-sm font-medium transition-all ${item.state ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}>
                    {item.label}
                    {item.state && <div className="mt-1"><Check className="w-4 h-4 mx-auto" /></div>}
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div>
                <Select value={preferredCity} onValueChange={setPreferredCity}>
                  <SelectTrigger className="text-center">
                    <SelectValue placeholder="أي مدينة تفضل؟" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">بدون تفضيل</SelectItem>
                    {["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <Button onClick={handleSubmit} disabled={recommendMutation.isPending} className="gap-1.5 flex-1">
              <Sparkles className="w-4 h-4" />
              {recommendMutation.isPending ? "جاري البحث..." : "ابحث لي"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
