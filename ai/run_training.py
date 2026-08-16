"""Run training with logs and stop it if its heartbeat stalls for 30 minutes."""

from __future__ import annotations

import json
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "ai" / "artifacts"
STATUS = OUTPUT / "training_status.json"
SUPERVISOR = OUTPUT / "supervisor_status.json"
MAX_SILENCE_SECONDS = 30 * 60


def write_supervisor(state: str, **details) -> None:
    SUPERVISOR.write_text(
        json.dumps(
            {
                "state": state,
                "updated_at": datetime.now(timezone.utc).isoformat(),
                **details,
            },
            indent=2,
        ),
        encoding="utf-8",
    )


def main() -> int:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    if STATUS.exists():
        STATUS.unlink()
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    stdout_path = OUTPUT / f"training-{stamp}.stdout.log"
    stderr_path = OUTPUT / f"training-{stamp}.stderr.log"
    command = [
        sys.executable,
        "-u",
        str(ROOT / "ai" / "train.py"),
        "--dataset",
        str(ROOT / "trainingdataset"),
        "--output",
        str(OUTPUT),
        "--head-epochs",
        "10",
        "--fine-tune-epochs",
        "5",
    ]
    with stdout_path.open("w", encoding="utf-8") as stdout, stderr_path.open(
        "w", encoding="utf-8"
    ) as stderr:
        process = subprocess.Popen(command, cwd=ROOT, stdout=stdout, stderr=stderr)
        write_supervisor(
            "running", training_pid=process.pid,
            stdout=str(stdout_path), stderr=str(stderr_path),
            max_silence_minutes=MAX_SILENCE_SECONDS // 60,
        )
        started = time.time()
        while process.poll() is None:
            time.sleep(60)
            heartbeat_time = STATUS.stat().st_mtime if STATUS.exists() else started
            silence = time.time() - heartbeat_time
            if silence > MAX_SILENCE_SECONDS:
                # Kill the exact training process tree, not unrelated Python jobs.
                subprocess.run(
                    ["taskkill", "/PID", str(process.pid), "/T", "/F"],
                    capture_output=True,
                    text=True,
                )
                write_supervisor(
                    "error", reason="No training heartbeat for 30 minutes",
                    training_pid=process.pid, silence_seconds=int(silence),
                )
                return 2
        return_code = process.returncode
        write_supervisor(
            "complete" if return_code == 0 else "error",
            return_code=return_code,
            training_pid=process.pid,
        )
        return return_code


if __name__ == "__main__":
    raise SystemExit(main())
