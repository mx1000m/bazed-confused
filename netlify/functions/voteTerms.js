const { Octokit } = require("@octokit/core");

exports.handler = async (event) => {
  const repo = "bazed-confused";
  const owner = "mx1000m";
  const path = "votes.json";

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  try {
    // GET vote counts
    if (event.httpMethod === "GET") {
      const term = event.queryStringParameters.term;
      if (!term) {
        return { statusCode: 400, body: "Term missing" };
      }

      const { data: fileData } = await octokit.request(
        `GET /repos/${owner}/${repo}/contents/${path}`,
        { headers: { accept: "application/vnd.github.v3.raw" } }
      );

      const content = JSON.parse(
        Buffer.from(fileData.content, "base64").toString("utf-8")
      );
      const termVotes = content[term] || { up: [], down: [] };

      return {
        statusCode: 200,
        body: JSON.stringify({
          up: termVotes.up.length,
          down: termVotes.down.length,
          voters: [...termVotes.up, ...termVotes.down],
        }),
      };
    }

    // POST to cast vote
    if (event.httpMethod === "POST") {
      const { term, vote, voter } = JSON.parse(event.body);

      if (!term || !vote || !voter || !["up", "down"].includes(vote)) {
        return { statusCode: 400, body: "Invalid input" };
      }

      const { data: fileData } = await octokit.request(
        `GET /repos/${owner}/${repo}/contents/${path}`,
        { headers: { accept: "application/vnd.github.v3.raw" } }
      );

      const sha = fileData.sha;
      const content = JSON.parse(
        Buffer.from(fileData.content, "base64").toString("utf-8")
      );

      const termVotes = content[term] || { up: [], down: [] };

      if (
        termVotes.up.includes(voter) ||
        termVotes.down.includes(voter)
      ) {
        return {
          statusCode: 409,
          body: "You already voted on this term.",
        };
      }

      termVotes[vote].push(voter);
      content[term] = termVotes;

      // Optional: remove term if too many downvotes
      // if (termVotes.down.length >= 50) {
      //   delete content[term];
      // }

      const updatedContent = Buffer.from(
        JSON.stringify(content, null, 2)
      ).toString("base64");

      await octokit.request(`PUT /repos/${owner}/${repo}/contents/${path}`, {
        owner,
        repo,
        path,
        message: `Vote ${vote} on ${term} by ${voter}`,
        content: updatedContent,
        sha,
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          up: termVotes.up.length,
          down: termVotes.down.length,
        }),
      };
    }

    return { statusCode: 405, body: "Method Not Allowed" };
  } catch (error) {
    console.error("Voting error:", error);
    return { statusCode: 500, body: "Internal Server Error" };
  }
};
