export default defineEventHandler(async event => {
  const uuid = getCookie(event, 'opcg_uuid')
  const body = await readBody(event)

  const storage = useStorage('db')

  const saved = (await storage.getItem(`stock-${uuid}`)) || []

  if (saved.includes(body.card)) {
    saved.splice(saved.indexOf(body.card), 1)
  } else {
    saved.push(body.card)
  }

  await storage.setItem(`stock-${uuid}`, saved)

  return saved
})
