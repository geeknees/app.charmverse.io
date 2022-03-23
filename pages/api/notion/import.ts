import nc from 'next-connect';
import { onError, onNoMatch, requireUser } from 'lib/middleware';
import * as http from 'adapters/http';
import { NextApiRequest, NextApiResponse } from 'next';
import { importFromWorkspace } from 'lib/notion/importFromWorkspace';
import { withSessionRoute } from 'lib/session/withSession';

const handler = nc({
  onError,
  onNoMatch
});

handler.use(requireUser).post(importNotion);

interface NotionApiResponse {
  workspace_name: string;
  workspace_icon: string;
  access_token: string;
  owner: {
    user: {
      id: string;
      person: {
        email: string
      };
    }
  }
}

async function importNotion (req: NextApiRequest, res: NextApiResponse) {

  const spaceId = req.body.spaceId as string;
  const tempAuthCode = req.body.code;
  if (!spaceId || !tempAuthCode) {
    res.status(400).send({ error: 'Invalid code or space' });
    return;
  }

  const encodedToken = Buffer.from(`${process.env.NOTION_OAUTH_CLIENT_ID}:${process.env.NOTION_OAUTH_SECRET}`).toString('base64');

  try {
    const token = await http.POST<NotionApiResponse>('https://api.notion.com/v1/oauth/token', {
      grant_type: 'authorization_code',
      redirect_uri: req.headers.host!.startsWith('localhost') ? `http://${req.headers.host}/api/notion/callback` : 'https://app.charmverse.io/api/notion/callback',
      code: tempAuthCode
    }, {
      headers: {
        Authorization: `Basic ${encodedToken}`,
        'Content-Type': 'application/json'
      }
    });
    try {
      await importFromWorkspace({
        spaceId,
        userId: req.session.user.id,
        accessToken: token.access_token,
        workspaceName: token.workspace_name,
        workspaceIcon: token.workspace_icon
      });
      res.status(200).end();
    }
    catch (err: any) {
      if (err.message.startsWith('[IMPORT]')) {
        const errorStringWithoutPrefix = err.message.replace('[IMPORT]: ', '');
        const errorData = JSON.parse(errorStringWithoutPrefix) as {
          pageId: string,
          type: 'page' | 'database',
          title: string,
          blocks: [string, number][]
        };
        res.status(400).json({ error: `Error importing ${errorData.type} named ${errorData.title} with id ${errorData.pageId}. Location: ${errorData.blocks.map(([blockType, blockIndex]) => `${blockType}(${blockIndex + 1})`).join(' -> ')}` });
      }
      else {
        res.status(400).json({ error: 'Something went wrong!' });
      }
    }
  }
  catch (err: any) {
    if (err.error === 'invalid_grant' || err.error === 'invalid_request') {
      res.status(400).json({ error: 'Invalid code. Please try importing again' });
    }
    else {
      res.status(400).json({ error: 'Something went wrong!' });
    }
  }
}

export default withSessionRoute(handler);