export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 animate-spin"
        style={{ borderColor: 'rgba(107,163,190,0.2)', borderTopColor: 'var(--lake-blue)' }} />
    </div>
  )
}
