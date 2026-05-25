import { z } from 'zod'

defineRouteMeta({
  openAPI: {
    description: 'Query a short link by slug',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'slug',
        in: 'query',
        required: true,
        schema: { type: 'string' },
        description: 'The slug of the link to query',
      },
    ],
  },
})

const QueryParamsSchema = z.object({
  slug: z.string().trim().min(1).max(2048),
})

export default eventHandler(async (event) => {
  const { slug } = await getValidatedQuery(event, QueryParamsSchema.parse)

  const { link, metadata } = await getLinkWithMetadata(event, slug)
  if (link) {
    let folderColor = 'slate'
    let tagsWithColors: any[] = []

    const { cloudflare } = event.context
    const { DB } = cloudflare.env

    if (DB) {
      try {
        if (link.folder) {
          const fMeta = await DB.prepare('SELECT color FROM folders_metadata WHERE name = ?').bind(link.folder).first()
          if (fMeta)
            folderColor = fMeta.color
        }
        if (link.tags?.length) {
          const tMeta = await DB.prepare(`SELECT name, color FROM tags_metadata WHERE name IN (${link.tags.map(() => '?').join(',')})`).bind(...link.tags).all()
          const tMap = new Map(tMeta.results.map((r: any) => [r.name, r.color]))
          tagsWithColors = link.tags.map(t => ({ name: t, color: (tMap.get(t) as string) || 'primary' }))
        }
      }
      catch {
        console.warn('Failed to fetch metadata colors for query response')
      }
    }

    return {
      ...metadata,
      ...link,
      folderColor,
      tagsWithColors,
    }
  }

  throw createError({
    status: 404,
    statusText: 'Not Found',
  })
})
