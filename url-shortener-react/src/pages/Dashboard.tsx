import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from "recharts";
import { 
  Link2, Plus, Copy, ExternalLink, BarChart3, 
  Calendar, MousePointer2, Trash2, Loader2, LogOut, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import dayjs from "dayjs";

interface UrlMapping {
  id: number;
  originalUrl: string;
  shortUrl: string;
  clickCount: number;
  createdDate: string;
}

const Dashboard = () => {
  const { token, logout } = useAuth();
  const [urls, setUrls] = useState<UrlMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [totalClicks, setTotalClicks] = useState<any[]>([]);

  const fetchUrls = async () => {
    try {
      const response = await api.get("/api/urls/myurls", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUrls(response.data);
    } catch (error) {
      console.error("Error fetching URLs:", error);
      toast.error("Failed to load your links");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTotalAnalytics = async () => {
    try {
      const response = await api.get("/api/urls/totalClicks?startDate=2024-01-01&endDate=2030-12-31", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Convert map to array for Recharts
      const chartData = Object.entries(response.data).map(([date, count]) => ({
        date,
        clicks: count,
      })).sort((a, b) => a.date.localeCompare(b.date));
      setTotalClicks(chartData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  useEffect(() => {
    fetchUrls();
    fetchTotalAnalytics();
  }, [token]);

  const handleCreateShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    setIsCreating(true);

    try {
      await api.post(
        "/api/urls/shorten",
        { originalUrl: newUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("URL shortened successfully!");
      setNewUrl("");
      setIsDialogOpen(false);
      fetchUrls();
      fetchTotalAnalytics();
    } catch (error) {
      toast.error("Failed to shorten URL");
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    const fullUrl = `${window.location.origin}/s/${text}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Dashboard Nav */}
      <nav className="border-b bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight flex items-center gap-2 text-brand-purple">
            <Link2 size={24} className="rotate-[-45deg]" /> Sutra
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={logout} className="text-slate-600 hover:text-red-600 transition-colors">
              <LogOut size={18} className="mr-2" /> LogOut
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage your shortened links and track performance.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-purple hover:bg-brand-purple/90 shadow-lg shadow-brand-purple/20">
                <Plus size={18} className="mr-2" /> Create New Link
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Shorten a long URL</DialogTitle>
                <DialogDescription>
                  Paste your long URL below and we'll create a manageable link for you.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateShorten}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="url">Long URL</Label>
                    <Input
                      id="url"
                      placeholder="https://example.com/very-long-url-path"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isCreating} className="w-full bg-brand-purple hover:bg-brand-purple/90">
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Short Link"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-brand-purple/5 to-transparent border-brand-purple/10">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center text-xs font-semibold uppercase tracking-wider">
                <Link2 size={14} className="mr-1 text-brand-purple" /> Total Links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{urls.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-brand-blue/5 to-transparent border-brand-blue/10">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center text-xs font-semibold uppercase tracking-wider">
                <MousePointer2 size={14} className="mr-1 text-brand-blue" /> Total Clicks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {urls.reduce((sum, url) => sum + url.clickCount, 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
             <CardHeader className="pb-2">
                <CardDescription className="flex items-center text-xs font-semibold uppercase tracking-wider">
                  <BarChart3 size={14} className="mr-1 text-brand-purple" /> Top Performer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold truncate">
                  {urls.length > 0 ? urls.sort((a,b) => b.clickCount - a.clickCount)[0].shortUrl : "None"}
                </div>
              </CardContent>
          </Card>
        </div>

        {/* Global Chart */}
        {totalClicks.length > 0 && (
          <Card className="mb-8 border-slate-200 dark:border-slate-800 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Overall Performance</CardTitle>
              <CardDescription>Click activity across all your links</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={totalClicks}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/.1)" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(value) => dayjs(value).format("MMM DD")}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted-foreground)/.05)'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="clicks" fill="url(#colorClicks)" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Link List */}
        <h2 className="text-xl font-bold mb-4 flex items-center">
          Recent Links
        </h2>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p>Loading your links...</p>
            </div>
          ) : urls.length === 0 ? (
            <Card className="border-dashed border-2 py-12 flex flex-col items-center justify-center text-center">
              <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-full mb-4">
                <Link2 size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold">No links yet</h3>
              <p className="text-slate-500 mb-6 max-w-xs mx-auto">Create your first short link to start tracking your audience.</p>
              <Button onClick={() => setIsDialogOpen(true)} variant="outline">
                Shorten your first link
              </Button>
            </Card>
          ) : (
            <AnimatePresence>
              {urls.map((url, index) => (
                <motion.div
                  key={url.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group hover:border-brand-purple/30 transition-all overflow-hidden border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex-1 p-5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-brand-purple flex items-center bg-brand-purple/5 px-2 py-0.5 rounded">
                            {window.location.host}/s/{url.shortUrl}
                          </div>
                          <div className="flex items-center gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => copyToClipboard(url.shortUrl)}>
                              <Copy size={16} />
                            </Button>
                            <a href={`${window.location.origin}/s/${url.shortUrl}`} target="_blank" rel="noreferrer">
                              <Button size="icon" variant="ghost" className="h-8 w-8">
                                <ExternalLink size={16} />
                              </Button>
                            </a>
                          </div>
                        </div>
                        <h3 className="font-bold text-lg mb-1 truncate text-slate-800 dark:text-slate-200">
                          {url.originalUrl}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                          <span className="flex items-center"><Calendar size={14} className="mr-1" /> {dayjs(url.createdDate).format("MMM D, YYYY")}</span>
                          <span className="flex items-center font-semibold text-slate-700 dark:text-slate-300">
                            <MousePointer2 size={14} className="mr-1" /> {url.clickCount} clicks
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>
      
      <footer className="py-8 border-t border-slate-200 dark:border-slate-800 mt-12 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Sutra Linklytics. Developed by Abhay Kale
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
