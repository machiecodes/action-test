import * as core from "@actions/core";

export async function closeIssue(message, octokit, context, foundTerm) {
    const issueNumber = context.payload.issue.number;
    const owner = context.repo.owner;
    const repo = context.repo.repo;

    let closeMessage = '### This issue is being automatically closed.\n' +
        `${message}`

    if (foundTerm !== '') closeMessage +=
        '\n' +
        '\n' +
        `_This issue was closed because you used the term "${foundTerm}". ` +
        'If you believe your issue is not associated with the given reason ' +
        'you may reopen it._'

    // IDE for whatever reason can't find the rest property yippee

    try {
        await octokit['rest'].issues.createComment({
            owner, repo, issue_number: issueNumber, body: closeMessage
        });

        core.info('Comment added successfully.');
    } catch (error) {
        core.error(`Failed to add comment: ${error.message}`);
    }

    try {
        await octokit['rest'].issues.update({
            owner, repo, issue_number: issueNumber, state: 'closed'
        });

        core.info('Closed issue successfully.');
    } catch (error) {
        core.setFailed(`Failed to close issue: ${error.message}`);
    }
}