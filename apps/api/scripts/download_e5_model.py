"""Download the local multilingual E5 model expected by E5SearchService."""

import argparse
from pathlib import Path

from huggingface_hub import model_info, snapshot_download


REPO_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_OUTPUT = REPO_ROOT / "models" / "e5"
DEFAULT_MODEL = "intfloat/multilingual-e5-base"
MODEL_FILES = [
    "config.json",
    "modules.json",
    "1_Pooling/**",
    "sentence_bert_config.json",
    "special_tokens_map.json",
    "tokenizer.json",
    "tokenizer_config.json",
    "sentencepiece.bpe.model",
    "model.safetensors",
]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model", default=DEFAULT_MODEL, help="Hugging Face model repository")
    parser.add_argument(
        "--revision", default="main", help="Branch, tag, or immutable commit hash (default: resolve main and print its hash)"
    )
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="Target directory (default: repo/models/e5)")
    args = parser.parse_args()

    # Resolve a movable branch to a commit before download, then use that immutable SHA.
    resolved = model_info(args.model, revision=args.revision).sha
    if not resolved:
        raise SystemExit(f"Could not resolve model revision {args.revision!r} for {args.model}.")
    args.output.mkdir(parents=True, exist_ok=True)
    snapshot_download(
        repo_id=args.model,
        revision=resolved,
        local_dir=str(args.output),
        allow_patterns=MODEL_FILES,
    )
    print(f"Downloaded {args.model}@{resolved} to {args.output.resolve()}")
    print("The model uses a safetensors checkpoint; the legacy pytorch_model.bin was not downloaded.")


if __name__ == "__main__":
    main()
