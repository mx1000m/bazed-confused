// netlify/functions/submitTerm.js
const { Octokit } = require('@octokit/rest');
require('dotenv').config();

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { term, category, definition, explanation, examples, submitted_by } = JSON.parse(event.body);

  if (!term || !category || !definition || !explanation || !examples || !submitted_by) {
    return { statusCode: 400, body: 'Missing fields' };
  }

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const owner = 'mx1000m'; // 👈 your GitHub username
  const repo = 'bazed-confused'; // 👈 your repo name
  const path = 'public/terms.json';
  const message = `Add term: ${term}`;

  try {
    // Fetch the existing file
    const { data: file } = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    const content = Buffer.from(file.content, 'base64').toString('utf-8');
    const terms = JSON.parse(content);

    // Add the new term
    terms[term.toLowerCase()] = {
      category,
      definition,
      explanation,
      examples,
      submitted_by,
    };

    const updatedContent = Buffer.from(JSON.stringify(terms, null, 2)).toString('base64');

    // Commit updated file
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
    console.error('GitHub update error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'GitHub update failed', details: error.message }),
    };
  }
};
