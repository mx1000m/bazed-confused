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

    // Rest of your code...
    
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