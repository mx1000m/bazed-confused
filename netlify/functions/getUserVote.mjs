import { Octokit } from '@octokit/rest';

export const handler = async function(event, context) {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // Get parameters from query string
  const termKey = event.queryStringParameters.termKey;
  const username = event.queryStringParameters.username;

  if (!termKey || !username) {
    return { 
      statusCode: 400, 
      body: JSON.stringify({ error: 'Missing required parameters' }) 
    };
  }

  console.log('Getting vote for:', { termKey, username });

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
      
      // Check if the user has voted for this term
      let voteType = null;
      
      // Check if the term exists in the votes data
      if (!votesData.terms || !votesData.terms[termKey]) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            username,
            termKey,
            voteType: null,
            upvotes: 0,
            downvotes: 0
          })
        };
      }
      
      // Check in the term's voters list
      if (votesData.terms[termKey].voters) {
        voteType = votesData.terms[termKey].voters[username] || null;
      }
      
      // Alternative check in the user's votes list
      if (!voteType && votesData.users && votesData.users[username]) {
        voteType = votesData.users[username][termKey] || null;
      }
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          username,
          termKey,
          voteType,
          // Include vote counts if available
          upvotes: votesData.terms[termKey].upvotes || 0,
          downvotes: votesData.terms[termKey].downvotes || 0
        })
      };
    } catch (error) {
      // File probably doesn't exist yet
      if (error.status === 404) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            username,
            termKey,
            voteType: null,
            upvotes: 0,
            downvotes: 0
          })
        };
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Error getting user vote:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to get user vote', 
        details: error.message,
        stack: error.stack
      })
    };
  }
};