const github = require('@actions/github');
const core = require('@actions/core');

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

        const clientMessage = `This issue is being automatically closed because it may mention a third-party  
        client (${term}). Meteor only supports Fabric via Prism Launcher and the Vanilla Launcher. Any problems 
        you encounter while using other clients are your responsibility to troubleshoot.\n
        \n 
        If you believe this issue was closed wrongly, you may reopen it.`

        await closeIssue(term, clientMessage);
        return;
    }

    for (const term of anticheatTerms) {
        if (checkTerm(issueText, term)) continue;

        const anticheatMessage = `This issue is being automatically closed because it may mention issues with 
        anticheat plugins (${term}). Meteor is intended to be used only as a utility client on servers that 
        allow it, we do not intend to add workarounds for specific anticheats unless it falls in that scope.\n
        \n
        If you believe this issue was closed wrongly, you may reopen it.`;

        await closeIssue(term, anticheatMessage);
        return;
    }

    for (const term of featureTerms) {
        if (checkTerm(issueText, term)) continue;

        const featureMessage = `This issue is being automatically closed because it may mention request that are
        impossible to make, associated with cheating/griefing, or fall outside the scope of this project (${term}).\n
        \n
        If you believe this issue was closed wrongly, you may reopen it.`;

        await closeIssue(term, featureMessage);
        return;
    }

    if (checkTerm(issueText, "old version")) {
        const oldVersionMessage = `This issue is being automatically closed because it may request support for or
        access to old versions of the client. Old versions can be found at https://meteorclient.com/archive, but 
        you will not receive any support while using them.`;

        await closeIssue("old version", oldVersionMessage);
        return;
    }

    if (checkTerm(issueText, "forge")) {
        const forgeMessage = `This issue is being automatically closed because it may request that Meteor be .
        ported to Forge. Meteor is only a Fabric mod and does plan to be ported in the future. `;

        await closeIssue("forge", forgeMessage);
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
        await octokit["rest"].issues.createComment({
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
        await octokit["rest"].issues.update({
            owner,
            repo,
            issue_number: issueNumber,
            state: 'closed',
        });

        core.info('Closed issue successfully.');
    } catch (error) {
        core.setFailed(`Failed to close issue: ${error.message}`);
    }
}

run();

