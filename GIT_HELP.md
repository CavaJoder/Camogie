# Git Help Guide

Here are some common Git commands to help you manage your project:

## Basic Commands

### Check Status
View the status of your files (modified, staged, untracked):
```bash
git status
```

### Add Files
Stage files for commit:
```bash
git add .             # Add all changes
git add <filename>    # Add a specific file
```

### Commit Changes
Save your staged changes with a message:
```bash
git commit -m "Your commit message here"
```

### View History
See the commit history:
```bash
git log
git log --oneline     # Condensed view
```

## Branching

### Create a Branch
```bash
git branch <branch-name>
```

### Switch Branch
```bash
git checkout <branch-name>
# OR
git switch <branch-name>
```

### Create and Switch
```bash
git checkout -b <new-branch-name>
```

## Remote Repositories

### Push Changes
Upload your commits to the remote repository:
```bash
git push origin <branch-name>
```

### Pull Changes
Download and merge changes from the remote repository:
```bash
git pull
```

## Undo Changes

### Discard Local Changes (before staging)
```bash
git checkout -- <filename>
# OR
git restore <filename>
```

### Unstage Files (after adding)
```bash
git reset HEAD <filename>
# OR
git restore --staged <filename>
```
