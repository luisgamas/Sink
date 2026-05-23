export default eventHandler(async (event) => {
  const { cloudflare } = event.context
  if (!cloudflare?.env)
    return

  const db = (cloudflare.env as unknown as Record<string, unknown>).DB
  if (db) {
    await ensureMigrations(db)
  }
})
