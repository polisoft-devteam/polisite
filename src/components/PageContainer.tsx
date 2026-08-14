// Standard page width and padding, so every page lines up with the header and footer.

export function PageContainer({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-5xl px-4 py-12">{children}</div>
}
