"use client";

export default function Footer() {
  return (
    <footer className="px-4 max-w-5xl mx-auto pt-16 border-t border-neutral-900">
      {/* Final Action Box */}
      <div className="p-8 border border-neutral-900 rounded-2xl bg-gradient-to-r from-neutral-950 via-neutral-900/50 to-neutral-950 text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-100 mb-4">
          Join Early Access
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto mb-6 leading-relaxed font-normal">
          Be among the first painters and homeowners helping shape PaintIt Studio. Lock in early access utilities and help us build the perfect visual tool for yourj
        </p>
        <a
          href="#early-access"
          className="inline-flex px-6 py-3 bg-emerald-500 text-neutral-950 font-bold text-sm rounded-md hover:bg-emerald-400 transition shadow-md min-h-[48px] items-center"
        >
          Join Early Access
        </a>
      </div>

      {/* Meta Footer Elements */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-600 font-medium">
        <div>
          © {new Date().getFullYear()} PaintIt Studio. All rights reserved.
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-neutral-400 transition">Privacy Policy</a>
          <a href="#" className="hover:text-neutral-400 transition">Terms of Service</a>
          <a href="/login" className="hover:text-neutral-400 transition">Contact Infrastructure</a>
        </div>
      </div>
    </footer>
  );
}