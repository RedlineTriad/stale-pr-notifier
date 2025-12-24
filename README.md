# Stale PR Notifier Action

###### GitHub Action
Custom GitHub action written Typescript for on-demand adoption by teams.
Created docs / Backstage template to add the workflow as a cronjob to existing repositories, or template new applications with it built-in.

Flow:
1. Get secrets for slack for notifications
2. Iterate over all PRs using GitHub actions token
3. Check for stale PRs
4. Group by assigned reviewer
5. Send notification that includes summary of all open PRs, highlighting old ones.

# Stale PR Notifier Action

This action can be added as a cronjob to automatically remind reviewers of stale PRs.

## Inputs

### `stale-pr-time`

The number of hours a PR has been open without activity to be considered stale. Default: `8`

## Example usage

```yaml
uses: actions/hello-world-javascript-action@e76147da8e5c81eaf017dede5645551d4b94427b
with:
  who-to-greet: Mona the Octocat
```
