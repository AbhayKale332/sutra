import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { QRCodeSVG } from "qrcode.react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { 
  Link2, Plus, Copy, ExternalLink, BarChart3, 
  Calendar, MousePointer2, Trash2, Loader2, LogOut, ChevronRight,
  QrCode, Download, Palette, Image as ImageIcon, Maximize
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import ThemeToggle from "@/components/ThemeToggle";

interface UrlMapping {
  id: number;
  originalUrl: string;
  shortUrl: string;
  clickCount: number;
  createdDate: string;
  isExpanded?: boolean;
  analytics?: { date: string; clicks: number }[];
  isLoadingAnalytics?: boolean;
}

const Dashboard = () => {
  const { token, logout } = useAuth();
  const [urls, setUrls] = useState<UrlMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [customShortUrl, setCustomShortUrl] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [totalClicks, setTotalClicks] = useState<any[]>([]);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  
  // QR Studio Customization States
  const [qrFgColor, setQrFgColor] = useState("#7C3AED"); // Brand Purple
  const [qrBgColor, setQrBgColor] = useState("#ffffff");
  const [qrSize, setQrSize] = useState(256);
  const [qrLogo, setQrLogo] = useState<string | null>(null);

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

  const toggleExpand = async (id: number, shortUrl: string) => {
    setUrls(prev => prev.map(url => 
      url.id === id ? { ...url, isExpanded: !url.isExpanded } : url
    ));

    const targetUrl = urls.find(u => u.id === id);
    if (targetUrl && !targetUrl.isExpanded && !targetUrl.analytics) {
      // Fetch only if it's being expanded and we don't have data yet
      await fetchUrlAnalytics(id, shortUrl);
    }
  };

  const fetchUrlAnalytics = async (id: number, shortUrl: string) => {
    setUrls(prev => prev.map(url => 
      url.id === id ? { ...url, isLoadingAnalytics: true } : url
    ));

    try {
      // Get last 7 days + 1 for context
      const endDate = dayjs().format("YYYY-MM-DDTHH:mm:ss");
      const startDate = dayjs().subtract(7, 'day').format("YYYY-MM-DDTHH:mm:ss");
      
      const response = await api.get(`/api/urls/analytics/${shortUrl}`, {
        params: { startDate, endDate },
        headers: { Authorization: `Bearer ${token}` },
      });

      // Backend returns List<ClickEventDTO> with count and clickDate
      const chartData = response.data.map((item: any) => ({
        date: item.clickDate,
        clicks: item.count,
      })).sort((a: any, b: any) => a.date.localeCompare(b.date));

      setUrls(prev => prev.map(url => 
        url.id === id ? { ...url, analytics: chartData, isLoadingAnalytics: false } : url
      ));
    } catch (error) {
       console.error("Error fetching analytics:", error);
       setUrls(prev => prev.map(url => 
         url.id === id ? { ...url, isLoadingAnalytics: false } : url
       ));
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-lg shadow-lg text-[11px]">
          <p className="font-semibold text-slate-500 dark:text-slate-400 mb-1">{dayjs(label).format("MMM DD, YYYY")}</p>
          <p className="text-brand-purple font-bold flex items-center gap-1">
            <MousePointer2 size={10} /> {payload[0].value} clicks
          </p>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    fetchUrls();
  }, [token]);

  const handleCreateShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    setIsCreating(true);

    try {
      await api.post(
        "/api/urls/shorten",
        { 
          originalUrl: newUrl,
          shortUrl: customShortUrl.trim() || undefined 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("URL shortened successfully!");
      setNewUrl("");
      setCustomShortUrl("");
      setIsDialogOpen(false);
      fetchUrls();
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error("That custom link is already taken!");
      } else {
        toast.error("Failed to shorten URL");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    const fullUrl = `${window.location.protocol}//${window.location.host}/s/${text}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Copied to clipboard!");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadQRCode = (shortUrl: string) => {
    const svg = document.getElementById(`qr-code-${shortUrl}`);
    if (!svg) return;

    // Use a temporary canvas to render the high-res version
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    // Scale canvas to user-defined high resolution (qrSize)
    const scale = qrSize / 200; // Original SVG size is 200 in the UI

    img.onload = () => {
      canvas.width = qrSize + 80; // Add padding
      canvas.height = qrSize + 80;
      if (ctx) {
        ctx.fillStyle = qrBgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Final draw with high resolution
        ctx.drawImage(img, 40, 40, qrSize, qrSize);
        
        const pngFile = canvas.toDataURL("image/png", 1.0);
        const downloadLink = document.createElement("a");
        downloadLink.download = `qr-sutra-${shortUrl}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    // Ensure all styles are captured in the blob
    const encodedSVG = btoa(unescape(encodeURIComponent(svgData)));
    img.src = "data:image/svg+xml;base64," + encodedSVG;
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
            <ThemeToggle className="text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" />
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
            <DialogContent className="sm:max-w-xl">
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
                  <div className="grid gap-2">
                    <Label htmlFor="custom">Custom Link (optional)</Label>
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-100 dark:bg-slate-800 px-3 h-10 flex items-center rounded-md border text-slate-500 text-sm whitespace-nowrap shrink-0">
                        {window.location.host}/s/
                      </div>
                      <Input
                        id="custom"
                        placeholder="my-brand-link"
                        value={customShortUrl}
                        onChange={(e) => setCustomShortUrl(e.target.value.replace(/[^a-zA-Z0-9-]/g, ""))}
                      />
                    </div>
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

        {/* Global Chart Removed as requested */}

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
                    <div className="flex flex-col">
                      <div className="flex flex-col md:flex-row p-5 cursor-pointer" onClick={() => toggleExpand(url.id, url.shortUrl)}>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-brand-purple flex items-center bg-brand-purple/5 px-2 py-0.5 rounded">
                              {window.location.host}/s/{url.shortUrl}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); copyToClipboard(url.shortUrl); }}>
                                <Copy size={16} />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setQrUrl(`${window.location.protocol}//${window.location.host}/s/${url.shortUrl}`); setIsQrDialogOpen(true); }}>
                                <QrCode size={16} />
                              </Button>
                              <a href={`${window.location.protocol}//${window.location.host}/s/${url.shortUrl}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
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
                            <span className="ml-auto hidden md:flex items-center text-brand-purple font-medium">
                              {url.isExpanded ? "Hide Analytics" : "Show Analytics"}
                              <ChevronRight size={16} className={`ml-1 transition-transform duration-200 ${url.isExpanded ? 'rotate-90' : ''}`} />
                            </span>
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {url.isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="bg-slate-50/50 dark:bg-slate-900/50 border-t"
                          >
                            <div className="p-5 overflow-hidden">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                  <BarChart3 size={16} className="text-brand-purple" />
                                  Link Performance (Last 7 Days)
                                </h4>
                              </div>
                              
                              {url.isLoadingAnalytics ? (
                                <div className="h-[200px] flex items-center justify-center text-slate-400">
                                  <Loader2 className="animate-spin mr-2" size={18} />
                                  <span className="text-sm">Fetching analytics...</span>
                                </div>
                              ) : url.analytics && url.analytics.length > 0 ? (
                                <div className="h-[200px]">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={url.analytics}>
                                      <defs>
                                        <linearGradient id={`grad-${url.id}`} x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.8}/>
                                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.8}/>
                                        </linearGradient>
                                      </defs>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/.1)" />
                                      <XAxis 
                                        dataKey="date" 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                                        tickFormatter={(value) => dayjs(value).format("MMM DD")}
                                      />
                                      <YAxis 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                                      />
                                      <Tooltip 
                                        cursor={{fill: 'hsl(var(--muted-foreground)/.05)'}}
                                        content={<CustomTooltip />}
                                      />
                                      <Bar dataKey="clicks" fill={`url(#grad-${url.id})`} radius={[4, 4, 0, 0]} barSize={25} />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              ) : (
                                <div className="h-[100px] flex items-center justify-center text-slate-400 text-sm italic">
                                  No click data recorded for this period yet.
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* QR Studio Dialog */}
        <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
          <DialogContent className="sm:max-w-3xl flex flex-col md:flex-row overflow-hidden p-0 gap-0 border-none shadow-2xl">
            <div className="flex-1 bg-slate-100/50 dark:bg-slate-900/50 p-8 flex flex-col items-center justify-center border-r border-slate-200 dark:border-slate-800">
               <div className="text-center mb-6">
                 <h2 className="text-2xl font-bold mb-1">QR Preview</h2>
                 <p className="text-sm text-slate-500">Live branding preview</p>
               </div>
               
               <div 
                 className="p-8 rounded-2xl shadow-xl transition-all duration-300"
                 style={{ backgroundColor: qrBgColor }}
               >
                 {qrUrl && (
                    <QRCodeSVG 
                      id={`qr-code-${qrUrl.split('/').pop()}`}
                      value={qrUrl} 
                      size={240}
                      level="H"
                      fgColor={qrFgColor}
                      bgColor={qrBgColor}
                      includeMargin={false}
                      imageSettings={qrLogo ? {
                        src: qrLogo,
                        x: undefined,
                        y: undefined,
                        height: 50,
                        width: 50,
                        excavate: true,
                      } : undefined}
                    />
                  )}
               </div>
               
               <div className="mt-8 text-xs text-slate-400 max-w-[240px] text-center">
                 Customized for {qrUrl?.split('/').pop()}
               </div>
            </div>

            <div className="w-full md:w-[350px] bg-white dark:bg-slate-950 p-6 flex flex-col">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-xl">QR Studio</DialogTitle>
                <DialogDescription>
                  Personalize your link's visual signature
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="style" className="flex-1">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="style" className="flex items-center gap-2">
                    <Palette size={14} /> Style
                  </TabsTrigger>
                  <TabsTrigger value="logo" className="flex items-center gap-2">
                    <ImageIcon size={14} /> Logo
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="style" className="space-y-6">
                   <div className="space-y-3">
                     <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Colors</Label>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-slate-500">Foreground</Label>
                          <div className="flex items-center gap-2">
                             <Input 
                               type="color" 
                               value={qrFgColor} 
                               onChange={(e) => setQrFgColor(e.target.value)}
                               className="h-10 w-full p-1 cursor-pointer border-none bg-transparent" 
                             />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-slate-500">Background</Label>
                          <div className="flex items-center gap-2">
                             <Input 
                               type="color" 
                               value={qrBgColor} 
                               onChange={(e) => setQrBgColor(e.target.value)}
                               className="h-10 w-full p-1 cursor-pointer border-none bg-transparent" 
                             />
                          </div>
                        </div>
                     </div>
                   </div>

                   <div className="space-y-3">
                     <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Export Resolution</Label>
                     <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>Low Res</span>
                        <span className="font-bold text-brand-purple">{qrSize}px</span>
                        <span>High Res</span>
                     </div>
                     <Slider 
                        value={[qrSize]} 
                        onValueChange={(val) => setQrSize(val[0])}
                        min={128} 
                        max={1024} 
                        step={128}
                        className="py-4"
                     />
                   </div>
                </TabsContent>

                <TabsContent value="logo" className="space-y-6">
                   <div className="space-y-3">
                     <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Logo Centerpiece</Label>
                     <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-6 flex flex-col items-center justify-center gap-3">
                        {qrLogo ? (
                          <div className="relative group">
                             <img src={qrLogo} alt="Preview" className="w-16 h-16 object-contain rounded border" />
                             <button 
                               onClick={() => setQrLogo(null)}
                               className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                               <Trash2 size={12} />
                             </button>
                          </div>
                        ) : (
                          <ImageIcon size={32} className="text-slate-300" />
                        )}
                        <Input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleLogoUpload}
                          className="text-xs h-9 cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-400 text-center">PNG/JPG works best. Size capped at 20% for scannability.</p>
                     </div>
                   </div>
                </TabsContent>
              </Tabs>

              <div className="mt-8 flex gap-3">
                <Button 
                  className="flex-1 bg-brand-purple hover:bg-brand-purple/90 h-11"
                  onClick={() => qrUrl && downloadQRCode(qrUrl.split('/').pop() || "qr")}
                >
                  <Download size={18} className="mr-2" /> Download
                </Button>
                <Button 
                  variant="outline" 
                  className="h-11"
                  onClick={() => setIsQrDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
