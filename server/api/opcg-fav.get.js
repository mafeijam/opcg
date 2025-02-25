export default defineEventHandler(async event => {
  const uuid = getCookie(event, 'opcg_uuid')

  const storage = useStorage('db')

  const saved = (await storage.getItem(`fav-${uuid}`)) || []

  return saved
})
