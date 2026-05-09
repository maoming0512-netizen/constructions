export default function Loading() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center">
      <div className="relative">
        <div 
          className="w-10 h-10 rounded-full border-2 animate-spin"
          style={{ 
            borderColor: 'rgba(107,163,190,0.2)',
            borderTopColor: 'var(--lake-blue)'
          }} 
        />
      </div>
    </div>
  )
}
