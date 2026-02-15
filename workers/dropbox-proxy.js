/**
 * Cloudflare Worker for Dropbox Proxy
 * To be deployed via Cloudflare Dashboard or Wrangler
 */

export default {
    async fetch(request, env, ctx) {
        // CORS Headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-File-Name',
        };

        // Handle OPTIONS (Preflight)
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const url = new URL(request.url);

        // GET: List Photos
        if (request.method === 'GET') {
            try {
                // 1. List Folder
                const listResp = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${env.DROPBOX_ACCESS_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        path: '', // App folder root
                        recursive: false,
                        include_media_info: false
                    })
                });

                if (!listResp.ok) {
                    return new Response(JSON.stringify({ error: 'Failed to list folder' }), {
                        status: listResp.status,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                }

                const listData = await listResp.json();

                // Filter images
                const files = listData.entries.filter(entry =>
                    entry['.tag'] === 'file' && entry.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                );

                // 2. Get Temporary Links (in parallel)
                // Note: Limit concurrent requests if necessary. Cloudflare limit is 50 subrequests.
                const photos = await Promise.all(files.map(async (file) => {
                    const linkResp = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${env.DROPBOX_ACCESS_TOKEN}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ path: file.path_lower })
                    });
                    const linkData = await linkResp.json();
                    return {
                        id: file.id,
                        name: file.name,
                        data: linkData.link,
                        uploadedAt: file.client_modified
                    };
                }));

                // Sort
                photos.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

                return new Response(JSON.stringify(photos), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });

            } catch (err) {
                return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
            }
        }

        // POST: Upload Photo
        if (request.method === 'POST') {
            try {
                const fileName = request.headers.get('X-File-Name') || 'uploaded_image.jpg';
                // Sanitize filename
                const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
                const timestamp = Date.now();
                const path = `/${timestamp}_${safeName}`;

                // Upload to Dropbox (Content-header implies binary)
                const uploadResp = await fetch('https://content.dropboxapi.com/2/files/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${env.DROPBOX_ACCESS_TOKEN}`,
                        'Dropbox-API-Arg': JSON.stringify({
                            path: path,
                            mode: 'add',
                            autorename: true,
                            mute: false
                        }),
                        'Content-Type': 'application/octet-stream'
                    },
                    body: request.body // Stream directly
                });

                if (!uploadResp.ok) {
                    const errText = await uploadResp.text();
                    return new Response(JSON.stringify({ error: errText }), { status: uploadResp.status, headers: corsHeaders });
                }

                const uploadData = await uploadResp.json();

                // Get Link for response
                const linkResp = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${env.DROPBOX_ACCESS_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ path: uploadData.path_lower })
                });
                const linkData = await linkResp.json();

                return new Response(JSON.stringify({
                    id: uploadData.id,
                    name: uploadData.name,
                    data: linkData.link,
                    uploadedAt: uploadData.client_modified
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

            } catch (err) {
                return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
            }
        }

        return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }
};
