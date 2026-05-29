from pathlib import Path


ROOT = Path(__file__).resolve().parent
paths = [
    ROOT / "tradedeck_local.db",
    ROOT / "instance" / "tradedeck_local.db",
]

removed = []
for path in paths:
    if path.exists():
        path.unlink()
        removed.append(path)

if removed:
    print("BDD local eliminada:")
    for path in removed:
        print(f"- {path}")
else:
    print("No habia BDD local que eliminar.")
