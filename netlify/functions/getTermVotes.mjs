import { Octokit } from '@octokit/rest';

export const handler = async function(event, context) {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // Get parameters from query string
  const termKey = event.queryStringParameters.termKey;

  if (!termKey) {
    return { 
      statusCode: 400, 
      body: JSON.stringify({ error: 'Missing required parameter: termKey' }) 
    };
  }

  console.log('Getting votes for term:', termKey);

  try {
    // Get GitHub token and repo info from environment variables
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = process.env.REPO_OWNER;
    const REPO_NAME = process.env.REPO_NAME;
    
    // Initialize GitHub client
    const octokit = new Octokit({
      auth: GITHUB_TOKEN
    });

    // Path to votes.json in your repository
    const votesFilePath = 'public/votes.json';
    
    try {
      // Get the current file content from GitHub
      const { data } = await octokit.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: votesFilePath,
      });
      
      // Decode and parse the content
      const content = Buffer.from(data.content, 'base64').toString();
      const votesData = JSON.parse(content);
      
      // Check if terms and the specific term exist
      if (!votesData.terms || !votesData.terms[termKey]) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            termKey,
            upvotes: 0,
            downvotes: 0,
            voterCount: 0
          })
        };
      }
      
      // Get vote information for the term
      const termVotes = votesData.terms[termKey];
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          termKey,
          upvotes: termVotes.upvotes || 0,
          downvotes: termVotes.downvotes || 0,
          voterCount: Object.keys(termVotes.voters || {}).length
        })
      };
    } catch (error) {
      // File probably doesn't exist yet
      if (error.status === 404) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            termKey,
            upvotes: 0,
            downvotes: 0,
            voterCount: 0
          })
        };
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Error getting term votes:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to get term votes', 
        details: error.message,
        stack: error.stack
      })
    };
  }
};