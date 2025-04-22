// Change the import to CommonJS format
const { Octokit } = require('@octokit/rest');

exports.handler = async function(event) {
  // Add debug logging
  console.log("Function invoked with method:", event.httpMethod);
  console.log("Event body:", event.body);
  
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { term, category, definition, explanation, examples, submitted_by } = JSON.parse(event.body);

    console.log("Parsed fields:", { term, category, definition, explanation, examples, submitted_by });

    if (!term || !category || !definition || !explanation || !examples || !submitted_by) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing fields' }) };
    }

    console.log("Initializing Octokit with token:", process.env.GITHUB_TOKEN ? "Token exists" : "Token missing");
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    const owner = 'mx1000m';
    const repo = 'bazed-confused';
    const path = 'public/terms.json';
    const message = `Add term: ${term}`;

    console.log("Fetching content from GitHub:", { owner, repo, path });
    const { data: file } = await octokit.repos.getContent({ owner, repo, path });
    const content = Buffer.from(file.content, 'base64').toString('utf-8');
    const terms = JSON.parse(content);

    console.log("Successfully parsed existing terms file");
    terms[term.toLowerCase()] = {
      category,
      definition,
      explanation,
      examples,
      submitted_by,
    };

    const updatedContent = Buffer.from(JSON.stringify(terms, null, 2)).toString('base64');

    console.log("Updating GitHub content");
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: updatedContent,
      sha: file.sha,
    });

    console.log("GitHub update successful");
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.log("Detailed error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'GitHub update failed',
        details: error.message,
        stack: error.stack
      }),
    };
  }
};