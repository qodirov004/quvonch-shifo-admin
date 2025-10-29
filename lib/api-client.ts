export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`https://api.greentraver.uz${endpoint}`, {
    ...options,
    headers,
    cache: 'no-store',
  })

  if (response.status === 401) {
    // Clear auth and redirect to login
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminToken")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
  }

  return response
}

export async function apiGet(endpoint: string) {
  try {
    const response = await apiCall(endpoint, { method: "GET" })
    if (!response.ok) {
      console.warn(`API error: ${response.status} for ${endpoint}`)
      throw new Error(`API error: ${response.status}`)
    }
    return response.json()
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error)
    throw error
  }
}

export async function apiPost(endpoint: string, data: any) {
  const response = await apiCall(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`API error: ${response.status}${text ? ` - ${text}` : ''}`)
  }
  return response.json()
}

export async function apiPut(endpoint: string, data: any) {
  const response = await apiCall(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`API error: ${response.status}${text ? ` - ${text}` : ''}`)
  }
  return response.json()
}

export async function apiPatch(endpoint: string, data: any) {
  const response = await apiCall(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`API error: ${response.status}${text ? ` - ${text}` : ''}`)
  }
  return response.json()
}

export async function apiDelete(endpoint: string) {
  const response = await apiCall(endpoint, { method: "DELETE" })
  if (!response.ok) throw new Error(`API error: ${response.status}`)
  return response
}
