import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const urlPathSchema = z
    .string()
    .min(1)
    .max(512)
    .refine(
        (p) =>
            p.startsWith('/') &&
            !p.includes('..') &&
            !p.includes('//') &&
            !/^https?:\/\//i.test(p),
        { message: 'Invalid url path' }
    )

function getBackendBase(): string {
    const base = process.env.NEXT_PUBLIC_API_URL || 'https://ajar-backend.mystore.social/api/v1'
    return base.replace(/\/$/, '')
}

/**
 * Proxies API calls to the backend: /api/ssr?url=/user/listings&page=1&...
 * Forwards Authorization (header or ajar_token cookie) and Accept-Language.
 */
async function proxy(req: NextRequest, method: string): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(req.url)
        const rawUrl = searchParams.get('url')
        const parsed = urlPathSchema.safeParse(rawUrl)
        if (!parsed.success) {
            return NextResponse.json({ message: 'Something went wrong' }, { status: 400 })
        }
        const targetPath = parsed.data

        const forwarded = new URLSearchParams(searchParams)
        forwarded.delete('url')
        const q = forwarded.toString()
        const backendUrl = `${getBackendBase()}${targetPath}${q ? `?${q}` : ''}`

        const headers = new Headers()
        const authHeader = req.headers.get('authorization')
        if (authHeader) {
            headers.set('Authorization', authHeader)
        } else {
            const cookieStore = await cookies()
            const token = cookieStore.get('ajar_token')?.value
            if (token) {
                headers.set('Authorization', `Bearer ${token}`)
            }
        }

        const acceptLanguage = req.headers.get('accept-language')
        if (acceptLanguage) {
            headers.set('Accept-Language', acceptLanguage)
        }
        headers.set('Accept', 'application/json')

        const contentType = req.headers.get('content-type')
        if (contentType && !['GET', 'HEAD'].includes(method)) {
            headers.set('Content-Type', contentType)
        } else if (!['GET', 'HEAD', 'DELETE'].includes(method)) {
            headers.set('Content-Type', 'application/json')
        }

        const init: RequestInit = {
            method,
            headers,
            signal: req.signal,
        }

        if (!['GET', 'HEAD'].includes(method)) {
            const buf = await req.arrayBuffer()
            if (buf.byteLength > 0) {
                init.body = buf
            }
        }

        const upstream = await fetch(backendUrl, init)
        const outHeaders = new Headers()
        const ct = upstream.headers.get('content-type')
        if (ct) {
            outHeaders.set('Content-Type', ct)
        }

        if (!upstream.body) {
            return new NextResponse(null, { status: upstream.status, headers: outHeaders })
        }

        return new NextResponse(upstream.body, {
            status: upstream.status,
            headers: outHeaders,
        })
    } catch (e) {
        console.error('api/ssr proxy error', e)
        return NextResponse.json({ message: 'Something went wrong' }, { status: 500 })
    }
}

export function GET(req: NextRequest) {
    return proxy(req, 'GET')
}

export function POST(req: NextRequest) {
    return proxy(req, 'POST')
}

export function PUT(req: NextRequest) {
    return proxy(req, 'PUT')
}

export function PATCH(req: NextRequest) {
    return proxy(req, 'PATCH')
}

export function DELETE(req: NextRequest) {
    return proxy(req, 'DELETE')
}
