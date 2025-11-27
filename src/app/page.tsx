import CarpenterScene from "@/components/CarpenterScene";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-amber-50 to-zinc-100 text-zinc-900">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16 md:px-10 lg:px-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1.2fr] lg:gap-16">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-amber-200/80 px-4 py-1 text-sm font-medium uppercase tracking-wider text-amber-800">
              Crafted Motion Study
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 md:text-5xl lg:text-6xl">
              Carpenter Carrying Timber With Tool Belt
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-zinc-700">
              A stylized motion vignette showing a focused carpenter hauling a
              timber beam across his shoulder with a well-stocked belt of tools.
              The looping animation uses hand-crafted canvas illustration to
              evoke a cinematic establishing shot.
            </p>
            <div className="flex flex-wrap gap-4 text-sm font-medium text-zinc-600">
              <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                2D Canvas Animation
              </span>
              <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                60 FPS Loop
              </span>
              <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                Handcrafted Scene
              </span>
            </div>
            <p className="text-sm text-zinc-500">
              The scene plays continuously; refresh the page to restart from the
              initial frame.
            </p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-3xl bg-amber-200/60 blur-3xl" />
            <CarpenterScene />
          </div>
        </div>
      </main>
    </div>
  );
}
