import { Building2, Users, Heart, TrendingUp, DollarSign, Flag, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useGetDashboardStats, useGetCityDistribution, useGetRecentActivity, getGetDashboardStatsQueryKey, getGetCityDistributionQueryKey, getGetRecentActivityQueryKey } from "@workspace/api-client-react";

const MONTHLY_DATA = [
  { month: "يناير", users: 20, listings: 35 },
  { month: "فبراير", users: 28, listings: 42 },
  { month: "مارس", users: 35, listings: 58 },
  { month: "أبريل", users: 45, listings: 71 },
  { month: "مايو", users: 62, listings: 89 },
  { month: "يونيو", users: 80, listings: 110 },
];

export default function Admin() {
  const { data: stats, isLoading } = useGetDashboardStats({ query: { queryKey: getGetDashboardStatsQueryKey() } });
  const { data: cities } = useGetCityDistribution({ query: { queryKey: getGetCityDistributionQueryKey() } });
  const { data: activity } = useGetRecentActivity({ query: { queryKey: getGetRecentActivityQueryKey() } });

  const statCards = stats ? [
    { label: "إجمالي المستخدمين", value: stats.totalUsers.toLocaleString(), icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/40" },
    { label: "إجمالي العقارات", value: stats.totalProperties.toLocaleString(), icon: Building2, color: "text-primary", bg: "bg-primary/5" },
    { label: "الإعلانات النشطة", value: stats.activeListings.toLocaleString(), icon: TrendingUp, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/40" },
    { label: "التطابقات", value: stats.totalMatches.toLocaleString(), icon: Heart, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/40" },
    { label: "الدخل الشهري", value: `${stats.monthlyRevenue?.toLocaleString()}€`, icon: DollarSign, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/40" },
    { label: "إعلانات مميزة", value: stats.featuredListings?.toLocaleString() || "0", icon: Star, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/40" },
    { label: "بلاغات معلقة", value: stats.pendingReports?.toLocaleString() || "0", icon: Flag, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/40" },
    { label: "مستخدمون جدد/شهر", value: stats.newUsersThisMonth?.toLocaleString() || "0", icon: Users, color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950/40" },
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">لوحة التحكم الإدارية</h1>
          <p className="text-muted-foreground text-sm">إحصائيات المنصة في الوقت الفعلي</p>
        </div>

        {/* Stats grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {statCards.map((card, i) => (
              <Card key={i} className="border border-border">
                <CardContent className="p-4">
                  <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{card.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* City distribution */}
          <Card>
            <CardHeader><CardTitle className="text-base">توزيع العقارات حسب المدينة</CardTitle></CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cities || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="city" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="عدد العقارات" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly growth */}
          <Card>
            <CardHeader><CardTitle className="text-base">النمو الشهري</CardTitle></CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MONTHLY_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" name="مستخدمون" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="listings" name="إعلانات" stroke="hsl(var(--secondary))" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent activity */}
        <Card>
          <CardHeader><CardTitle className="text-base">آخر النشاطات</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activity?.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.type === "new_listing" ? "bg-primary/10" :
                    item.type === "new_match" ? "bg-red-500/10" :
                    item.type === "new_review" ? "bg-yellow-500/10" :
                    "bg-green-500/10"
                  }`}>
                    {item.type === "new_listing" ? <Building2 className="w-4 h-4 text-primary" /> :
                     item.type === "new_match" ? <Heart className="w-4 h-4 text-red-500" /> :
                     item.type === "new_review" ? <Star className="w-4 h-4 text-yellow-500" /> :
                     <Users className="w-4 h-4 text-green-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.descriptionAr}</div>
                  </div>
                  <div className="text-xs text-muted-foreground flex-shrink-0">
                    {new Date(item.createdAt).toLocaleDateString("ar")}
                  </div>
                </div>
              ))}
              {(!activity || activity.length === 0) && (
                <p className="text-center text-muted-foreground text-sm py-4">لا توجد نشاطات بعد</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
