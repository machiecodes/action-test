import * as github from '@actions/github';
import * as core from '@actions/core';

const clientTerms = [
    "feather client",
    "lunar client",
    "labymod",
    "tlauncher",
    "pojav",
    "boze",
    "liquid bounce",
    "mio client",
    "future client",
    "wurst client",
    "optifine"
];

const anticheatTerms = [
    "bypass",
    "ncp",
    "nocheat plus",
    "vulcan",
    "grim",
    "wraith",
    "antiaura",
    "anticheataddition",
    "godseye",
    "anti xray"
];

const featureTerms = [
    "infinite reach",
    "godmode",
    "portal godmode",
    "dupe",
    "ping bypass",
    "tp aura",
    "force op",
    ".panic",
    "anti vanish"
];

const token = process.env.GITHUB_TOKEN;
const octokit = github.getOctokit(token);
const context = github.context

const issueNumber = context.payload.issue.number;
const owner = context.repo.owner;
const repo = context.repo.repo;
const title = context.payload.issue.title;
const body = context.payload.issue.body;

async function run() {
    const issueText = `${title} ${body}`.toLowerCase();

    for (const term of clientTerms) {
        if (checkTerm(issueText, term)) continue;

        const clientMessage =
            `### This issue is being automatically closed because it may mention a third-party client (${term}).\n` +
            'Meteor only supports Fabric via Prism Launcher and the Vanilla Launcher. Any problems you encounter ' +
            'while using other clients are your responsibility to troubleshoot.\n' +
            '\n' +
            '_If you believe this issue was closed wrongly, you may reopen it._'

        await closeIssue(term, clientMessage);
        return;
    }

    for (const term of anticheatTerms) {
        if (checkTerm(issueText, term)) continue;

        const clientMessage =
            `### This issue is being automatically closed because it may mention issues with anticheats (${term}).\n` +
            'Meteor is intended to be used only as a utility client on servers that allow it, we do not intend to ' +
            'add workarounds for specific anticheats unless it falls in that scope.\n' +
            '\n' +
            '_If you believe this issue was closed wrongly, you may reopen it._'

        await closeIssue(term, clientMessage);
        return;
    }

    for (const term of featureTerms) {
        if (checkTerm(issueText, term)) continue;

        const featureMessage =
            `### This issue is being automatically closed because it may request this feature: (${term}).\n` +
            'This feature is likely impossible to make, associated with cheating/griefing, or falls outside ' +
            'the scope of this project. We do not plan on adding this feature.\n' +
            '\n' +
            '_If you believe this issue was closed wrongly, you may reopen it._'

        await closeIssue(term, featureMessage);
        return;
    }

    if (checkTerm(issueText, "old version")) {
        const oldVersionMessage =
            `### This issue is being automatically closed because it may mention old versions.\n` +
            'Old versions of Meteor can be found at https://meteorclient.com/archive, but you will' +
            'not receive support for any issues you encounter while using them.\n' +
            '\n' +
            '_If you believe this issue was closed wrongly, you may reopen it._'

        await closeIssue("old version", oldVersionMessage);
        return;
    }

    if (checkTerm(issueText, "forge")) {
        const oldVersionMessage =
            `### This issue is being automatically closed because it may request a Forge port.\n` +
            'Meteor is a Fabric only mod and has no plans to port to Forge.\n' +
            '\n' +
            '_If you believe this issue was closed wrongly, you may reopen it._'

        await closeIssue("forge", oldVersionMessage);
    }
}

function checkTerm(text, term) {
    if (text.includes(term)) return true;
    if (text.includes(term.replaceAll(' ', '-'))) return true;
    return text.includes(term.replaceAll(' ', ''));
}

async function closeIssue(foundTerm, message) {
    core.warning(`Found banned term ('${foundTerm}'), closing issue.`);

    // IDE for whatever reason can't find the rest property yippee

    try {
        await octokit['rest'].issues.createComment({
            owner,
            repo,
            issue_number: issueNumber,
            body: message,
        });

        core.info('Comment added successfully.');
    } catch (error) {
        core.error(`Failed to add comment: ${error.message}`);
    }

    try {
        await octokit['rest'].issues.update({
            owner,
            repo,
            issue_number: issueNumber,
            state: "closed",
        });

        core.info('Closed issue successfully.');
    } catch (error) {
        core.setFailed(`Failed to close issue: ${error.message}`);
    }
}

run();

