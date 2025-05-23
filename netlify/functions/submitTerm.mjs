// netlify/functions/submitTerm.js
import { Octokit } from '@octokit/rest';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { term, category, definition, explanation, examples, submitted_by } = JSON.parse(event.body);

    if (!term || !category || !definition || !explanation || !examples || !submitted_by) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing fields' }) };
    }

    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    const owner = 'mx1000m';
    const repo = 'bazed-confused';
    const path = 'public/terms.json';
    const message = `Add term: ${term}`;

    const { data: file } = await octokit.repos.getContent({ owner, repo, path });
    const content = Buffer.from(file.content, 'base64').toString('utf-8');
    const terms = JSON.parse(content);

    // ✅ Check for duplicate term
    const termKey = term.toLowerCase();
    if (terms[termKey]) {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: `The term "${term}" has already been submitted.` }),
      };
    }

    // ✅ Add new term
    terms[termKey] = {
      category,
      definition,
      explanation,
      examples,
      submitted_by,
    };

    const updatedContent = Buffer.from(JSON.stringify(terms, null, 2)).toString('base64');

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: updatedContent,
      sha: file.sha,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error("GitHub update error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'GitHub update failed',
        details: error.message,
      }),
    };
  }
}
