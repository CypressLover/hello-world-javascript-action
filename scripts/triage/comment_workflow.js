async function handleComment(github, context) {
    
    // Only continue if the payload was triggered by a comment event and the comment was made by a human user
    if (!context.payload.comment || context.payload.comment.user.type === "Bot") {
      console.log("Payload does not contain a comment event made by a human user.");
      return;
    }
  
    // Get the details of the issue or pull request that triggered the workflow
    const { issue, pull_request } = context.payload;
    const issueOrPullRequest = issue || pull_request;

    console.log(issueOrPullRequest);

    const isMemberQuery = `query ($login: String!, $org: String!) {
        user(login: $login) {
          organization(login: $org) {
            viewerCanAdminister
            viewerIsAMember
          }
        }
      }`;
    const isMemberVariables = {
        login: context.payload.comment.user.login,
        org: context.payload.organization.login
    }
    
    const isMemberResult = await github.graphql(isMemberQuery, isMemberVariables)

    var isCommentFromMember = false;

    if (isMemberResult.user.organization != null) {
        isCommentFromMember = true;
    }

    //console.log(isCommentFromMember);
    
    // If comment is from someone outside of the org
    if (!isCommentFromMember) {
        console.log('not from an org member');
        //Get Item Info
        
        const getItemInfoQuery = "query ($org: String!, $repo: String!, $project: Int!, $issue: Int!) {
            organization(login: $org) {
              repository(name: $repo) {
                issue(number: $issue) {
                  projectItems(first: 10, includeArchived: false) {
                    nodes {
                      id
                      fieldValueByName(name: 'Status') {
                        ... on ProjectV2ItemFieldSingleSelectValue {
                          name
                          field {
                            ... on ProjectV2SingleSelectField {
                              project {
                                ... on ProjectV2 {
                                  id
                                  number
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
              projectV2(number: $project) {
                field(name: 'Status') {
                  ... on ProjectV2SingleSelectField {
                    id
                    options {
                      id
                      name
                    }
                  }
                }
              }
            }
          }";
        
        const getItemInfoVars = {
            org: context.payload.organization.login,
            repo: "hello-world-javascript-action",
            issueNumber: issueOrPullRequest.number,
            projectNumber: 1
        };
        // If issue is archived on the board, reactivate it

        // If the issue is open but is not on the project board, move it to the New Issues column on the project board

        // If the issue the issue is of status Closed on the project board, move it to the New Issues column

        
} 


module.exports = { handleComment };
