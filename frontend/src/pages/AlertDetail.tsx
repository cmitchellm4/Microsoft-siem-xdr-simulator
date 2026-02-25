import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, Clock, Tag, User, Monitor, Shield, Activity } from 'lucide-react'

const severityColor: Record<string, string> = {
  Critical: '#9b59b6',
  High: '#e74c3c',
  Medium: '#f39c12',
  Low: '#27ae60',
  Informational: '#8888aa',
}

const categoryDescriptions: Record<string, string> = {
  Phishing: 'Attempts to steal credentials or install malware via deceptive emails or websites.',
  InitialAccess: 'Techniques used to gain an initial foothold in the network.',
  Execution: 'Techniques resulting in adversary-controlled code running on a system.',
  Persistence: 'Techniques used to maintain access across restarts or credential changes.',
  CredentialAccess: 'Techniques for stealing credentials like account names and passwords.',
  LateralMovement: 'Techniques used to move through the environment and access resources.',
  Collection: 'Techniques used to gather data relevant to the adversary goals.',
  Impact: 'Techniques used to disrupt availability or compromise integrity of systems.',
  Malware: 'Malicious software detected on the system or in communications.',
}

const productColors: Record<string, string> = {
  'Defender for Endpoint': '#0078d4',
  'Defender for Identity': '#00b4d8',
  'Defender for Office 365': '#00cc6a',
  'Defender for Cloud Apps': '#f39c12',
}

const remediationSteps: Record<string, string[]> = {
  Phishing: [
    'Block the sending domain at the email gateway',
    'Remove the phishing email from all affected mailboxes',
    'Reset credentials for any users who clicked the link',
    'Enable Safe Links and Safe Attachments policies',
    'Review and update anti-phishing policies',
  ],
  InitialAccess: [
    'Revoke all active sessions for the compromised account',
    'Reset the account password immediately',
    'Review sign-in logs for suspicious activity',
    'Enable MFA if not already configured',
    'Block the source IP address at the firewall',
  ],
  Execution: [
    'Isolate the affected device immediately',
    'Kill the suspicious process',
    'Scan the device for additional malware',
    'Review PowerShell execution logs',
    'Enable PowerShell script block logging',
  ],
  Persistence: [
    'Remove the malicious inbox rule or registry key',
    'Review all recently created rules and scheduled tasks',
    'Audit admin accounts for unauthorized changes',
    'Enable audit logging for rule creation events',
  ],
  CredentialAccess: [
    'Reset all credentials on the affected device',
    'Rotate service account passwords',
    'Isolate the device from the network',
    'Check for lateral movement using stolen credentials',
    'Enable Credential Guard on Windows devices',
  ],
  LateralMovement: [
    'Isolate all affected devices immediately',
    'Reset credentials used for lateral movement',
    'Review network logs for additional compromised hosts',
    'Block NTLM authentication where possible',
    'Enable Protected Users security group',
  ],
  Collection: [
    'Revoke access tokens and active sessions',
    'Review mailbox audit logs for data access',
    'Check for data exfiltration to external locations',
    'Enable mailbox auditing if not already enabled',
  ],
  Impact: [
    'Isolate all affected systems immediately',
    'Do not pay any ransom demands',
    'Preserve forensic evidence before remediation',
    'Restore from clean backups',
    'Engage incident response team',
    'Report to relevant authorities',
  ],
  Malware: [
    'Isolate the affected device immediately',
    'Run a full antivirus scan',
    'Remove the malicious file',
    'Check for persistence mechanisms',
    'Review network connections from the device',
  ],
}

