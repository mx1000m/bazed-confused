import { Octokit } from '@octokit/rest';

export const handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    // Parse request body
    const { termKey, username, voteType } = JSON.parse(event.body);
    
    if (!termKey || !username) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'Missing required parameters' }) 
      };
    }

    // Get GitHub token and repo info from environment variables
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = process.env.REPO_OWNER;
    const REPO_NAME = process.env.REPO_NAME;

    console.log('Environment vars:', { 
      tokenExists: !!GITHUB_TOKEN,
      owner: REPO_OWNER,
      repo: REPO_NAME
    });

    // Initialize GitHub client
    const octokit = new Octokit({
      auth: GITHUB_TOKEN
    });

    // Path to votes.json in your repository
    const votesFilePath = 'public/votes.json';
    
    // First, try to get the current votes file
    let votesData = {};
    let sha = null;
    
    try {
      // Get the current file content from GitHub
      const { data } = await octokit.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: votesFilePath,
      });
      
      sha = data.sha;
      
      // Decode and parse the content
      const content = Buffer.from(data.content, 'base64').toString();
      votesData = JSON.parse(content);
      console.log('Successfully fetched existing votes file');
    } catch (error) {
      // File probably doesn't exist yet, we'll create it
      console.log("Votes file not found, will create a new one:", error.message);
      votesData = { terms: {}, users: {} };
    }

    // Initialize term data if it doesn't exist
    if (!votesData.terms[termKey]) {
      votesData.terms[termKey] = {
        upvotes: 0,
        downvotes: 0,
        voters: {}
      };
    }

    // Initialize user data if it doesn't exist
    if (!votesData.users[username]) {
      votesData.users[username] = {};
    }

    // Get the user's previous vote on this term
    const previousVote = votesData.terms[termKey].voters[username];
    
    // Remove previous vote count if exists
    if (previousVote) {
      if (previousVote === 'upvote') {
        votesData.terms[termKey].upvotes = Math.max(0, votesData.terms[termKey].upvotes - 1);
      } else if (previousVote === 'downvote') {
        votesData.terms[termKey].downvotes = Math.max(0, votesData.terms[termKey].downvotes - 1);
      }
    }

    // If voteType is null, we're removing the vote
    if (!voteType) {
      // Remove the vote
      delete votesData.terms[termKey].voters[username];
      delete votesData.users[username][termKey];
    } else {
      // Add the new vote
      votesData.terms[termKey].voters[username] = voteType;
      votesData.users[username][termKey] = voteType;
      
      // Increment the vote count
      if (voteType === 'upvote') {
        votesData.terms[termKey].upvotes++;
      } else if (voteType === 'downvote') {
        votesData.terms[termKey].downvotes++;
      }
    }

    // Save the updated votes data
    const updatedContent = JSON.stringify(votesData, null, 2);
    
    try {
      // Commit the file to GitHub
      const result = await octokit.repos.createOrUpdateFileContents({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: votesFilePath,
        message: `Update votes for ${termKey}`,
        content: Buffer.from(updatedContent).toString('base64'),
        sha: sha, // Include this only if the file already exists
      });
      console.log('Successfully updated votes file');
    } catch (commitError) {
      console.error('Error committing to GitHub:', commitError.message);
      throw commitError;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        term: termKey,
        voteType,
        upvotes: votesData.terms[termKey].upvotes,
        downvotes: votesData.terms[termKey].downvotes
      })
    };
  } catch (error) {
    console.error('Error submitting vote:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to submit vote', 
        details: error.message,
        stack: error.stack
      })
    };
  }
};