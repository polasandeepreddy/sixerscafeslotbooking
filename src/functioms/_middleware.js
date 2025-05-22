export function middleware(request) {
  // Add CORS headers for API routes
  if (request.url.includes("/api/")) {
    const response = new Response(null, {
      status: 200,
      headers: new Headers(request.headers),
    })
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    return response
  }

  return new Response(null, {
    status: 200,
    headers: new Headers(request.headers),
  })
}
