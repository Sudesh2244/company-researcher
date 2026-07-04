"use client";

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Sparkles, Download, Send, RefreshCw, Plus } from 'lucide-react';

export default function Home() {
  const [input, setInput] = useState('');
  const [model, setModel] = useState('google/gemini-2.5-flash');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [report, setReport] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('api');
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [serperKey, setSerperKey] = useState('');

  const [discordConfig, setDiscordConfig] = useState({
    botToken: '',
    channelId: '',
    applicantName: 'Sudesh',
    applicantEmail: 'sudeshkamthekar673@gmail.com'
  });

  const handleSaveConfiguration = () => {
    alert("Configuration parameters updated in active runtime memory!");
  };

  const startResearchPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setReport(null);

    try {
      setStatusText('Parsing entry rules and identifying domains...');
      setTimeout(() => setStatusText('Launching web crawler across primary site trees...'), 1200);
      setTimeout(() => setStatusText('Aggregating search intelligence matrices via Serper...'), 2500);
      setTimeout(() => setStatusText('Injecting payloads into OpenRouter reasoning framework...'), 4000);

      const payload: Record<string, string> = { input, model };
      
      if (openRouterKey.trim()) payload.openRouterKey = openRouterKey.trim();
      if (serperKey.trim()) payload.serperKey = serperKey.trim();

      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Safe Extraction: Parse response as text first to handle any bad JSON or HTML crashes elegantly
      const rawText = await res.text();
      let data;
      
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(`Server returned a non-JSON response structure: ${rawText.slice(0, 120)}`);
      }

      if (!res.ok) throw new Error(data.error || 'Pipeline execution broken');

      setReport(data);

      if (discordConfig.botToken && discordConfig.channelId) {
        await dispatchToDiscord(data);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  const generatePDF = (data: any) => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(`Intelligence Report: ${data.companyName}`, 20, 20);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Website: ${data.website}`, 20, 32);
    doc.text(`Phone: ${data.phone}`, 20, 40);
    doc.text(`Address: ${data.address}`, 20, 48);

    doc.setFont('helvetica', 'bold');
    doc.text('Company Executive Summary:', 20, 60);
    doc.setFont('helvetica', 'normal');
    const splitSummary = doc.splitTextToSize(data.summary, 170);
    doc.text(splitSummary, 20, 68);

    let currentY = 68 + (splitSummary.length * 7);

    doc.setFont('helvetica', 'bold');
    doc.text('Identified Core Pain Points:', 20, currentY);
    doc.setFont('helvetica', 'normal');
    data.painPoints.forEach((pt: string) => {
      currentY += 7;
      doc.text(`• ${pt}`, 25, currentY);
    });

    currentY += 12;
    doc.setFont('helvetica', 'bold');
    doc.text('Identified Market Competitors:', 20, currentY);
    doc.setFont('helvetica', 'normal');
    data.competitors.forEach((comp: any) => {
      currentY += 7;
      doc.text(`• ${comp.name} (${comp.website})`, 25, currentY);
    });

    return doc;
  };

  const handleManualDownload = () => {
    if (!report) return;
    const doc = generatePDF(report);
    doc.save(`${report.companyName}_Analysis_Report.pdf`);
  };

  const handleNewResearch = () => {
    setReport(null);
    setInput('');
    setStatusText('');
  };

  const dispatchToDiscord = async (freshReport: any) => {
    try {
      const doc = generatePDF(freshReport);
      const pdfBlob = doc.output('blob');

      const formData = new FormData();
      formData.append('botToken', discordConfig.botToken);
      formData.append('channelId', discordConfig.channelId);
      formData.append('applicantName', discordConfig.applicantName);
      formData.append('applicantEmail', discordConfig.applicantEmail);
      formData.append('companyName', freshReport.companyName);
      formData.append('companyWebsite', freshReport.website);
      formData.append('file', pdfBlob, 'report.pdf');

      await fetch('/api/discord', { method: 'POST', body: formData });
    } catch (e) {
      console.error('Failed executing automated background dispatch to Discord', e);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#090a0f',
      color: '#f4f4f7',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    layoutWrapper: {
      display: 'flex',
      flex: 1,
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
    },
    sidebar: {
      width: '280px',
      backgroundColor: '#12131a',
      borderRight: '1px solid #1f212d',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '20px',
      boxSizing: 'border-box' as const,
      flexShrink: 0,
    },
    brandHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    iconWrapper: {
      borderRadius: '8px',
      border: '1px solid #3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      padding: '8px',
      color: '#3b82f6',
      display: 'flex',
      alignItems: 'center',
    },
    btnNewResearch: {
      marginTop: '16px',
      display: 'flex',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      borderRadius: '8px',
      border: '1px solid #2e303f',
      backgroundColor: '#1c1e29',
      padding: '10px',
      fontSize: '13px',
      fontWeight: 600,
      color: '#f4f4f7',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
    },
    configWidget: {
      borderRadius: '12px',
      border: '1px solid #1f212d',
      backgroundColor: '#161722',
      padding: '14px',
    },
    tabWrapper: {
      marginTop: '12px',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '4px',
      borderRadius: '8px',
      border: '1px solid #2e303f',
      backgroundColor: '#090a0f',
      padding: '3px',
    },
    tabButton: (isActive: boolean) => ({
      borderRadius: '6px',
      padding: '6px 0',
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: isActive ? '#f4f4f7' : 'transparent',
      color: isActive ? '#090a0f' : '#7c7f93',
      transition: 'all 0.15s ease',
    }),
    inputGroup: {
      marginTop: '12px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '10px',
    },
    inputItem: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '4px',
    },
    label: {
      fontSize: '9px',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      color: '#7c7f93',
    },
    input: {
      width: '100%',
      borderRadius: '8px',
      border: '1px solid #2e303f',
      backgroundColor: '#090a0f',
      padding: '8px 12px',
      fontSize: '13px',
      color: '#f4f4f7',
      outline: 'none',
      boxSizing: 'border-box' as const,
    },
    btnSave: {
      marginTop: '14px',
      width: '100%',
      borderRadius: '8px',
      backgroundColor: '#3b82f6',
      padding: '10px 0',
      fontSize: '12px',
      fontWeight: 600,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      color: '#ffffff',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.15s ease',
    },
    instructions: {
      marginTop: '12px',
      borderRadius: '12px',
      border: '1px solid #1f212d',
      backgroundColor: 'rgba(22, 23, 34, 0.4)',
      padding: '14px',
    },
    stepItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      marginTop: '10px',
      fontSize: '12px',
      color: '#9ba0b0',
      lineHeight: '1.5',
    },
    stepNumber: {
      display: 'flex',
      height: '18px',
      width: '18px',
      flexShrink: 0,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px',
      backgroundColor: '#1c1e29',
      fontFamily: 'monospace',
      fontSize: '10px',
      fontWeight: 700,
      color: '#3b82f6',
      border: '1px solid #2e303f',
    },
    canvas: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      minWidth: '0',
      background: 'radial-gradient(circle at 30% 20%, #131520 0%, #090a0f 60%)',
    },
    contentArea: {
      flex: 1,
      padding: '32px',
      overflowY: 'auto' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
    },
    heroSection: {
      maxWidth: '580px',
      margin: '0 auto',
      textAlign: 'center' as const,
    },
    heroIcon: {
      display: 'inline-flex',
      borderRadius: '12px',
      border: '1px solid #2e303f',
      backgroundColor: '#161722',
      padding: '12px',
      color: '#3b82f6',
    },
    dockBar: {
      borderTop: '1px solid #1f212d',
      backgroundColor: '#12131a',
      padding: '18px 32px',
    },
    dockForm: {
      maxWidth: '900px',
      margin: '0 auto',
      display: 'flex',
      gap: '10px',
    },
    dockInput: {
      flex: 1,
      borderRadius: '8px',
      border: '1px solid #2e303f',
      backgroundColor: '#090a0f',
      padding: '11px 14px',
      fontSize: '13px',
      color: '#f4f4f7',
      outline: 'none',
    },
    btnExecute: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      borderRadius: '8px',
      backgroundColor: '#3b82f6',
      padding: '0 20px',
      fontSize: '13px',
      fontWeight: 600,
      color: '#ffffff',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.15s ease',
    },
    card: {
      backgroundColor: '#12131a',
      border: '1px solid #1f212d',
      borderRadius: '12px',
      padding: '20px',
    },
    grid3: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '20px',
      marginTop: '20px',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.layoutWrapper}>
        
        <aside style={styles.sidebar}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={styles.brandHeader}>
                <div style={styles.iconWrapper}>
                  <Sparkles size={16} />
                </div>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: '#f4f4f7', margin: 0, letterSpacing: '-0.01em' }}>Relu Consultancy</p>
                  <p style={{ fontSize: '9px', fontWeight: 600, color: '#7c7f93', letterSpacing: '0.15em', margin: '1px 0 0 0' }}>COMPANY INTELLIGENCE</p>
                </div>
              </div>

              <button type="button" onClick={handleNewResearch} style={styles.btnNewResearch}>
                <Plus size={14} style={{ color: '#3b82f6' }} />
                <span>New Research</span>
              </button>
            </div>

            <div style={styles.configWidget}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em', color: '#9ba0b0', margin: 0 }}>Configuration</p>
                <span style={{ borderRadius: '4px', border: '1px solid #2e303f', backgroundColor: '#1c1e29', padding: '1px 6px', fontSize: '9px', fontWeight: 600, letterSpacing: '0.05em', color: '#3b82f6', marginLeft: 'auto' }}>Live</span>
              </div>

              <div style={styles.tabWrapper}>
                <button type="button" onClick={() => setActiveTab('api')} style={styles.tabButton(activeTab === 'api')}>API</button>
                <button type="button" onClick={() => setActiveTab('discord')} style={styles.tabButton(activeTab === 'discord')}>Discord</button>
              </div>

              {activeTab === 'api' ? (
                <div style={styles.inputGroup}>
                  <div style={styles.inputItem}>
                    <label style={styles.label}>OpenRouter API Key</label>
                    <input type="password" value={openRouterKey} onChange={(e) => setOpenRouterKey(e.target.value)} placeholder="Enter dynamic token..." style={styles.input} />
                  </div>
                  <div style={styles.inputItem}>
                    <label style={styles.label}>Serper.dev API Key</label>
                    <input type="password" value={serperKey} onChange={(e) => setSerperKey(e.target.value)} placeholder="Enter dynamic token..." style={styles.input} />
                  </div>
                </div>
              ) : (
                <div style={styles.inputGroup}>
                  <div style={styles.inputItem}>
                    <label style={styles.label}>Bot Token</label>
                    <input type="password" value={discordConfig.botToken} onChange={(e) => setDiscordConfig({ ...discordConfig, botToken: e.target.value })} placeholder="Bot token" style={styles.input} />
                  </div>
                  <div style={styles.inputItem}>
                    <label style={styles.label}>Channel ID</label>
                    <input type="text" value={discordConfig.channelId} onChange={(e) => setDiscordConfig({ ...discordConfig, channelId: e.target.value })} placeholder="Channel ID" style={styles.input} />
                  </div>
                </div>
              )}

              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={styles.label}>AI Model</label>
                <select value={model} onChange={(e) => setModel(e.target.value)} style={styles.input}>
                  <option value="google/gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
                  <option value="anthropic/claude-3-haiku">Claude 3 Haiku</option>
                </select>
              </div>

              <button type="button" onClick={handleSaveConfiguration} style={styles.btnSave}>
                Save Configuration
              </button>
            </div>
          </div>

          <div style={styles.instructions}>
            <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em', color: '#7c7f93', margin: 0 }}>How it works</p>
            <div style={styles.stepItem}>
              <span style={styles.stepNumber}>1</span>
              <span>Choose your target company or URL.</span>
            </div>
            <div style={styles.stepItem}>
              <span style={styles.stepNumber}>2</span>
              <span>Collect public signals and context.</span>
            </div>
            <div style={styles.stepItem}>
              <span style={styles.stepNumber}>3</span>
              <span>Analyze gaps, competitors, and opportunities.</span>
            </div>
            <div style={styles.stepItem}>
              <span style={styles.stepNumber}>4</span>
              <span>Export a professional intelligence report.</span>
            </div>
          </div>
        </aside>

        <div style={styles.canvas}>
          <div style={styles.contentArea}>
            
            {!report && !loading && (
              <div style={styles.heroSection}>
                <div style={styles.heroIcon}>
                  <Sparkles size={24} />
                </div>
                <h2 style={{ marginTop: '16px', fontSize: '26px', fontWeight: 700, color: '#f4f4f7', letterSpacing: '-0.02em' }}>AI-Powered Enterprise Intelligence</h2>
                <p style={{ marginTop: '10px', fontSize: '13px', color: '#9ba0b0', lineHeight: '1.5' }}>
                  Provide a corporate brand target title or native landing URL. Our automation spiders crawl index branches, analyze search vectors, extract performance gaps, and formulate automated summary files.
                </p>
              </div>
            )}

            {loading && (
              <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', padding: '12px', color: '#3b82f6' }}>
                  <RefreshCw size={20} className="animate-spin" />
                </div>
                <div style={{ ...styles.card, marginTop: '16px', padding: '16px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em', color: '#3b82f6', textTransform: 'uppercase' }}>Active Pipeline Executing</p>
                  <p style={{ marginTop: '6px', fontSize: '13px', color: '#e4e4e7', minHeight: '18px' }}>{statusText}</p>
                </div>
              </div>
            )}

            {report && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignSelf: 'start', width: '100%' }}>
                <div style={styles.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={styles.label}>Intelligence Matrix Harvest</p>
                      <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#f4f4f7', margin: '2px 0 0 0', letterSpacing: '-0.01em' }}>{report.companyName}</h1>
                      <a href={report.website} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#3b82f6', textDecoration: 'none', display: 'inline-block', marginTop: '2px' }}>{report.website}</a>
                    </div>
                    <button onClick={handleManualDownload} style={{ ...styles.btnExecute, height: '38px', backgroundColor: '#3b82f6' }}>
                      <Download size={14} /> Export Document
                    </button>
                  </div>
                </div>

                <div style={styles.grid3}>
                  <div style={styles.card}>
                    <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#f4f4f7', borderBottom: '1px solid #1f212d', paddingBottom: '10px', margin: 0, letterSpacing: '0.02em' }}>Strategic Profile</h3>
                    <p style={{ marginTop: '12px', fontSize: '13px', color: '#9ba0b0', lineHeight: '1.5', whiteSpace: 'pre-line' }}>{report.summary}</p>
                  </div>
                  <div style={styles.card}>
                    <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#f4f4f7', borderBottom: '1px solid #1f212d', paddingBottom: '10px', margin: 0, letterSpacing: '0.02em' }}>Core Offerings</h3>
                    <ul style={{ marginTop: '16px', paddingLeft: '0', listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {report.productsServices?.map((item: string, idx: number) => (
                        <li key={idx} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#9ba0b0' }}>
                          <span style={{ height: '5px', width: '6px', backgroundColor: '#3b82f6', borderRadius: '50%', marginTop: '6px', flexShrink: 0 }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={styles.dockBar}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <form onSubmit={startResearchPipeline} style={styles.dockForm}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter target enterprise brand name or direct platform URL..."
                  disabled={loading}
                  style={styles.dockInput}
                />
                <button type="submit" disabled={loading || !input.trim()} style={{ ...styles.btnExecute, backgroundColor: '#3b82f6' }}>
                  <span>Execute Pipeline</span>
                  <Send size={14} />
                </button>
              </form>
              <p style={{ fontSize: '11px', color: '#4c4f69', margin: '8px 0 0 2px' }}>Suggested formats: Stripe, Retool, Vercel, or https://openai.com</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}