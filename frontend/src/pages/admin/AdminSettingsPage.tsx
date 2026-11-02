import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../../api/services';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2 } from 'lucide-react';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { AppSettings } from '../../types';

export const AdminSettingsPage: React.FC = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<AppSettings>({
    queryKey: ['app-settings'],
    queryFn: () => settingsApi.getSettings()
  });

  const [appName, setAppName] = useState('');
  const [commissionType, setCommissionType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [commissionValue, setCommissionValue] = useState(10);
  const [cancellationCutoffHours, setCancellationCutoffHours] = useState(24);
  const [supportEmail, setSupportEmail] = useState('');

  useEffect(() => {
    if (settings) {
      setAppName(settings.appName || 'DocCare Connect');
      setCommissionType(settings.commissionType || 'PERCENTAGE');
      setCommissionValue(Number(settings.commissionValue) || 10);
      setCancellationCutoffHours(settings.cancellationCutoffHours || 24);
      setSupportEmail(settings.supportEmail || 'support@doccare.com');
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => settingsApi.updateSettings(data),
    onSuccess: () => {
      addToast('Platform settings saved successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || 'Failed to update settings.', 'error');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      appName,
      commissionType,
      commissionValue: Number(commissionValue),
      cancellationCutoffHours: Number(cancellationCutoffHours),
      supportEmail
    });
  };

  if (isLoading) {
    return <LoadingSkeleton height="360px" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '760px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>Platform Configuration</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Adjust financial commission structures, cancellation cutoff rules, and healthcare branding.
        </p>
      </div>

      <div className="card" style={{ padding: '32px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '6px' }}>
              Healthcare Platform Name
            </label>
            <input
              type="text"
              required
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="input-field"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '6px' }}>
                Commission Fee Model
              </label>
              <select
                value={commissionType}
                onChange={(e) => setCommissionType(e.target.value as any)}
                className="input-field"
              >
                <option value="PERCENTAGE">Percentage (%) of Consultation Fee</option>
                <option value="FIXED">Fixed Fee (₹ INR) per Booking</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '6px' }}>
                Commission Value ({commissionType === 'PERCENTAGE' ? '%' : '₹'})
              </label>
              <input
                type="number"
                required
                min={0}
                step={commissionType === 'PERCENTAGE' ? 0.5 : 10}
                value={commissionValue}
                onChange={(e) => setCommissionValue(parseFloat(e.target.value))}
                className="input-field"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '6px' }}>
                Cancellation & Reschedule Cutoff (Hours)
              </label>
              <input
                type="number"
                required
                min={0}
                max={168}
                value={cancellationCutoffHours}
                onChange={(e) => setCancellationCutoffHours(parseInt(e.target.value, 10))}
                className="input-field"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                Patients cannot cancel or reschedule within this many hours of appointment.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '6px' }}>
                System Support Email
              </label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="btn btn-primary"
              style={{ minWidth: '180px', justifyContent: 'center' }}
            >
              <CheckCircle2 size={16} />
              {updateMutation.isPending ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
