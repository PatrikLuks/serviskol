// AI Code Review Assistant: Automatizovaná AI asistence pro pull requesty
require('dotenv').config();
const { Octokit } = require('octokit');
const { Configuration, OpenAIApi } = require('openai');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'PatrikLuks';
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'serviskol';

if (!GITHUB_TOKEN || !OPENAI_API_KEY) {
  console.error('Chybí GITHUB_TOKEN nebo OPENAI_API_KEY v .env');
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });
const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }));

async function getOpenPullRequests() {
  const prs = await octokit.rest.pulls.list({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    state: 'open',
    per_page: 10
  });
  return prs.data;
}

async function getPullRequestDiff(prNumber) {
  const { data } = await octokit.rest.pulls.get({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    pull_number: prNumber,
    mediaType: { format: 'diff' }
  });
  return data;
}

async function generateReview(diff, prTitle) {
  const prompt = `Jsi AI code review asistent. Proveď code review pro tento pull request (název: ${prTitle}):\n\n${diff}\n\nV bodech navrhni zlepšení, upozorni na rizika, doporuč best practices. Buď konkrétní a stručný.`;
  const res = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 600
  });
  return res.data.choices[0].message.content;
}

async function postReviewComment(prNumber, body) {
  await octokit.rest.issues.createComment({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    issue_number: prNumber,
    body
  });
}

async function main() {
  const prs = await getOpenPullRequests();
  if (!prs.length) {
    console.log('Žádné otevřené pull requesty.');
    return;
  }
  for (const pr of prs) {
    const diff = await getPullRequestDiff(pr.number);
    const review = await generateReview(diff, pr.title);
    await postReviewComment(pr.number, `🤖 AI Code Review:\n${review}`);
    console.log(`AI review přidán do PR #${pr.number}`);
  }
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
