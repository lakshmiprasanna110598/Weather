import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Bell,
  BellRing,
  Info,
  ChevronRight,
  X,
  Volume2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { WeatherAlert } from '../types/weather';

interface WeatherAlertsBannerProps {
  alerts: WeatherAlert[];
  onTriggerTestAlert?: () => void;
}

export const WeatherAlertsBanner: React.FC<WeatherAlertsBannerProps> = ({
  alerts,
  onTriggerTestAlert,
}) => {
  const [selectedAlert, setSelectedAlert] = useState<WeatherAlert | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const activeAlerts = alerts;

  const handleToggleNotifications = async () => {
    if (!('Notification' in window)) {
      setNotificationMsg('Notifications not supported in this browser.');
      setTimeout(() => setNotificationMsg(null), 3500);
      return;
    }

    if (Notification.permission === 'granted') {
      setNotificationsEnabled(!notificationsEnabled);
      setNotificationMsg(
        !notificationsEnabled
          ? 'Real-time alert notifications active!'
          : 'Real-time notifications paused.'
      );
      setTimeout(() => setNotificationMsg(null), 3000);
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        new Notification('Weather Alerts Activated', {
          body: 'You will receive instant alerts for severe storms, gale winds, and freeze warnings.',
          icon: '/icon.svg',
        });
        setNotificationMsg('Alert notifications enabled!');
        setTimeout(() => setNotificationMsg(null), 3000);
      } else {
        setNotificationMsg('Notification permission was dismissed.');
        setTimeout(() => setNotificationMsg(null), 3000);
      }
    } else {
      setNotificationMsg('Notifications are blocked in browser settings.');
      setTimeout(() => setNotificationMsg(null), 3500);
    }
  };

  const getSeverityStyles = (severity: WeatherAlert['severity']) => {
    switch (severity) {
      case 'extreme':
        return {
          bannerBg: 'bg-rose-950/80 border-rose-500/60 text-rose-200',
          badge: 'bg-rose-600 text-white',
          iconColor: 'text-rose-400',
        };
      case 'severe':
        return {
          bannerBg: 'bg-orange-950/80 border-orange-500/60 text-orange-200',
          badge: 'bg-orange-600 text-white',
          iconColor: 'text-orange-400',
        };
      case 'moderate':
        return {
          bannerBg: 'bg-amber-950/70 border-amber-500/50 text-amber-200',
          badge: 'bg-amber-600 text-white',
          iconColor: 'text-amber-400',
        };
      case 'minor':
      default:
        return {
          bannerBg: 'bg-sky-950/70 border-sky-500/40 text-sky-200',
          badge: 'bg-sky-600 text-white',
          iconColor: 'text-sky-400',
        };
    }
  };

  return (
    <div className="mb-6 space-y-3">
      {/* Alert Notification & Test Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <ShieldAlert className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-slate-200">Real-Time Severe Weather Monitor</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Live Polling
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onTriggerTestAlert && (
            <button
              id="btn-trigger-test-alert"
              onClick={onTriggerTestAlert}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-white transition"
              title="Simulate severe weather alert event"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Alert</span>
            </button>
          )}

          <button
            id="btn-toggle-notifications"
            onClick={handleToggleNotifications}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition ${
              notificationsEnabled
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            {notificationsEnabled ? (
              <BellRing className="w-3.5 h-3.5 text-sky-400" />
            ) : (
              <Bell className="w-3.5 h-3.5" />
            )}
            <span>{notificationsEnabled ? 'Alerts On' : 'Enable Alerts'}</span>
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-sky-300 border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <Info className="w-3.5 h-3.5" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Active Alerts List */}
      {activeAlerts.length > 0 ? (
        <div className="space-y-2">
          {activeAlerts.map((alert) => {
            const styles = getSeverityStyles(alert.severity);
            return (
              <div
                key={alert.id}
                id={`alert-card-${alert.id}`}
                onClick={() => setSelectedAlert(alert)}
                className={`group cursor-pointer rounded-2xl border p-4 shadow-lg backdrop-blur-md transition-all hover:scale-[1.005] hover:shadow-xl ${styles.bannerBg}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl bg-black/20 ${styles.iconColor}`}>
                      <AlertTriangle className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`uppercase tracking-wider font-bold text-[10px] px-2 py-0.5 rounded-full ${styles.badge}`}
                        >
                          {alert.severity}
                        </span>
                        <h3 className="font-semibold text-sm text-white">{alert.event}</h3>
                        <span className="text-[11px] text-slate-300/80">
                          Expires: {alert.expires}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-200 line-clamp-2">
                        {alert.headline} — {alert.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-medium text-slate-300 group-hover:text-white flex-shrink-0 self-center">
                    <span>Details</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-3.5 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>No active severe weather warnings for current region. Conditions are normal.</span>
          </div>
          <span className="text-[11px] text-slate-500">Updated in real-time</span>
        </div>
      )}

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase px-2 py-0.5 rounded-md font-bold bg-amber-500/30 text-amber-300">
                      {selectedAlert.severity} Severity
                    </span>
                    <span className="text-xs text-slate-400">{selectedAlert.effective}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">{selectedAlert.event}</h2>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
                  Headline Summary
                </h4>
                <p className="mt-1 text-sm font-medium text-amber-200/90 leading-relaxed">
                  {selectedAlert.headline}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
                  Advisory Overview
                </h4>
                <p className="text-slate-300 leading-relaxed">{selectedAlert.description}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-amber-300">
                  <Volume2 className="w-4 h-4" />
                  <span>Safety Recommendations</span>
                </div>
                <p className="text-amber-100/90 leading-relaxed">{selectedAlert.instruction}</p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <span>Issued by: {selectedAlert.sender}</span>
                <span>Valid through: {selectedAlert.expires}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedAlert(null)}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