export default function AlertDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [alert, setAlert] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/v1/defender/alerts/${id}`)
        const data = await res.json()
        setAlert(data)
      } catch {
        setAlert(null)
      } finally {
        setLoading(false)
      }
    }
    fetchAlert()
  }, [id])

  if (loading) return (
    <div style={{ padding: '32px', color: '#8888aa' }}>Loading...</div>
  )

  if (!alert) return (
    <div style={{ padding: '32px', color: '#e74c3c' }}>Alert not found.</div>
  )

  const steps = remediationSteps[alert.category] || remediationSteps['Malware']
  const categoryDesc = categoryDescriptions[alert.category] || ''
  const productColor = productColors[alert.product] || '#0078d4'
  const isDevice = !alert.entity?.includes('@')

  return (
    <div style={{ padding: '32px', maxWidth: '1100px' }}>

      {/* Back Button */}
      <button onClick={() => navigate('/alerts')} style={{
        background: 'transparent',
        border: 'none',
        color: '#8888aa',
        fontSize: '13px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '24px',
        padding: 0,
      }}>
        <ArrowLeft size={14} /> Back to Alerts
      </button>

      {/* Header */}
      <div style={{
        background: '#1a1a2e',
        border: '1px solid #2a2a4a',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '20px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Bell size={24} color={severityColor[alert.severity]} />
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff' }}>
              {alert.title}
            </h1>
          </div>
          <span style={{
            background: `${severityColor[alert.severity]}22`,
            color: severityColor[alert.severity],
            border: `1px solid ${severityColor[alert.severity]}44`,
            borderRadius: '20px',
            padding: '4px 16px',
            fontSize: '12px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}>
            {alert.severity}
          </span>
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#8888aa' }}>
            <Clock size={12} />
            {new Date(alert.createdTime).toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#8888aa' }}>
            <Tag size={12} />
            Status: <span style={{ color: '#ffffff' }}>{alert.status}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <Shield size={12} color={productColor} />
            <span style={{ color: productColor }}>{alert.product}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#8888aa', fontFamily: 'monospace' }}>
            <Activity size={12} />
            {alert.mitreAttackTechnique}
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: '13px', color: '#aaaacc', lineHeight: '1.6' }}>
          {alert.description}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

        {/* Affected Entity */}
        <div style={{
          background: '#1a1a2e',
          border: '1px solid #2a2a4a',
          borderRadius: '8px',
          padding: '20px',
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '16px' }}>
            Affected Entity
          </h2>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: '#0f0f1a',
            borderRadius: '6px',
            border: '1px solid #2a2a4a',
          }}>
            {isDevice
              ? <Monitor size={20} color='#0078d4' />
              : <User size={20} color='#27ae60' />
            }
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                {alert.entity}
              </div>
              <div style={{ fontSize: '11px', color: '#8888aa', marginTop: '2px' }}>
                {isDevice ? 'Device' : 'User Account'}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '12px', color: '#8888aa', marginBottom: '8px' }}>
              Alert Category
            </div>
            <div style={{
              padding: '12px 16px',
              background: '#0f0f1a',
              borderRadius: '6px',
              border: '1px solid #2a2a4a',
            }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>
                {alert.category}
              </div>
              <div style={{ fontSize: '12px', color: '#8888aa', lineHeight: '1.5' }}>
                {categoryDesc}
              </div>
            </div>
          </div>
        </div>

        {/* MITRE Detail */}
        <div style={{
          background: '#1a1a2e',
          border: '1px solid #2a2a4a',
          borderRadius: '8px',
          padding: '20px',
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '16px' }}>
            MITRE ATT&amp;CK
          </h2>
          <div style={{
            padding: '16px',
            background: '#0f0f1a',
            borderRadius: '6px',
            border: '1px solid #2a2a4a',
            marginBottom: '12px',
          }}>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0078d4', fontFamily: 'monospace', marginBottom: '4px' }}>
              {alert.mitreAttackTechnique}
            </div>
            <div style={{ fontSize: '12px', color: '#8888aa' }}>
              Technique ID
            </div>
          </div>
          
        <button
            onClick={() => window.open(`https://attack.mitre.org/techniques/${alert.mitreAttackTechnique?.replace('.', '/')}/`, '_blank')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: '#0078d4',
              textDecoration: 'none',
              padding: '6px 12px',
              background: '#0078d422',
              borderRadius: '6px',
              border: '1px solid #0078d444',
              cursor: 'pointer',
            }}
          >
            View on MITRE ATT&amp;CK
          </button>
        </div>
      </div>

      {/* Remediation Steps */}
      <div style={{
        background: '#1a1a2e',
        border: '1px solid #2a2a4a',
        borderRadius: '8px',
        padding: '20px',
      }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '16px' }}>
          Recommended Remediation Steps
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {steps.map((step, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '12px 16px',
              background: '#0f0f1a',
              borderRadius: '6px',
              border: '1px solid #2a2a4a',
            }}>
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: '#0078d422',
                border: '1px solid #0078d444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                color: '#0078d4',
                flexShrink: 0,
              }}>
                {index + 1}
              </div>
              <span style={{ fontSize: '13px', color: '#cccccc', lineHeight: '1.5' }}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}