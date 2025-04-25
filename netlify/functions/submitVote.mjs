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

    // Log the data we're processing
    console.log('Processing vote:', { termKey, username, voteType });

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
    let votesData = { terms: {}, users: {} };
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
      
      // Ensure the correct structure exists
      if (!votesData.terms) votesData.terms = {};
      if (!votesData.users) votesData.users = {};
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

    // Make sure the voters object exists
    if (!votesData.terms[termKey].voters) {
      votesData.terms[termKey].voters = {};
    }

    // Get the user's previous vote on this term
    const previousVote = votesData.terms[termKey].voters[username];
    
    // Make sure the upvotes and downvotes properties exist and are numbers
    if (typeof votesData.terms[termKey].upvotes !== 'number') {
      votesData.terms[termKey].upvotes = 0;
    }
    
    if (typeof votesData.terms[termKey].downvotes !== 'number') {
      votesData.terms[termKey].downvotes = 0;
    }
    
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

    // Log the updated vote counts before saving
    console.log('Updated vote counts:', {
      term: termKey,
      upvotes: votesData.terms[termKey].upvotes,
      downvotes: votesData.terms[termKey].downvotes
    });

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

    // Check if the term should be deleted (15 or more downvotes)
    const shouldDeleteTerm = votesData.terms[termKey].downvotes >= 15;
    let deletedTerm = false;
    
    if (shouldDeleteTerm) {
      console.log(`Term ${termKey} has ${votesData.terms[termKey].downvotes} downvotes. Attempting to remove it.`);
      
      try {
        // Get the terms.json file
        const termsFilePath = 'public/terms.json';
        const { data: termsFile } = await octokit.repos.getContent({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          path: termsFilePath,
        });
        
        // Decode and parse the content
        const termsContent = Buffer.from(termsFile.content, 'base64').toString();
        const termsData = JSON.parse(termsContent);
        
        // Check if the term exists in the terms data
        if (termsData[termKey]) {
          // Remove the term
          delete termsData[termKey];
          
          // Save the updated terms data
          const updatedTermsContent = JSON.stringify(termsData, null, 2);
          
          await octokit.repos.createOrUpdateFileContents({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: termsFilePath,
            message: `Remove term ${termKey} due to negative votes`,
            content: Buffer.from(updatedTermsContent).toString('base64'),
            sha: termsFile.sha,
          });
          
          console.log(`Successfully removed term ${termKey} from terms.json`);
          deletedTerm = true;
        } else {
          console.log(`Term ${termKey} not found in terms.json, nothing to delete.`);
        }
      } catch (error) {
        console.error(`Error removing term ${termKey}:`, error.message);
        // We continue execution even if deletion fails
        // The vote has already been recorded successfully
      }
    }

    // Return the updated vote counts in the response
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        term: termKey,
        voteType,
        upvotes: votesData.terms[termKey].upvotes,
        downvotes: votesData.terms[termKey].downvotes,
        termDeleted: deletedTerm
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