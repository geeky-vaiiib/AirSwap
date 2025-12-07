/**
 * Production Monitoring Dashboard
 * Displays system health, uptime, and key metrics
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity,
  Database,
  Shield,
  Zap,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Server
} from 'lucide-react';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: {
      status: 'up' | 'down';
      latency?: number;
      error?: string;
    };
  };
}

interface MonitoringMetrics {
  claimsToday: number;
  totalClaims: number;
  pendingVerifications: number;
  errorRate: number;
  recentErrors: string[];
}

export default function MonitoringDashboard() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [metrics, setMetrics] = useState<MonitoringMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchHealthStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealthStatus(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch health status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      // These would typically come from actual monitoring APIs
      // For now, using placeholder/mock data
      setMetrics({
        claimsToday: 0,
        totalClaims: 0,
        pendingVerifications: 0,
        errorRate: 0,
        recentErrors: []
      });

      // Uncomment when you have real APIs:
      // const claimsRes = await fetch('/api/monitoring/metrics');
      // const metricsData = await claimsRes.json();
      // setMetrics(metricsData);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
    fetchMetrics();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'degraded': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'unhealthy': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatLatency = (latency: number) => {
    return latency < 1000 ? `${latency}ms` : `${(latency / 1000).toFixed(1)}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time health and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHealthStatus}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            Updated: {lastUpdated.toLocaleTimeString()}
          </Button>
        </div>
      </div>

      {/* Health Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            {healthStatus && getStatusIcon(healthStatus.status)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              <span className={getStatusColor(healthStatus?.status || 'unknown')}>
                {healthStatus?.status || 'Unknown'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Overall system health
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              { formatUptime(healthStatus?.uptime || 0) }
            </div>
            <p className="text-xs text-muted-foreground">
              Continuous operation time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Health</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthStatus?.checks.database.status === 'up' ? (
                <span className="text-green-600">
                  {healthStatus.checks.database.latency ?
                    formatLatency(healthStatus.checks.database.latency) :
                    '<1ms'
                  }
                </span>
              ) : (
                <span className="text-red-600">Down</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Database response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">🔐</div>
            <p className="text-xs text-muted-foreground">
              Security systems active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Status Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>
              Detailed health status and system information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {healthStatus ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status</span>
                  <Badge
                    variant={healthStatus.status === 'healthy' ? 'default' :
                           healthStatus.status === 'degraded' ? 'secondary' : 'destructive'}
                    className="capitalize"
                  >
                    {healthStatus.status}
                  </Badge>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium">Version</span>
                  <span className="text-sm text-muted-foreground">{healthStatus.version}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium">Last Check</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(healthStatus.timestamp).toLocaleString()}
                  </span>
                </div>

                {healthStatus.checks.database.status === 'down' && (
                  <Alert>
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      Database is unavailable: {healthStatus.checks.database.error}
                    </AlertDescription>
                  </Alert>
                )}
              </>
            ) : (
              <p className="text-center text-muted-foreground py-4">Loading health status...</p>
            )}
          </CardContent>
        </Card>

        {/* Application Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Application Metrics
            </CardTitle>
            <CardDescription>
              Key performance indicators and usage statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Claims Today</span>
                  <span className="text-lg font-bold">{metrics.claimsToday}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total Claims</span>
                  <span className="text-sm text-muted-foreground">{metrics.totalClaims}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium">Pending Verifications</span>
                  <span className="text-sm text-muted-foreground">{metrics.pendingVerifications}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Error Rate</span>
                    <span className="text-sm text-muted-foreground">{metrics.errorRate.toFixed(2)}%</span>
                  </div>
                  <Progress value={metrics.errorRate} className="h-2" />
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground py-4">Loading metrics...</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Errors */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Events</CardTitle>
          <CardDescription>
            Latest system events and error notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metrics?.recentErrors && metrics.recentErrors.length > 0 ? (
            <div className="space-y-2">
              {metrics.recentErrors.map((error, index) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-green-600 font-medium">No recent errors</p>
              <p className="text-sm text-muted-foreground">System operating normally</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monitoring Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Monitoring Actions</CardTitle>
          <CardDescription>
            Quick actions for system maintenance and monitoring
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button variant="outline" size="sm">
            View Sentry Logs
          </Button>
          <Button variant="outline" size="sm">
            Export System Report
          </Button>
          <Button variant="outline" size="sm">
            Database Health Check
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
