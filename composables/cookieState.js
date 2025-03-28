export function useCookieState(key, defaultValue = null) {
  const cookie = useCookie(key)
  cookie.value = cookie.value || defaultValue

  return cookie
}
