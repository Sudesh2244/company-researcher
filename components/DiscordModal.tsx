"use client";
import { X } from 'lucide-react';

export default function DiscordModal({ config, setConfig, onClose }: { config: any, setConfig: any, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-semibold text-white">Discord automation</h3>
            <p className="text-sm text-slate-400">Send completed reports to a target channel</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Applicant name</label>
            <input type="text" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-slate-200 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30" value={config.applicantName} onChange={e => setConfig({...config, applicantName: e.target.value})} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Applicant contact email</label>
            <input type="email" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-slate-200 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30" value={config.applicantEmail} onChange={e => setConfig({...config, applicantEmail: e.target.value})} />
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Target bot token</label>
            <input type="password" placeholder="Bot MTA0..." className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-200 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30" value={config.botToken} onChange={e => setConfig({...config, botToken: e.target.value})} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Target channel ID</label>
            <input type="text" placeholder="1182..." className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-slate-200 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30" value={config.channelId} onChange={e => setConfig({...config, channelId: e.target.value})} />
          </div>
        </div>

        <button onClick={onClose} className="mt-5 w-full rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500">
          Save configuration
        </button>
      </div>
    </div>
  );
}