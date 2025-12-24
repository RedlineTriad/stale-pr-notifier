import * as core from "@actions/core";
import * as github from "@actions/github";

try {
  // `stale-pr-time` input defined in action metadata file
  const stalePrTime = core.getInput("stale-pr-time");
  core.info(`Stale PR time: ${stalePrTime}!`);

  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  core.info(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
