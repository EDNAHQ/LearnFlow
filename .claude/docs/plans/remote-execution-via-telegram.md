# Remote Execution via Telegram

## Goal

Trigger Claude Code work from your phone via Telegram messages, with results sent back to you.

## Architecture

```
Phone (Telegram) → Your Always-On PC (Python script) → Claude Code → Results back to Telegram
```

## Setup Steps

### 1. Create Telegram Bot (2 minutes)

1. Open Telegram, search for `@BotFather`
2. Send `/newbot`
3. Choose a name (e.g., "My Claude Runner")
4. Choose a username ending in `bot` (e.g., `myclaude_runner_bot`)
5. Copy the API token BotFather gives you

### 2. Install Python Dependencies

```bash
pip install python-telegram-bot
```

### 3. Create the Listener Script

Save as `telegram-claude-runner.py` (or wherever you prefer):

```python
import asyncio
import subprocess
import os
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

# Configuration
TELEGRAM_TOKEN = "YOUR_BOT_TOKEN_HERE"
ALLOWED_USER_IDS = []  # Add your Telegram user ID for security, or leave empty to allow anyone

# Map of project shortcuts to paths
PROJECTS = {
    "superpowers": r"c:\Users\GGPC\CascadeProjects\superpowers",
    # Add more projects:
    # "myapp": r"c:\Users\GGPC\Projects\myapp",
}

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Send help message."""
    await update.message.reply_text(
        "Commands:\n"
        "/run <project> <task> - Run a task in a project\n"
        "/projects - List available projects\n"
        "/status - Check if runner is alive\n\n"
        "Example: /run superpowers fix the failing tests"
    )

async def list_projects(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """List available projects."""
    projects_list = "\n".join(f"  - {name}" for name in PROJECTS.keys())
    await update.message.reply_text(f"Available projects:\n{projects_list}")

async def status(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Simple health check."""
    await update.message.reply_text("Runner is online and ready.")

async def run_task(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Run a Claude Code task."""
    user_id = update.effective_user.id

    # Security check
    if ALLOWED_USER_IDS and user_id not in ALLOWED_USER_IDS:
        await update.message.reply_text("Unauthorized.")
        return

    # Parse command
    if not context.args or len(context.args) < 2:
        await update.message.reply_text("Usage: /run <project> <task description>")
        return

    project_name = context.args[0].lower()
    task = " ".join(context.args[1:])

    if project_name not in PROJECTS:
        await update.message.reply_text(f"Unknown project: {project_name}\nUse /projects to see available projects.")
        return

    project_path = PROJECTS[project_name]

    await update.message.reply_text(f"Starting in {project_name}...\nTask: {task}")

    # Build the prompt
    prompt = f"""Use the prepare-autonomous-execution skill checklist, then:

{task}

Use autonomous-resilience principles:
- Make reasonable decisions and document them
- If blocked, try alternatives or skip and continue
- Log progress and assumptions
- Commit after each completed task
"""

    try:
        # Run Claude Code
        result = subprocess.run(
            ["claude", "--dangerously-skip-permissions", "-p", prompt],
            cwd=project_path,
            capture_output=True,
            text=True,
            timeout=3600  # 1 hour timeout
        )

        output = result.stdout[-3000:] if len(result.stdout) > 3000 else result.stdout

        if result.returncode == 0:
            await update.message.reply_text(f"Done!\n\nOutput:\n{output}")
        else:
            await update.message.reply_text(f"Completed with errors.\n\nOutput:\n{output}\n\nStderr:\n{result.stderr[-500:]}")

    except subprocess.TimeoutExpired:
        await update.message.reply_text("Task timed out after 1 hour.")
    except Exception as e:
        await update.message.reply_text(f"Error: {str(e)}")

def main():
    """Start the bot."""
    app = Application.builder().token(TELEGRAM_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", start))
    app.add_handler(CommandHandler("projects", list_projects))
    app.add_handler(CommandHandler("status", status))
    app.add_handler(CommandHandler("run", run_task))

    print("Bot starting...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
```

### 4. Configure the Script

1. Replace `YOUR_BOT_TOKEN_HERE` with your token from BotFather
2. Add your projects to the `PROJECTS` dict
3. (Optional) Add your Telegram user ID to `ALLOWED_USER_IDS` for security
   - To find your ID, message `@userinfobot` on Telegram

### 5. Run the Script

```bash
python telegram-claude-runner.py
```

### 6. Set Up Auto-Start (Windows)

Create a batch file `start-claude-runner.bat`:
```batch
@echo off
cd /d "C:\path\to\script\directory"
python telegram-claude-runner.py
```

Add to Windows Task Scheduler:
1. Open Task Scheduler
2. Create Basic Task
3. Trigger: "When the computer starts"
4. Action: Start the batch file
5. Check "Run whether user is logged on or not"

### 7. Usage

From your phone:
```
/run superpowers fix the failing tests
/run superpowers execute the plan at docs/plans/current-plan.md
/run myapp add user authentication
```

## Security Notes

- The `--dangerously-skip-permissions` flag bypasses Claude's safety prompts
- Only use on projects you trust
- Add your Telegram user ID to ALLOWED_USER_IDS
- Consider running in a sandbox/VM for extra safety

## Future Enhancements

- Progress updates during execution
- Support for specifying plan files
- Queue multiple tasks
- Cancel running tasks
- Cross-project dashboard commands
