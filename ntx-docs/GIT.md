# COMMIT MESSAGES
Format:
`<prefix> <short description> [(WIP)] #<gh-issue>`

Examples: 
* `Add search feature #98`
* `Update thumbnail upload processing (WIP) #91`

Use a `prefix` to ensure quick search and clear commit messages, always start the commit messages with:
* `Add` (some functionality). If it's still a work in progress, add `(WIP)` after short description.
* `Update` (functionality). If it's still a work in progress, add `(WIP)` after short description.
* `Fix` (some bug).
* `Refactor` (comments, moving code, without changing functionality).
* `Docs` (documentation only changes)
* `Style` (formatting, white-space, etc.)
* `Test` (adding missing tests)
* `Chore` (build process changes, lib changes, documentation generation)

# BRANCHING STRATEGY
Branches:
* `main` - for releases/iterations.
* `develop` - merging developed features, integrating them, adding fixes.
* `feature/*` (*feature/\<gh-issue\>-\<US_ID\>-short-name*) - a feature branch for some user story (US). Branched from `develop`. This branch would be merged into `develop` through a PR (Pull Request). Example branch name `feature/24-e1u3-drag-and-drop-video-upload`. 
* `task/*` (*task/\<gh-issue\>-\<task_ID\>-short-name*) - a task branch for a user story. Branched from parent `feature/*` branch. This branch would be merged into parent `feature/*` branch through a PR (Pull Request). Example naming `task/25-e1u3t4-metadata-search-plugins`.

Other branches:
* `bugfix/*` - for bug fixing.
* `other/*` - for example: formatting, style changing, config changes, etc.

![image](https://github.com/user-attachments/assets/d8ec4ffe-52b4-4387-9d4b-5eaf4d21b31d)

# PULL REQUESTS
* For **develop -> main** PRs, add 2+ reviewers.
* For **feature -> develop** PRs, add 2+ reviewers.
* For **task -> feature** PRs, add 1+ reviewer.

### Merge Types
* For **develop -> main** PRs, do a simple merge.
* For **feature -> develop** PRs, do a simple merge.
* For **task -> feature** PRs, do a squash merge.

### **task->feature** pull request example

Title example: `Add task/25-e1u3t4 metadata search plugins`

Description example:
```text
Closes #999

Added title(movie or series) search functionality (with plugins for extensibility).
New route examples:

GET /v1/search/title?q=shrek (for title(movie/series) search results)
GET /v1/search/title/30984?type=SERIES&source=TMDB_SEARCH_V3 (for more details on specific MOVIE/SERIES based on ID from a certain source(aka search plugin))
```
Note: #999 is the github-issue ID.
