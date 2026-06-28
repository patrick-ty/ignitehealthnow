export default async function ComingSoon({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const title = slug.charAt(0).toUpperCase() + slug.slice(1)
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center">
      <h2 className="text-lg font-semibold text-brand-ink">{title}</h2>
      <p className="mt-1 text-sm text-muted">This admin module is coming in a later slice.</p>
    </div>
  )
}
