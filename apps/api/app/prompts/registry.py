import json
from dataclasses import dataclass
from pathlib import Path


PROMPTS_ROOT = Path(__file__).parent


@dataclass(frozen=True)
class PromptDefinition:
    prompt_id: str
    version: str
    system_prompt: str


class PromptCatalog:
    def __init__(self, root: Path = PROMPTS_ROOT):
        self.root = root
        self.manifest = json.loads((root / "manifest.json").read_text(encoding="utf-8"))

    @property
    def version(self) -> str:
        return self.manifest["version"]

    @property
    def prompt_ids(self) -> tuple[str, ...]:
        return tuple(self.manifest["prompt_ids"])

    def get(self, prompt_id: str) -> PromptDefinition:
        if prompt_id not in self.prompt_ids:
            raise KeyError(f"Unknown prompt ID: {prompt_id}")
        prompt_path = self.root / f"v{self.version.replace('.', '_')}" / f"{prompt_id}.md"
        return PromptDefinition(prompt_id, self.version, prompt_path.read_text(encoding="utf-8").strip())


catalog = PromptCatalog()
