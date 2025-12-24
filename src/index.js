import * as core from "@actions/core";
import * as github from "@actions/github";

async function run() {
  try {
    const stalePrTimeInput = core.getInput("stale-pr-time") || "8";
    core.info(`Stale PR time input: ${stalePrTimeInput}`);
    const staleHours = parseInt(stalePrTimeInput, 10) || 8;
    core.info(`Using stale PR time: ${staleHours} hours`);

    const token = core.getInput("github-token") || process.env.GITHUB_TOKEN;
    if (!token) throw new Error("GITHUB token is required via GITHUB_TOKEN or github-token input");

    const octokit = github.getOctokit(token);
    const { owner, repo } = github.context.repo;

    const now = new Date();
    const cutoff = new Date(now.getTime() - staleHours * 60 * 60 * 1000);

    const pulls = await octokit.paginate(octokit.rest.pulls.list, {
      owner,
      repo,
      state: "open",
      per_page: 100,
    });

    const stalePRs = pulls.filter((pr) => new Date(pr.updated_at) < cutoff);

    if (stalePRs.length === 0) {
      core.info("No stale PRs found");
      core.info(`Checked ${pulls.length} open PRs, none stale for over ${staleHours} hours.`);
      for (const pr of pulls) {
        core.info(`- #${pr.number} ${pr.title} (updated ${pr.updated_at})`);
      }
      return;
    }

    const groups = {};
    for (const pr of stalePRs) {
      const reviewers = (pr.requested_reviewers || []).map((r) => r.login);
      const assignees = (pr.assignees || []).map((a) => a.login);
      const targets = reviewers.length ? reviewers : assignees.length ? assignees : [pr.user.login];

      for (const t of targets) {
        if (!groups[t]) groups[t] = [];
        groups[t].push(pr);
      }
    }

    for (const reviewer of Object.keys(groups)) {
      const prs = groups[reviewer].sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
      const targetPr = prs[0];

      let body = `:wave: Hi @${reviewer}, the following PRs are stale (no activity in the last ${staleHours} hours):\n\n`;
      for (const p of prs) {
        body += `- #${p.number} ${p.title} — ${p.html_url} (updated ${p.updated_at})\n`;
      }
      body += `\nPlease take a look.`;

      await octokit.rest.issues.createComment({ owner, repo, issue_number: targetPr.number, body });
      core.info(`Posted comment to #${targetPr.number} for ${reviewer}`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
