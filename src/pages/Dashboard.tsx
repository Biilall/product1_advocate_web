import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, MessageSquare, Hash, UserCheck, RefreshCw, Bot, Play, CheckCircle, XCircle, Clock, SkipForward } from "lucide-react";


interface User {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  info_collected: boolean;
  created_at: string;
}


interface Chat {
  id: string;
  thread_id: string;
  user_id?: string;
  message?: string;
  response?: string;
  message_type: string;
  created_at: string;
}

interface Stats {
  totalUsers: number;
  totalChats: number;
  totalThreads: number;
  infoCollected: number;
}

interface ContentJob {
  _id: string;
  status: 'running' | 'success' | 'failed' | 'skipped';
  sourceUrl: string;
  sourceTitle: string;
  generatedTitle?: string;
  generatedSlug?: string;
  blogPostId?: string;
  category?: string;
  tags?: string[];
  keywordsUsed?: string[];
  hasUrduVersion: boolean;
  error?: string;
  durationMs?: number;
  startedAt: string;
  completedAt?: string;
}

interface ContentJobStats {
  total: number;
  success: number;
  failed: number;
  skipped: number;
  running: number;
  avgDurationMs: number;
  lastRun: string | null;
}

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [contentJobs, setContentJobs] = useState<ContentJob[]>([]);
  const [contentJobStats, setContentJobStats] = useState<ContentJobStats | null>(null);
  const [triggeringJob, setTriggeringJob] = useState(false);

  useEffect(() => {
    document.title = "Dashboard — M Salman Tahir";
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  // Dialog state for user chat history
  const [selectedUserChats, setSelectedUserChats] = useState<Chat[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isUserChatHistoryOpen, setIsUserChatHistoryOpen] = useState(false);

  const getAuthHeader = () => "Basic " + btoa("admin:" + password);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/stats", {
        headers: { Authorization: "Basic " + btoa("admin:" + password) },
      });
      if (!res.ok) {
        setError("Invalid password");
        return;
      }
      setIsAuthenticated(true);
      loadDashboardData();
    } catch {
      setError("Connection error");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const authHeader = getAuthHeader();
      const headers = { Authorization: authHeader };
      const [statsRes, usersRes, chatsRes] = await Promise.all([
        fetch("/api/dashboard/stats", { headers }),
        fetch("/api/dashboard/users", { headers }),
        fetch("/api/dashboard/chats", { headers })
      ]);

      if (!statsRes.ok || !usersRes.ok || !chatsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const chatsData = await chatsRes.json();

      setStats(statsData);
      setUsers(usersData);
      setChats(chatsData);

      // Load content job data
      try {
        const [jobsRes, jobStatsRes] = await Promise.all([
          fetch("/api/dashboard/content-jobs", { headers }),
          fetch("/api/dashboard/content-jobs/stats", { headers })
        ]);
        if (jobsRes.ok) setContentJobs(await jobsRes.json());
        if (jobStatsRes.ok) setContentJobStats(await jobStatsRes.json());
      } catch {
        console.error("Error loading content job data");
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword("");
    setStats(null);
    setUsers([]);
    setChats([]);
    setContentJobs([]);
    setContentJobStats(null);
  };

  const handleTriggerContentJob = async () => {
    setTriggeringJob(true);
    try {
      const res = await fetch("/api/dashboard/content-jobs/trigger", {
        method: "POST",
        headers: { Authorization: getAuthHeader() },
      });
      if (res.ok) {
        // Reload content job data
        const [jobsRes, jobStatsRes] = await Promise.all([
          fetch("/api/dashboard/content-jobs", { headers: { Authorization: getAuthHeader() } }),
          fetch("/api/dashboard/content-jobs/stats", { headers: { Authorization: getAuthHeader() } })
        ]);
        if (jobsRes.ok) setContentJobs(await jobsRes.json());
        if (jobStatsRes.ok) setContentJobStats(await jobStatsRes.json());
      }
    } catch {
      console.error("Error triggering content job");
    } finally {
      setTriggeringJob(false);
    }
  };

  // Group chats by user and get last message for each user
  const getGroupedChatsByUser = () => {
    const userGroups: { [key: string]: Chat[] } = {};

    chats.forEach(chat => {
      if (chat.user_id) {
        if (!userGroups[chat.user_id]) {
          userGroups[chat.user_id] = [];
        }
        userGroups[chat.user_id].push(chat);
      }
    });

    // Get last message for each user
    return Object.entries(userGroups).map(([userId, userChats]) => {
      const sortedChats = userChats.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const lastChat = sortedChats[0];
      const user = users.find(u => u.id === userId);

      return {
        userId: userId,
        user,
        lastChat,
        totalChats: userChats.length,
        allChats: sortedChats.reverse() // chronological order for dialog
      };
    });
  };

  const handleUserRowClick = (userId: string) => {
    const userChats = chats
      .filter(chat => chat.user_id === userId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    setSelectedUserChats(userChats);
    setSelectedUserId(userId);
    setIsUserChatHistoryOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Dashboard Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chat Dashboard</h1>
            <p className="text-gray-600">Database overview and analytics</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={loadDashboardData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link to="/dashboard/blog">
              <Button variant="outline">Blog Manager</Button>
            </Link>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
            <Link to="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Chats</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalChats}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Threads</CardTitle>
                <Hash className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalThreads}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Info Collected</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.infoCollected}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Content Automation Section */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Content Automation Jobs
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">Automated content generation runs 5 times per day</p>
            </div>
            <Button onClick={handleTriggerContentJob} disabled={triggeringJob} size="sm">
              <Play className={`w-4 h-4 mr-2 ${triggeringJob ? 'animate-pulse' : ''}`} />
              {triggeringJob ? 'Running...' : 'Run Now'}
            </Button>
          </CardHeader>
          <CardContent>
            {/* Job Stats */}
            {contentJobStats && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-700">{contentJobStats.success}</div>
                  <div className="text-xs text-green-600">Success</div>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-red-700">{contentJobStats.failed}</div>
                  <div className="text-xs text-red-600">Failed</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-700">{contentJobStats.skipped}</div>
                  <div className="text-xs text-yellow-600">Skipped</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-700">{contentJobStats.running}</div>
                  <div className="text-xs text-blue-600">Running</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-700">{contentJobStats.avgDurationMs ? `${(contentJobStats.avgDurationMs / 1000).toFixed(1)}s` : '-'}</div>
                  <div className="text-xs text-gray-600">Avg Duration</div>
                </div>
              </div>
            )}

            {/* Job Logs Table */}
            {contentJobs.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Generated Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Keywords</TableHead>
                      <TableHead>Urdu</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contentJobs.slice(0, 20).map((job) => (
                      <TableRow key={job._id}>
                        <TableCell>
                          {job.status === 'success' && <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>}
                          {job.status === 'failed' && <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>}
                          {job.status === 'running' && <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Running</Badge>}
                          {job.status === 'skipped' && <Badge className="bg-yellow-100 text-yellow-800"><SkipForward className="w-3 h-3 mr-1" />Skipped</Badge>}
                        </TableCell>
                        <TableCell className="max-w-[250px]" title={job.generatedTitle || job.sourceTitle}>
                          <div className="truncate">{job.generatedTitle || job.sourceTitle || '-'}</div>
                          {job.status === 'failed' && job.error && (
                            <div className="text-[11px] text-red-600 mt-1 truncate" title={job.error}>
                              Error: {job.error}
                            </div>
                          )}
                          {job.status === 'failed' && job.sourceUrl && (
                            <div className="text-[10px] text-gray-400 mt-0.5 truncate" title={job.sourceUrl}>
                              {job.sourceUrl.replace('https://joshandmakinternational.com/', '/')}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{job.category || '-'}</TableCell>
                        <TableCell className="max-w-[150px]">
                          <div className="flex flex-wrap gap-1">
                            {(job.keywordsUsed || []).slice(0, 2).map((kw, i) => (
                              <Badge key={i} variant="outline" className="text-[10px] py-0">{kw}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{job.hasUrduVersion ? '✅' : '❌'}</TableCell>
                        <TableCell>{job.durationMs ? `${(job.durationMs / 1000).toFixed(1)}s` : '-'}</TableCell>
                        <TableCell className="text-xs">{new Date(job.startedAt).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No content jobs yet. Click "Run Now" to generate your first article.</p>
            )}
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Info Collected</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name || '-'}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={user.info_collected ? "default" : "secondary"}>
                        {user.info_collected ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Chats Table - Grouped by User */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Chat History</CardTitle>
            <p className="text-sm text-gray-600">Click any user row to view their complete conversation history</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Last Message</TableHead>
                  <TableHead>Total Chats</TableHead>
                  <TableHead>Last Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getGroupedChatsByUser().map((userGroup) => (
                  <TableRow
                    key={userGroup.userId}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleUserRowClick(userGroup.userId)}
                  >
                    <TableCell>{userGroup.userId}</TableCell>
                    <TableCell>{userGroup.user?.name || '-'}</TableCell>
                    <TableCell>{userGroup.user?.phone || '-'}</TableCell>
                    <TableCell>{userGroup.user?.email || '-'}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {userGroup.lastChat.message ?
                        userGroup.lastChat.message.substring(0, 50) + (userGroup.lastChat.message.length > 50 ? '...' : '') :
                        '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{userGroup.totalChats}</Badge>
                    </TableCell>
                    <TableCell>{new Date(userGroup.lastChat.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* User Chat History Dialog */}
        <Dialog open={isUserChatHistoryOpen} onOpenChange={setIsUserChatHistoryOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>User Chat History</DialogTitle>
              {selectedUserId && (
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>User ID:</strong> {selectedUserId}</p>
                  {(() => {
                    const user = users.find(u => u.id === selectedUserId);
                    return user ? (
                      <>
                        <p><strong>Name:</strong> {user.name || 'N/A'}</p>
                        <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
                        <p><strong>Email:</strong> {user.email || 'N/A'}</p>
                        <p><strong>Info Collected:</strong> <Badge variant={user.info_collected ? "default" : "secondary"}>
                          {user.info_collected ? "Yes" : "No"}
                        </Badge></p>
                      </>
                    ) : null;
                  })()}
                  <p><strong>Total Conversations:</strong> {selectedUserChats.length}</p>
                </div>
              )}
            </DialogHeader>
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4">
                {selectedUserChats.map((chat, index) => (
                  <div key={chat.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {chat.message_type}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(chat.created_at).toLocaleString()}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">#{index + 1}</span>
                    </div>

                    {/* User Query */}
                    <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500 mb-3">
                      <h4 className="font-semibold text-blue-900 text-sm mb-1 flex items-center gap-2">
                        <MessageSquare className="w-3 h-3" />
                        User Query
                      </h4>
                      <div className="text-blue-800 text-sm whitespace-pre-wrap break-words">
                        {chat.message || 'No message content'}
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-900 text-sm mb-1 flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        AI Response
                      </h4>
                      <div className="text-green-800 text-sm whitespace-pre-wrap break-words">
                        {chat.response || 'No response content'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
};

export default Dashboard;