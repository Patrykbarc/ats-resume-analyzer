type ListBlockProps = {
  title: string
  items: string[]
}

export function ListBlock({ title, items }: ListBlockProps) {
  if (!items?.length) {
    return null
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
