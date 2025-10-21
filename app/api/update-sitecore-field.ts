import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { itemId, fieldName, fieldValue } = req.body;

  if (!itemId || !fieldName) return res.status(400).json({ error: 'Missing parameters' });

  try {
    // Step 1: Get token
    const tokenRes = await fetch('https://auth.sitecorecloud.io/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.SITECORE_CLIENT_ID!,
        client_secret: process.env.SITECORE_CLIENT_SECRET!,
        audience: 'https://api.sitecorecloud.io',
        grant_type: 'client_credentials',
      }),
    });

    if (!tokenRes.ok) {
      throw new Error(`Token request failed with status ${tokenRes.status}`);
    }

    const tokenData = await tokenRes.json();
    console.log('Token kk:', tokenData.access_token);
    let data;
    if (tokenData?.access_token) {
      console.log('calling');
      // Step 2: Run mutation
      const response = await fetch(process.env.SITECORE_GRAPHQL_ENDPOINT!, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenData?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
          mutation($input: UpdateItemInput!) {
            updateItem(input: $input) {
              item {
                itemId
                name
              }
            }
          }
        `,
          variables: {
            input: {
              database: 'master',
              itemId,
              language: 'en',
              fields: [{ name: fieldName, value: fieldValue }],
            },
          },
        }),
      });

      const text = await response.text();

      if (!response.ok) {
        console.error('GraphQL request failed:', text);
        return res.status(response.status).json({ error: text });
      }

      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error('Non-JSON response:', text);
        return res.status(500).json({ error: 'Sitecore returned non-JSON data' });
      }
    }

    if (data.errors) {
      console.error('GraphQL errors:', data);
      return res.status(500).json({ error: data.errors });
    }

    return res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    if (error instanceof Error) {
      // ✅ Safe: now TypeScript knows 'error' has 'message'
      return res.status(500).json({ error: error.message });
    }

    // fallback if it's not an instance of Error
    return res.status(500).json({ error: String(error) });
  }
}
