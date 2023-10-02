export function isBodyEmpty(requestBody) {
  const isEmpty = (requestBody === null || typeof requestBody !== 'object')
  return isEmpty
}