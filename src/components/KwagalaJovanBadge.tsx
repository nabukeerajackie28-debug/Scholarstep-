import React from 'react';
import { Award, Zap, Star } from 'lucide-react';

export default function KwagalaJovanBadge() {
  return (
    <div id="kwagala-jovan-badge" className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-yellow-900/5 to-transparent p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-amber-500/40 hover:shadow-amber-500/5">
      <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 opacity-5">
        <Star className="h-32 w-32 text-amber-400 stroke-[1.5]" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 ring-2 ring-amber-400/20 animate-pulse">
            <Award className="h-6 w-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xs font-semibold tracking-wider text-amber-400 uppercase">Honorary Contributor</span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400 ring-1 ring-inset ring-amber-400/20">
                <Zap className="h-2.5 w-2.5 fill-current" /> Peer Study Advocate
              </span>
            </div>
            <h4 className="mt-1 font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
              Kwagala Jovan
            </h4>
            <p className="mt-1.5 max-w-xl text-sm text-slate-300 leading-relaxed">
              Recognized with supreme honors for laying the core structural components, designing educational pathways, and introducing historical character-driven learning styles to empower secondary education.
            </p>
          </div>
        </div>

        <div className="self-end sm:self-center shrink-0">
          <div className="flex items-center gap-1.5 rounded-lg border border-yellow-500/10 bg-yellow-500/5 px-3.5 py-2 text-xs font-medium text-yellow-400">
            <Star className="h-4 w-4 fill-current text-yellow-400" />
            <span>Excellence in Tutoring</span>
          </div>
        </div>
      </div>
    </div>
  );
}
