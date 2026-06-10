Stage and commit all current changes with a single short commit message.

Steps:
1. Run `git status` to see what has changed.
2. Run `git add -u` to stage all modified and deleted tracked files (skip untracked files unless they are clearly intentional new additions, in which case use `git add <file>`).
3. Write a commit message that follows these strict rules:
   - One line only — no body, no blank line, no second paragraph.
   - Max ~60 characters.
   - Lowercase, plain English, imperative mood.
   - Describes WHAT changed, not WHY. Examples:
     - `add ground shadows for player and NPCs`
     - `clean up sprite loading order`
     - `fix bride offset on small screens`
   - NO period at the end.
4. Run: `git commit -m "<your message>"` — use `-m` only, never `--trailer`, never append anything after the message string.

Hard rules — never break these:
- The commit message must be a single `-m` string. No multiline heredoc, no `-m` twice.
- Do NOT add any of: `Co-Authored-By`, `Generated with`, `🤖`, `Author:`, model names, or any AI attribution of any kind.
- Do NOT mention Claude, Copilot, GPT, or any AI tool anywhere in the commit.