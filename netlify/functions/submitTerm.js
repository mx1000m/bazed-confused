// netlify/functions/submitTerm.js
const { Octokit } = require('@octokit/rest');
require('dotenv').config();

exports.handler = async (event) => {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': 'https://bazedandconfused.netlify.app',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { term, category, definition, explanation, examples, submitted_by } = JSON.parse(event.body);

    console.log("Received submission:", { term, category, submitted_by });

    if (!term || !category || !definition || !explanation || !examples || !submitted_by) {
      return { 
        statusCode: 400, 
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    const owner = 'mx1000m'; // your GitHub username
    const repo = 'bazed-confused'; // your repo name
    const path = 'public/terms.json';
    const message = `Add term: ${term}`;

    // Get the current content of the terms.json file
    const { data: file } = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    const content = Buffer.from(file.content, 'base64').toString('utf-8');
    const terms = JSON.parse(content);

    // Add new term
    terms[term.toLowerCase()] = {
      category,
      definition,
      explanation,
      examples,
      submitted_by,
    };

    const updatedContent = Buffer.from(JSON.stringify(terms, null, 2)).toString('base64');

    // Commit the update
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
      headers,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Server error processing request',
        details: error.message,
      }),
    };
  }
};