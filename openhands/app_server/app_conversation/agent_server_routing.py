from collections.abc import Sequence


def acp_display_name(acp_command: Sequence[str] | None) -> str:
    """Return a display-safe ACP label from the configured command."""
    if not acp_command:
        return 'ACP'
    token = acp_command[-1]
    if not token:
        return 'ACP'
    name = token.rsplit('/', 1)[-1]
    return f'ACP: {name}' if name else 'ACP'
